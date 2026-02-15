import { useState, useEffect } from 'react';

const STORAGE_KEY = 'plushie-haven-gallery-favorites';

export function useGalleryFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Set(parsed);
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
    }
    return new Set();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error);
    }
  }, [favorites]);

  const isFavorite = (id: string): boolean => {
    return favorites.has(id);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return {
    isFavorite,
    toggleFavorite,
  };
}
