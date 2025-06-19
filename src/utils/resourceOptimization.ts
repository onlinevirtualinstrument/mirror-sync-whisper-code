
// Resource optimization utilities with CSP compliance
export class ResourceOptimizer {
  private static preloadedResources = new Set<string>();
  private static resourceUsage = new Map<string, number>();

  // Preload critical resources with CSP compliance
  static preloadResource(url: string, type: 'script' | 'style' | 'font' | 'image' = 'script') {
    if (this.preloadedResources.has(url)) return;

    // Skip external scripts that might violate CSP
    if (type === 'script' && url.startsWith('http') && !url.includes(window.location.origin)) {
      console.warn(`ResourceOptimizer: Skipping external script preload to avoid CSP violations:`, url);
      return;
    }

    console.log(`ResourceOptimizer: Preloading ${type} resource:`, url);
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        link.crossOrigin = 'anonymous';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
      case 'image':
        link.as = 'image';
        break;
    }

    // Track resource usage
    link.onload = () => {
      this.resourceUsage.set(url, Date.now());
      console.log(`ResourceOptimizer: Resource loaded successfully:`, url);
    };

    link.onerror = () => {
      console.error(`ResourceOptimizer: Failed to preload resource:`, url);
      this.preloadedResources.delete(url);
    };

    // Add CSP-safe attributes
    link.referrerPolicy = 'strict-origin-when-cross-origin';

    document.head.appendChild(link);
    this.preloadedResources.add(url);
  }

  // Load resource on demand with CSP compliance
  static loadResourceOnDemand(url: string, type: 'script' | 'style'): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check CSP compliance for external resources
      if (url.startsWith('http') && !url.includes(window.location.origin)) {
        reject(new Error('External resource blocked by CSP'));
        return;
      }

      if (type === 'script') {
        const script = document.createElement('script');
        script.src = url;
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'strict-origin-when-cross-origin';
        script.onload = () => {
          this.resourceUsage.set(url, Date.now());
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      } else if (type === 'style') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.crossOrigin = 'anonymous';
        link.referrerPolicy = 'strict-origin-when-cross-origin';
        link.onload = () => {
          this.resourceUsage.set(url, Date.now());
          resolve();
        };
        link.onerror = reject;
        document.head.appendChild(link);
      }
    });
  }

  // Clean up unused preloaded resources
  static cleanupUnusedResources() {
    const now = Date.now();
    const unusedThreshold = 30000; // 30 seconds

    for (const [url, loadTime] of this.resourceUsage.entries()) {
      if (now - loadTime > unusedThreshold) {
        console.log(`ResourceOptimizer: Cleaning up unused resource:`, url);
        this.preloadedResources.delete(url);
        this.resourceUsage.delete(url);
        
        // Remove the preload link if it exists
        const preloadLink = document.querySelector(`link[href="${url}"]`);
        if (preloadLink) {
          preloadLink.remove();
        }
      }
    }
  }

  // Initialize resource optimization with CSP awareness
  static initialize() {
    // Clean up unused resources every 60 seconds
    setInterval(() => this.cleanupUnusedResources(), 60000);

    // Don't preload external resources that might violate CSP
    console.log('ResourceOptimizer: Initialized with CSP compliance');
  }
}

// Initialize only in browser environment
if (typeof window !== 'undefined') {
  ResourceOptimizer.initialize();
}