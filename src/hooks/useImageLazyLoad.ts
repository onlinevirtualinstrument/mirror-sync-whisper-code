
import { useState, useEffect } from 'react';

interface ImageLoadOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * Hook for lazy loading images to improve performance
 */
export const useImageLazyLoad = (
  src: string, 
  placeholderSrc?: string, 
  options: ImageLoadOptions = {}
) => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc || '');
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  const { threshold = 0.1, rootMargin = '0px', once = true } = options;

  useEffect(() => {
    if (!imageRef || !src) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Start loading the image
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
              if (once) observer.disconnect();
            };
            img.onerror = () => {
              setIsError(true);
              if (once) observer.disconnect();
            };
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(imageRef);

    return () => {
      observer.disconnect();
    };
  }, [imageRef, src, threshold, rootMargin, once]);

  return { 
    imageSrc, 
    isLoaded, 
    isError, 
    ref: setImageRef 
  };
};

export default useImageLazyLoad;
