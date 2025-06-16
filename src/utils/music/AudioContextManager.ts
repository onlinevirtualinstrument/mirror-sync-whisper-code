/**
 * Shared Audio Context Manager for better performance across instruments
 * Optimized with shared resources, memory management, and better cleanup
 */
class AudioContextManager {
  private static instance: AudioContextManager;
  private audioContext: AudioContext | null = null;
  private reverbNodes: Map<string, ConvolverNode> = new Map();
  private lastCleanupTime: number = 0;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private nodeRegistry: Map<string, { node: AudioNode, lastUsed: number }> = new Map();
  private scheduledCleanup: number | null = null;

  private constructor() {
    // Private constructor to enforce singleton
    if (typeof window !== 'undefined') {
      // Setup periodic cleanup
      this.scheduleCleanup();
    }
  }

  public static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  public getAudioContext(): AudioContext {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx({
        latencyHint: 'interactive',
        sampleRate: 44100
      });
      
      // Resume audio context on user interaction to handle autoplay policies
      const resumeAudioContext = () => {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        // Remove event listeners once context is resumed
        ['mousedown', 'touchstart', 'keydown'].forEach(event => {
          document.removeEventListener(event, resumeAudioContext);
        });
      };
      
      ['mousedown', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, resumeAudioContext, { once: true });
      });
    } else if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  public async getReverbNode(reverbId: string = 'default'): Promise<ConvolverNode> {
    if (!this.reverbNodes.has(reverbId)) {
      const reverb = await this.createReverb(reverbId);
      this.reverbNodes.set(reverbId, reverb);
      
      // Register for cleanup monitoring
      this.registerNode(`reverb-${reverbId}`, reverb);
    }
    
    // Mark as recently used
    this.touchNode(`reverb-${reverbId}`);
    return this.reverbNodes.get(reverbId)!;
  }

  // Register a node for lifecycle management
  public registerNode(id: string, node: AudioNode): void {
    this.nodeRegistry.set(id, { node, lastUsed: Date.now() });
  }
  
  // Mark a node as recently used
  public touchNode(id: string): void {
    const entry = this.nodeRegistry.get(id);
    if (entry) {
      entry.lastUsed = Date.now();
    }
  }
  
  // Cache an audio buffer for reuse
  public cacheBuffer(key: string, buffer: AudioBuffer): void {
    this.bufferCache.set(key, buffer);
  }
  
  // Get a cached buffer
  public getCachedBuffer(key: string): AudioBuffer | undefined {
    return this.bufferCache.get(key);
  }

  private async createReverb(reverbId: string): Promise<ConvolverNode> {
    const audioCtx = this.getAudioContext();
    const convolver = audioCtx.createConvolver();
    
    // Check if we have this impulse response cached
    const cacheKey = `reverb-ir-${reverbId}`;
    let impulse = this.bufferCache.get(cacheKey);
    
    if (!impulse) {
      // Create parameters based on reverb type
      const sampleRate = audioCtx.sampleRate;
      let length, decay, wet, damping;
      
      switch(reverbId) {
        case 'hall':
          length = sampleRate * 3;
          decay = 2.5;
          wet = 0.5;
          damping = 0.2;
          break;
        case 'room':
          length = sampleRate * 1;
          decay = 1.5;
          wet = 0.4;
          damping = 0.1;
          break;
        case 'plate':
          length = sampleRate * 1.5;
          decay = 2;
          wet = 0.6;
          damping = 0.3;
          break;
        default:
          length = sampleRate * 2;
          decay = 2;
          wet = 0.5;
          damping = 0.2;
      }
      
      impulse = audioCtx.createBuffer(2, length, sampleRate);
      const impulseL = impulse.getChannelData(0);
      const impulseR = impulse.getChannelData(1);
      
      // Generate reverb
      for (let i = 0; i < length; i++) {
        const n = i / length;
        const value = (Math.random() * 2 - 1) * Math.pow(1 - n, decay) * (1 - damping * n);
        impulseL[i] = value * wet;
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay) * (1 - damping * n) * wet;
      }
      
      // Cache the generated impulse response
      this.bufferCache.set(cacheKey, impulse);
    }
    
    convolver.buffer = impulse;
    return convolver;
  }

  private scheduleCleanup(): void {
    if (this.scheduledCleanup !== null) {
      clearTimeout(this.scheduledCleanup);
    }
    
    this.scheduledCleanup = window.setTimeout(() => {
      this.performCleanup();
      this.scheduleCleanup();
    }, 30000) as unknown as number; // Run cleanup every 30 seconds
  }
  
  private performCleanup(): void {
    const now = Date.now();
    const unusedThreshold = 60000; // Remove nodes unused for 1 minute
    
    // Cleanup node registry
    this.nodeRegistry.forEach((entry, id) => {
      if (now - entry.lastUsed > unusedThreshold) {
        // Special handling for different node types
        if (id.startsWith('reverb-')) {
          const reverbId = id.replace('reverb-', '');
          this.reverbNodes.delete(reverbId);
        }
        
        this.nodeRegistry.delete(id);
      }
    });
    
    // Limit buffer cache size (keep max 20 cached buffers)
    if (this.bufferCache.size > 20) {
      const bufferEntries = Array.from(this.bufferCache.entries());
      const oldestBuffers = bufferEntries
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .slice(0, bufferEntries.length - 20);
      
      oldestBuffers.forEach(([key]) => this.bufferCache.delete(key));
    }
  }

  // Improved cleanup method with throttling
  public cleanupInactiveNodes(nodeMap: Map<string, any>): void {
    const now = Date.now();
    if (now - this.lastCleanupTime < 1000) return;
    
    this.lastCleanupTime = now;
    
    nodeMap.forEach((node, key) => {
      try {
        if (node.frequency) {
          const _ = node.frequency.value;
        } else if (node.gain) {
          const _ = node.gain.value;
        } else {
          nodeMap.delete(key);
        }
      } catch (e) {
        nodeMap.delete(key);
      }
    });
  }

  // Alias method for backward compatibility
  public cleanupInactiveOscillators(nodeMap: Map<string, any>): void {
    this.cleanupInactiveNodes(nodeMap);
  }
  
  // Explicit method to suspend audio context when app goes to background
  public suspendAudio(): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend().catch(err => console.error('Error suspending audio context:', err));
    }
  }
  
  // Resume audio when app comes to foreground
  public resumeAudio(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(err => console.error('Error resuming audio context:', err));
    }
  }
}

// Add visibility change event listeners for better performance
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    const manager = AudioContextManager.getInstance();
    if (document.visibilityState === 'hidden') {
      manager.suspendAudio();
    } else {
      manager.resumeAudio();
    }
  });
}

export default AudioContextManager;