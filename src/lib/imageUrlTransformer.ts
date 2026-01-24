/**
 * Transforms Resales Online CDN image URLs to higher resolution versions
 * 
 * CDN supports: /w400/, /w800/, /w1200/
 * 
 * Size recommendations:
 * - thumbnail: w400 (for small previews, saves bandwidth)
 * - card: w800 (for property cards in grids)
 * - hero: w1200 (for large hero images)
 * - lightbox: w1200 (for fullscreen viewing)
 */
export function getHighResImageUrl(
  url: string | undefined | null, 
  size: 'thumbnail' | 'card' | 'hero' | 'lightbox' = 'hero'
): string {
  if (!url) return '/placeholder.svg';
  
  // Map size presets to CDN width parameters
  const sizeMap = {
    thumbnail: 'w400',
    card: 'w800',
    hero: 'w1200',
    lightbox: 'w1200'
  };
  
  const targetSize = sizeMap[size];
  
  // Replace any existing width parameter with the target size
  if (url.includes('/w400/') || url.includes('/w800/') || url.includes('/w1200/')) {
    return url.replace(/\/w\d+\//g, `/${targetSize}/`);
  }
  
  // If URL doesn't have a width parameter, return as-is
  return url;
}
