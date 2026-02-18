import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAddGalleryMediaItem } from '@/hooks/useGalleryMediaQueries';
import { ExternalBlob } from '@/backend';
import {
  validateImageFiles,
  ACCEPTED_IMAGE_TYPES,
} from '@/utils/imageAttachment';
import {
  validateVideoFile,
  ACCEPTED_VIDEO_TYPES,
} from '@/utils/videoAttachment';
import { normalizeActorError } from '@/utils/actorError';
import { toast } from 'sonner';

interface GalleryUploadDialogProps {
  disabled?: boolean;
  isConnecting?: boolean;
}

export function GalleryUploadDialog({ disabled, isConnecting }: GalleryUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const addMediaMutation = useAddGalleryMediaItem();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setError(null);
      return;
    }

    // Determine if it's an image or video
    const isImage = ACCEPTED_IMAGE_TYPES.includes(selectedFile.type);
    const isVideo = ACCEPTED_VIDEO_TYPES.includes(selectedFile.type);

    if (!isImage && !isVideo) {
      setError('Please select an image (PNG, JPEG, WebP) or video (MP4, WebM, OGG, MOV) file.');
      setFile(null);
      return;
    }

    // Validate based on type
    if (isImage) {
      const validation = validateImageFiles([selectedFile]);
      if (!validation.valid) {
        setError(validation.error || 'Invalid image file');
        setFile(null);
        return;
      }
    } else if (isVideo) {
      const validation = validateVideoFile(selectedFile);
      if (!validation.valid) {
        setError(validation.error || 'Invalid video file');
        setFile(null);
        return;
      }
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setError(null);
      setUploadProgress(0);

      // Read file as bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Determine media type
      const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
      const mediaType = isImage ? 'image' : 'video';

      // Upload to backend
      await addMediaMutation.mutateAsync({
        mediaType,
        blob,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
      });

      // Show success message
      toast.success('Upload successful! Your item has been added to the gallery.');

      // Reset form and close dialog
      setFile(null);
      setTitle('');
      setDescription('');
      setUploadProgress(0);
      setOpen(false);
    } catch (err) {
      // Normalize all backend errors including ACTOR_CONNECTING
      const message = normalizeActorError(err);
      setError(message);
      setUploadProgress(0);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !addMediaMutation.isPending) {
      // Reset form when closing
      setFile(null);
      setTitle('');
      setDescription('');
      setError(null);
      setUploadProgress(0);
    }
    setOpen(newOpen);
  };

  const isUploading = addMediaMutation.isPending;
  const acceptedTypes = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',');

  const uploadButton = (
    <Button disabled={disabled} className="gap-2">
      <Upload className="h-4 w-4" />
      Upload
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              {uploadButton}
            </DialogTrigger>
          </TooltipTrigger>
          {isConnecting && (
            <TooltipContent>
              <p>Connecting to server... Please wait.</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload to Gallery</DialogTitle>
            <DialogDescription>
              Share your plushie photos or videos with the community. Images and videos up to 100MB are supported.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="file">File *</Label>
              <Input
                id="file"
                type="file"
                accept={acceptedTypes}
                onChange={handleFileChange}
                disabled={isUploading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: PNG, JPEG, WebP, MP4, WebM, OGG, MOV (max 100MB)
              </p>
            </div>

            {file && (
              <div className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                type="text"
                placeholder="Give your upload a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                maxLength={500}
                rows={3}
              />
            </div>

            {isUploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!file || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
