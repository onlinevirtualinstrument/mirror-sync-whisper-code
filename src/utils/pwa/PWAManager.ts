/**
 * PWA Manager for Mobile Installation and Offline Capabilities
 * Handles service worker registration, app installation, and offline features
 */

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private static instance: PWAManager;
  private installPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private onInstallPromptReady?: () => void;
  private onInstalled?: () => void;
  private onOfflineReady?: () => void;

  private constructor() {
    this.setupEventListeners();
    this.checkInstallationStatus();
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private setupEventListeners(): void {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as PWAInstallPrompt;
      this.onInstallPromptReady?.();
      console.log('PWA: Install prompt is ready');
    });

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.installPrompt = null;
      this.onInstalled?.();
      console.log('PWA: App was installed successfully');
    });

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('PWA: Service worker updated');
        window.location.reload();
      });
    }

    // Listen for online/offline status
    window.addEventListener('online', () => {
      console.log('PWA: App is online');
      this.showNetworkStatus('online');
    });

    window.addEventListener('offline', () => {
      console.log('PWA: App is offline');
      this.showNetworkStatus('offline');
    });
  }

  private checkInstallationStatus(): void {
    // Check if app is running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Check if app was launched from home screen (iOS)
    if ((window.navigator as any).standalone) {
      this.isInstalled = true;
    }
  }

  public async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('PWA: Service workers are not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('PWA: Service worker registered successfully');

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('PWA: New content is available; please refresh');
              this.showUpdateAvailable();
            }
          });
        }
      });

      // Check if service worker is ready
      if (registration.active) {
        this.onOfflineReady?.();
      }

    } catch (error) {
      console.error('PWA: Service worker registration failed:', error);
    }
  }

  public canInstall(): boolean {
    return this.installPrompt !== null && !this.isInstalled;
  }

  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        return true;
      } else {
        console.log('PWA: User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Error during install prompt:', error);
      return false;
    }
  }

  public async shareApp(url?: string, title?: string, text?: string): Promise<boolean> {
    if (!navigator.share) {
      // Fallback to copying URL to clipboard
      try {
        await navigator.clipboard.writeText(url || window.location.href);
        this.showToast('Link copied to clipboard!');
        return true;
      } catch (error) {
        console.error('PWA: Failed to copy to clipboard:', error);
        return false;
      }
    }

    try {
      await navigator.share({
        title: title || 'Mirror Sync Music Rooms',
        text: text || 'Join me in this amazing music collaboration app!',
        url: url || window.location.href
      });
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('PWA: Error sharing:', error);
      }
      return false;
    }
  }

  public async cacheInstrumentAssets(): Promise<void> {
    if (!('caches' in window)) {
      console.warn('PWA: Cache API not supported');
      return;
    }

    const instrumentAssets = [
      '/audio/piano-samples.json',
      '/audio/guitar-samples.json',
      '/audio/drum-samples.json',
      // Add more instrument assets as needed
    ];

    try {
      const cache = await caches.open('instrument-assets-v1');
      await cache.addAll(instrumentAssets);
      console.log('PWA: Instrument assets cached successfully');
    } catch (error) {
      console.error('PWA: Failed to cache instrument assets:', error);
    }
  }

  private showNetworkStatus(status: 'online' | 'offline'): void {
    const message = status === 'online' ? 'Connection restored' : 'You are offline';
    const type = status === 'online' ? 'success' : 'warning';
    
    this.showToast(message, type);
  }

  private showUpdateAvailable(): void {
    this.showToast('A new version is available. Refresh to update.', 'info');
  }

  private showToast(message: string, type: 'success' | 'warning' | 'info' = 'info'): void {
    // This would typically use your toast notification system
    console.log(`PWA Toast (${type}): ${message}`);
    
    // For now, use a simple browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Mirror Sync', {
        body: message,
        icon: '/favicon.ico',
        tag: 'pwa-notification'
      });
    }
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('PWA: Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  public setEventHandlers(handlers: {
    onInstallPromptReady?: () => void;
    onInstalled?: () => void;
    onOfflineReady?: () => void;
  }): void {
    this.onInstallPromptReady = handlers.onInstallPromptReady;
    this.onInstalled = handlers.onInstalled;
    this.onOfflineReady = handlers.onOfflineReady;
  }

  public getNetworkInfo(): {
    isOnline: boolean;
    connectionType?: string;
    downlink?: number;
    rtt?: number;
  } {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      isOnline: navigator.onLine,
      connectionType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt
    };
  }
}

export default PWAManager;