import { useState, ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  transformWidth?: number;
  transformHeight?: number;
}

/**
 * Get Supabase Storage URL with image transformations enabled.
 * IMPORTANT: Must use /render/image/public/ path instead of /object/public/ for transformations to work.
 */
const getSupabaseTransformUrl = (url: string, width?: number, height?: number): string => {
  if (!url || !url.includes('supabase.co/storage') || !url.includes('/object/public/')) {
    return url;
  }
  
  // Replace /object/public/ with /render/image/public/ to enable transformations
  const transformedUrl = url.replace('/object/public/', '/render/image/public/');
  const params = new URLSearchParams();
  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('resize', 'cover');
  params.set('quality', '75');
  
  return `${transformedUrl}?${params.toString()}`;
};

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  transformWidth,
  transformHeight,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Apply Supabase transformations if transform dimensions are provided
  const optimizedSrc = transformWidth || transformHeight 
    ? getSupabaseTransformUrl(src, transformWidth, transformHeight)
    : src;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={width && height ? { aspectRatio: `${width}/${height}` } : undefined}
    >
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        className={`transition-all duration-500 ${
          isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm scale-105'
        } ${className}`}
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted">
          <div className="w-full h-full bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse" />
        </div>
      )}
    </div>
  );
};
