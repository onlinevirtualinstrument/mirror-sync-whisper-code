/**
 * Unified Audio Engine - Phase 2 Enhanced Implementation
 * Advanced audio management with WebRTC, MIDI, and visual effects integration
 */

import WebRTCManager from '../webrtc/webrtcManager';
import MIDIManager, { MIDINoteEvent } from '../midi/MIDIManager';

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
  private webrtcManager: any = null;
  private midiManager: MIDIManager | null = null;
  private isWebRTCEnabled: boolean = false;
  private isMIDIEnabled: boolean = false;
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private compressionNode: DynamicsCompressorNode | null = null;

  private constructor() {
    this.initializeAudioContext();
    this.setupPeriodicCleanup();
    this.initializeAdvancedFeatures();
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

      // Setup compression for better audio quality
      this.setupCompression();

      // Handle autoplay policy
      this.handleAutoplayPolicy();

      console.log('UnifiedAudioEngine: Initialized successfully with advanced features');
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

  private async initializeAdvancedFeatures(): Promise<void> {
    // Initialize WebRTC for real-time audio sharing
    try {
      this.webrtcManager = new WebRTCManager('user', 'room');
      await this.webrtcManager.initialize();
      this.isWebRTCEnabled = true;
      console.log('UnifiedAudioEngine: WebRTC initialized');
    } catch (error) {
      console.warn('UnifiedAudioEngine: WebRTC initialization failed:', error);
    }

    // Initialize MIDI support
    try {
      this.midiManager = MIDIManager.getInstance();
      const midiSupported = await this.midiManager.initialize();
      this.isMIDIEnabled = midiSupported;
      
      if (midiSupported) {
        this.setupMIDIHandlers();
        console.log('UnifiedAudioEngine: MIDI support enabled');
      }
    } catch (error) {
      console.warn('UnifiedAudioEngine: MIDI initialization failed:', error);
    }
  }

  private setupCompression(): void {
    if (!this.audioContext || !this.masterGain) return;

    this.compressionNode = this.audioContext.createDynamicsCompressor();
    this.compressionNode.threshold.value = -24;
    this.compressionNode.knee.value = 30;
    this.compressionNode.ratio.value = 12;
    this.compressionNode.attack.value = 0.003;
    this.compressionNode.release.value = 0.25;

    // Insert compression before master gain
    this.masterGain.disconnect();
    this.masterGain.connect(this.compressionNode);
    this.compressionNode.connect(this.audioContext.destination);
  }

  private setupMIDIHandlers(): void {
    if (!this.midiManager) return;

    this.midiManager.setEventHandlers({
      onMIDIMessage: (event: MIDINoteEvent) => {
        this.handleMIDIInput(event);
      },
      onDeviceConnected: (device) => {
        console.log('UnifiedAudioEngine: MIDI device connected:', device.name);
      },
      onDeviceDisconnected: (device) => {
        console.log('UnifiedAudioEngine: MIDI device disconnected:', device.name);
      }
    });
  }

  private handleMIDIInput(event: MIDINoteEvent): void {
    if (event.type === 'noteon' && event.note !== undefined && event.velocity !== undefined) {
      const frequency = MIDIManager.noteNumberToFrequency(event.note);
      const noteName = MIDIManager.noteNumberToName(event.note);
      
      this.playNote('piano', noteName, frequency, event.velocity, 1000);
    } else if (event.type === 'noteoff' && event.note !== undefined) {
      // Handle note off if needed
    }
  }

  public enableWebRTC(): boolean {
    if (!this.webrtcManager) return false;
    this.isWebRTCEnabled = true;
    return true;
  }

  public disableWebRTC(): void {
    this.isWebRTCEnabled = false;
  }

  public getMIDIDevices(): { inputs: any[], outputs: any[] } {
    if (!this.midiManager || !this.isMIDIEnabled) {
      return { inputs: [], outputs: [] };
    }
    
    return {
      inputs: this.midiManager.getInputDevices(),
      outputs: this.midiManager.getOutputDevices()
    };
  }

  public async cacheInstrumentSample(instrument: string, note: string, audioData: ArrayBuffer): Promise<void> {
    if (!this.audioContext) return;

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData.slice(0));
      const cacheKey = `${instrument}-${note}`;
      this.audioBufferCache.set(cacheKey, audioBuffer);
      console.log(`UnifiedAudioEngine: Cached sample for ${cacheKey}`);
    } catch (error) {
      console.error('UnifiedAudioEngine: Failed to cache audio sample:', error);
    }
  }

  public getAudioAnalyzer(): AnalyserNode | null {
    if (!this.audioContext) return null;

    const analyzer = this.audioContext.createAnalyser();
    analyzer.fftSize = 2048;
    analyzer.minDecibels = -90;
    analyzer.maxDecibels = -10;
    analyzer.smoothingTimeConstant = 0.85;

    // Connect master gain to analyzer
    if (this.masterGain) {
      this.masterGain.connect(analyzer);
    }

    return analyzer;
  }

  public getLatency(): number {
    if (!this.audioContext) return 0;
    return this.audioContext.baseLatency + this.audioContext.outputLatency;
  }

  public dispose(): void {
    if (this.scheduledCleanup) {
      clearInterval(this.scheduledCleanup);
    }
    
    this.stopAllNotes();
    
    if (this.webrtcManager) {
      this.webrtcManager.dispose();
    }
    
    if (this.midiManager) {
      this.midiManager.dispose();
    }
    
    this.audioBufferCache.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.noteEventListeners = [];
  }
}

export default UnifiedAudioEngine;