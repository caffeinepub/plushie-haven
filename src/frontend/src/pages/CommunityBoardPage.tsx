import { useState, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListPostsWithCounts, useCreatePost, useDeletePost, useEditPost, useIsCallerAdmin } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useProfileQueries';
import { useGetSupporters } from '../hooks/useSupporterQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, ImagePlus, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError, isStoppedCanisterError } from '../utils/actorError';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES, formatFileSize } from '../utils/imageAttachment';
import { PostImageAttachment } from '../components/community/PostImageAttachment';
import { PostActions } from '../components/community/PostActions';
import { PostLikeButton } from '../components/community/PostLikeButton';
import { PostComments } from '../components/community/PostComments';
import { SupporterBadge } from '../components/supporter/SupporterBadge';
import { LinkifiedText } from '../components/community/LinkifiedText';
import LoadingState from '../components/LoadingState';
import { PollsSection } from '../components/community/PollsSection';

// Single file validation helper
function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please use PNG, JPEG, or WebP images only.' };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: `Image is too large. Maximum size is ${formatFileSize(MAX_IMAGE_SIZE_BYTES)}.` };
  }
  return { valid: true };
}

export default function CommunityBoardPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: posts, isLoading, error: postsError } = useListPostsWithCounts();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: supportersMap } = useGetSupporters();
  const { data: isAdmin } = useIsCallerAdmin();
  const createPostMutation = useCreatePost();
  const deletePostMutation = useDeletePost();
  const editPostMutation = useEditPost();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if backend is unavailable due to stopped canister
  const isBackendUnavailable = !!(postsError && isStoppedCanisterError(postsError));
  const backendUnavailableMessage = isBackendUnavailable ? normalizeActorError(postsError) : null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to create a post');
      return;
    }

    // Prevent submission if backend is unavailable
    if (isBackendUnavailable) {
      toast.error(backendUnavailableMessage || 'Service is temporarily unavailable');
      return;
    }

    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required');
      return;
    }

    try {
      let imageBytes: Uint8Array | null = null;
      let imageContentType: string | null = null;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        imageBytes = new Uint8Array(arrayBuffer);
        imageContentType = imageFile.type;
      }

      const authorName = userProfile?.displayName || null;

      await createPostMutation.mutateAsync({
        authorName,
        title: title.trim(),
        body: body.trim(),
        imageBytes,
        imageContentType,
      });

      setTitle('');
      setBody('');
      handleRemoveImage();
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const handleEditPost = async (id: bigint, newTitle: string, newBody: string, newAuthorName: string | null) => {
    try {
      await editPostMutation.mutateAsync({
        id,
        title: newTitle,
        body: newBody,
        authorName: newAuthorName,
      });
      toast.success('Post updated successfully!');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const handleDeletePost = async (id: bigint) => {
    try {
      await deletePostMutation.mutateAsync(id);
      toast.success('Post deleted successfully!');
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

  const isSupporter = (authorPrincipal: any): boolean => {
    if (!supportersMap) return false;
    return supportersMap.has(authorPrincipal.toString());
  };

  const canEditPost = (post: any): boolean => {
    if (!identity) return false;
    const callerPrincipal = identity.getPrincipal();
    return post.author.toString() === callerPrincipal.toString() || isAdmin === true;
  };

  const canDeletePost = (post: any): boolean => {
    if (!identity) return false;
    const callerPrincipal = identity.getPrincipal();
    return post.author.toString() === callerPrincipal.toString() || isAdmin === true;
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Community Board</h1>
        <p className="text-muted-foreground">
          Share your plushie stories, photos, and connect with fellow enthusiasts.
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

      {/* Create Post Form */}
      <Card className="border-2 shadow-soft">
        <CardHeader>
          <CardTitle>Create a Post</CardTitle>
          <CardDescription>Share something with the community</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <Alert>
              <AlertDescription>Please sign in to create posts.</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Give your post a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                  disabled={isBackendUnavailable}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">
                  Body <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="body"
                  placeholder="What's on your mind?"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  maxLength={2000}
                  rows={5}
                  disabled={isBackendUnavailable}
                />
              </div>

              <div className="space-y-2">
                <Label>Image (optional)</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-full rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={handleRemoveImage}
                      disabled={isBackendUnavailable}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                      disabled={isBackendUnavailable}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      disabled={isBackendUnavailable}
                    >
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Add Image
                    </Button>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createPostMutation.isPending || isBackendUnavailable}
              >
                {createPostMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Post'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <LoadingState message="Loading posts..." />
        ) : isBackendUnavailable ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to Load Posts</AlertTitle>
            <AlertDescription>{backendUnavailableMessage}</AlertDescription>
          </Alert>
        ) : !posts || posts.length === 0 ? (
          <Card className="border-2 shadow-soft">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
            </CardContent>
          </Card>
        ) : (
          posts
            .sort((a, b) => Number(b.post.createdAt - a.post.createdAt))
            .map(({ post, likeCount, commentCount }) => (
              <Card key={post.id.toString()} className="border-2 shadow-soft">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        <LinkifiedText text={post.title} />
                      </CardTitle>
                      <CardDescription className="mt-2 flex flex-wrap items-center gap-2">
                        <span>
                          By {post.authorName || 'Anonymous'} • {formatDate(post.createdAt)}
                        </span>
                        {isSupporter(post.author) && <SupporterBadge />}
                      </CardDescription>
                    </div>
                    <PostActions
                      post={post}
                      canEdit={canEditPost(post)}
                      canDelete={canDeletePost(post)}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      isEditPending={editPostMutation.isPending}
                      isDeletePending={deletePostMutation.isPending}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-foreground">
                    <LinkifiedText text={post.body} />
                  </div>
                  <PostImageAttachment image={post.image} />
                  <div className="flex items-center gap-4 border-t pt-4">
                    <PostLikeButton postId={post.id} />
                    <PostComments postId={post.id} initialCount={Number(commentCount)} />
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Polls Section */}
      <Separator className="my-8" />
      <PollsSection />
    </div>
  );
}
