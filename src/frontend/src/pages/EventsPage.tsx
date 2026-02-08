import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListEvents, useCreateEvent } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, User, Clock } from 'lucide-react';
import { toast } from 'sonner';
import LoadingState from '../components/LoadingState';

export default function EventsPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: events, isLoading } = useListEvents();
  const createEventMutation = useCreateEvent();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [authorName, setAuthorName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to create an event');
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim() || !startDate || !startTime || !endDate || !endTime) {
      toast.error('All fields are required');
      return;
    }

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`).getTime() * 1_000_000;
      const endDateTime = new Date(`${endDate}T${endTime}`).getTime() * 1_000_000;

      if (startDateTime >= endDateTime) {
        toast.error('Start time must be before end time');
        return;
      }

      await createEventMutation.mutateAsync({
        authorName: authorName.trim() || null,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startTime: BigInt(startDateTime),
        endTime: BigInt(endDateTime),
      });

      setTitle('');
      setDescription('');
      setLocation('');
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setAuthorName('');
      toast.success('Event created successfully!');
    } catch (error) {
      toast.error('Failed to create event. Please try again.');
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEventTime = (start: bigint, end: bigint) => {
    const startDate = new Date(Number(start) / 1_000_000);
    const endDate = new Date(Number(end) / 1_000_000);
    
    const dateStr = startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    const startTimeStr = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const endTimeStr = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return `${dateStr} • ${startTimeStr} - ${endTimeStr}`;
  };

  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Events</h1>
        <p className="text-lg text-muted-foreground">
          Discover plushie meetups, conventions, and community gatherings. Create your own events!
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Create Event Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 border-2 shadow-soft">
            <CardHeader>
              <CardTitle>Create an Event</CardTitle>
              <CardDescription>Share your plushie gathering with the community</CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <Alert>
                  <AlertDescription>Please sign in to create events and organize gatherings.</AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="authorName">Organizer Name (Optional)</Label>
                    <Input
                      id="authorName"
                      placeholder="Anonymous"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Event Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Plushie Meetup"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your event..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={4}
                      maxLength={500}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="location"
                      placeholder="City, State or Venue"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        Start Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime">
                        Start Time <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="endDate">
                        End Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">
                        End Time <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={createEventMutation.isPending}>
                    {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="space-y-6 lg:col-span-2">
          {isLoading ? (
            <LoadingState message="Loading events..." />
          ) : events && events.length > 0 ? (
            events
              .slice()
              .reverse()
              .map((event) => (
                <Card key={event.id.toString()} className="border-2 shadow-soft transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="space-y-3">
                      <CardTitle className="text-2xl">{event.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{formatEventTime(event.startTime, event.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>Organized by {event.authorName || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Posted {formatDate(event.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-foreground">{event.description}</p>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card className="border-2 shadow-soft">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No events yet</h3>
                <p className="text-muted-foreground">Be the first to organize a plushie gathering!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
