/**
 * Image URL utility for Resales Online CDN
 * 
 * Currently in safe pass-through mode.
 * w800 was tested and caused 404s - reverting to original URLs.
 */
export function getHighResImageUrl(
  url: string | undefined | null, 
  size: 'thumbnail' | 'card' | 'hero' | 'lightbox' = 'hero'
): string {
  if (!url) return '/placeholder.svg';
  return url; // Back to working state
}
