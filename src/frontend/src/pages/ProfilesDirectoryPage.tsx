import { Link } from '@tanstack/react-router';
import { useListDirectoryProfiles } from '../hooks/useProfileQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import { getBlobDirectURL } from '../utils/profileImages';

export default function ProfilesDirectoryPage() {
  const { data: profiles, isLoading, error } = useListDirectoryProfiles();

  if (isLoading) {
    return <LoadingState message="Loading profiles..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Failed to load profiles. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEmpty = !profiles || profiles.length === 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary">Community Profiles</h1>
          <p className="text-lg text-muted-foreground">
            Meet fellow plushie enthusiasts from our community
          </p>
        </div>

        {isEmpty ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No profiles yet</h2>
              <p className="text-muted-foreground mb-6">
                Be the first to create a profile and share your plushie collection with the community!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile, index) => {
              const displayName = profile.displayName || 'Plushie Enthusiast';
              const avatarUrl = profile.avatar ? getBlobDirectURL(profile.avatar) : undefined;
              const initials = displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              // Extract principal from profile (we need to get it from the directory listing)
              // Since the backend doesn't return principal in UserProfile, we'll use index as a workaround
              // In a real scenario, the backend should include the principal in directory results
              const principalString = `profile-${index}`;

              return (
                <Card key={index} className="hover:shadow-gentle transition-shadow">
                  <CardHeader className="text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">{displayName}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="rounded-full" disabled>
                      View Profile
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Profile viewing temporarily unavailable
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
