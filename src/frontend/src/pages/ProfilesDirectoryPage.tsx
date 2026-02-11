import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function ProfilesDirectoryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-3">Profiles Currently Unavailable</h2>
            <p className="text-muted-foreground">
              The profiles directory is not available at this time. Please check back later or explore other areas of Plushie Haven.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
