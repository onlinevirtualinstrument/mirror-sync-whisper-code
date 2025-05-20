
// A robust metronome player with error handling
export class MetronomePlayer {
  private audioContext: AudioContext | null = null;
  private scheduledTicks: number[] = [];
  private bpm: number = 120;
  private isPlaying: boolean = false;
  private nextTickTime: number = 0;
  private soundBuffer: AudioBuffer | null = null;
  private lookahead: number = 25; // ms
  private scheduleAheadTime: number = 0.1; // seconds
  private intervalId: number | null = null;
  private soundLoaded: boolean = false;
  private soundLoadError: boolean = false;
  private soundUrl: string = '/sounds/metronome.mp3';
  private onErrorCallback: ((error: Error) => void) | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  constructor(initialBpm: number = 120, soundUrl?: string) {
    this.bpm = initialBpm;
    if (soundUrl) this.soundUrl = soundUrl;
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      // Using a more cross-browser compatible approach
      if (typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          this.audioContext = new AudioContext();
          this.loadSound();
        } else {
          this.handleError(new Error("Web Audio API is not supported in this browser"));
        }
      }
    } catch (e) {
      this.handleError(new Error(`Failed to initialize audio context: ${e instanceof Error ? e.message : String(e)}`));
    }
  }

  private async loadSound() {
    if (!this.audioContext) return;
    try {
      const response = await fetch(this.soundUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch sound: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      this.audioContext.decodeAudioData(
        arrayBuffer,
        (buffer) => {
          this.soundBuffer = buffer;
          this.soundLoaded = true;
          this.soundLoadError = false;
          this.reconnectAttempts = 0;
        },
        (error) => {
          this.handleError(new Error(`Error decoding audio data: ${error}`));
          this.soundLoadError = true;
        }
      );
    } catch (e) {
      this.handleError(new Error(`Error loading metronome sound: ${e instanceof Error ? e.message : String(e)}`));
      this.soundLoadError = true;
      
      // Attempt to reconnect with exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.pow(2, this.reconnectAttempts) * 1000;
        this.reconnectAttempts++;
        setTimeout(() => this.loadSound(), delay);
      }
    }
  }

  private scheduleNote(time: number) {
    if (!this.audioContext || !this.soundBuffer) {
      this.handleError(new Error("Cannot schedule note: Audio context or sound buffer is not available"));
      return;
    }
    
    // Create a new source node for each note
    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.soundBuffer;
      
      // Create a gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.7; // Prevent clipping
      
      // Connect the nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Start the sound
      source.start(time);
      
      // Add to scheduled ticks
      this.scheduledTicks.push(this.audioContext.currentTime + time);
      
      // Clean up old scheduled ticks
      const now = this.audioContext.currentTime;
      this.scheduledTicks = this.scheduledTicks.filter(t => t > now);
      
    } catch (e) {
      this.handleError(new Error(`Error scheduling note: ${e instanceof Error ? e.message : String(e)}`));
    }
  }

  private scheduler() {
    if (!this.audioContext || !this.isPlaying) return;

    try {
      const now = this.audioContext.currentTime;
      const secondsPerBeat = 60.0 / this.bpm;

      // Schedule notes that will play before the next interval
      while (this.nextTickTime < now + this.scheduleAheadTime) {
        this.scheduleNote(this.nextTickTime - now);
        this.nextTickTime += secondsPerBeat;
      }
    } catch (e) {
      this.handleError(new Error(`Error in scheduler: ${e instanceof Error ? e.message : String(e)}`));
    }
  }

  /**
   * Set the BPM (Beats Per Minute) for the metronome
   * @param newBpm The new BPM value (between 30 and 250)
   * @returns The actual BPM value set (clamped if out of range)
   */
  setBpm(newBpm: number): number {
    this.bpm = Math.max(30, Math.min(250, newBpm));
    return this.bpm;
  }

  /**
   * Start the metronome
   * @returns True if started successfully, false otherwise
   */
  start(): boolean {
    if (this.isPlaying) return true;
    
    if (!this.soundLoaded) {
      if (this.soundLoadError) {
        // Try loading the sound again if there was an error
        this.loadSound();
      }
      this.handleError(new Error("Cannot start metronome: Sound not loaded"));
      return false;
    }
    
    try {
      if (!this.audioContext) {
        this.initAudioContext();
        if (!this.audioContext) {
          throw new Error("Failed to initialize audio context");
        }
      } else if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      this.isPlaying = true;
      this.nextTickTime = this.audioContext.currentTime;
      this.scheduler();
      
      // Schedule future ticks
      this.intervalId = window.setInterval(() => this.scheduler(), this.lookahead);
      return true;
      
    } catch (e) {
      this.handleError(new Error(`Error starting metronome: ${e instanceof Error ? e.message : String(e)}`));
      this.isPlaying = false;
      return false;
    }
  }

  /**
   * Stop the metronome
   * @returns The current playing state (should be false)
   */
  stop(): boolean {
    this.isPlaying = false;
    
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.scheduledTicks = [];
    return this.isPlaying;
  }

  /**
   * Toggle the metronome on/off
   * @returns The new playing state
   */
  toggle(): boolean {
    return this.isPlaying ? this.stop() : this.start();
  }

  /**
   * Check if the metronome is currently playing
   */
  isActive(): boolean {
    return this.isPlaying;
  }

  /**
   * Set an error handler function
   * @param callback Function to call when errors occur
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Handle errors by calling the error callback if set
   */
  private handleError(error: Error): void {
    console.error(error);
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  /**
   * Check if the sound is loaded and ready
   */
  isSoundLoaded(): boolean {
    return this.soundLoaded;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close().catch(e => console.error("Error closing audio context:", e));
      this.audioContext = null;
    }
    this.soundBuffer = null;
    this.soundLoaded = false;
  }

  /**
   * Force reload the sound file
   */
  reloadSound(): Promise<boolean> {
    return new Promise((resolve) => {
      this.soundLoaded = false;
      this.soundLoadError = false;
      this.loadSound();
      
      // Create a timeout to check if sound loaded
      const timeout = setTimeout(() => {
        resolve(this.soundLoaded);
      }, 3000);
      
      // Create a small interval to check sooner if possible
      const checkInterval = setInterval(() => {
        if (this.soundLoaded) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve(true);
        }
        if (this.soundLoadError) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    });
  }
}

export default MetronomePlayer;