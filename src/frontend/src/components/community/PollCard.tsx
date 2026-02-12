import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetPollResults, useVote } from '../../hooks/useQueries';
import { useGetSupporters } from '../../hooks/useSupporterQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError, isStoppedCanisterError } from '../../utils/actorError';
import { SupporterBadge } from '../supporter/SupporterBadge';
import type { Poll } from '../../backend';

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: pollResults, isLoading: resultsLoading, error: resultsError } = useGetPollResults(poll.pollId);
  const { data: supportersMap } = useGetSupporters();
  const voteMutation = useVote();

  const [selectedOption, setSelectedOption] = useState<string>('');

  // Check if backend is unavailable due to stopped canister
  const isBackendUnavailable = resultsError && isStoppedCanisterError(resultsError);
  const backendUnavailableMessage = isBackendUnavailable ? normalizeActorError(resultsError) : null;

  const handleVote = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to vote');
      return;
    }

    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }

    try {
      await voteMutation.mutateAsync({
        pollId: poll.pollId,
        optionId: BigInt(selectedOption),
      });
      toast.success('Vote recorded!');
      setSelectedOption('');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isSupporter = (creatorPrincipal: any): boolean => {
    if (!supportersMap) return false;
    return supportersMap.has(creatorPrincipal.toString());
  };

  const totalVotes = pollResults?.results.reduce((sum, [_, count]) => sum + Number(count), 0) || 0;

  return (
    <Card className="border-2 shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl">{poll.question}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <span>
            Created {formatDate(poll.createdAt)} • {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
          {isSupporter(poll.createdBy) && <SupporterBadge />}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resultsLoading && !isBackendUnavailable ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isBackendUnavailable ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to Load Poll Results</AlertTitle>
            <AlertDescription>{backendUnavailableMessage}</AlertDescription>
          </Alert>
        ) : pollResults ? (
          <>
            {/* Voting UI */}
            {isAuthenticated && poll.isActive && (
              <div className="space-y-3">
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  {poll.options.map((option) => (
                    <div key={option.optionId.toString()} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option.optionId.toString()}
                        id={`option-${poll.pollId}-${option.optionId}`}
                      />
                      <Label
                        htmlFor={`option-${poll.pollId}-${option.optionId}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button
                  onClick={handleVote}
                  disabled={voteMutation.isPending || !selectedOption}
                  className="w-full"
                >
                  {voteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Voting...
                    </>
                  ) : (
                    'Submit Vote'
                  )}
                </Button>
              </div>
            )}

            {!isAuthenticated && (
              <Alert>
                <AlertDescription>Please sign in to vote.</AlertDescription>
              </Alert>
            )}

            {!poll.isActive && (
              <Alert>
                <AlertDescription>This poll is closed.</AlertDescription>
              </Alert>
            )}

            {/* Results */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-semibold">Results</h4>
              {pollResults.results.map(([optionId, count]) => {
                const option = poll.options.find((o) => o.optionId === optionId);
                const percentage = totalVotes > 0 ? (Number(count) / totalVotes) * 100 : 0;

                return (
                  <div key={optionId.toString()} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{option?.text}</span>
                      <span className="text-muted-foreground">
                        {count.toString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
