/**
 * Shared types and helpers for the mixed gallery feed (static + uploaded items)
 */

import type { GalleryMediaItem } from '../backend';
import { teddyStorybook } from '../content/teddyStorybook';

export interface StaticGalleryItem {
  id: string;
  type: 'static';
  mediaType: 'image';
  src: string;
  title: string;
  description: string;
}

export interface StorybookGalleryItem {
  id: string;
  type: 'storybook';
  mediaType: 'storybook';
  src: string;
  title: string;
  description: string;
  story: string;
}

export interface UploadedGalleryItem {
  id: string;
  type: 'uploaded';
  mediaType: 'image' | 'video';
  src: string;
  title: string;
  description: string;
  createdAt: bigint;
}

export type UnifiedGalleryItem = StaticGalleryItem | StorybookGalleryItem | UploadedGalleryItem;

/**
 * Static gallery items (existing images)
 */
export const staticGalleryItems: StaticGalleryItem[] = [
  {
    id: 'static:1',
    type: 'static',
    mediaType: 'image',
    src: '/assets/generated/gallery-plushies-1.dim_1024x1024.png',
    title: 'Pastel Plushie Collection',
    description: 'A cozy bed display featuring adorable plushies in pink and baby blue',
  },
  {
    id: 'static:2',
    type: 'static',
    mediaType: 'image',
    src: '/assets/generated/gallery-plushies-2.dim_1024x1024.png',
    title: 'Bunny & Bear Friends',
    description: 'Cute plush bunny and bear posed together with soft studio lighting',
  },
  {
    id: 'static:3',
    type: 'static',
    mediaType: 'image',
    src: '/assets/generated/gallery-plushies-3.dim_1024x1024.png',
    title: 'Organized Plushie Shelf',
    description: 'Neatly arranged plush toys with pink and baby blue decor accents',
  },
  {
    id: 'static:4',
    type: 'static',
    mediaType: 'image',
    src: '/assets/generated/gallery-plushies-4.dim_1024x1024.png',
    title: 'Plushie Tea Party',
    description: 'A charming miniature tea party scene with pastel props and plushies',
  },
  {
    id: 'static:5',
    type: 'static',
    mediaType: 'image',
    src: '/assets/generated/gallery-plushies-5.dim_1024x1024.png',
    title: 'Soft Fabric Textures',
    description: 'Close-up details of plush fabric in pink and baby blue tones',
  },
  {
    id: 'static:6',
    type: 'static',
    mediaType: 'image',
    src: '/assets/generated/gallery-plushies-6.dim_1024x1024.png',
    title: 'Adventure Plushie',
    description: 'A travel-ready plushie with tiny backpack against a pastel sky',
  },
];

/**
 * Storybook gallery item
 */
export const storybookGalleryItem: StorybookGalleryItem = {
  id: teddyStorybook.id,
  type: 'storybook',
  mediaType: 'storybook',
  src: teddyStorybook.coverImage,
  title: teddyStorybook.title,
  description: teddyStorybook.description,
  story: teddyStorybook.story,
};

/**
 * Convert backend GalleryMediaItem to UploadedGalleryItem
 */
export function backendItemToUploadedItem(item: GalleryMediaItem, index: number): UploadedGalleryItem {
  // Create a stable ID based on creation time and index
  const id = `uploaded:${item.createdAt.toString()}-${index}`;
  
  return {
    id,
    type: 'uploaded',
    mediaType: item.mediaType === 'image' ? 'image' : 'video',
    src: item.blob.getDirectURL(),
    title: item.title || 'Untitled',
    description: item.description || '',
    createdAt: item.createdAt,
  };
}

/**
 * Merge static, storybook, and uploaded items into a unified list
 */
export function mergeGalleryItems(uploadedItems: GalleryMediaItem[]): UnifiedGalleryItem[] {
  const uploaded = uploadedItems.map((item, index) => backendItemToUploadedItem(item, index));
  
  // Combine static items, storybook, then uploaded items (newest first)
  return [...staticGalleryItems, storybookGalleryItem, ...uploaded.reverse()];
}

/**
 * Filter gallery items by search query
 */
export function filterBySearch(items: UnifiedGalleryItem[], query: string): UnifiedGalleryItem[] {
  if (!query) return items;
  
  const lowerQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Filter gallery items by favorites
 */
export function filterByFavorites(
  items: UnifiedGalleryItem[],
  isFavorite: (id: string) => boolean
): UnifiedGalleryItem[] {
  return items.filter((item) => isFavorite(item.id));
}
