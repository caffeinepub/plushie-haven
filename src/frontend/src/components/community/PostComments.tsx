import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetComments, useCreateComment } from '../../hooks/useQueries';
import { useGetCallerUserProfile } from '../../hooks/useProfileQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError, isStoppedCanisterError } from '../../utils/actorError';
import { LinkifiedText } from './LinkifiedText';

interface PostCommentsProps {
  postId: bigint;
  initialCount?: number;
}

export function PostComments({ postId, initialCount = 0 }: PostCommentsProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');

  const { data: comments, isLoading, error: commentsError } = useGetComments(postId);
  const { data: userProfile } = useGetCallerUserProfile();
  const createCommentMutation = useCreateComment();

  const commentCount = comments?.length ?? initialCount;

  // Check if backend is unavailable due to stopped canister
  const isBackendUnavailable = !!(commentsError && isStoppedCanisterError(commentsError));
  const backendUnavailableMessage = isBackendUnavailable ? normalizeActorError(commentsError) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const authorName = userProfile?.displayName || null;

      await createCommentMutation.mutateAsync({
        postId,
        authorName,
        content: commentText.trim(),
      });

      setCommentText('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}</span>
      </Button>

      {isExpanded && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {/* Backend Unavailable Alert */}
          {isBackendUnavailable && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to Load Comments</AlertTitle>
              <AlertDescription>{backendUnavailableMessage}</AlertDescription>
            </Alert>
          )}

          {/* Comment Form */}
          {isAuthenticated && !isBackendUnavailable && (
            <form onSubmit={handleSubmit} className="space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <Button
                type="submit"
                size="sm"
                disabled={createCommentMutation.isPending || !commentText.trim()}
              >
                {createCommentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Comment'
                )}
              </Button>
            </form>
          )}

          {!isAuthenticated && (
            <Alert>
              <AlertDescription>Please sign in to comment.</AlertDescription>
            </Alert>
          )}

          {/* Comments List */}
          {isLoading && !isBackendUnavailable ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !isBackendUnavailable && comments && comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment, index) => (
                <div key={index} className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{comment.authorName || 'Anonymous'}</span>
                    <span className="text-muted-foreground">{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="text-sm">
                    <LinkifiedText text={comment.content} />
                  </div>
                </div>
              ))}
            </div>
          ) : !isBackendUnavailable && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
