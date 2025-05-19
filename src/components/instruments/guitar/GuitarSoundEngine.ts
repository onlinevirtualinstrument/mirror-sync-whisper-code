
import { 
  GUITAR_SOUND_PROFILES, 
  GuitarSoundProfile,
  GuitarType
} from './GuitarSoundProfiles';

// Interface for a playable note
export interface GuitarNote {
  string: number;
  fret: number;
  time?: number;
  duration?: number;
  velocity?: number;
}

// Guitar effects options
export interface GuitarEffectsOptions {
  distortion?: number;
  reverbMix?: number;
  delayTime?: number;
  delayMix?: number;
  modulationType?: ModulationType;
  modulationDepth?: number;
  modulationRate?: number;
  compressorThreshold?: number;
  compressorRatio?: number;
  filterType?: BiquadFilterType;
  filterFrequency?: number;
  filterResonance?: number;
}

// Types of modulation for guitar effects
export type ModulationType = 'chorus' | 'flanger' | 'phaser' | 'tremolo' | 'vibrato';

// Guitar sound player for real-time playback
export class GuitarSoundEngine {
  private audioContext: AudioContext | null = null;
  private toneGenerator: any = null;
  private activeNotes: Map<string, any> = new Map();
  private guitarType: GuitarType;
  private effectsOptions: GuitarEffectsOptions;

  constructor(guitarType: GuitarType = 'acoustic', effectsOptions: GuitarEffectsOptions = {}) {
    this.guitarType = guitarType;
    this.effectsOptions = effectsOptions;
    this.initAudio();
  }

  private initAudio() {
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Ensure context is running (needed due to autoplay policies)
  private ensureAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Initialize or reinitialize the tone generator with new settings
  public updateSettings(guitarType: GuitarType, effectsOptions: GuitarEffectsOptions = {}) {
    this.guitarType = guitarType;
    this.effectsOptions = { ...this.effectsOptions, ...effectsOptions };
    
    // Stop any playing notes
    this.stopAllNotes();
    
    // Reinitialize the tone generator if context exists
    if (this.audioContext) {
      this.toneGenerator = createGuitarToneGenerator(this.audioContext, this.guitarType, this.effectsOptions);
    }
  }

  // Convert string and fret to frequency
  private getFrequency(stringIndex: number, fret: number): number {
    // Base frequencies for standard tuning (E2, A2, D3, G3, B3, E4)
    const baseFrequencies = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];
    
    // Make sure string index is valid
    if (stringIndex < 0 || stringIndex >= baseFrequencies.length) {
      console.warn('Invalid string index:', stringIndex);
      return 440; // Default to A4 if invalid
    }
    
    // Calculate frequency based on the fret position (12-TET)
    const baseFreq = baseFrequencies[stringIndex];
    return baseFreq * Math.pow(2, fret / 12);
  }

  // Play a note on the virtual guitar
  public playNote(note: GuitarNote): void {
    this.ensureAudioContext();
    
    // Lazy initialize tone generator if needed
    if (!this.toneGenerator && this.audioContext) {
      this.toneGenerator = createGuitarToneGenerator(this.audioContext, this.guitarType, this.effectsOptions);
    }
    
    if (!this.toneGenerator) {
      console.error('Tone generator not initialized');
      return;
    }
    
    // Convert string/fret to frequency
    const frequency = this.getFrequency(note.string, note.fret);
    
    // Default velocity if not provided
    const velocity = note.velocity || 0.8;
    
    // Generate a unique ID for this note
    const noteId = `${note.string}-${note.fret}-${Date.now()}`;
    
    // Play the note using the tone generator
    const noteInstance = this.toneGenerator.playNote(
      frequency,
      velocity,
      this.audioContext?.currentTime || 0,
      note.duration || 1.0
    );
    
    // Store reference to the playing note
    this.activeNotes.set(noteId, {
      instance: noteInstance,
      string: note.string,
      fret: note.fret
    });
    
    // Auto-remove from active notes after it finishes
    if (note.duration) {
      setTimeout(() => {
        this.activeNotes.delete(noteId);
      }, (note.duration * 1000) + 500); // Add a small buffer
    }
    
    return;
  }

  // Stop a specific note
  public stopNote(stringIndex: number, fret: number): void {
    // Find and stop all instances of this note
    this.activeNotes.forEach((note, id) => {
      if (note.string === stringIndex && note.fret === fret) {
        if (note.instance && note.instance.stop) {
          note.instance.stop();
        }
        this.activeNotes.delete(id);
      }
    });
  }

