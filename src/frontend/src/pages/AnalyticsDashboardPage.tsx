import { useGetSupporters, useGetSupporterRequests } from '../hooks/useSupporterQueries';
import { useListEvents } from '../hooks/useEventQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Calendar, Heart } from 'lucide-react';
import LoadingState from '../components/LoadingState';

export default function AnalyticsDashboardPage() {
  const { data: events, isLoading: eventsLoading } = useListEvents();
  const { data: supportersMap, isLoading: supportersLoading } = useGetSupporters();
  const { data: supporterRequests, isLoading: requestsLoading } = useGetSupporterRequests();

  const isLoading = eventsLoading || supportersLoading || requestsLoading;

  const totalEvents = events?.length || 0;
  const totalSupporters = supportersMap?.size || 0;
  const pendingRequests = supporterRequests?.length || 0;

  const MetricCard = ({ title, value, icon: Icon, description }: { title: string; value: number; icon: any; description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Overview of community metrics and activity</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading analytics..." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Events"
              value={totalEvents}
              icon={Calendar}
              description="Scheduled events"
            />
            <MetricCard
              title="Supporters"
              value={totalSupporters}
              icon={Heart}
              description="Active supporters"
            />
            <MetricCard
              title="Pending Requests"
              value={pendingRequests}
              icon={Users}
              description="Supporter requests"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Community Overview</CardTitle>
              <CardDescription>Summary of community activity and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-medium">Events</span>
                  </div>
                  <span className="text-2xl font-bold">{totalEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="font-medium">Supporters</span>
                  </div>
                  <span className="text-2xl font-bold">{totalSupporters}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">Pending Requests</span>
                  </div>
                  <span className="text-2xl font-bold">{pendingRequests}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
