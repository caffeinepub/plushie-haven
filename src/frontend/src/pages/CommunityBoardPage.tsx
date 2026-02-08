import { useState, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListPosts, useCreatePost, useDeletePost, useEditPost, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { PostImageAttachment } from '../components/community/PostImageAttachment';
import { PostActions } from '../components/community/PostActions';
import { PostLikeButton } from '../components/community/PostLikeButton';
import { PostComments } from '../components/community/PostComments';
import LoadingState from '../components/LoadingState';
import { normalizeActorError } from '../utils/actorError';
import type { LegacyPost } from '../backend';
import {
  fileToImageData,
  isValidImageType,
  isValidImageSize,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
  ACCEPTED_IMAGE_TYPES,
  type ImageFileData,
} from '../utils/imageAttachment';

export default function CommunityBoardPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: posts, isLoading } = useListPosts();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const createPostMutation = useCreatePost();
  const deletePostMutation = useDeletePost();
  const editPostMutation = useEditPost();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageFileData | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidImageType(file)) {
      toast.error('Please select a valid image file (PNG, JPEG, or WebP)');
      return;
    }

    // Validate file size
    if (!isValidImageSize(file)) {
      toast.error(`Image size must be less than ${formatFileSize(MAX_IMAGE_SIZE_BYTES)}`);
      return;
    }

    try {
      const imageData = await fileToImageData(file);
      setSelectedImage(imageData);

      // Create preview URL
      const bytes = new Uint8Array(imageData.bytes);
      const blob = new Blob([bytes], { type: imageData.contentType });
      const previewUrl = URL.createObjectURL(blob);
      
      // Revoke old preview URL if exists
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      
      setImagePreviewUrl(previewUrl);
    } catch (error) {
      toast.error('Failed to process image. Please try again.');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
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

    if (!title.trim() || !body.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      await createPostMutation.mutateAsync({
        authorName: authorName.trim() || null,
        title: title.trim(),
        body: body.trim(),
        imageBytes: selectedImage?.bytes || null,
        imageContentType: selectedImage?.contentType || null,
      });

      setTitle('');
      setBody('');
      setAuthorName('');
      handleRemoveImage();
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const handleDeletePost = async (postId: bigint) => {
    try {
      await deletePostMutation.mutateAsync(postId);
      toast.success('Post deleted successfully!');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const handleEditPost = async (postId: bigint, newTitle: string, newBody: string, newAuthorName: string | null) => {
    try {
      await editPostMutation.mutateAsync({
        id: postId,
        title: newTitle,
        body: newBody,
        authorName: newAuthorName,
      });
      toast.success('Post updated successfully!');
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

  const isPostAuthor = (post: LegacyPost): boolean => {
    if (!identity) return false;
    return post.author.toString() === identity.getPrincipal().toString();
  };

  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Community Board</h1>
        <p className="text-lg text-muted-foreground">
          Share your plushie stories, ask questions, and connect with fellow enthusiasts.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Create Post Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 border-2 shadow-soft">
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

                  <div className="space-y-2">
                    <Label htmlFor="image">Image (Optional)</Label>
                    <div className="space-y-2">
                      <Input
                        ref={fileInputRef}
                        id="image"
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        onChange={handleImageSelect}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Max size: {formatFileSize(MAX_IMAGE_SIZE_BYTES)}. Formats: PNG, JPEG, WebP
                      </p>
                    </div>

                    {imagePreviewUrl && (
                      <div className="relative mt-2 overflow-hidden rounded-lg border-2">
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          className="h-48 w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={createPostMutation.isPending}>
                    {createPostMutation.isPending ? 'Posting...' : 'Create Post'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <div className="space-y-6 lg:col-span-2">
          {isLoading ? (
            <LoadingState message="Loading posts..." />
          ) : posts && posts.length > 0 ? (
            posts
              .slice()
              .reverse()
              .map((post) => {
                const canDelete = isAuthenticated ? (isAdmin || isPostAuthor(post)) : false;
                const canEdit = isAuthenticated ? isAdmin : false;

                return (
                  <Card key={post.id.toString()} className="border-2 shadow-soft transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-2xl">{post.title}</CardTitle>
                          <PostActions
                            post={post}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            onEdit={handleEditPost}
                            onDelete={handleDeletePost}
                            isEditPending={editPostMutation.isPending}
                            isDeletePending={deletePostMutation.isPending}
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            <span>{post.authorName || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="whitespace-pre-wrap text-base leading-relaxed">{post.body}</p>
                      <PostImageAttachment image={post.image} />
                      <div className="flex items-center gap-2 pt-2">
                        <PostLikeButton postId={post.id} />
                      </div>
                      <PostComments postId={post.id} />
                    </CardContent>
                  </Card>
                );
              })
          ) : (
            <Card className="border-2 shadow-soft">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
