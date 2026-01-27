/**
 * Image URL utility for Resales Online CDN
 * 
 * Transforms /w400/ URLs to higher resolutions based on display context.
 * Pattern: https://cdn.resales-online.com/public/{hash}/properties/{id}/w400/{filename}.jpg
 */
export function getHighResImageUrl(
  url: string | undefined | null, 
  size: 'thumbnail' | 'card' | 'hero' | 'lightbox' = 'hero'
): string {
  if (!url) return '/placeholder.svg';
  
  // Only transform if URL contains /w400/ pattern
  if (!url.includes('/w400/')) {
    return url;
  }
  
  // Map size to resolution
  const resolutionMap: Record<typeof size, string> = {
    thumbnail: 'w400',   // Keep thumbnails small for performance
    card: 'w800',        // Property cards need medium resolution
    hero: 'w1200',       // Hero images need high resolution
    lightbox: 'w1200',   // Full-screen gallery needs high resolution
  };
  
  const targetResolution = resolutionMap[size];
  return url.replace('/w400/', `/${targetResolution}/`);
}
