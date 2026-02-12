import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetPostLikeSummary, useLikePost, useUnlikePost } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError, isStoppedCanisterError } from '../../utils/actorError';

interface PostLikeButtonProps {
  postId: bigint;
}

export function PostLikeButton({ postId }: PostLikeButtonProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: likeSummary, error: likeSummaryError } = useGetPostLikeSummary(postId);
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();

  // Check if backend is unavailable due to stopped canister
  const isBackendUnavailable = !!(likeSummaryError && isStoppedCanisterError(likeSummaryError));

  const handleLike = async () => {
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
      if (likeSummary?.isLiked) {
        await unlikeMutation.mutateAsync(postId);
      } else {
        await likeMutation.mutateAsync(postId);
      }
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const isLiked = likeSummary?.isLiked || false;
  const likeCount = likeSummary?.count ? Number(likeSummary.count) : 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={likeMutation.isPending || unlikeMutation.isPending || !!isBackendUnavailable}
      className="gap-2"
    >
      <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
      <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
    </Button>
  );
}
