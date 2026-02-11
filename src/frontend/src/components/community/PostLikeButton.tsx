import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetPostLikeSummary, useLikePost, useUnlikePost } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError, isStoppedCanisterError } from '../../utils/actorError';

interface PostLikeButtonProps {
  postId: bigint;
}

export function PostLikeButton({ postId }: PostLikeButtonProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: likeSummary, isLoading, error: likeSummaryError } = useGetPostLikeSummary(postId);
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();

  // Check if backend is unavailable due to stopped canister
  const isBackendUnavailable = !!(likeSummaryError && isStoppedCanisterError(likeSummaryError));

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like posts');
      return;
    }

    // Prevent action if backend is unavailable
    if (isBackendUnavailable) {
      toast.error(normalizeActorError(likeSummaryError));
      return;
    }

    try {
      if (likeSummary?.callerLiked) {
        await unlikeMutation.mutateAsync(postId);
      } else {
        await likeMutation.mutateAsync(postId);
      }
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const isPending = likeMutation.isPending || unlikeMutation.isPending;
  const isLiked = likeSummary?.callerLiked || false;
  const likeCount = likeSummary?.likeCount ? Number(likeSummary.likeCount) : 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleLike}
      disabled={isPending || isLoading || isBackendUnavailable}
      className="gap-2"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
      )}
      {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
    </Button>
  );
}
