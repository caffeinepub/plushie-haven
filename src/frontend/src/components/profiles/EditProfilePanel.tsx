import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useProfileQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, X, Plus, Trash2, AlertCircle, Info } from 'lucide-react';
import { AvatarUploader } from './AvatarUploader';
import { PlushieImagesEditor } from './PlushieImagesEditor';
import LoadingState from '../LoadingState';
import { toast } from 'sonner';
import type { ExternalBlob, Link } from '../../backend';

interface EditProfilePanelProps {
  onClose: () => void;
}

export function EditProfilePanel({ onClose }: EditProfilePanelProps) {
  const { data: currentProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveMutation = useSaveCallerUserProfile();
  const { identity } = useInternetIdentity();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<ExternalBlob | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [plushieImages, setPlushieImages] = useState<ExternalBlob[]>([]);
  const [publicDirectory, setPublicDirectory] = useState(false);

  // Initialize form with defaults when profile is null (first-time creation)
  useEffect(() => {
    if (isFetched) {
      if (currentProfile) {
        setDisplayName(currentProfile.displayName || '');
        setBio(currentProfile.bio || '');
        setAvatar(currentProfile.avatar || null);
        setLinks(currentProfile.links || []);
        setPlushieImages(currentProfile.plushieImages || []);
        setPublicDirectory(currentProfile.publicDirectory || false);
      } else {
        // First-time creation: reset to defaults
        setDisplayName('');
        setBio('');
        setAvatar(null);
        setLinks([]);
        setPlushieImages([]);
        setPublicDirectory(false);
      }
    }
  }, [currentProfile, isFetched]);

  const handleAddLink = () => {
    setLinks([...links, { url: '', displayName: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: 'url' | 'displayName', value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    try {
      await saveMutation.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatar: avatar || undefined,
        links: links.filter(link => link.url.trim() && link.displayName.trim()),
        plushieImages,
        publicDirectory,
      });
      
      toast.success('Profile saved successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingState message="Loading profile..." />
      </div>
    );
  }

  const isCreating = !currentProfile;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {isCreating ? 'Create Your Profile' : 'Edit Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
              />
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <AvatarUploader
                value={avatar}
                onChange={setAvatar}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself and your plushie collection..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {bio.length}/500 characters
              </p>
            </div>

            {/* Links */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Links</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLink}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Link
                </Button>
              </div>
              {links.length > 0 && (
                <div className="space-y-3">
                  {links.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Link name (e.g., Instagram)"
                          value={link.displayName}
                          onChange={(e) => handleLinkChange(index, 'displayName', e.target.value)}
                        />
                        <Input
                          placeholder="URL (e.g., https://instagram.com/username)"
                          value={link.url}
                          onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLink(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Plushie Images */}
            <div className="space-y-2">
              <Label>Plushie Collection</Label>
              <PlushieImagesEditor
                value={plushieImages}
                onChange={setPlushieImages}
              />
            </div>

            {/* Public Directory Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="publicDirectory">Show in Public Directory</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible in the community profiles directory
                  </p>
                </div>
                <Switch
                  id="publicDirectory"
                  checked={publicDirectory}
                  onCheckedChange={setPublicDirectory}
                />
              </div>
              {publicDirectory && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your profile will be visible to all visitors in the public profiles directory.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saveMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || !displayName.trim()}
            >
              {saveMutation.isPending ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Create Profile' : 'Save Changes'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
