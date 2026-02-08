import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListPosts, useCreatePost } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function CommunityBoardPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: posts, isLoading } = useListPosts();
  const createPostMutation = useCreatePost();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [authorName, setAuthorName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to create a post');
      return;
    }

    if (!title.trim() || !body.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      await createPostMutation.mutateAsync({
        authorName: authorName.trim() || null,
        title: title.trim(),
        body: body.trim(),
      });

      setTitle('');
      setBody('');
      setAuthorName('');
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Failed to create post. Please try again.');
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
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Community Board</h1>
        <p className="text-lg text-muted-foreground">
          Share your stories, ask questions, and connect with fellow plushie enthusiasts.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Create Post Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 border-2">
            <CardHeader>
              <CardTitle>Create a Post</CardTitle>
              <CardDescription>Share your thoughts with the community</CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <Alert>
                  <AlertDescription>Please sign in to create posts and join the conversation.</AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="authorName">Display Name (Optional)</Label>
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
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="What's on your mind?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body">
                      Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="body"
                      placeholder="Share your story..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      required
                      rows={6}
                      maxLength={1000}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={createPostMutation.isPending}>
                    {createPostMutation.isPending ? 'Posting...' : 'Post'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <div className="space-y-6 lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : posts && posts.length > 0 ? (
            posts
              .slice()
              .reverse()
              .map((post) => (
                <Card key={post.id.toString()} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{post.authorName || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-foreground">{post.body}</p>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card className="border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No posts yet</h3>
                <p className="text-muted-foreground">Be the first to share something with the community!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
