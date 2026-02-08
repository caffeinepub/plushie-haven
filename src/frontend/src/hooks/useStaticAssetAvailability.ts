import { useQuery } from '@tanstack/react-query';
import { checkStaticAssetAvailability } from '@/utils/staticAssetCheck';

/**
 * Hook to check if a static asset is available at the given URL.
 * Uses a robust strategy (HEAD with GET fallback) to avoid false negatives in production.
 */
export function useStaticAssetAvailability(assetUrl: string) {
  return useQuery({
    queryKey: ['static-asset-availability', assetUrl],
    queryFn: async () => {
      return checkStaticAssetAvailability(assetUrl);
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });
}
