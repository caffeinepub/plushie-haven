/**
 * Shared utility to verify a static asset is reachable using a robust strategy.
 * Attempts HEAD first, then falls back to a lightweight GET check if HEAD is not supported.
 * Returns a boolean indicating whether the asset is reachable.
 */
export async function checkStaticAssetAvailability(assetUrl: string): Promise<boolean> {
  try {
    // Try HEAD request first (most efficient)
    const headResponse = await fetch(assetUrl, { method: 'HEAD' });
    
    // If HEAD succeeds, return the result
    if (headResponse.ok) {
      return true;
    }
    
    // If HEAD returns 405 (Method Not Allowed) or 501 (Not Implemented), fall back to GET
    if (headResponse.status === 405 || headResponse.status === 501) {
      // Fallback: Use GET with abort to minimize download
      const controller = new AbortController();
      const getResponse = await fetch(assetUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      
      // Abort immediately after getting headers
      controller.abort();
      
      return getResponse.ok;
    }
    
    // For other non-OK statuses, asset is not available
    return false;
  } catch (error) {
    // If HEAD failed completely (network error, CORS, etc.), try GET as fallback
    try {
      const controller = new AbortController();
      const getResponse = await fetch(assetUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      
      // Abort immediately after getting headers
      controller.abort();
      
      return getResponse.ok;
    } catch (getFallbackError) {
      // Both strategies failed - asset is not reachable
      return false;
    }
  }
}
