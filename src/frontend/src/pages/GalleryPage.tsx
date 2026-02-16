import { useState, useEffect, useRef } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search, Heart, LogIn, Play, BookOpen, Trash2 } from 'lucide-react';
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
import { GalleryLightbox } from '@/components/gallery/GalleryLightbox';
import { GalleryUploadDialog } from '@/components/gallery/GalleryUploadDialog';
import { useGalleryFavorites } from '@/hooks/useGalleryFavorites';
import { useListGalleryMediaItems, useDeleteGalleryMediaItem } from '@/hooks/useGalleryMediaQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useIsCallerAdmin } from '@/hooks/useQueries';
import {
  mergeGalleryItems,
  filterBySearch,
  filterByFavorites,
  type UnifiedGalleryItem,
  type UploadedGalleryItem,
} from '@/utils/galleryMedia';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { normalizeActorError } from '@/utils/actorError';
import { toast } from 'sonner';

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lastFocusedCardRef, setLastFocusedCardRef] = useState<HTMLElement | null>(null);
  const [itemToDelete, setItemToDelete] = useState<UploadedGalleryItem | null>(null);
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const { isFavorite, toggleFavorite } = useGalleryFavorites();
  const { identity, login } = useInternetIdentity();
  const { data: uploadedItems = [], isLoading: isLoadingUploaded } = useListGalleryMediaItems();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const deleteMutation = useDeleteGalleryMediaItem();

  const isAuthenticated = !!identity;

  // Merge static, storybook, and uploaded items
  const allItems = mergeGalleryItems(uploadedItems);

  // Filter items based on search and favorites
  let filteredItems = filterBySearch(allItems, searchQuery);
  if (showFavoritesOnly) {
    filteredItems = filterByFavorites(filteredItems, isFavorite);
  }

  const handleCardClick = (index: number, event: React.MouseEvent<HTMLElement>) => {
    setLastFocusedCardRef(event.currentTarget);
    setSelectedIndex(index);
  };

  const handleCardKeyDown = (index: number, event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setLastFocusedCardRef(event.currentTarget);
      setSelectedIndex(index);
    }
  };

  const handleClose = () => {
    setSelectedIndex(null);
    // Return focus to the last interacted card
    if (lastFocusedCardRef) {
      setTimeout(() => {
        lastFocusedCardRef?.focus();
      }, 0);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < filteredItems.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Check if current user can delete an item
  const canDeleteItem = (item: UnifiedGalleryItem): boolean => {
    if (item.type !== 'uploaded') return false;
    if (!isAuthenticated) return false;
    
    const uploadedItem = item as UploadedGalleryItem;
    const currentPrincipal = identity?.getPrincipal().toString();
    const itemAuthor = uploadedItem.author.toString();
    
    return isAdmin || currentPrincipal === itemAuthor;
  };

  // Handle delete confirmation
  const handleDeleteClick = (item: UploadedGalleryItem, event: React.MouseEvent) => {
    event.stopPropagation();
    setItemToDelete(item);
  };

  // Execute delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMutation.mutateAsync(itemToDelete.backendId);
      toast.success('Item deleted successfully');
      setItemToDelete(null);
      
      // If lightbox is open and showing the deleted item, close or navigate
      if (selectedIndex !== null) {
        const selectedItem = filteredItems[selectedIndex];
        if (selectedItem.id === itemToDelete.id) {
          // Close lightbox if this was the deleted item
          handleClose();
        }
      }
    } catch (error) {
      const message = normalizeActorError(error);
      toast.error(message);
    }
  };

  // Handle delete from lightbox
  const handleDeleteFromLightbox = async () => {
    if (selectedIndex === null) return;
    const selectedItem = filteredItems[selectedIndex];
    
    if (selectedItem.type !== 'uploaded') return;
    
    try {
      await deleteMutation.mutateAsync((selectedItem as UploadedGalleryItem).backendId);
      toast.success('Item deleted successfully');
      
      // Navigate to adjacent item or close if no items left
      const newFilteredItems = filteredItems.filter(item => item.id !== selectedItem.id);
      if (newFilteredItems.length === 0) {
        handleClose();
      } else if (selectedIndex >= newFilteredItems.length) {
        setSelectedIndex(newFilteredItems.length - 1);
      }
      // If selectedIndex < newFilteredItems.length, it will naturally point to the next item
    } catch (error) {
      const message = normalizeActorError(error);
      toast.error(message);
    }
  };

  const selectedItem = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Gallery</h1>
        <p className="text-lg text-muted-foreground">
          Explore beautiful plushie collections, displays, and adorable setups from our community.
        </p>
      </div>

      {/* Upload prompt for anonymous users */}
      {!isAuthenticated && (
        <Alert className="mb-6">
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>Sign in to upload your own plushie photos and videos to the gallery!</span>
            <Button size="sm" onClick={login} className="gap-2 shrink-0">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Search, Filter, and Upload Controls */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            {showFavoritesOnly ? 'Show All' : 'Favorites Only'}
          </Button>

          <GalleryUploadDialog disabled={!isAuthenticated} />
        </div>
      </div>

      {/* Gallery Grid */}
      {isLoadingUploaded ? (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">Loading gallery...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            {showFavoritesOnly
              ? 'No favorites yet. Click the heart icon on any item to add it to your favorites!'
              : 'No items match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => {
            const canDelete = canDeleteItem(item);
            
            return (
              <Card
                key={item.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(index, el);
                }}
                className="group relative overflow-hidden border-2 shadow-soft transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                onClick={(e) => handleCardClick(index, e)}
                onKeyDown={(e) => handleCardKeyDown(index, e)}
                tabIndex={0}
                role="button"
                aria-label={`View ${item.title}`}
              >
                <div className="aspect-square overflow-hidden bg-muted relative">
                  {item.mediaType === 'video' ? (
                    <>
                      <video
                        src={item.src}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="bg-white/90 rounded-full p-3 shadow-lg">
                          <Play className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                    </>
                  ) : item.mediaType === 'storybook' ? (
                    <>
                      <img
                        src={item.src}
                        alt={item.description}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 to-transparent">
                        <div className="bg-white/95 rounded-full p-3 shadow-lg">
                          <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.src}
                      alt={item.description}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/90 hover:bg-white shadow-soft"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      aria-label={isFavorite(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isFavorite(item.id) ? 'fill-accent text-accent' : 'text-muted-foreground'
                        }`}
                      />
                    </Button>
                    
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/90 hover:bg-destructive hover:text-destructive-foreground shadow-soft"
                        onClick={(e) => handleDeleteClick(item as UploadedGalleryItem, e)}
                        aria-label="Delete item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gallery Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.title}"? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox */}
      {selectedItem && selectedIndex !== null && (
        <GalleryLightbox
          item={selectedItem}
          onClose={handleClose}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={selectedIndex > 0}
          hasNext={selectedIndex < filteredItems.length - 1}
          currentIndex={selectedIndex + 1}
          totalCount={filteredItems.length}
          isFavorite={isFavorite(selectedItem.id)}
          onToggleFavorite={() => toggleFavorite(selectedItem.id)}
          canDelete={canDeleteItem(selectedItem)}
          onDelete={handleDeleteFromLightbox}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
