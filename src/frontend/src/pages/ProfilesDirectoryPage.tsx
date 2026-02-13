import { useListDirectoryProfiles } from '../hooks/useProfileQueries';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, User } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function ProfilesDirectoryPage() {
  const { data: profiles, isLoading, error } = useListDirectoryProfiles();
  const { identity } = useInternetIdentity();

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

  if (!profiles || profiles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-3">No Public Profiles Yet</h2>
              <p className="text-muted-foreground">
                Be the first to create a public profile and join the Plushie Haven community!
              </p>
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
          {profiles.map((profile, index) => {
            // Get principal from identity if available, otherwise use index as fallback
            const principalString = identity?.getPrincipal().toString() || `profile-${index}`;
            
            return (
              <Link
                key={index}
                to="/profiles/$principal"
                params={{ principal: principalString }}
                className="block"
              >
                <Card className="hover:shadow-gentle transition-shadow cursor-pointer h-full">
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
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
