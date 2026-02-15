import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useGetProfileForPage, useGetFollowSummary, useFollowProfile, useUnfollowProfile, useGetProfileLikeSummary, useLikeProfile, useUnlikeProfile } from '../hooks/useProfileQueries';
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
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { principal } = useParams({ from: '/profiles/$principal' });
  const search = useSearch({ from: '/profiles/$principal' });
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading, error } = useGetProfileForPage(principal);
  const { data: followSummary } = useGetFollowSummary(principal);
  const { data: likeSummary } = useGetProfileLikeSummary(principal);

  const followMutation = useFollowProfile();
  const unfollowMutation = useUnfollowProfile();
  const likeMutation = useLikeProfile();
  const unlikeMutation = useUnlikeProfile();

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();
  const isOwnProfile = isAuthenticated && identity.getPrincipal().toString() === principal;

  // Handle edit mode from URL search param
  useEffect(() => {
    if (search.edit && isOwnProfile) {
      setIsEditing(true);
    }
  }, [search.edit, isOwnProfile]);

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

  const handleEditClick = () => {
    setIsEditing(true);
    navigate({
      to: '/profiles/$principal',
      params: { principal },
      search: { edit: true },
    });
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    navigate({
      to: '/profiles/$principal',
      params: { principal },
      search: {},
    });
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
    return <EditProfilePanel onClose={handleCloseEdit} />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
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

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.displayName}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {Number(followSummary?.followersCount || 0n)} followers
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {Number(followSummary?.followingCount || 0n)} following
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {Number(likeSummary?.likeCount || 0n)} likes
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <Button onClick={handleEditClick} className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    ) : isAuthenticated ? (
                      <>
                        <Button
                          variant={followSummary?.callerFollowsTarget ? 'outline' : 'default'}
                          onClick={handleFollowToggle}
                          disabled={followMutation.isPending || unfollowMutation.isPending}
                          className="gap-2"
                        >
                          {followSummary?.callerFollowsTarget ? (
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
                          variant={likeSummary?.callerLiked ? 'default' : 'outline'}
                          onClick={handleLikeToggle}
                          disabled={likeMutation.isPending || unlikeMutation.isPending}
                          size="icon"
                        >
                          <Heart
                            className={`h-4 w-4 ${likeSummary?.callerLiked ? 'fill-current' : ''}`}
                          />
                        </Button>
                      </>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center gap-2">
                          <span>Sign in to follow and like profiles</span>
                          <Button size="sm" onClick={login}>
                            Sign In
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-muted-foreground whitespace-pre-wrap mb-4">{profile.bio}</p>
                )}

                {profile.links && profile.links.length > 0 && (
                  <ProfileLinksList links={profile.links} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plushie Collection */}
        {profile.plushieImages && profile.plushieImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Plushie Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileImageGrid images={profile.plushieImages} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
