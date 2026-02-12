import { useState, useRef, useEffect } from 'react';
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
import { Loader2, ImagePlus, Video, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError, isStoppedCanisterError } from '../utils/actorError';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES, formatFileSize } from '../utils/imageAttachment';
import { ACCEPTED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES, validateVideoFile, formatFileSize as formatVideoFileSize } from '../utils/videoAttachment';
import { PostImageAttachment } from '../components/community/PostImageAttachment';
import { PostVideoAttachment } from '../components/community/PostVideoAttachment';
import { PostActions } from '../components/community/PostActions';
import { PostLikeButton } from '../components/community/PostLikeButton';
import { PostComments } from '../components/community/PostComments';
import { SupporterBadge } from '../components/supporter/SupporterBadge';
import { LinkifiedText } from '../components/community/LinkifiedText';
import LoadingState from '../components/LoadingState';
import { PollsSection } from '../components/community/PollsSection';
import { ModerationQueuePanel } from '../components/community/ModerationQueuePanel';
import { ExternalBlob } from '../backend';

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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Check if backend is unavailable due to stopped canister
  const isBackendUnavailable = !!(postsError && isStoppedCanisterError(postsError));
  const backendUnavailableMessage = isBackendUnavailable ? normalizeActorError(postsError) : null;

  // Cleanup video preview URL on unmount or when video changes
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

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
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateVideoFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Revoke previous preview URL to avoid memory leaks
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreview(objectUrl);
  };

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
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
      let videoBlob: ExternalBlob | null = null;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        imageBytes = new Uint8Array(arrayBuffer);
        imageContentType = imageFile.type;
      }

      if (videoFile) {
        const arrayBuffer = await videoFile.arrayBuffer();
        const videoBytes = new Uint8Array(arrayBuffer);
        videoBlob = ExternalBlob.fromBytes(videoBytes);
      }

      const authorName = userProfile?.displayName || null;

      await createPostMutation.mutateAsync({
        authorName,
        title: title.trim(),
        body: body.trim(),
        imageBytes,
        imageContentType,
        video: videoBlob,
      });

      setTitle('');
      setBody('');
      handleRemoveImage();
      handleRemoveVideo();
      toast.success('Post submitted for review!');
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
          Share your plushie stories, photos, videos, and connect with fellow enthusiasts.
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

      {/* Admin Moderation Queue */}
      {isAdmin && (
        <ModerationQueuePanel />
      )}

      {/* Create Post Form */}
      {isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Create a Post</CardTitle>
            <CardDescription>Share your thoughts, photos, or videos with the community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Give your post a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={createPostMutation.isPending || isBackendUnavailable}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  placeholder="Share your story, thoughts, or experiences..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  disabled={createPostMutation.isPending || isBackendUnavailable}
                />
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 w-full rounded-lg border object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleRemoveImage}
                    disabled={createPostMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Video Preview */}
              {videoPreview && (
                <div className="relative">
                  <video
                    src={videoPreview}
                    controls
                    className="max-h-64 w-full rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleRemoveVideo}
                    disabled={createPostMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={createPostMutation.isPending || !!imageFile || isBackendUnavailable}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={createPostMutation.isPending || !!imageFile || isBackendUnavailable}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Add Image
                </Button>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept={ACCEPTED_VIDEO_TYPES.join(',')}
                  onChange={handleVideoSelect}
                  className="hidden"
                  disabled={createPostMutation.isPending || !!videoFile || isBackendUnavailable}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={createPostMutation.isPending || !!videoFile || isBackendUnavailable}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Add Video
                </Button>

                <Button
                  type="submit"
                  disabled={createPostMutation.isPending || isBackendUnavailable}
                  className="ml-auto"
                >
                  {createPostMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Post'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Community Posts</h2>

        {isLoading ? (
          <LoadingState message="Loading posts..." />
        ) : posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(({ post, likeCount, commentCount }) => (
              <Card key={post.id.toString()}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        {isSupporter(post.author) && <SupporterBadge />}
                      </div>
                      <CardDescription>
                        Posted by {post.authorName || 'Anonymous'} on {formatDate(post.createdAt)}
                      </CardDescription>
                    </div>
                    {(canEditPost(post) || canDeletePost(post)) && (
                      <PostActions
                        post={post}
                        canEdit={canEditPost(post)}
                        canDelete={canDeletePost(post)}
                        onEdit={handleEditPost}
                        onDelete={handleDeletePost}
                        isEditPending={editPostMutation.isPending}
                        isDeletePending={deletePostMutation.isPending}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="whitespace-pre-wrap">
                    <LinkifiedText text={post.body} />
                  </div>

                  {post.video && (
                    <PostVideoAttachment video={post.video} />
                  )}

                  <Separator />

                  <div className="flex items-center gap-4">
                    <PostLikeButton postId={post.id} />
                    <PostComments postId={post.id} initialCount={Number(commentCount)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No posts yet. Be the first to share something!
            </CardContent>
          </Card>
        )}
      </div>

      {/* Polls Section */}
      <PollsSection />
    </div>
  );
}
