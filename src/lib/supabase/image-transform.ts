/**
 * Supabase Image Helper
 * Returns original URLs since transformations are not enabled
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Get image URL (returns original for now)
 */
export const getOptimizedImageUrl = (
  imageUrl: string,
  _options?: ImageTransformOptions
): string => {
  // Just return original URL since transformations aren't enabled
  return imageUrl;
};

/**
 * Preset configurations - now just return original URLs
 */
export const ImagePresets = {
  hero: (url: string) => url,
  courtFeatured: (url: string) => url,
  courtCard: (url: string) => url,
  galleryFull: (url: string) => url,
  galleryGrid: (url: string) => url,
  galleryThumb: (url: string) => url,
  welcome: (url: string) => url,
  features: (url: string) => url,
  featuresBackground: (url: string) => url,
  backgroundImage: (url: string) => url,
  pageHero: (url: string) => url,
};
