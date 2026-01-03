/**
 * Transforms Resales Online CDN image URLs to higher resolution
 * The API returns w400 thumbnails by default - this upgrades to higher quality
 * 
 * Supported sizes: w400, w800, w1200, w1600, w1920
 */
export function getHighResImageUrl(
  url: string | undefined | null, 
  size: 'thumbnail' | 'card' | 'hero' | 'lightbox' = 'hero'
): string {
  if (!url) return '/placeholder.svg';
  
  // Map size context to CDN width parameter
  const sizeMap = {
    thumbnail: 'w400',
    card: 'w800',
    hero: 'w1600',
    lightbox: 'w1920'
  };
  
  const targetWidth = sizeMap[size];
  
  // Replace any existing width parameter (w400, w800, etc.) with the target
  // CDN format: .../w400/... or similar patterns
  const transformed = url.replace(/\/w\d+\//g, `/${targetWidth}/`);
  
  return transformed;
}
