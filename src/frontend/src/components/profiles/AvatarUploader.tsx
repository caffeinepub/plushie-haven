import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, User } from 'lucide-react';
import { isValidImageType, isValidImageSize, formatFileSize, MAX_IMAGE_SIZE_BYTES, getAcceptedImageTypesString } from '../../utils/imageAttachment';
import { fileToExternalBlob, createFilePreviewURL, revokeFilePreviewURL } from '../../utils/profileImages';
import type { ExternalBlob } from '../../backend';
import { toast } from 'sonner';

interface AvatarUploaderProps {
  value: ExternalBlob | null;
  onChange: (blob: ExternalBlob | null) => void;
}

export function AvatarUploader({ value, onChange }: AvatarUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup preview URL on unmount
    return () => {
      if (previewUrl) {
        revokeFilePreviewURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidImageType(file)) {
      toast.error('Please select a PNG, JPEG, or WebP image.');
      return;
    }

    // Validate file size
    if (!isValidImageSize(file)) {
      toast.error(`Image must be smaller than ${formatFileSize(MAX_IMAGE_SIZE_BYTES)}.`);
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL
      const preview = createFilePreviewURL(file);
      
      // Revoke old preview if exists
      if (previewUrl) {
        revokeFilePreviewURL(previewUrl);
      }
      
      setPreviewUrl(preview);

      // Convert to ExternalBlob
      const blob = await fileToExternalBlob(file);
      onChange(blob);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      revokeFilePreviewURL(previewUrl);
      setPreviewUrl(null);
    }
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || (value ? value.getDirectURL() : null);

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-24 w-24 border-2 border-primary/20">
        {displayUrl ? (
          <AvatarImage src={displayUrl} alt="Avatar preview" />
        ) : null}
        <AvatarFallback className="bg-primary/10 text-primary">
          <User className="h-12 w-12" />
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedImageTypesString()}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : value ? 'Change Avatar' : 'Upload Avatar'}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          PNG, JPEG, or WebP. Max {formatFileSize(MAX_IMAGE_SIZE_BYTES)}.
        </p>
      </div>
    </div>
  );
}
