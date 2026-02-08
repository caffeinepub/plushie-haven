import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetPostLikeSummary, useLikePost, useUnlikePost } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { normalizeActorError } from '../../utils/actorError';

interface PostLikeButtonProps {
  postId: bigint;
}

export function PostLikeButton({ postId }: PostLikeButtonProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: likeSummary, isLoading } = useGetPostLikeSummary(postId);
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();

  const likeCount = likeSummary?.likeCount ? Number(likeSummary.likeCount) : 0;
  const isLiked = likeSummary?.callerLiked || false;
  const isPending = likePostMutation.isPending || unlikePostMutation.isPending;

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      if (isLiked) {
        await unlikePostMutation.mutateAsync(postId);
      } else {
        await likePostMutation.mutateAsync(postId);
      }
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  return (
    <Button
      variant={isLiked ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggleLike}
      disabled={isPending || isLoading}
      className="gap-2"
    >
      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likeCount}</span>
    </Button>
  );
}
