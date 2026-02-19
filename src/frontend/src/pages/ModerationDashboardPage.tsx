import { useState } from 'react';
import { useGetModerationQueue, useApproveModerationRequest, useRejectModerationRequest } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError } from '../utils/actorError';
import LoadingState from '../components/LoadingState';
import { PostImageAttachment } from '../components/community/PostImageAttachment';
import { PostVideoAttachment } from '../components/community/PostVideoAttachment';

export default function ModerationDashboardPage() {
  const { data: moderationQueue, isLoading } = useGetModerationQueue();
  const approveMutation = useApproveModerationRequest();
  const rejectMutation = useRejectModerationRequest();
  const [activeTab, setActiveTab] = useState('pending');

  const handleApprove = async (id: bigint) => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success('Content approved successfully');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const handleReject = async (id: bigint) => {
    try {
      await rejectMutation.mutateAsync(id);
      toast.success('Content rejected');
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
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
          <p className="text-muted-foreground">Review and moderate community content</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review
            {moderationQueue && moderationQueue.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {moderationQueue.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Content</CardTitle>
              <CardDescription>Review content awaiting moderation approval</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingState message="Loading moderation queue..." />
              ) : !moderationQueue || moderationQueue.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending content to review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {moderationQueue.map(([id, content]) => (
                    <div
                      key={id.toString()}
                      className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-pink-500/5 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{content.title}</h3>
                          <div className="text-xs text-muted-foreground mt-1">
                            By {content.author.toString().slice(0, 20)}...
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Submitted {formatDate(content.submittedAt)}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>

                      <div className="mb-3 rounded-lg bg-white/50 p-3 text-sm whitespace-pre-wrap">
                        {content.body}
                      </div>

                      {content.image && (
                        <div className="mb-3">
                          <PostImageAttachment image={content.image} />
                        </div>
                      )}

                      {content.video && (
                        <div className="mb-3">
                          <PostVideoAttachment video={content.video} />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="flex-1 gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="flex-1 gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Post Moderation</CardTitle>
              <CardDescription>Manage published posts</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="border-yellow-500/50 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  Post moderation features are available through the Community Board page. Admins can delete any post directly from there.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>Gallery Moderation</CardTitle>
              <CardDescription>Manage gallery media items</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="border-yellow-500/50 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  Gallery moderation features are available through the Gallery page. Admins can delete any media item directly from there.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
