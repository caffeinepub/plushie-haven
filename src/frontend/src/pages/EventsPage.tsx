import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { events } from '../content/events';
import { Calendar, MapPin } from 'lucide-react';

export default function EventsPage() {
  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Upcoming Events</h1>
        <p className="text-lg text-muted-foreground">
          Discover plushie meetups, conventions, and community gatherings near you.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="border-2 transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-2">
                <Badge variant={event.type === 'convention' ? 'default' : 'secondary'}>{event.type}</Badge>
              </div>
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <CardDescription className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