  // Stop all currently playing notes
  public stopAllNotes(): void {
    this.activeNotes.forEach(note => {
      if (note.instance && note.instance.stop) {
        note.instance.stop();
      }
    });
    this.activeNotes.clear();
  }

  // Release resources
  public dispose(): void {
    this.stopAllNotes();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.toneGenerator = null;
  }

  // Play a chord
  public playChord(positions: Array<{string: number, fret: number}>, velocity: number = 0.7, strum: boolean = true): void {
    if (!positions || positions.length === 0) return;
    
    // Sort strings from low to high for natural strumming
    const sortedPositions = [...positions].sort((a, b) => b.string - a.string);
    
    if (strum) {
      // Add slight delay between notes for strumming effect
      const strumDuration = 0.12; // Total strum time in seconds
      const noteDuration = 1.5; // How long each note sustains
      
      sortedPositions.forEach((pos, index) => {
        if (pos.fret >= 0) { // Skip if fret is negative (muted string)
          setTimeout(() => {
            this.playNote({
              string: pos.string,
              fret: pos.fret,
              velocity: velocity * (0.9 + Math.random() * 0.2), // Slight velocity variations
              duration: noteDuration - (index * 0.05) // Slightly shorter duration for higher strings
            });
          }, index * (strumDuration * 1000 / sortedPositions.length));
        }
      });
    } else {
      // Play all notes simultaneously (no strum)
      sortedPositions.forEach(pos => {
        if (pos.fret >= 0) {
          this.playNote({
            string: pos.string,
            fret: pos.fret,
            velocity,
            duration: 1.0
          });
        }
      });
    }
  }
}

