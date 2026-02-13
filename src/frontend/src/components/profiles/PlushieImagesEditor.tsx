import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { validateImageFiles, getAcceptedImageTypesString } from '../../utils/imageAttachment';
import { fileToExternalBlob, createFilePreviewURL, revokeFilePreviewURL } from '../../utils/profileImages';
import type { ExternalBlob } from '../../backend';
import { toast } from 'sonner';

interface PlushieImagesEditorProps {
  value: ExternalBlob[];
  onChange: (blobs: ExternalBlob[]) => void;
}

interface ImagePreview {
  blob: ExternalBlob;
  previewUrl: string;
}

export function PlushieImagesEditor({ value, onChange }: PlushieImagesEditorProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize previews from existing blobs
    const existingPreviews = value.map(blob => ({
      blob,
      previewUrl: blob.getDirectURL(),
    }));
    setPreviews(existingPreviews);

    // Cleanup preview URLs on unmount
    return () => {
      previews.forEach(preview => {
        // Only revoke URLs that were created locally (blob: URLs)
        if (preview.previewUrl.startsWith('blob:')) {
          revokeFilePreviewURL(preview.previewUrl);
        }
      });
    };
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const validation = validateImageFiles(files);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image files');
      return;
    }

    setIsUploading(true);

    try {
      const newPreviews: ImagePreview[] = [];

      for (const file of files) {
        const previewUrl = createFilePreviewURL(file);
        const blob = await fileToExternalBlob(file);
        newPreviews.push({ blob, previewUrl });
      }

      const updatedPreviews = [...previews, ...newPreviews];
      setPreviews(updatedPreviews);
      onChange(updatedPreviews.map(p => p.blob));
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const preview = previews[index];
    
    // Revoke preview URL if it's a local blob URL
    if (preview.previewUrl.startsWith('blob:')) {
      revokeFilePreviewURL(preview.previewUrl);
    }

    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    onChange(updatedPreviews.map(p => p.blob));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {previews.map((preview, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-lg border-2 group"
          >
            <img
              src={preview.previewUrl}
              alt={`Plushie ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="aspect-square">
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptedImageTypesString()}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Plus className="h-8 w-8" />
            <span className="text-sm">
              {isUploading ? 'Uploading...' : 'Add Images'}
            </span>
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Upload photos of your plushie collection. PNG, JPEG, or WebP format.
      </p>
    </div>
  );
}
