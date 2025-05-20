
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Cloud, Download, Check } from 'lucide-react';
import { toast } from 'sonner';

interface OfflineModeHandlerProps {
  instrumentName: string;
  assetUrls?: string[];
  children: React.ReactNode;
}

const OfflineModeHandler: React.FC<OfflineModeHandlerProps> = ({ 
  instrumentName, 
  assetUrls = [],
  children 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCached, setIsCached] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online!");
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline. Some features may be limited.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if instrument is cached
  useEffect(() => {
    const checkIfCached = async () => {
      if (!('caches' in window)) {
        return false;
      }
      
      try {
        const cache = await caches.open('harmonyHub-instruments');
        const cachedFiles = await cache.keys();
        
        // Create an array of asset URLs specific to this instrument
        const instrumentAssetUrls = [
          `/instruments/${instrumentName.toLowerCase()}`,
          ...assetUrls
        ];
        
        // Check if all required assets are cached
        const allCached = instrumentAssetUrls.every(url => 
          cachedFiles.some(file => file.url.includes(url))
        );
        
        setIsCached(allCached && cachedFiles.length > 0);
      } catch (error) {
        console.error('Error checking cache:', error);
        setIsCached(false);
      }
    };
    
    checkIfCached();
  }, [instrumentName, assetUrls]);

  const cacheInstrumentAssets = async () => {
    if (!('caches' in window)) {
      toast.error("Your browser doesn't support offline mode");
      return;
    }
    
    setIsInstalling(true);
    
    try {
      const cache = await caches.open('harmonyHub-instruments');
      
      // URLs to cache (base path + any specific assets)
      const urlsToCache = [
        `/instruments/${instrumentName.toLowerCase()}`,
        ...assetUrls,
        // Add common assets
        '/sounds/metronome.mp3',
        '/sounds/placeholder.txt'
      ];
      
      // Cache all URLs
      await Promise.all(urlsToCache.map(url => cache.add(url).catch(err => {
        console.warn(`Failed to cache ${url}:`, err);
      })));
      
      setIsCached(true);
      toast.success(`${instrumentName} is now available offline!`);
    } catch (error) {
      console.error('Error caching assets:', error);
      toast.error("Failed to save for offline use");
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      {/* Offline/Online Status Indicator */}
      <div className="flex items-center justify-between bg-muted/30 dark:bg-gray-800/40 px-4 py-2 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi size={18} className="text-green-500" />
              <span className="text-sm font-medium">Online Mode</span>
            </>
          ) : (
            <>
              <WifiOff size={18} className="text-amber-500" />
              <span className="text-sm font-medium">Offline Mode</span>
              {isCached ? (
                <Button variant="outline" className="ml-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                  <Check size={12} className="mr-1" />
                  Available Offline
                </Button>
              ) : (
                <Button variant="outline" className="ml-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400">
                  Limited Functionality
                </Button>
              )}
            </>
          )}
        </div>
        
        {isOnline && !isCached && (
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 text-xs"
            onClick={cacheInstrumentAssets}
            disabled={isInstalling}
          >
            {isInstalling ? (
              <>
                <div className="animate-spin h-3 w-3 border-2 border-current rounded-full border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Download size={14} />
                Save for offline use
              </>
            )}
          </Button>
        )}
        
        {isOnline && isCached && (
          <Button 
            variant="ghost" 
            size="sm"
            className="gap-2 text-xs"
            disabled
          >
            <Check size={14} className="text-green-500" />
            Available offline
          </Button>
        )}
      </div>
      
      {/* Main content */}
      {children}
      
      {/* Offline warning for non-cached instruments */}
      {!isOnline && !isCached && (
        <div className="mt-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Limited Offline Access</h3>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            You're currently offline and this instrument hasn't been saved for offline use.
            Some features may not work properly. Connect to the internet and use the "Save for offline use" 
            button to enable full offline functionality.
          </p>
        </div>
      )}
    </>
  );
};

export default OfflineModeHandler;
