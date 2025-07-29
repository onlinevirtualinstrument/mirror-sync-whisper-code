/**
 * Unified Audio Engine - Phase 1 Implementation
 * Centralized audio management for all instruments with consistent performance
 */

export interface NoteEvent {
  instrument: string;
  note: string;
  frequency: number;
  velocity: number;
  timestamp: number;
  userId?: string;
  duration?: number;
}

export interface AudioEngineSettings {
  masterVolume: number;
  reverbLevel: number;
  latency: 'interactive' | 'balanced' | 'playback';
  quality: 'low' | 'medium' | 'high';
}

class UnifiedAudioEngine {
  private static instance: UnifiedAudioEngine;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private activeNotes: Map<string, { oscillator: OscillatorNode; gain: GainNode; startTime: number }> = new Map();
  private settings: AudioEngineSettings = {
    masterVolume: 0.7,
    reverbLevel: 0.3,
    latency: 'interactive',
    quality: 'medium'
  };
  private noteEventListeners: ((event: NoteEvent) => void)[] = [];
  private scheduledCleanup: number | null = null;

  private constructor() {
    this.initializeAudioContext();
    this.setupPeriodicCleanup();
  }

  public static getInstance(): UnifiedAudioEngine {
    if (!UnifiedAudioEngine.instance) {
      UnifiedAudioEngine.instance = new UnifiedAudioEngine();
    }
    return UnifiedAudioEngine.instance;
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({
        latencyHint: this.settings.latency,
        sampleRate: 44100
      });

      // Create master gain
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.settings.masterVolume;
      this.masterGain.connect(this.audioContext.destination);

      // Setup reverb
      await this.setupReverb();

      // Handle autoplay policy
      this.handleAutoplayPolicy();

      console.log('UnifiedAudioEngine: Initialized successfully');
    } catch (error) {
      console.error('UnifiedAudioEngine: Failed to initialize:', error);
    }
  }

  private async setupReverb(): Promise<void> {
    if (!this.audioContext) return;

    this.reverbNode = this.audioContext.createConvolver();
    const impulseBuffer = await this.createReverbImpulse();
    this.reverbNode.buffer = impulseBuffer;
  }

  private async createReverbImpulse(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 2; // 2 seconds
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = i / length;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, 2);
      }
    }

    return impulse;
  }

  private handleAutoplayPolicy(): void {
    const resumeAudio = () => {
      if (this.audioContext?.state === 'suspended') {
        this.audioContext.resume();
      }
    };

    ['mousedown', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, resumeAudio, { once: true });
    });
  }

  private setupPeriodicCleanup(): void {
    this.scheduledCleanup = window.setInterval(() => {
      this.cleanupFinishedNotes();
    }, 5000);
  }

  private cleanupFinishedNotes(): void {
    const now = Date.now();
    this.activeNotes.forEach((noteData, noteId) => {
      if (now - noteData.startTime > 10000) { // 10 seconds max note duration
        this.stopNote(noteId);
      }
    });
  }

  public async playNote(
    instrument: string,
    note: string,
    frequency: number,
    velocity: number = 0.7,
    duration?: number,
    userId?: string
  ): Promise<string> {
    if (!this.audioContext || !this.masterGain) {
      console.warn('UnifiedAudioEngine: Audio context not ready');
      return '';
    }

    const noteId = `${instrument}-${note}-${Date.now()}-${Math.random()}`;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Configure oscillator based on instrument
    this.configureOscillatorForInstrument(oscillator, filter, instrument);
    oscillator.frequency.value = frequency;

    // Setup gain envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(velocity, this.audioContext.currentTime + 0.01);
    
    if (duration) {
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
    } else {
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
    }

    // Connect audio graph
    oscillator.connect(filter);
    filter.connect(gain);
    
    // Add reverb if enabled
    if (this.reverbNode && this.settings.reverbLevel > 0) {
      const dryGain = this.audioContext.createGain();
      const wetGain = this.audioContext.createGain();
      
      dryGain.gain.value = 1 - this.settings.reverbLevel;
      wetGain.gain.value = this.settings.reverbLevel;
      
      gain.connect(dryGain);
      gain.connect(this.reverbNode);
      this.reverbNode.connect(wetGain);
      
      dryGain.connect(this.masterGain);
      wetGain.connect(this.masterGain);
    } else {
      gain.connect(this.masterGain);
    }

    // Start and store note
    oscillator.start();
    const stopTime = duration ? this.audioContext.currentTime + duration / 1000 : this.audioContext.currentTime + 2;
    oscillator.stop(stopTime);

    this.activeNotes.set(noteId, {
      oscillator,
      gain,
      startTime: Date.now()
    });

    // Emit note event
    const noteEvent: NoteEvent = {
      instrument,
      note,
      frequency,
      velocity,
      timestamp: Date.now(),
      userId,
      duration
    };
    this.emitNoteEvent(noteEvent);

    // Cleanup after note ends
    setTimeout(() => {
      this.activeNotes.delete(noteId);
    }, (duration || 2000) + 100);

    return noteId;
  }

  private configureOscillatorForInstrument(
    oscillator: OscillatorNode,
    filter: BiquadFilterNode,
    instrument: string
  ): void {
    switch (instrument.toLowerCase()) {
      case 'piano':
        oscillator.type = 'triangle';
        filter.type = 'lowpass';
        filter.frequency.value = 3000;
        filter.Q.value = 1;
        break;
      case 'guitar':
        oscillator.type = 'sawtooth';
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 5;
        break;
      case 'violin':
        oscillator.type = 'sawtooth';
        filter.type = 'highpass';
        filter.frequency.value = 400;
        filter.Q.value = 2;
        break;
      case 'flute':
        oscillator.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.value = 4000;
        filter.Q.value = 0.5;
        break;
      default:
        oscillator.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;
    }
  }

  public stopNote(noteId: string): void {
    const noteData = this.activeNotes.get(noteId);
    if (noteData) {
      try {
        noteData.oscillator.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
      this.activeNotes.delete(noteId);
    }
  }

  public stopAllNotes(): void {
    this.activeNotes.forEach((_, noteId) => {
      this.stopNote(noteId);
    });
  }

  public setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.masterVolume;
    }
  }

  public setReverbLevel(level: number): void {
    this.settings.reverbLevel = Math.max(0, Math.min(1, level));
  }

  public onNoteEvent(listener: (event: NoteEvent) => void): () => void {
    this.noteEventListeners.push(listener);
    return () => {
      const index = this.noteEventListeners.indexOf(listener);
      if (index > -1) {
        this.noteEventListeners.splice(index, 1);
      }
    };
  }

  private emitNoteEvent(event: NoteEvent): void {
    this.noteEventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('UnifiedAudioEngine: Error in note event listener:', error);
      }
    });
  }

  public getActiveNoteCount(): number {
    return this.activeNotes.size;
  }

  public getSettings(): AudioEngineSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AudioEngineSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    if (newSettings.masterVolume !== undefined) {
      this.setMasterVolume(newSettings.masterVolume);
    }
    if (newSettings.reverbLevel !== undefined) {
      this.setReverbLevel(newSettings.reverbLevel);
    }
  }

  public dispose(): void {
    if (this.scheduledCleanup) {
      clearInterval(this.scheduledCleanup);
    }
    this.stopAllNotes();
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.noteEventListeners = [];
  }
}

export default UnifiedAudioEngine;