// Function to create a tone generator for the guitar
const createGuitarToneGenerator = (
  audioContext: AudioContext, 
  guitarType: GuitarType,
  effectsOptions: GuitarEffectsOptions = {}
) => {
  const soundProfile = GUITAR_SOUND_PROFILES[guitarType];
  
  // Combine default effects from sound profile with any custom effects
  const combinedEffects = {
    filterFrequency: soundProfile.filterFrequency,
    filterResonance: soundProfile.filterResonance,
    reverbMix: soundProfile.reverbMix,
    chorusMix: soundProfile.chorusMix,
    delayMix: soundProfile.delayMix,
    compressorThreshold: soundProfile.compressorThreshold,
    ...effectsOptions
  };

  // Function to play a note with the guitar's characteristic sound
  const playNote = (
    frequency: number, 
    velocity: number = 0.8, 
    startTime: number = audioContext.currentTime,
    duration: number = 1.0
  ) => {
    // Create oscillator with characteristics matching the guitar type
    const oscillator = audioContext.createOscillator();
    
    // Set oscillator type based on guitar profile
    if (soundProfile.oscillatorType !== 'custom' && 
       (soundProfile.oscillatorType === 'sine' || 
        soundProfile.oscillatorType === 'square' || 
        soundProfile.oscillatorType === 'sawtooth' || 
        soundProfile.oscillatorType === 'triangle')) {
      oscillator.type = soundProfile.oscillatorType;
    } else {
      // For custom waveform, create a periodic wave
      const harmonics = new Float32Array(16);
      const phases = new Float32Array(16);
      
      // Set harmonic content based on guitar type
      for (let i = 0; i < harmonics.length; i++) {
        // Different harmonic structures for different guitars
        if (guitarType === 'acoustic') {
          // Rich in even and odd harmonics
          harmonics[i] = 1.0 / (i + 1) * (i % 2 ? 0.9 : 1.0);
        } else if (guitarType === 'electric') {
          // More odd harmonics for electric guitars
          harmonics[i] = 1.0 / (i + 1) * (i % 2 ? 1.0 : 0.7);
        } else if (guitarType === 'classical') {
          // Softer harmonics with faster decay for higher ones
          harmonics[i] = 1.0 / Math.pow(i + 1, 1.5);
        } else if (guitarType === 'bass') {
          // Strong fundamentals, fewer high harmonics
          harmonics[i] = i === 0 ? 1.0 : 0.5 / (i + 1);
        } else if (guitarType === 'steel') {
          // Metallic resonances with specific harmonics emphasized
          harmonics[i] = 1.0 / (i + 1) * (i % 3 === 0 ? 1.2 : 0.8);
        } else if (guitarType === 'flamenco') {
          // Bright attack with specific harmonics for percussive quality
          harmonics[i] = 1.0 / (i + 1) * (i === 2 || i === 3 ? 1.3 : 0.9);
        } else if (guitarType === 'twelveString') {
          // Doubled strings produce chorus-like beating effects
          harmonics[i] = 1.0 / (i + 1) * (i === 1 || i === 2 ? 1.4 : 0.95);
          // Add slight detuning effect
          phases[i] = i % 2 ? 0.05 : 0;
        }
      }
      
      const customWave = audioContext.createPeriodicWave(harmonics, phases);
      oscillator.setPeriodicWave(customWave);
    }
    
    oscillator.frequency.value = frequency;
    
    // Add slight random detune for more natural sound
    oscillator.detune.value = (Math.random() * 6 - 3); // Slight random detune ±3 cents
    
    // Create gain node for envelope
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    
    // Create filter for tone shaping
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = combinedEffects.filterFrequency;
    filter.Q.value = combinedEffects.filterResonance;
    
    // Add second filter for resonance (body of the guitar)
    const resonanceFilter = audioContext.createBiquadFilter();
    resonanceFilter.type = 'peaking';
    
    // Set resonance frequency based on guitar type
    if (guitarType === 'acoustic') {
      resonanceFilter.frequency.value = 110; // Typical acoustic body resonance
    } else if (guitarType === 'classical') {
      resonanceFilter.frequency.value = 98; // Warmer classical body
    } else if (guitarType === 'bass') {
      resonanceFilter.frequency.value = 65; // Lower for bass
    } else if (guitarType === 'flamenco') {
      resonanceFilter.frequency.value = 125; // Brighter flamenco body
    } else if (guitarType === 'steel') {
      resonanceFilter.frequency.value = 220; // Resonator's metallic resonance
    } else if (guitarType === 'twelveString') {
      resonanceFilter.frequency.value = 130; // Larger body for 12-string
    } else {
      resonanceFilter.frequency.value = 90; // Default for electric
    }
    
    resonanceFilter.Q.value = 7.0 * soundProfile.resonance;
    resonanceFilter.gain.value = 3.0 * soundProfile.resonance;
    
    // Create compressor for dynamics
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = combinedEffects.compressorThreshold;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.1;
    
    // Add distortion for electric guitars
    let distortion;
    if ((guitarType === 'electric' || guitarType === 'bass') && 
        combinedEffects.distortion && 
        combinedEffects.distortion > 0) {
      distortion = createDistortionEffect(audioContext, combinedEffects.distortion);
    }
    
    // Add chorus for specific guitar types
    let chorus;
    if ((guitarType === 'electric' || guitarType === 'twelveString') && soundProfile.chorusMix > 0) {
      chorus = createModulationEffect(audioContext, 'chorus', {
        depth: soundProfile.chorusMix * 0.03,
        rate: guitarType === 'twelveString' ? 0.8 : 0.5,
        mix: soundProfile.chorusMix
      });
    }
    
    // Add reverb
    const reverb = createReverbEffect(audioContext, {
      mix: combinedEffects.reverbMix,
      decay: guitarType === 'classical' || guitarType === 'acoustic' ? 2.5 : 1.5
    });
    
    // Connect the audio nodes
    oscillator.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(resonanceFilter);
    
    // Build effects chain
    let lastNode: AudioNode = resonanceFilter;
    
    if (distortion) {
      lastNode.connect(distortion.input);
      lastNode = distortion.output;
    }
    
    if (chorus) {
      lastNode.connect(chorus.input);
      lastNode = chorus.output;
    }
    
    if (reverb) {
      lastNode.connect(reverb.input);
      lastNode = reverb.output;
    }
    
    lastNode.connect(compressor);
    compressor.connect(audioContext.destination);
    
    // Apply envelope based on guitar type
    // Attack
    const attackTime = startTime + (soundProfile.attack * 0.1);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(velocity, attackTime);
    
    // Decay to sustain
    const decayTime = attackTime + (soundProfile.decay * 0.2);
    const sustainLevel = velocity * 0.8 * soundProfile.sustain;
    gainNode.gain.linearRampToValueAtTime(sustainLevel, decayTime);
    
    // Release
    const releaseStart = startTime + duration;
    const releaseTime = releaseStart + (soundProfile.release * 0.5);
    gainNode.gain.setValueAtTime(sustainLevel, releaseStart);
    gainNode.gain.exponentialRampToValueAtTime(0.001, releaseTime);
    
    // Schedule oscillator start and stop
    oscillator.start(startTime);
    oscillator.stop(releaseTime + 0.05);
    
    // Return control object
    return {
      oscillator,
      gainNode,
      stop: () => {
        // Fast release on manual stop
        const now = audioContext.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        oscillator.stop(now + 0.06);
      }
    };
  };
  
  return {
    playNote,
    audioContext
  };
};

