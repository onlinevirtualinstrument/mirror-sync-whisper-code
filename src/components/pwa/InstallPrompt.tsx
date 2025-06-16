import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // Detect if the app is already installed
  const isInstalled = () => {
    return (
      window.matchMedia('(display-mode: standalone)').matches || // Android
      window.matchMedia('(display-mode: fullscreen)').matches || // Fallback PWA mode
      (window.navigator as any).standalone === true              // iOS Safari
    );
  };

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed && !isInstalled()) {
        setTimeout(() => setShowBanner(true), 3 * 60 * 1000); // Show banner after 2 min
      }
    };

    const onAppInstalled = () => {
      console.log('PWA installed');
      localStorage.setItem('pwa-install-dismissed', 'true');
      setShowBanner(false);
      setShowCard(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    // Hide prompts if already installed
    if (isInstalled()) {
      setShowBanner(false);
      setShowCard(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted install prompt');
    } else {
      console.log('User dismissed install prompt');
    }
    setShowCard(false);
    setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowCard(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    // Re-prompt after 1 day
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 1 * 24 * 60 * 60 * 1000);
  };

  const escalateToCard = () => {
    setShowBanner(false);
    setShowCard(true);
  };

  if (!deferredPrompt || isInstalled()) return null;

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-4 left-4 w-auto z-50 px-4 py-2 bg-background border shadow rounded-lg flex items-center gap-3">
          <Smartphone className="h-4 w-4 text-primary" />
          <span className="text-sm">Install HarmonyHub for the best experience</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" onClick={escalateToCard}>Install</Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>Dismiss</Button>
          </div>
        </div>
      )}

      {showCard && (
        <Card className="fixed bottom-4 left-4 w-80 z-50 shadow-lg bg-background border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Install HarmonyHub</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-xs">
              Install the app for offline access and the best experience with instruments!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm" className="flex-1">
                Install App
              </Button>
              <Button onClick={handleDismiss} variant="outline" size="sm">
                Not Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default InstallPrompt;
