
import * as Tone from 'tone';

class ToneAudioEngine {
  private static instance: ToneAudioEngine;
  private initialized = false;
  private synths: Map<string, Tone.PolySynth> = new Map();
  private masterVolume: Tone.Volume;
  private reverb: Tone.Reverb;
  private compressor: Tone.Compressor;

  private constructor() {
    this.masterVolume = new Tone.Volume(-10).toDestination();
    this.reverb = new Tone.Reverb(1.2);
    this.compressor = new Tone.Compressor(-30, 3);
  }

  public static getInstance(): ToneAudioEngine {
    if (!ToneAudioEngine.instance) {
      ToneAudioEngine.instance = new ToneAudioEngine();
    }
    return ToneAudioEngine.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure audio context is running
      if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log('ToneAudioEngine: Audio context started');
      }

      // Connect effects chain
      await this.reverb.generate();
      this.reverb.connect(this.compressor);
      this.compressor.connect(this.masterVolume);

      // Create instrument-specific synthesizers
      this.createInstrumentSynths();

      this.initialized = true;
      console.log('ToneAudioEngine: Successfully initialized');
    } catch (error) {
      console.error('ToneAudioEngine: Failed to initialize:', error);
      throw error;
    }
  }

  private createInstrumentSynths(): void {
    // Piano synthesizer
    const pianoSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
    });
    pianoSynth.connect(this.reverb);
    this.synths.set('piano', pianoSynth);

    // Guitar synthesizer
    const guitarSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.8 }
    });
    guitarSynth.connect(this.reverb);
    this.synths.set('guitar', guitarSynth);

    // Violin synthesizer
    const violinSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.5 }
    });
    violinSynth.connect(this.reverb);
    this.synths.set('violin', violinSynth);

    // Flute synthesizer
    const fluteSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.6, release: 0.3 }
    });
    fluteSynth.connect(this.reverb);
    this.synths.set('flute', fluteSynth);

    // Drums (use MonoSynth with pulse wave for percussive sound)
    const drumSynth = new Tone.PolySynth(Tone.MonoSynth, {
      oscillator: { type: 'pulse' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    });
    drumSynth.connect(this.reverb);
    this.synths.set('drums', drumSynth);

    // Default synthesizer for other instruments
    const defaultSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 }
    });
    defaultSynth.connect(this.reverb);
    this.synths.set('default', defaultSynth);
  }

  public async playNote(
    instrument: string,
    frequency: number,
    velocity: number = 0.7,
    duration: number = 500,
    userId?: string
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Get appropriate synthesizer for the instrument
      let synth = this.synths.get(instrument.toLowerCase());
      if (!synth) {
        synth = this.synths.get('default')!;
      }

      // Convert frequency to note name for Tone.js
      const note = Tone.Frequency(frequency).toNote();
      
      // Adjust velocity for better remote audio experience
      const adjustedVelocity = Math.min(Math.max(velocity * 0.8, 0.1), 1.0);
      
      // Play the note with duration
      const durationInSeconds = duration / 1000;
      synth.triggerAttackRelease(note, durationInSeconds, Tone.now(), adjustedVelocity);

      console.log(`ToneAudioEngine: Playing ${instrument} note ${note} (${frequency}Hz) for ${duration}ms from user ${userId || 'local'}`);
    } catch (error) {
      console.error('ToneAudioEngine: Error playing note:', error);
    }
  }

  public setMasterVolume(volume: number): void {
    // Convert 0-1 range to dB (-60 to 0)
    const dbVolume = Math.max(-60, Math.log10(Math.max(0.001, volume)) * 20);
    this.masterVolume.volume.value = dbVolume;
  }

  public dispose(): void {
    this.synths.forEach(synth => synth.dispose());
    this.synths.clear();
    this.reverb.dispose();
    this.compressor.dispose();
    this.masterVolume.dispose();
    this.initialized = false;
  }
}

export default ToneAudioEngine;