// Helper function to create distortion effect
const createDistortionEffect = (audioContext: AudioContext, amount: number = 0.3) => {
  const distortion = audioContext.createWaveShaper();
  const preGain = audioContext.createGain();
  const postGain = audioContext.createGain();
  
  // Create distortion curve
  const k = amount * 400;
  const samples = 44100;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; ++i) {
    const x = (i * 2) / samples - 1;
    curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
  }
  
  distortion.curve = curve;
  distortion.oversample = '4x';
  
  // Set pre and post gain for better control
  preGain.gain.value = 0.6 + amount;
  postGain.gain.value = 0.7;
  
  // Connect
  preGain.connect(distortion);
  distortion.connect(postGain);
  
  return {
    input: preGain,
    output: postGain
  };
};

// Helper function to create modulation effects (chorus, flanger, etc.)
const createModulationEffect = (
  audioContext: AudioContext, 
  type: ModulationType, 
  options: { depth: number, rate: number, mix: number }
) => {
  const input = audioContext.createGain();
  const dryGain = audioContext.createGain();
  const wetGain = audioContext.createGain();
  const output = audioContext.createGain();
  
  // Set up dry/wet mix
  dryGain.gain.value = 1 - options.mix;
  wetGain.gain.value = options.mix;
  
  input.connect(dryGain);
  dryGain.connect(output);
  
  // Create delay for the wet signal
  const delay = audioContext.createDelay();
  
  // Set base delay time based on effect type
  let baseDelayTime = 0;
  switch (type) {
    case 'chorus': baseDelayTime = 0.025; break;
    case 'flanger': baseDelayTime = 0.005; break;
    case 'phaser': baseDelayTime = 0.01; break;
    case 'vibrato': baseDelayTime = 0.002; break;
    case 'tremolo': baseDelayTime = 0; break;
  }
  
  delay.delayTime.value = baseDelayTime;
  
  // Create LFO for modulation
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  
  lfo.type = 'sine';
  lfo.frequency.value = options.rate;
  lfoGain.gain.value = options.depth;
  
  lfo.connect(lfoGain);
  lfoGain.connect(delay.delayTime);
  
  // Connect wet path
  input.connect(delay);
  delay.connect(wetGain);
  wetGain.connect(output);
  
  // Start the LFO
  lfo.start();
  
  return {
    input,
    output
  };
};

// Helper function to create reverb
const createReverbEffect = (
  audioContext: AudioContext, 
  options: { mix: number, decay: number }
) => {
  // Simplified reverb implementation
  const input = audioContext.createGain();
  const output = audioContext.createGain();
  const dryGain = audioContext.createGain();
  const wetGain = audioContext.createGain();
  
  // Set up dry/wet mix
  dryGain.gain.value = 1 - options.mix;
  wetGain.gain.value = options.mix;
  
  // Connect dry path
  input.connect(dryGain);
  dryGain.connect(output);
  
  // Create convolver for reverb
  const convolver = audioContext.createConvolver();
  
  // Create impulse response (simplified)
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * options.decay;
  const impulse = audioContext.createBuffer(2, length, sampleRate);
  
  // Fill impulse with decaying noise
  for (let channel = 0; channel < 2; channel++) {
    const impulseData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, options.decay);
    }
  }
  
  convolver.buffer = impulse;
  
  // Connect wet path
  input.connect(convolver);
  convolver.connect(wetGain);
  wetGain.connect(output);
  
  return {
    input,
    output
  };
};

// Factory function to create a GuitarSoundEngine
export const createGuitarSoundEngine = (
  guitarType: GuitarType = 'acoustic', 
  effectsOptions: GuitarEffectsOptions = {}
) => {
  return new GuitarSoundEngine(guitarType, effectsOptions);
};
