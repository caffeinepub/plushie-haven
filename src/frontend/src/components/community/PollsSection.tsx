import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useListPolls, useCreatePoll } from '../../hooks/useQueries';
import { useGetCallerUserProfile } from '../../hooks/useProfileQueries';
import { useIsCallerSupporter } from '../../hooks/useSupporterQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Plus, X, Heart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError, isStoppedCanisterError } from '../../utils/actorError';
import { PollCard } from './PollCard';
import LoadingState from '../LoadingState';
import type { PollOption } from '../../backend';

export function PollsSection() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: polls, isLoading, error: pollsError } = useListPolls();
  const { data: userProfile } = useGetCallerUserProfile();
  const { isSupporter } = useIsCallerSupporter();
  const createPollMutation = useCreatePoll();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);

  // Check if backend is unavailable due to stopped canister
  const isBackendUnavailable = !!(pollsError && isStoppedCanisterError(pollsError));
  const backendUnavailableMessage = isBackendUnavailable ? normalizeActorError(pollsError) : null;

  const maxOptions = isSupporter ? 10 : 4;

  const handleAddOption = () => {
    if (options.length < maxOptions) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to create a poll');
      return;
    }

    // Prevent submission if backend is unavailable
    if (isBackendUnavailable) {
      toast.error(backendUnavailableMessage || 'Service is temporarily unavailable');
      return;
    }

    if (!question.trim()) {
      toast.error('Question is required');
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      toast.error('At least 2 options are required');
      return;
    }

    try {
      const pollOptions: PollOption[] = validOptions.map((text, index) => ({
        optionId: BigInt(index),
        text: text.trim(),
      }));

      await createPollMutation.mutateAsync({
        question: question.trim(),
        options: pollOptions,
      });

      setQuestion('');
      setOptions(['', '']);
      toast.success('Poll created successfully!');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-3xl font-bold tracking-tight">Community Polls</h2>
        <p className="text-muted-foreground">
          Vote on community questions and create your own polls.
        </p>
      </div>

      {/* Backend Unavailable Alert */}
      {isBackendUnavailable && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Service Unavailable</AlertTitle>
          <AlertDescription>{backendUnavailableMessage}</AlertDescription>
        </Alert>
      )}

      {/* Create Poll Form */}
      <Card className="border-2 shadow-soft">
        <CardHeader>
          <CardTitle>Create a Poll</CardTitle>
          <CardDescription>
            Ask the community a question
            {!isSupporter && (
              <span className="mt-2 flex items-center gap-1 text-xs">
                <Heart className="h-3 w-3 text-pink-500" />
                <a href="/support" className="text-primary hover:underline">
                  Supporters
                </a>{' '}
                can create polls with up to 10 options (vs 4 for non-supporters)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <Alert>
              <AlertDescription>Please sign in to create polls.</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poll-question">
                  Question <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="poll-question"
                  placeholder="What's your question?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  maxLength={200}
                  disabled={isBackendUnavailable}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Options <span className="text-destructive">*</span> (min 2, max {maxOptions})
                </Label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        maxLength={100}
                        disabled={isBackendUnavailable}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                          disabled={isBackendUnavailable}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {options.length < maxOptions && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="w-full"
                    disabled={isBackendUnavailable}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createPollMutation.isPending || isBackendUnavailable}
              >
                {createPollMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Poll'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Polls List */}
      <div className="space-y-4">
        {isLoading ? (
          <LoadingState message="Loading polls..." />
        ) : isBackendUnavailable ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to Load Polls</AlertTitle>
            <AlertDescription>{backendUnavailableMessage}</AlertDescription>
          </Alert>
        ) : !polls || polls.length === 0 ? (
          <Card className="border-2 shadow-soft">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No polls yet. Be the first to create one!</p>
            </CardContent>
          </Card>
        ) : (
          polls
            .sort((a, b) => Number(b.createdAt - a.createdAt))
            .map((poll) => <PollCard key={poll.pollId.toString()} poll={poll} />)
        )}
      </div>
    </div>
  );
}
