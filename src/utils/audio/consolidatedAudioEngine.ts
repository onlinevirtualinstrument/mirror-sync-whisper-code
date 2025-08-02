/**
 * Consolidated Audio Engine
 * Integrates all audio systems: Web Audio API, Tone.js, WebRTC, and MIDI
 */

import * as Tone from 'tone';
import AudioContextManager from '../music/AudioContextManager';
import WebRTCManager from '../webrtc/webrtcManager';

export interface AudioEngineConfig {
  enableWebRTC: boolean;
  enableMIDI: boolean;
  enableSpatialAudio: boolean;
  latencyHint: 'interactive' | 'balanced' | 'playback';
  bufferSize: number;
  sampleRate: number;
}

export interface NoteEvent {
  instrument: string;
  note: string;
  frequency: number;
  velocity: number;
  duration: number;
  timestamp: number;
  userId?: string;
  isRemote?: boolean;
}

export interface SpatialAudioConfig {
  x: number;
  y: number;
  z: number;
  distance: number;
  orientation: number;
}

class ConsolidatedAudioEngine {
  private static instance: ConsolidatedAudioEngine;
  private audioContextManager: AudioContextManager;
  private webRTCManager: any;
  private toneInitialized: boolean = false;
  private midiAccess: MIDIAccess | null = null;
  private config: AudioEngineConfig;
  
  // Audio nodes and effects
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverb: ConvolverNode | null = null;
  private spatialPanner: Map<string, PannerNode> = new Map();
  
  // Instrument synthesizers
  private instruments: Map<string, Tone.Synth | Tone.PolySynth | Tone.Sampler> = new Map();
  private effects: Map<string, any[]> = new Map();
  
  // Event handlers
  private noteHandlers: Set<(event: NoteEvent) => void> = new Set();
  private midiHandlers: Set<(event: any) => void> = new Set();
  
  // Performance monitoring
  private performanceMetrics = {
    audioLatency: 0,
    processingLoad: 0,
    activeNotes: 0,
    memoryUsage: 0
  };

  private constructor() {
    this.audioContextManager = AudioContextManager.getInstance();
    this.webRTCManager = new WebRTCManager('user', 'room');
    
    this.config = {
      enableWebRTC: false,
      enableMIDI: false,
      enableSpatialAudio: false,
      latencyHint: 'interactive',
      bufferSize: 256,
      sampleRate: 44100
    };
  }

  public static getInstance(): ConsolidatedAudioEngine {
    if (!ConsolidatedAudioEngine.instance) {
      ConsolidatedAudioEngine.instance = new ConsolidatedAudioEngine();
    }
    return ConsolidatedAudioEngine.instance;
  }

  public async initialize(config: Partial<AudioEngineConfig> = {}): Promise<void> {
    this.config = { ...this.config, ...config };
    
    try {
      // Initialize Tone.js
      await Tone.start();
      this.toneInitialized = true;
      
      // Setup master audio chain
      await this.setupMasterAudioChain();
      
      // Initialize WebRTC if enabled
      if (this.config.enableWebRTC) {
        await this.initializeWebRTC();
      }
      
      // Initialize MIDI if enabled and supported
      if (this.config.enableMIDI && navigator.requestMIDIAccess) {
        await this.initializeMIDI();
      }
      
      // Setup performance monitoring
      this.startPerformanceMonitoring();
      
      console.log('Consolidated Audio Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Consolidated Audio Engine:', error);
      throw error;
    }
  }

  private async setupMasterAudioChain(): Promise<void> {
    const audioContext = this.audioContextManager.getAudioContext();
    
    // Create master gain
    this.masterGain = audioContext.createGain();
    this.masterGain.gain.value = 0.7;
    
    // Create compressor for consistent levels
    this.compressor = audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;
    
    // Get reverb
    this.reverb = await this.audioContextManager.getReverbNode('hall');
    
    // Connect audio chain: instruments -> compressor -> reverb -> master -> destination
    this.compressor.connect(this.reverb);
    this.reverb.connect(this.masterGain);
    this.masterGain.connect(audioContext.destination);
    
    // Connect Tone.js to our master chain
    Tone.Destination.connect(this.compressor as any);
  }

