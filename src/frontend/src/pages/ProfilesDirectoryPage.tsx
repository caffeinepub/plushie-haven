import { useListDirectoryProfiles } from '../hooks/useProfileQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, User, Plus } from 'lucide-react';
import LoadingState from '../components/LoadingState';

export default function ProfilesDirectoryPage() {
  const { data: profileEntries, isLoading, error } = useListDirectoryProfiles();
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const handleCreateProfile = () => {
    if (isAuthenticated && identity) {
      const principalString = identity.getPrincipal().toString();
      navigate({
        to: '/profiles/$principal',
        params: { principal: principalString },
        search: { edit: true },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingState message="Loading profiles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <h2 className="text-2xl font-semibold mb-3">Error Loading Profiles</h2>
              <p className="text-muted-foreground">
                We couldn't load the profiles directory. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profileEntries || profileEntries.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-3">No Public Profiles Yet</h2>
              <p className="text-muted-foreground mb-6">
                Be the first to create a public profile and join the Plushie Haven community!
              </p>
              {isAuthenticated ? (
                <Button 
                  onClick={handleCreateProfile} 
                  size="lg" 
                  className="gap-2"
                  disabled={isInitializing || !identity}
                >
                  <Plus className="h-5 w-5" />
                  Create My Public Profile
                </Button>
              ) : (
                <Button
                  onClick={login}
                  size="lg"
                  disabled={loginStatus === 'logging-in'}
                >
                  {loginStatus === 'logging-in' ? 'Signing in...' : 'Sign In to Create Profile'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community Profiles</h1>
          <p className="text-muted-foreground">
            Discover members of the Plushie Haven community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profileEntries.map(([principal, profile]) => (
            <Card
              key={principal.toString()}
              className="hover:shadow-gentle transition-shadow cursor-pointer h-full"
              onClick={() => {
                navigate({
                  to: '/profiles/$principal',
                  params: { principal: principal.toString() },
                });
              }}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    {profile.avatar ? (
                      <AvatarImage
                        src={profile.avatar.getDirectURL()}
                        alt={profile.displayName}
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {profile.displayName}
                    </h3>
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
