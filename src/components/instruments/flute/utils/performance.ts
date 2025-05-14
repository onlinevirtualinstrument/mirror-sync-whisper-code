/**
 * Performance optimization utilities for Melodia
 */

// Improved debounce function with TypeScript generics and proper cleanup
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

// Enhanced throttle function with better TypeScript support
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): ((...args: Parameters<T>) => void) => {
  let canRun = true;
  let pendingArgs: Parameters<T> | null = null;
  let pendingThis: any = null;
  
  return function(this: any, ...args: Parameters<T>) {
    pendingArgs = args;
    pendingThis = this;
    
    if (!canRun) return;
    
    canRun = false;
    fn.apply(this, args);
    
    setTimeout(() => { 
      canRun = true; 
      if (pendingArgs) {
        fn.apply(pendingThis, pendingArgs);
        pendingArgs = null;
        pendingThis = null;
      }
    }, ms);
  };
};

// More efficient memoize function with WeakMap support
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  options: { maxSize?: number; ttl?: number } = {}
): ((...args: Parameters<T>) => ReturnType<T>) => {
  const { maxSize = 100, ttl } = options;
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  const keyOrder: string[] = [];
  
  return function(this: any, ...args: Parameters<T>) {
    const key = JSON.stringify(args);
    const now = Date.now();
    
    if (cache.has(key)) {
      const cached = cache.get(key)!;
      
      if (ttl && now - cached.timestamp > ttl) {
        cache.delete(key);
        const keyIndex = keyOrder.indexOf(key);
        if (keyIndex > -1) {
          keyOrder.splice(keyIndex, 1);
        }
      } else {
        const keyIndex = keyOrder.indexOf(key);
        if (keyIndex > -1) {
          keyOrder.splice(keyIndex, 1);
        }
        keyOrder.push(key);
        
        return cached.value;
      }
    }
    
    const result = fn.apply(this, args);
    
    if (maxSize && cache.size >= maxSize) {
      const oldestKey = keyOrder.shift();
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }
    
    cache.set(key, { value: result, timestamp: now });
    keyOrder.push(key);
    
    return result;
  };
};

// Optimized image preloader
export const preloadImage = (
  src: string, 
  options: { priority?: boolean; timeout?: number } = {}
): Promise<HTMLImageElement> => {
  const { priority = false, timeout = 10000 } = options;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    if (priority && 'fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }
    
    const timeoutId = setTimeout(() => {
      reject(new Error(`Image loading timed out after ${timeout}ms: ${src}`));
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(img);
    };
    
    img.onerror = (err) => {
      clearTimeout(timeoutId);
      reject(err);
    };
    
    img.src = src;
    
    if (priority) {
      fetch(src, { priority: priority ? 'high' : 'auto' })
        .catch(() => {/* Ignore fetch errors */});
    }
  });
};

// Optimized batch image preloader
export const preloadImages = (
  srcs: string[],
  options: { batchSize?: number; priority?: boolean; timeout?: number } = {}
): Promise<HTMLImageElement[]> => {
  const { batchSize = 4, priority = false, timeout = 10000 } = options;
  
  const processBatch = async (batch: string[]): Promise<HTMLImageElement[]> => {
    return Promise.all(batch.map(src => preloadImage(src, { priority, timeout })));
  };
  
  return new Promise(async (resolve, reject) => {
    const results: HTMLImageElement[] = [];
    
    try {
      for (let i = 0; i < srcs.length; i += batchSize) {
        const batch = srcs.slice(i, i + batchSize);
        const batchResults = await processBatch(batch);
        results.push(...batchResults);
      }
      
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

// Feature detection utilities
export const supportsWebAudio = (): boolean => {
  return typeof window !== 'undefined' && (
    typeof AudioContext !== 'undefined' || 
    typeof (window as any).webkitAudioContext !== 'undefined' ||
    typeof (window as any).mozAudioContext !== 'undefined'
  );
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0 ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  );
};

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Measure performance of a function with more detailed metrics
export const measurePerformance = async <T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
): Promise<{ 
  result: ReturnType<T>; 
  duration: number;
  memory?: { 
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  };
}> => {
  const memoryBefore = (performance as any).memory ? 
    JSON.parse(JSON.stringify((performance as any).memory)) : 
    undefined;
  
  const start = performance.now();
  const result = await fn(...args);
  const end = performance.now();
  
  const memoryAfter = (performance as any).memory ?
    JSON.parse(JSON.stringify((performance as any).memory)) :
    undefined;
  
  return {
    result,
    duration: end - start,
    memory: memoryAfter ? {
      usedJSHeapSize: memoryAfter.usedJSHeapSize,
      totalJSHeapSize: memoryAfter.totalJSHeapSize,
      jsHeapSizeLimit: memoryAfter.jsHeapSizeLimit
    } : undefined
  };
};

// Optimize animations based on device capabilities with better detection
export const getOptimalAnimationSettings = () => {
  const isLowMemoryMode = 'deviceMemory' in navigator && 
    (navigator as any).deviceMemory < 2;
    
  const isLowPowerDevice = 
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) || 
    isLowMemoryMode ||
    /Android 4|Android 5|iPhone 5|iPhone 6|iPad Mini/i.test(navigator.userAgent);
  
  const reducedMotion = prefersReducedMotion();
  const isMobile = isTouchDevice() && window.innerWidth < 768;
  
  return {
    enableAnimations: !reducedMotion,
    complexAnimations: !isLowPowerDevice && !reducedMotion && !isMobile,
    animationDuration: isLowPowerDevice ? 150 : (isMobile ? 200 : 300),
    particleCount: isLowPowerDevice ? 3 : (isMobile ? 8 : 15),
    useSoftwareRendering: isLowPowerDevice || isLowMemoryMode
  };
};

// Progressive image loading helper
export const loadImageProgressively = (
  lowQualitySrc: string, 
  highQualitySrc: string,
  callback: (state: {
    src: string;
    isLoading: boolean;
    isHighQuality: boolean;
  }) => void
): () => void => {
  let isMounted = true;
  
  callback({
    src: lowQualitySrc,
    isLoading: true,
    isHighQuality: false
  });
  
  const img = new Image();
  img.onload = () => {
    if (isMounted) {
      callback({
        src: highQualitySrc,
        isLoading: false,
        isHighQuality: true
      });
    }
  };
  
  img.onerror = () => {
    if (isMounted) {
      callback({
        src: lowQualitySrc,
        isLoading: false,
        isHighQuality: false
      });
    }
  };
  
  img.src = highQualitySrc;
  
  return () => {
    isMounted = false;
  };
};

// Resource hint helper for critical resources
export const addResourceHints = (resources: {
  preconnect?: string[];
  prefetch?: string[];
  preload?: Array<{ href: string; as: string; type?: string }>;
}) => {
  if (typeof document === 'undefined') return;
  
  const { preconnect = [], prefetch = [], preload = [] } = resources;
  
  preconnect.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
  
  prefetch.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  });
  
  preload.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  });
};