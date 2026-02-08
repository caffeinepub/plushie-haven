import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2 } from 'lucide-react';
import type { LegacyPost } from '../../backend';

interface PostActionsProps {
  post: LegacyPost;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (id: bigint, title: string, body: string, authorName: string | null) => Promise<void>;
  onDelete: (id: bigint) => Promise<void>;
  isEditPending: boolean;
  isDeletePending: boolean;
}

export function PostActions({
  post,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  isEditPending,
  isDeletePending,
}: PostActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body);
  const [editAuthorName, setEditAuthorName] = useState(post.authorName || '');

  const handleEditSubmit = async () => {
    if (!editTitle.trim() || !editBody.trim()) {
      return;
    }

    await onEdit(post.id, editTitle.trim(), editBody.trim(), editAuthorName.trim() || null);
    setShowEditDialog(false);
  };

  const handleDeleteConfirm = async () => {
    await onDelete(post.id);
    setShowDeleteDialog(false);
  };

  const handleEditCancel = () => {
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditAuthorName(post.authorName || '');
    setShowEditDialog(false);
  };

  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditDialog(true)}
            disabled={isEditPending}
            className="gap-2"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeletePending}
            className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Make changes to your post. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-author-name">Display Name (Optional)</Label>
              <Input
                id="edit-author-name"
                placeholder="Anonymous"
                value={editAuthorName}
                onChange={(e) => setEditAuthorName(e.target.value)}
                maxLength={50}
                disabled={isEditPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={100}
                disabled={isEditPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-body">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="edit-body"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={6}
                maxLength={1000}
                disabled={isEditPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditCancel} disabled={isEditPending}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isEditPending || !editTitle.trim() || !editBody.trim()}>
              {isEditPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post "{post.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeletePending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeletePending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
