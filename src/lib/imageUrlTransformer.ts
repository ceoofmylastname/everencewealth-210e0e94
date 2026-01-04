/**
 * Transforms Resales Online CDN image URLs
 * NOTE: CDN only supports w400 - larger sizes return 404
 * Keep this function for future use if CDN adds more sizes
 */
export function getHighResImageUrl(
  url: string | undefined | null, 
  size: 'thumbnail' | 'card' | 'hero' | 'lightbox' = 'hero'
): string {
  if (!url) return '/placeholder.svg';
  
  // CDN only supports w400 - return original URL unchanged
  // Browser handles scaling via CSS object-cover
  return url;
}
