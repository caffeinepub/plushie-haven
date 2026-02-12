import { useState } from 'react';
import { useGetModerationQueue, useApproveModerationRequest, useRejectModerationRequest } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError } from '../../utils/actorError';
import { PostVideoAttachment } from './PostVideoAttachment';
import LoadingState from '../LoadingState';

export function ModerationQueuePanel() {
  const { data: queueData, isLoading, error } = useGetModerationQueue();
  const approveMutation = useApproveModerationRequest();
  const rejectMutation = useRejectModerationRequest();
  const [processingId, setProcessingId] = useState<bigint | null>(null);

  const handleApprove = async (id: bigint) => {
    setProcessingId(id);
    try {
      await approveMutation.mutateAsync(id);
      toast.success('Post approved and published!');
    } catch (error) {
      toast.error(normalizeActorError(error));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: bigint) => {
    setProcessingId(id);
    try {
      await rejectMutation.mutateAsync(id);
      toast.success('Post rejected and removed from queue.');
    } catch (error) {
      toast.error(normalizeActorError(error));
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-amber-900">Moderation Queue</CardTitle>
          <CardDescription>Review pending posts flagged for manual review</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingState message="Loading moderation queue..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-amber-900">Moderation Queue</CardTitle>
          <CardDescription>Review pending posts flagged for manual review</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{normalizeActorError(error)}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const queue = queueData || [];

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="text-amber-900">Moderation Queue</CardTitle>
        <CardDescription>
          Review pending posts flagged for manual review ({queue.length} item{queue.length !== 1 ? 's' : ''})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {queue.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No pending items</AlertTitle>
            <AlertDescription>
              All posts have been reviewed. New posts flagged for manual review will appear here.
            </AlertDescription>
          </Alert>
        ) : (
          queue.map(([id, item]) => (
            <div key={id.toString()} className="space-y-3 rounded-lg border border-amber-300 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Pending Review
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Submitted {formatDate(item.submittedAt)} by {item.author.toString().slice(0, 8)}...
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="whitespace-pre-wrap text-sm">{item.body}</p>
                {item.video && (
                  <div className="mt-3">
                    <PostVideoAttachment video={item.video} />
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(id)}
                  disabled={processingId === id}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processingId === id && approveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve & Publish
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleReject(id)}
                  disabled={processingId === id}
                  size="sm"
                  variant="destructive"
                >
                  {processingId === id && rejectMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