  private async initializeWebRTC(): Promise<void> {
    await this.webRTCManager.initialize();
    
    this.webRTCManager.setEventHandlers({
      onAudioData: (peerId, data) => {
        this.handleRemoteNoteEvent(data);
      },
      onPeerConnected: (peerId) => {
        console.log('Audio: Peer connected', peerId);
        this.setupSpatialAudioForPeer(peerId);
      },
      onPeerDisconnected: (peerId) => {
        console.log('Audio: Peer disconnected', peerId);
        this.removeSpatialAudioForPeer(peerId);
      }
    });
  }

  private async initializeMIDI(): Promise<void> {
    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      
      this.midiAccess.inputs.forEach((input) => {
        input.onmidimessage = (message) => {
          this.handleMIDIMessage(message);
        };
      });
      
      console.log('MIDI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MIDI:', error);
    }
  }

  private handleMIDIMessage(message: MIDIMessageEvent): void {
    const [command, note, velocity] = message.data;
    
    if (command === 144 && velocity > 0) { // Note on
      const frequency = Tone.Frequency(note, 'midi').toFrequency();
      const noteEvent: NoteEvent = {
        instrument: 'midi',
        note: Tone.Frequency(note, 'midi').toNote(),
        frequency,
        velocity: velocity / 127,
        duration: 1000, // Default duration
        timestamp: performance.now()
      };
      
      this.playNote(noteEvent);
      this.midiHandlers.forEach(handler => handler(noteEvent));
    }
  }

  public async createInstrument(
    instrumentId: string, 
    type: 'synth' | 'polysynth' | 'sampler' = 'synth',
    options: any = {}
  ): Promise<void> {
    let instrument: Tone.Synth | Tone.PolySynth | Tone.Sampler;
    
    switch (type) {
      case 'polysynth':
        instrument = new Tone.PolySynth(Tone.Synth, options);
        break;
      case 'sampler':
        instrument = new Tone.Sampler(options);
        break;
      default:
        instrument = new Tone.Synth(options);
    }
    
    // Connect to master chain
    if (this.compressor) {
      instrument.connect(this.compressor as any);
    }
    
    this.instruments.set(instrumentId, instrument);
    
    // Setup effects chain if specified
    if (options.effects && Array.isArray(options.effects)) {
      this.setupEffectsChain(instrumentId, options.effects);
    }
  }

  private setupEffectsChain(instrumentId: string, effectsConfig: any[]): void {
    const instrument = this.instruments.get(instrumentId);
    if (!instrument) return;
    
    const effects: any[] = [];
    
    effectsConfig.forEach(config => {
      let effect: any;
      
      switch (config.type) {
        case 'reverb':
          effect = new Tone.Reverb(config.options);
          break;
        case 'delay':
          effect = new Tone.Delay(config.options);
          break;
        case 'chorus':
          effect = new Tone.Chorus(config.options);
          break;
        case 'distortion':
          effect = new Tone.Distortion(config.options);
          break;
        case 'filter':
          effect = new Tone.Filter(config.options);
          break;
        default:
          return;
      }
      
      effects.push(effect);
    });
    
    if (effects.length > 0) {
      // Connect effects in chain
      let previousNode: any = instrument;
      effects.forEach(effect => {
        previousNode.connect(effect);
        previousNode = effect;
      });
      
      // Connect last effect to compressor
      if (this.compressor) {
        previousNode.connect(this.compressor);
      }
      
      this.effects.set(instrumentId, effects);
    }
  }

  public async playNote(noteEvent: NoteEvent): Promise<void> {
    if (!this.toneInitialized) {
      await this.initialize();
    }
    
    try {
      const instrument = this.instruments.get(noteEvent.instrument);
      
      if (instrument) {
        // Use Tone.js instrument
        const duration = noteEvent.duration / 1000; // Convert to seconds
        
        try {
          (instrument as any).triggerAttackRelease(
            noteEvent.note,
            duration,
            undefined,
            noteEvent.velocity
          );
        } catch {
          // Fallback for different instrument types
          try {
            (instrument as any).triggerAttack(noteEvent.note, undefined, noteEvent.velocity);
            setTimeout(() => {
              (instrument as any).triggerRelease?.(noteEvent.note);
            }, noteEvent.duration);
          } catch (error) {
            console.warn('Could not trigger instrument:', error);
          }
        }
      } else {
        // Fallback to basic oscillator
        await this.playBasicNote(noteEvent);
      }
      
      this.performanceMetrics.activeNotes++;
      
      // Broadcast to WebRTC if enabled and not a remote note
      if (this.config.enableWebRTC && !noteEvent.isRemote) {
        this.webRTCManager.sendAudioData(noteEvent, 'note');
      }
      
      // Notify handlers
      this.noteHandlers.forEach(handler => handler(noteEvent));
      
      // Setup spatial audio if enabled
      if (this.config.enableSpatialAudio && noteEvent.userId) {
        this.applySpatialAudio(noteEvent);
      }
      
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }

  private async playBasicNote(noteEvent: NoteEvent): Promise<void> {
    const audioContext = this.audioContextManager.getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.frequency.value = noteEvent.frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.value = noteEvent.velocity * 0.3;
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + noteEvent.duration / 1000
    );
    
    oscillator.connect(gainNode);
    if (this.compressor) {
      gainNode.connect(this.compressor);
    } else {
      gainNode.connect(audioContext.destination);
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + noteEvent.duration / 1000);
  }

  private setupSpatialAudioForPeer(peerId: string): void {
    if (!this.config.enableSpatialAudio) return;
    
    const audioContext = this.audioContextManager.getAudioContext();
    const panner = audioContext.createPanner();
    
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;
    
    this.spatialPanner.set(peerId, panner);
  }

  private removeSpatialAudioForPeer(peerId: string): void {
    this.spatialPanner.delete(peerId);
  }

  private applySpatialAudio(noteEvent: NoteEvent): void {
    if (!noteEvent.userId || !this.spatialPanner.has(noteEvent.userId)) return;
    
    const panner = this.spatialPanner.get(noteEvent.userId)!;
    // Apply spatial positioning based on user data
    // This would need to be connected to user position data
    panner.positionX.value = Math.random() * 10 - 5; // Placeholder
    panner.positionY.value = 0;
    panner.positionZ.value = Math.random() * 10 - 5; // Placeholder
  }

  private handleRemoteNoteEvent(data: any): void {
    const noteEvent: NoteEvent = {
      ...data,
      isRemote: true,
      timestamp: performance.now()
    };
    
    this.playNote(noteEvent);
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      const audioContext = this.audioContextManager.getAudioContext();
      
      this.performanceMetrics.audioLatency = audioContext.baseLatency * 1000;
      this.performanceMetrics.processingLoad = audioContext.currentTime;
      
      // Memory usage estimation
      if ((performance as any).memory) {
        this.performanceMetrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
      }
      
      // Reset active notes count
      this.performanceMetrics.activeNotes = 0;
    }, 1000);
  }

  // Public API methods
  public setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  public addNoteHandler(handler: (event: NoteEvent) => void): void {
    this.noteHandlers.add(handler);
  }

  public removeNoteHandler(handler: (event: NoteEvent) => void): void {
    this.noteHandlers.delete(handler);
  }

  public addMIDIHandler(handler: (event: any) => void): void {
    this.midiHandlers.add(handler);
  }

  public removeMIDIHandler(handler: (event: any) => void): void {
    this.midiHandlers.delete(handler);
  }

  public async dispose(): Promise<void> {
    // Dispose Tone.js instruments
    this.instruments.forEach(instrument => {
      instrument.dispose();
    });
    this.instruments.clear();
    
    // Dispose effects
    this.effects.forEach(effectsChain => {
      effectsChain.forEach(effect => effect.dispose());
    });
    this.effects.clear();
    
    // Clear handlers
    this.noteHandlers.clear();
    this.midiHandlers.clear();
    
    // Dispose WebRTC
    this.webRTCManager.dispose();
    
    // Reset state
    this.toneInitialized = false;
    this.midiAccess = null;
    
    console.log('Consolidated Audio Engine disposed');
  }
}

export default ConsolidatedAudioEngine;