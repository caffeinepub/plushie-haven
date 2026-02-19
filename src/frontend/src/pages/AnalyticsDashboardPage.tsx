import { useListPostsWithCounts, useListEvents, useListPolls } from '../hooks/useQueries';
import { useGetSupporters, useGetSupporterRequests } from '../hooks/useSupporterQueries';
import { useListGalleryMediaItems } from '../hooks/useGalleryMediaQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, FileText, Image, Calendar, Heart, TrendingUp } from 'lucide-react';
import LoadingState from '../components/LoadingState';

export default function AnalyticsDashboardPage() {
  const { data: posts, isLoading: postsLoading } = useListPostsWithCounts();
  const { data: events, isLoading: eventsLoading } = useListEvents();
  const { data: supportersMap, isLoading: supportersLoading } = useGetSupporters();
  const { data: supporterRequests, isLoading: requestsLoading } = useGetSupporterRequests();
  const { data: galleryItems, isLoading: galleryLoading } = useListGalleryMediaItems();
  const { data: polls, isLoading: pollsLoading } = useListPolls();

  const isLoading = postsLoading || eventsLoading || supportersLoading || requestsLoading || galleryLoading || pollsLoading;

  const totalPosts = posts?.length || 0;
  const totalComments = posts?.reduce((sum, p) => sum + Number(p.commentCount), 0) || 0;
  const totalLikes = posts?.reduce((sum, p) => sum + Number(p.likeCount), 0) || 0;
  const totalEvents = events?.length || 0;
  const totalSupporters = supportersMap?.size || 0;
  const pendingRequests = supporterRequests?.length || 0;
  const totalGalleryItems = galleryItems?.length || 0;
  const totalPolls = polls?.length || 0;

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Posts"
              value={totalPosts}
              icon={FileText}
              description="Community board posts"
            />
            <MetricCard
              title="Total Comments"
              value={totalComments}
              icon={Users}
              description="Across all posts"
            />
            <MetricCard
              title="Total Likes"
              value={totalLikes}
              icon={Heart}
              description="Post engagement"
            />
            <MetricCard
              title="Gallery Items"
              value={totalGalleryItems}
              icon={Image}
              description="Uploaded media"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Events"
              value={totalEvents}
              icon={Calendar}
              description="Scheduled events"
            />
            <MetricCard
              title="Polls"
              value={totalPolls}
              icon={TrendingUp}
              description="Community polls"
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
              <CardTitle>Content Overview</CardTitle>
              <CardDescription>Summary of community-generated content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">Posts</span>
                  </div>
                  <span className="text-2xl font-bold">{totalPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">Comments</span>
                  </div>
                  <span className="text-2xl font-bold">{totalComments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    <span className="font-medium">Gallery Items</span>
                  </div>
                  <span className="text-2xl font-bold">{totalGalleryItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-medium">Polls</span>
                  </div>
                  <span className="text-2xl font-bold">{totalPolls}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
