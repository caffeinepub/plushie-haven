import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListEvents, useCreateEvent } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, MapPin, User, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError, isStoppedCanisterError } from '../utils/actorError';
import LoadingState from '../components/LoadingState';

export default function EventsPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: events, isLoading, error: eventsError } = useListEvents();
  const createEventMutation = useCreateEvent();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [authorName, setAuthorName] = useState('');

  // Check if backend is unavailable due to stopped canister
  const isBackendUnavailable = eventsError && isStoppedCanisterError(eventsError);
  const backendUnavailableMessage = isBackendUnavailable ? normalizeActorError(eventsError) : null;

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
      toast.error(normalizeActorError(error));
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

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Discover and create plushie-related events in your area.
        </p>
      </div>

      {/* Backend Unavailable Alert */}
      {isBackendUnavailable && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Service Unavailable</AlertTitle>
          <AlertDescription>{backendUnavailableMessage}</AlertDescription>
        </Alert>
      )}

      {/* Create Event Form */}
      <Card className="border-2 shadow-soft">
        <CardHeader>
          <CardTitle>Create an Event</CardTitle>
          <CardDescription>Share an upcoming plushie event with the community</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <Alert>
              <AlertDescription>Please sign in to create events.</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">
                  Event Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="event-title"
                  placeholder="e.g., Monthly Plushie Meetup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="event-description"
                  placeholder="Describe your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  maxLength={1000}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="event-location"
                  placeholder="e.g., Central Park, New York"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  maxLength={200}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-date">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-time">
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="end-date">
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time">
                    End Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizer-name">Organizer Name (optional)</Label>
                <Input
                  id="organizer-name"
                  placeholder="Your name or organization"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending ? 'Creating Event...' : 'Create Event'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Upcoming Events</h2>
        {isLoading ? (
          <LoadingState message="Loading events..." />
        ) : isBackendUnavailable ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to Load Events</AlertTitle>
            <AlertDescription>{backendUnavailableMessage}</AlertDescription>
          </Alert>
        ) : !events || events.length === 0 ? (
          <Card className="border-2 shadow-soft">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No events yet. Be the first to create one!</p>
            </CardContent>
          </Card>
        ) : (
          events
            .sort((a, b) => Number(a.startTime - b.startTime))
            .map((event) => (
              <Card key={event.id.toString()} className="border-2 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription className="flex flex-col gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Organized by {event.authorName || 'Anonymous'}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.startTime)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Until {formatDate(event.endTime)}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-foreground">{event.description}</p>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}
