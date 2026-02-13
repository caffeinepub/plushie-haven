import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useProfileQueries';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { AvatarUploader } from './AvatarUploader';
import { PlushieImagesEditor } from './PlushieImagesEditor';
import LoadingState from '../LoadingState';
import { toast } from 'sonner';
import type { ExternalBlob, Link } from '../../backend';

interface EditProfilePanelProps {
  onClose: () => void;
}

export function EditProfilePanel({ onClose }: EditProfilePanelProps) {
  const { data: currentProfile, isLoading } = useGetCallerUserProfile();
  const saveMutation = useSaveCallerUserProfile();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<ExternalBlob | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [plushieImages, setPlushieImages] = useState<ExternalBlob[]>([]);
  const [publicDirectory, setPublicDirectory] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setDisplayName(currentProfile.displayName || '');
      setBio(currentProfile.bio || '');
      setAvatar(currentProfile.avatar || null);
      setLinks(currentProfile.links || []);
      setPlushieImages(currentProfile.plushieImages || []);
      setPublicDirectory(currentProfile.publicDirectory || false);
    }
  }, [currentProfile]);

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
      toast.error(error.message || 'Failed to save profile');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-12">
          <LoadingState message="Loading profile..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Edit Profile</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your profile helps other members of the Plushie Haven community get to know you.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name *</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            maxLength={50}
          />
        </div>

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

        <div className="space-y-2">
          <Label>Avatar</Label>
          <AvatarUploader value={avatar} onChange={setAvatar} />
        </div>

        <div className="space-y-2">
          <Label>Links</Label>
          <div className="space-y-3">
            {links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Display name"
                  value={link.displayName}
                  onChange={(e) => handleLinkChange(index, 'displayName', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveLink(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddLink}>
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Plushie Collection</Label>
          <PlushieImagesEditor value={plushieImages} onChange={setPlushieImages} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="publicDirectory">Show in Public Directory</Label>
            <p className="text-sm text-muted-foreground">
              Allow others to discover your profile
            </p>
          </div>
          <Switch
            id="publicDirectory"
            checked={publicDirectory}
            onCheckedChange={setPublicDirectory}
          />
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
