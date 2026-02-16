import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { GalleryMediaItem, ExternalBlob, Variant_video_image } from '../backend';
import { Variant_video_image as MediaType } from '../backend';

/**
 * Helper to ensure actor is available before mutation.
 */
function requireActor(actor: any, isFetching: boolean): any {
  if (isFetching && !actor) {
    throw new Error('ACTOR_CONNECTING');
  }
  
  if (!actor) {
    throw new Error('ACTOR_CONNECTING');
  }
  
  return actor;
}

/**
 * Fetch all uploaded gallery media items
 */
export function useListGalleryMediaItems() {
  const { actor, isFetching } = useActor();

  return useQuery<GalleryMediaItem[]>({
    queryKey: ['galleryMediaItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGalleryMediaItems();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Upload a new gallery media item (image or video)
 */
export function useAddGalleryMediaItem() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mediaType,
      blob,
      title,
      description,
    }: {
      mediaType: 'image' | 'video';
      blob: ExternalBlob;
      title?: string;
      description?: string;
    }) => {
      const validActor = requireActor(actor, isFetching);
      
      const backendMediaType = mediaType === 'image' ? MediaType.image : MediaType.video;
      
      return validActor.addGalleryMediaItem(
        backendMediaType,
        blob,
        title || null,
        description || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleryMediaItems'] });
    },
  });
}

/**
 * Delete a gallery media item by ID
 */
export function useDeleteGalleryMediaItem() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      const validActor = requireActor(actor, isFetching);
      return validActor.deleteGalleryMediaItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleryMediaItems'] });
    },
  });
}
