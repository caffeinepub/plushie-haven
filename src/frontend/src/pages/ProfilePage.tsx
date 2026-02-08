import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetUserProfile,
  useGetFollowSummary,
  useFollowProfile,
  useUnfollowProfile,
  useGetProfileLikeSummary,
  useLikeProfile,
  useUnlikeProfile,
} from '../hooks/useProfileQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Heart, UserPlus, UserMinus, ExternalLink } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import { toast } from 'sonner';
import { normalizeActorError } from '../utils/actorError';
import type { ExternalBlob } from '../backend';

export default function ProfilePage() {
  const { principal } = useParams({ from: '/profiles/$principal' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: profile, isLoading: profileLoading } = useGetUserProfile(principal);
  const { data: followSummary, isLoading: followLoading } = useGetFollowSummary(principal);
  const { data: likeSummary, isLoading: likeLoading } = useGetProfileLikeSummary(principal);

  const followMutation = useFollowProfile();
  const unfollowMutation = useUnfollowProfile();
  const likeMutation = useLikeProfile();
  const unlikeMutation = useUnlikeProfile();

  const isOwnProfile = isAuthenticated && identity.getPrincipal().toString() === principal;

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow profiles');
      return;
    }

    try {
      if (followSummary?.callerFollowsTarget) {
        await unfollowMutation.mutateAsync(principal);
        toast.success('Unfollowed successfully');
      } else {
        await followMutation.mutateAsync(principal);
        toast.success('Followed successfully');
      }
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like profiles');
      return;
    }

    try {
      if (likeSummary?.callerLiked) {
        await unlikeMutation.mutateAsync(principal);
      } else {
        await likeMutation.mutateAsync(principal);
      }
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const getAvatarUrl = (avatar?: ExternalBlob): string | undefined => {
    if (!avatar) return undefined;
    return avatar.getDirectURL();
  };

  if (profileLoading || followLoading || likeLoading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Profile Unavailable</h2>
            <p className="text-muted-foreground mb-6">
              This profile is private or does not exist.
            </p>
            <Button onClick={() => navigate({ to: '/profiles' })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Directory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = profile.displayName || 'Plushie Enthusiast';
  const avatarUrl = getAvatarUrl(profile.avatar);
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const followersCount = followSummary?.followersCount ? Number(followSummary.followersCount) : 0;
  const followingCount = followSummary?.followingCount ? Number(followSummary.followingCount) : 0;
  const likeCount = likeSummary?.likeCount ? Number(likeSummary.likeCount) : 0;
  const isFollowing = followSummary?.callerFollowsTarget || false;
  const isLiked = likeSummary?.callerLiked || false;

  const followPending = followMutation.isPending || unfollowMutation.isPending;
  const likePending = likeMutation.isPending || unlikeMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/profiles' })}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Directory
        </Button>

        <Card className="border-2 shadow-soft">
          <CardHeader className="text-center">
            <Avatar className="h-32 w-32 mx-auto mb-4">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl mb-2">{displayName}</CardTitle>

            {/* Stats */}
            <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-4">
              <div className="text-center">
                <div className="font-semibold text-foreground">{followersCount}</div>
                <div>Followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">{followingCount}</div>
                <div>Following</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">{likeCount}</div>
                <div>Likes</div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && (
              <div className="flex justify-center gap-3">
                <Button
                  variant={isFollowing ? 'outline' : 'default'}
                  onClick={handleFollowToggle}
                  disabled={followPending}
                  className="gap-2"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
                <Button
                  variant={isLiked ? 'default' : 'outline'}
                  onClick={handleLikeToggle}
                  disabled={likePending}
                  className="gap-2"
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {profile.bio && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                </div>
              </>
            )}

            {profile.links && profile.links.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Links</h3>
                  <div className="space-y-2">
                    {profile.links.map((link, index) => {
                      const url = link.url.startsWith('http://') || link.url.startsWith('https://')
                        ? link.url
                        : `https://${link.url}`;

                      return (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>{link.displayName || url}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {profile.plushieImages && profile.plushieImages.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Plushie Collection</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.plushieImages.map((image, index) => {
                      const imageUrl = image.getDirectURL();
                      return (
                        <div
                          key={index}
                          className="aspect-square overflow-hidden rounded-lg border-2 hover:shadow-gentle transition-shadow"
                        >
                          <img
                            src={imageUrl}
                            alt={`Plushie ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
