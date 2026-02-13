import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetUserProfile, useGetFollowSummary, useFollowProfile, useUnfollowProfile, useGetProfileLikeSummary, useLikeProfile, useUnlikeProfile } from '../hooks/useProfileQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Heart, Users, UserPlus, UserMinus, Edit, AlertCircle } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import { ProfileLinksList } from '../components/profiles/ProfileLinksList';
import { ProfileImageGrid } from '../components/profiles/ProfileImageGrid';
import { EditProfilePanel } from '../components/profiles/EditProfilePanel';
import { useState } from 'react';

export default function ProfilePage() {
  const { principal } = useParams({ from: '/profiles/$principal' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading, error } = useGetUserProfile(principal);
  const { data: followSummary } = useGetFollowSummary(principal);
  const { data: likeSummary } = useGetProfileLikeSummary(principal);

  const followMutation = useFollowProfile();
  const unfollowMutation = useUnfollowProfile();
  const likeMutation = useLikeProfile();
  const unlikeMutation = useUnlikeProfile();

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();
  const isOwnProfile = isAuthenticated && identity.getPrincipal().toString() === principal;

  const handleFollowToggle = async () => {
    if (!isAuthenticated) return;
    
    try {
      if (followSummary?.callerFollowsTarget) {
        await unfollowMutation.mutateAsync(principal);
      } else {
        await followMutation.mutateAsync(principal);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) return;
    
    try {
      if (likeSummary?.callerLiked) {
        await unlikeMutation.mutateAsync(principal);
      } else {
        await likeMutation.mutateAsync(principal);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingState message="Loading profile..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-3">Profile Not Found</h2>
              <p className="text-muted-foreground mb-6">
                This profile doesn't exist or is not publicly visible.
              </p>
              <Button onClick={() => navigate({ to: '/profiles' })}>
                Back to Profiles
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isEditing && isOwnProfile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <EditProfilePanel onClose={() => setIsEditing(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                {profile.avatar ? (
                  <AvatarImage
                    src={profile.avatar.getDirectURL()}
                    alt={profile.displayName}
                  />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                  <User className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <CardTitle className="text-3xl mb-2">{profile.displayName}</CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{Number(followSummary?.followersCount || 0n)} followers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{Number(followSummary?.followingCount || 0n)} following</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{Number(likeSummary?.likeCount || 0n)} likes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <Button onClick={() => setIsEditing(true)} size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : isAuthenticated ? (
                      <>
                        <Button
                          onClick={handleFollowToggle}
                          variant={followSummary?.callerFollowsTarget ? 'outline' : 'default'}
                          size="sm"
                          disabled={followMutation.isPending || unfollowMutation.isPending}
                        >
                          {followSummary?.callerFollowsTarget ? (
                            <>
                              <UserMinus className="h-4 w-4 mr-2" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleLikeToggle}
                          variant={likeSummary?.callerLiked ? 'default' : 'outline'}
                          size="sm"
                          disabled={likeMutation.isPending || unlikeMutation.isPending}
                        >
                          <Heart className={`h-4 w-4 ${likeSummary?.callerLiked ? 'fill-current' : ''}`} />
                        </Button>
                      </>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Please sign in to follow or like profiles.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-muted-foreground whitespace-pre-wrap mb-4">
                    {profile.bio}
                  </p>
                )}

                {profile.links && profile.links.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Links</h3>
                    <ProfileLinksList links={profile.links} />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          {profile.plushieImages && profile.plushieImages.length > 0 && (
            <CardContent>
              <h3 className="font-semibold text-lg mb-4">Plushie Collection</h3>
              <ProfileImageGrid images={profile.plushieImages} />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
