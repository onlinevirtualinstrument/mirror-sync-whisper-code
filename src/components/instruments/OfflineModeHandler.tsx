
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';

interface InstrumentState {
  id: string;
  name: string;
  settings: Record<string, any>;
  lastPlayed: Date;
}

const OfflineModeHandler: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [cachedInstruments, setCachedInstruments] = useState<InstrumentState[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        description: "You're back online! Full features available.",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        variant: "destructive",
        description: "You're offline. Limited functionality available.",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached instruments from localStorage
    const loadCachedInstruments = () => {
      try {
        const cached = localStorage.getItem('offline_instruments');
        if (cached) {
          const parsed = JSON.parse(cached);
          setCachedInstruments(parsed);
        }
      } catch (error) {
        console.error("Failed to load cached instruments:", error);
      }
    };

    loadCachedInstruments();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save instrument state for offline use
  const saveInstrumentForOffline = (instrument: Partial<InstrumentState>) => {
    try {
      const existingData: InstrumentState[] = JSON.parse(localStorage.getItem('offline_instruments') || '[]');
      
      // Find if this instrument already exists
      const existingIndex = existingData.findIndex(i => i.id === instrument.id);
      
      if (existingIndex >= 0) {
        // Update existing instrument
        existingData[existingIndex] = {
          ...existingData[existingIndex],
          ...instrument,
          lastPlayed: new Date()
        };
      } else {
        // Add new instrument
        existingData.push({
          id: instrument.id!,
          name: instrument.name!,
          settings: instrument.settings || {},
          lastPlayed: new Date()
        });
      }
      
      // Save back to localStorage
      localStorage.setItem('offline_instruments', JSON.stringify(existingData));
      setCachedInstruments(existingData);
      
      toast({
        description: `${instrument.name} saved for offline use`,
      });
    } catch (error) {
      console.error("Failed to save instrument for offline use:", error);
      toast({
        variant: "destructive",
        description: "Failed to save instrument for offline use",
      });
    }
  };

  // Clear offline data
  const clearOfflineData = () => {
    try {
      localStorage.removeItem('offline_instruments');
      setCachedInstruments([]);
      setShowDialog(false);
      
      toast({
        description: "Offline instrument data cleared",
      });
    } catch (error) {
      console.error("Failed to clear offline data:", error);
    }
  };

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 dark:bg-yellow-900/60 p-4 z-50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
              Offline Mode
            </Badge>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              You're currently offline. Limited functionality is available.
            </p>
          </div>
          
          <div className="flex gap-2">
            {cachedInstruments.length > 0 && (
              <Badge variant="outline" className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                {cachedInstruments.length} Instrument{cachedInstruments.length !== 1 ? 's' : ''} Available Offline
              </Badge>
            )}
            
            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Manage Offline Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Manage Offline Instrument Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have {cachedInstruments.length} instrument{cachedInstruments.length !== 1 ? 's' : ''} saved for offline use.
                    {cachedInstruments.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {cachedInstruments.map((instrument) => (
                          <li key={instrument.id} className="text-sm flex justify-between">
                            <span>{instrument.name}</span>
                            <span className="text-muted-foreground">
                              {new Date(instrument.lastPlayed).toLocaleDateString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={clearOfflineData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear Offline Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineModeHandler;
