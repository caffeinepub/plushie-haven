import { useState } from 'react';
import { MessageSquare, User, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useListComments, useCreateComment, useGetCommentCount } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { normalizeActorError } from '../../utils/actorError';
import LoadingState from '../LoadingState';

interface PostCommentsProps {
  postId: bigint;
}

export function PostComments({ postId }: PostCommentsProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');

  const { data: commentCount, isLoading: countLoading } = useGetCommentCount(postId);
  const { data: comments, isLoading: commentsLoading } = useListComments(postId);
  const createCommentMutation = useCreateComment();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      return;
    }

    const trimmedContent = commentText.trim();
    if (!trimmedContent) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        postId,
        authorName: null,
        content: trimmedContent,
      });

      setCommentText('');
      toast.success('Comment posted successfully!');
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayCount = commentCount ?? 0;

  return (
    <div className="space-y-3">
      <Separator />
      
      {/* Comments Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={countLoading}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Comments ({displayCount})</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {/* Expanded Comments Section */}
      {isExpanded && (
        <div className="space-y-4 rounded-lg border-2 bg-muted/30 p-4">
          {/* Comment Input Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                maxLength={500}
                disabled={createCommentMutation.isPending}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={createCommentMutation.isPending || !commentText.trim()}
                >
                  {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>
          ) : (
            <Alert>
              <AlertDescription>
                Please sign in to leave a comment.
              </AlertDescription>
            </Alert>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {commentsLoading ? (
              <LoadingState message="Loading comments..." />
            ) : comments && comments.length > 0 ? (
              comments.map((comment, index) => (
                <Card key={index} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span>{comment.authorName || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
