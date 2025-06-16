
import { GuitarType, GUITAR_SOUND_PROFILES } from './GuitarSoundProfiles';

export type ModulationType = 'none' | 'tremolo' | 'vibrato';

export interface GuitarEffectsOptions {
  distortion?: number;
  reverb?: number;
  delay?: number;
  chorus?: number;
  modulation?: {
    type: ModulationType;
    rate: number;
    depth: number;
  };
}

class GuitarSoundEngine {
  private context: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private oscillators: Map<string, OscillatorNode> = new Map();
  private volume: number = 0.8;
  private guitarType: GuitarType = 'acoustic';
  private effectNodes: AudioNode[] = [];

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    if (typeof window !== 'undefined') {
      try {
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.context.destination);
      } catch (error) {
        console.error("Web Audio API is not supported in this browser", error);
      }
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume / 100));
    
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  public setGuitarType(type: GuitarType) {
    this.guitarType = type;
  }

  public pluckString(stringIndex: number, fret: number = 0): void {
    if (!this.context || !this.gainNode) {
      this.initializeAudioContext();
      if (!this.context || !this.gainNode) return;
    }

    const stringKey = `${stringIndex}-${fret}`;

    // Stop any existing sound for this string
    this.stopString(stringKey);

    const oscillator = this.context.createOscillator();
    const stringGain = this.context.createGain();

    // Set oscillator type based on guitar type
    oscillator.type = this.getOscillatorType();

    // Calculate frequency based on string and fret
    const frequency = this.calculateFrequency(stringIndex, fret);
    oscillator.frequency.value = frequency;

    // Add slight random detune for more natural sound
    oscillator.detune.value = (Math.random() * 8) - 4;

    // Configure envelope
    const soundProfile = GUITAR_SOUND_PROFILES[this.guitarType];
    const attackTime = 0.01 + (soundProfile.attack * 0.05);
    const now = this.context.currentTime;

    stringGain.gain.setValueAtTime(0, now);
    stringGain.gain.linearRampToValueAtTime(this.volume, now + attackTime);

    // Set decay
    const decayTime = 1.0 + (stringIndex * 0.1) + (soundProfile.sustain * 1.5);
    
    stringGain.gain.exponentialRampToValueAtTime(
      0.001, 
      now + decayTime
    );

    // Connect nodes
    oscillator.connect(stringGain);
    stringGain.connect(this.gainNode);

    oscillator.start();
    
    // Store for later reference
    this.oscillators.set(stringKey, oscillator);
    
    // Schedule stop
    setTimeout(() => {
      this.stopString(stringKey);
    }, decayTime * 1000);
  }

  public stopString(stringKey: string): void {
    const oscillator = this.oscillators.get(stringKey);
    if (oscillator) {
      try {
        oscillator.stop();
      } catch (e) {
        // Already stopped
      }
      this.oscillators.delete(stringKey);
    }
  }

  public stopAllStrings(): void {
    this.oscillators.forEach((oscillator, key) => {
      this.stopString(key);
    });
  }

  public applyEffects(options: GuitarEffectsOptions): void {
    // To be implemented
  }

  public dispose(): void {
    this.stopAllStrings();
    
    // Clean up audio context if needed
    if (this.context && this.context.state !== 'closed') {
      this.context.close().catch(console.error);
    }
    
    // Clear references
    this.oscillators.clear();
    this.effectNodes = [];
    this.context = null;
    this.gainNode = null;
  }

  // Helper methods
  private getOscillatorType(): OscillatorType {
    switch (this.guitarType) {
      case 'electric':
        return 'sawtooth';
      case 'bass':
        return 'sine';
      case 'classical':
      case 'flamenco':
        return 'triangle';
      case 'steel':
        return 'sawtooth';
      case 'twelveString':
        return 'triangle';
      default:
        return 'triangle';
    }
  }

  private calculateFrequency(stringIndex: number, fret: number): number {
    const baseFrequency = this.getBaseFrequency(stringIndex);
    return baseFrequency * Math.pow(2, fret / 12);
  }

  private getBaseFrequency(stringIndex: number): number {
    // Standard tuning frequencies (can be extended for different tunings)
    const frequencies = {
      acoustic: [82.41, 110, 146.83, 196, 246.94, 329.63],
      electric: [82.41, 110, 146.83, 196, 246.94, 329.63],
      bass: [41.20, 55, 73.42, 98],
      classical: [82.41, 110, 146.83, 196, 246.94, 329.63],
      flamenco: [82.41, 110, 146.83, 196, 246.94, 329.63],
      steel: [82.41, 110, 146.83, 196, 246.94, 329.63],
      twelveString: [82.41, 82.41 * 2, 110, 110 * 2, 146.83, 146.83 * 2, 196, 196 * 2, 246.94, 246.94, 329.63, 329.63 * 2]
    };

    return frequencies[this.guitarType][stringIndex] || 440;
  }
}

export default GuitarSoundEngine;
