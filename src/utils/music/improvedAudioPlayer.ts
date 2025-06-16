
interface SoundOptions {
  volume?: number;
  pan?: number; // -1 (left) to 1 (right)
  detune?: number; // in cents
  playbackRate?: number; // 1 is normal, 0.5 is half speed
  loop?: boolean;
  loopStart?: number; // in seconds
  loopEnd?: number; // in seconds
  fadeIn?: number; // milliseconds
  fadeOut?: number; // milliseconds
  onended?: () => void;
}

interface BufferCache {
  [key: string]: AudioBuffer;
}

export class ImprovedAudioPlayer {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private bufferCache: BufferCache = {};
  private activeNodes: AudioNode[] = [];
  private loadingPromises: Record<string, Promise<AudioBuffer>> = {};
  
  constructor() {
    this.initAudioContext();
  }
  
  private initAudioContext() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
    }
  }
  
  /**
   * Preloads a sound file into the buffer cache
   */
  async preloadSound(url: string): Promise<AudioBuffer | null> {
    if (this.bufferCache[url]) return this.bufferCache[url];
    
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    if (!this.audioContext) {
      console.error('Audio context could not be initialized');
      return null;
    }
    
    // If already loading, return the existing promise
    if (this.loadingPromises[url]) {
      return this.loadingPromises[url];
    }
    
    try {
      const loadPromise = fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.arrayBuffer();
        })
        .then(arrayBuffer => {
          if (!this.audioContext) throw new Error('Audio context not available');
          return this.audioContext.decodeAudioData(arrayBuffer);
        })
        .then(audioBuffer => {
          this.bufferCache[url] = audioBuffer;
          delete this.loadingPromises[url];
          return audioBuffer;
        })
        .catch(error => {
          console.error('Error loading sound:', error, url);
          delete this.loadingPromises[url];
          throw error;
        });
      
      this.loadingPromises[url] = loadPromise;
      return loadPromise;
    } catch (error) {
      console.error('Error in preloadSound:', error);
      return null;
    }
  }
  
  /**
   * Plays a sound with options for volume, panning, etc.
   */
  async playSound(url: string, options: SoundOptions = {}): Promise<AudioBufferSourceNode | null> {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    if (!this.audioContext || !this.gainNode) {
      console.error('Audio context or gain node not available');
      return null;
    }
    
    try {
      // Resume suspended audio context (for autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Get AudioBuffer (preload if needed)
      let buffer = this.bufferCache[url];
      if (!buffer) {
        buffer = await this.preloadSound(url);
        if (!buffer) return null;
      }
      
      // Create source node
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      
      // Configure source node
      if (options.playbackRate !== undefined) source.playbackRate.value = options.playbackRate;
      if (options.detune !== undefined) source.detune.value = options.detune;
      if (options.loop !== undefined) source.loop = options.loop;
      if (options.loopStart !== undefined) source.loopStart = options.loopStart;
      if (options.loopEnd !== undefined) source.loopEnd = options.loopEnd;
      
      // Create gain node for volume
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options.volume !== undefined ? options.volume : 1;
      
      // Create panner if needed
      let outputNode: AudioNode = gainNode;
      if (options.pan !== undefined) {
        const pannerNode = this.audioContext.createStereoPanner();
        pannerNode.pan.value = options.pan;
        gainNode.connect(pannerNode);
        outputNode = pannerNode;
      }
      
      // Connect nodes
      source.connect(gainNode);
      outputNode.connect(this.gainNode);
      
      // Handle fade in
      if (options.fadeIn && options.fadeIn > 0) {
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          options.volume || 1,
          this.audioContext.currentTime + (options.fadeIn / 1000)
        );
      }
      
      // Start playback
      source.start();
      
      // Handle fade out and cleanup
      if (options.onended || options.fadeOut) {
        source.onended = () => {
          this.cleanupNode(source);
          this.cleanupNode(gainNode);
          if (outputNode !== gainNode) {
            this.cleanupNode(outputNode);
          }
          if (options.onended) options.onended();
        };
      }
      
      // Track active nodes for cleanup
      this.activeNodes.push(source, gainNode);
      if (outputNode !== gainNode) {
        this.activeNodes.push(outputNode);
      }
      
      return source;
    } catch (error) {
      console.error('Error playing sound:', error);
      return null;
    }
  }
  
  /**
   * Stops all currently playing sounds
   */
  stopAllSounds(fadeOutTime: number = 0) {
    if (!this.audioContext) return;
    
    const currentTime = this.audioContext.currentTime;
    this.activeNodes.forEach(node => {
      if (node instanceof AudioBufferSourceNode) {
        try {
          // Find connected gain node if any
          const connections = this.activeNodes.filter(n => 
            n instanceof GainNode && 
            this.isConnected(node, n)
          ) as GainNode[];
          
          if (connections.length > 0 && fadeOutTime > 0) {
            // Fade out before stopping
            connections.forEach(gainNode => {
              const currentVolume = gainNode.gain.value;
              gainNode.gain.setValueAtTime(currentVolume, currentTime);
              gainNode.gain.linearRampToValueAtTime(0, currentTime + (fadeOutTime / 1000));
            });
            
            // Stop after fadeout
            setTimeout(() => {
              try {
                node.stop();
              } catch (e) {
                // Already stopped
              }
            }, fadeOutTime);
          } else {
            // Stop immediately
            node.stop();
          }
        } catch (e) {
          // Already stopped or other error
        }
      }
    });
    
    // Clean up after fade out
    if (fadeOutTime > 0) {
      setTimeout(() => {
        this.cleanupNodes();
      }, fadeOutTime + 100); // Add small buffer
    } else {
      this.cleanupNodes();
    }
  }
  
  private isConnected(source: AudioNode, target: AudioNode): boolean {
    // Simple check - this is a best guess as the Web Audio API doesn't provide
    // a way to check connections between specific nodes
    return this.activeNodes.includes(source) && this.activeNodes.includes(target);
  }
  
  private cleanupNode(node: AudioNode) {
    try {
      node.disconnect();
    } catch (e) {
      // Already disconnected
    }
    
    const index = this.activeNodes.indexOf(node);
    if (index !== -1) {
      this.activeNodes.splice(index, 1);
    }
  }
  
  private cleanupNodes() {
    // Make a copy of the array before modifying it
    const nodesToCleanup = [...this.activeNodes];
    nodesToCleanup.forEach(node => {
      this.cleanupNode(node);
    });
    this.activeNodes = [];
  }
  
  /**
   * Sets the master volume
   */
  setMasterVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  /**
   * Gets the current master volume
   */
  getMasterVolume(): number {
    return this.gainNode?.gain.value || 0;
  }
  
  /**
   * Cleanup resources on destruction
   */
  cleanup() {
    this.stopAllSounds();
    this.bufferCache = {};
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.gainNode = null;
  }
}

export default ImprovedAudioPlayer;
