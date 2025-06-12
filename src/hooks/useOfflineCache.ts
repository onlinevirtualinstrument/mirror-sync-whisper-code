
import { useState, useEffect } from 'react';

interface CacheItem {
  url: string;
  timestamp: number;
  data?: any;
}

export const useOfflineCache = () => {
  const [cacheStatus, setCacheStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [cachedFiles, setCachedFiles] = useState<CacheItem[]>([]);

  const instrumentSounds = [
    // Piano sounds
    '/sounds/piano/C4.mp3',
    '/sounds/piano/D4.mp3',
    '/sounds/piano/E4.mp3',
    '/sounds/piano/F4.mp3',
    '/sounds/piano/G4.mp3',
    '/sounds/piano/A4.mp3',
    '/sounds/piano/B4.mp3',
    
    // Drum sounds
    '/sounds/drums/kick.mp3',
    '/sounds/drums/snare.mp3',
    '/sounds/drums/hihat.mp3',
    '/sounds/drums/crash.mp3',
    
    // Guitar sounds
    '/sounds/guitar/E2.mp3',
    '/sounds/guitar/A2.mp3',
    '/sounds/guitar/D3.mp3',
    '/sounds/guitar/G3.mp3',
    '/sounds/guitar/B3.mp3',
    '/sounds/guitar/E4.mp3',
  ];

  const cacheInstrumentSounds = async () => {
    try {
      setCacheStatus('loading');
      
      if ('caches' in window) {
        const cache = await caches.open('harmonyhub-instruments-v1');
        const cached: CacheItem[] = [];
        
        for (const soundUrl of instrumentSounds) {
          try {
            const response = await fetch(soundUrl);
            if (response.ok) {
              await cache.put(soundUrl, response.clone());
              cached.push({
                url: soundUrl,
                timestamp: Date.now()
              });
            }
          } catch (error) {
            console.warn(`Failed to cache ${soundUrl}:`, error);
          }
        }
        
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
