/**
 * Performance Optimization Utilities
 * Handles memory management, lazy loading, and performance monitoring
 */

export interface PerformanceMetrics {
  audioLatency: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  frameRate: number;
  lastUpdated: number;
}

export interface OptimizationConfig {
  enableMemoryCleanup: boolean;
  enableLazyLoading: boolean;
  enablePerformanceMonitoring: boolean;
  maxMemoryUsage: number; // MB
  targetFrameRate: number;
  cleanupInterval: number; // ms
}

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: PerformanceMetrics;
  private config: OptimizationConfig;
  private cleanupTimer: number | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private memoryObserver: number | null = null;

  private constructor() {
    this.metrics = {
      audioLatency: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      activeConnections: 0,
      frameRate: 60,
      lastUpdated: Date.now()
    };

    this.config = {
      enableMemoryCleanup: true,
      enableLazyLoading: true,
      enablePerformanceMonitoring: true,
      maxMemoryUsage: 100, // 100MB
      targetFrameRate: 60,
      cleanupInterval: 30000 // 30 seconds
    };
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  public initialize(): void {
    if (this.config.enablePerformanceMonitoring) {
      this.startPerformanceMonitoring();
    }

    if (this.config.enableMemoryCleanup) {
      this.startMemoryCleanup();
    }

    console.log('Performance Optimizer initialized');
  }

  private startPerformanceMonitoring(): void {
    // Monitor performance entries
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            // Update audio latency metrics
            if (entry.name.includes('audio')) {
              this.metrics.audioLatency = entry.duration;
            }
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    }

    // Monitor memory usage
    this.memoryObserver = window.setInterval(() => {
      this.updateMemoryMetrics();
    }, 5000);

    // Monitor frame rate
    this.monitorFrameRate();
  }

  private updateMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      
      // Trigger cleanup if memory usage is high
      if (this.metrics.memoryUsage > this.config.maxMemoryUsage) {
        this.triggerMemoryCleanup();
      }
    }
  }

  private monitorFrameRate(): void {
    let frames = 0;
    let startTime = performance.now();

    const measureFrameRate = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime - startTime >= 1000) {
        this.metrics.frameRate = frames;
        frames = 0;
        startTime = currentTime;
      }

      requestAnimationFrame(measureFrameRate);
    };

    requestAnimationFrame(measureFrameRate);
  }

  private startMemoryCleanup(): void {
    this.cleanupTimer = window.setInterval(() => {
      this.performMemoryCleanup();
    }, this.config.cleanupInterval);
  }

  private performMemoryCleanup(): void {
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }

    // Clear unused audio buffers
    this.cleanupAudioBuffers();

    // Clear performance entries
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }

    console.log('Memory cleanup performed', this.metrics.memoryUsage + 'MB');
  }

  private triggerMemoryCleanup(): void {
    console.warn('High memory usage detected, triggering cleanup');
    this.performMemoryCleanup();
  }

  private cleanupAudioBuffers(): void {
    // This would be implemented based on the specific audio engine being used
    // For now, we'll just log that cleanup is happening
    console.log('Cleaning up audio buffers');
  }

  // Lazy loading utilities
  public createLazyImport(
    importFunction: () => Promise<{ default: any }>
  ): Promise<any> {
    if (!this.config.enableLazyLoading) {
      return importFunction().then(module => module.default);
    }
    return importFunction().then(module => module.default);
  }

  public preloadComponent(importFunction: () => Promise<any>): void {
    // Preload component in the background
    setTimeout(() => {
      importFunction().catch(console.error);
    }, 100);
  }

  // Audio performance optimization
  public optimizeAudioLatency(): void {
    // Reduce audio buffer size for lower latency
    if (AudioContext) {
      performance.mark('audio-optimization-start');
      
      // Audio optimization logic would go here
      
      performance.mark('audio-optimization-end');
      performance.measure('audio-optimization', 'audio-optimization-start', 'audio-optimization-end');
    }
  }

  // Network optimization
  public optimizeNetworkRequests(): void {
    // Implement request batching and caching
    console.log('Optimizing network requests');
  }

  // Get current performance metrics
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics, lastUpdated: Date.now() };
  }

  // Update configuration
  public updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart monitoring if config changed
    if (newConfig.enablePerformanceMonitoring !== undefined) {
      this.stopPerformanceMonitoring();
      if (newConfig.enablePerformanceMonitoring) {
        this.startPerformanceMonitoring();
      }
    }
  }

  private stopPerformanceMonitoring(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    if (this.memoryObserver) {
      clearInterval(this.memoryObserver);
      this.memoryObserver = null;
    }
  }

  // Throttle function calls for performance
  public throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number | null = null;
    let lastExecTime = 0;

    return (...args: Parameters<T>) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  // Debounce function calls
  public debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number | null = null;

    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => func(...args), delay);
    };
  }

  // Resource preloading
  public preloadResources(resources: string[]): Promise<void[]> {
    return Promise.all(
      resources.map(resource => {
        if (resource.endsWith('.mp3') || resource.endsWith('.wav')) {
          return this.preloadAudio(resource);
        } else if (resource.endsWith('.js')) {
          return this.preloadScript(resource);
        } else {
          return this.preloadAsset(resource);
        }
      })
    );
  }

  private preloadAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.addEventListener('canplaythrough', () => resolve());
      audio.addEventListener('error', reject);
      audio.src = url;
      audio.load();
    });
  }

  private preloadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => resolve();
      script.onerror = reject;
      script.src = url;
      document.head.appendChild(script);
    });
  }

  private preloadAsset(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  public dispose(): void {
    this.stopPerformanceMonitoring();
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    console.log('Performance Optimizer disposed');
  }
}

export default PerformanceOptimizer;