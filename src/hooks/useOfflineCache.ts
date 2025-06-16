
import { useState, useEffect } from 'react';

interface CacheItem {
  url: string;
  timestamp: number;
  data?: any;
}

export const useOfflineCache = () => {
  const [cacheStatus, setCacheStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [cachedFiles, setCachedFiles] = useState<CacheItem[]>([]);

  const cacheInstrumentSounds = async () => {
    try {
      setCacheStatus('loading');
      
      if ('caches' in window) {
        const cache = await caches.open('harmonyhub-instruments-v1');
        const cached: CacheItem[] = [];
        
        setCachedFiles(cached);
        setCacheStatus('ready');
        
        // Store cache info in localStorage
        localStorage.setItem('harmonyhub-cache-info', JSON.stringify({
          timestamp: Date.now(),
          files: cached.length
        }));
        
        console.log(`Cached ${cached.length} instrument sounds for offline use`);
      } else {
        setCacheStatus('error');
      }
    } catch (error) {
      console.error('Error caching instrument sounds:', error);
      setCacheStatus('error');
    }
  };

  const checkCacheStatus = async () => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('harmonyhub-instruments-v1');
        const keys = await cache.keys();
        
        const cached = keys.map(request => ({
          url: request.url,
          timestamp: Date.now()
        }));
        
        setCachedFiles(cached);
        setCacheStatus(cached.length > 0 ? 'ready' : 'loading');
      } catch (error) {
        setCacheStatus('error');
      }
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      await caches.delete('harmonyhub-instruments-v1');
      setCachedFiles([]);
      setCacheStatus('loading');
      localStorage.removeItem('harmonyhub-cache-info');
    }
  };

  useEffect(() => {
    checkCacheStatus();
    
    // Auto-cache on first visit
    const cacheInfo = localStorage.getItem('harmonyhub-cache-info');
    if (!cacheInfo) {
      cacheInstrumentSounds();
    }
  }, []);

  return {
    cacheStatus,
    cachedFiles,
    cacheInstrumentSounds,
    clearCache,
    isOfflineReady: cacheStatus === 'ready' && cachedFiles.length > 0
  };
};
