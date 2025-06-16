
// Professional drum sound synthesis with optimized quality and performance
export class DrumSynthesizer {
  private audioContext: AudioContext;
  private masterGain: GainNode;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.setValueAtTime(0.8, this.audioContext.currentTime);
  }

  private createEnvelope(gainNode: GainNode, attack: number, decay: number, sustain: number, release: number) {
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.001), now + attack + decay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + attack + decay + release);
  }

  async synthesizeKick(volume: number = 1, speed: number = 1): Promise<void> {
    const duration = 0.6 / speed;
    
    // Main thump oscillator
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Kick characteristics: deep fundamental with quick pitch drop
    oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.1);
    oscillator.type = 'sine';
    
    // Low-pass filter for warmth
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, this.audioContext.currentTime);
    filter.Q.setValueAtTime(1, this.audioContext.currentTime);
    
    // Punchy envelope
    this.createEnvelope(gainNode, 0.01, 0.1, 0.4, 0.5);
    gainNode.gain.setValueAtTime(volume * 0.9, this.audioContext.currentTime);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  async synthesizeSnare(volume: number = 1, speed: number = 1): Promise<void> {
    const duration = 0.25 / speed;
    
    // Tone component
    const toneOsc = this.audioContext.createOscillator();
    const toneGain = this.audioContext.createGain();
    const toneFilter = this.audioContext.createBiquadFilter();
    
    // Noise component
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.4;
    }
    
    const noiseSource = this.audioContext.createBufferSource();
    const noiseGain = this.audioContext.createGain();
    const noiseFilter = this.audioContext.createBiquadFilter();
    
    noiseSource.buffer = buffer;
    
    // Connect tone path
    toneOsc.connect(toneFilter);
    toneFilter.connect(toneGain);
    toneGain.connect(this.masterGain);
    
    // Connect noise path
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    // Snare tone (200Hz fundamental)
    toneOsc.frequency.setValueAtTime(220, this.audioContext.currentTime);
    toneOsc.type = 'triangle';
    
    // Tone filter for body
    toneFilter.type = 'bandpass';
    toneFilter.frequency.setValueAtTime(220, this.audioContext.currentTime);
    toneFilter.Q.setValueAtTime(2, this.audioContext.currentTime);
    
    // Noise filter for snare buzz
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    noiseFilter.Q.setValueAtTime(1, this.audioContext.currentTime);
    
    // Sharp envelopes
    this.createEnvelope(toneGain, 0.005, 0.05, 0.2, 0.2);
    this.createEnvelope(noiseGain, 0.005, 0.03, 0.1, 0.15);
    
    toneGain.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
    noiseGain.gain.setValueAtTime(volume * 0.6, this.audioContext.currentTime);
    
    toneOsc.start(this.audioContext.currentTime);
    noiseSource.start(this.audioContext.currentTime);
    
    toneOsc.stop(this.audioContext.currentTime + duration);
    noiseSource.stop(this.audioContext.currentTime + duration);
  }

  async synthesizeHiHat(isOpen: boolean = false, volume: number = 1, speed: number = 1): Promise<void> {
    const duration = isOpen ? 0.8 / speed : 0.15 / speed;
    
    // Create multiple high-frequency oscillators for metallic sound
    const frequencies = [6000, 8000, 10000, 12000];
    
    frequencies.forEach((freq, index) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      osc.frequency.setValueAtTime(freq + (Math.random() * 800 - 400), this.audioContext.currentTime);
      osc.type = 'square';
      
      // High-pass filter for brightness
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(5000, this.audioContext.currentTime);
      filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
      
      // Different envelopes for open vs closed
      if (isOpen) {
        this.createEnvelope(gain, 0.01, 0.1, 0.4, 0.7);
      } else {
        this.createEnvelope(gain, 0.005, 0.02, 0.1, 0.1);
      }
      
      gain.gain.setValueAtTime(volume * 0.15 / frequencies.length, this.audioContext.currentTime);
      
      osc.start(this.audioContext.currentTime);
      osc.stop(this.audioContext.currentTime + duration);
    });
  }

  async synthesizeTom(pitch: 'high' | 'mid' | 'low', volume: number = 1, speed: number = 1): Promise<void> {
    const duration = 1.0 / speed;
    const baseFreq = pitch === 'high' ? 180 : pitch === 'mid' ? 120 : 80;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Tom characteristics with pitch bend
    oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, this.audioContext.currentTime + 0.4);
    oscillator.type = 'sine';
    
    // Resonant filter for tom character
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq * 1.5, this.audioContext.currentTime);
    filter.Q.setValueAtTime(3, this.audioContext.currentTime);
    
    // Warm envelope
    this.createEnvelope(gainNode, 0.01, 0.3, 0.5, 0.7);
    gainNode.gain.setValueAtTime(volume * 0.7, this.audioContext.currentTime);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  async synthesizeCrash(volume: number = 1, speed: number = 1): Promise<void> {
    const duration = 2.5 / speed;
    
    // Create bright, shimmering crash
    const frequencies = [4000, 5500, 7000, 9000];
    
    frequencies.forEach(freq => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      osc.frequency.setValueAtTime(freq + (Math.random() * 1500 - 750), this.audioContext.currentTime);
      osc.type = 'sawtooth';
      
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3000, this.audioContext.currentTime);
      filter.Q.setValueAtTime(0.3, this.audioContext.currentTime);
      
      // Long, shimmering envelope
      this.createEnvelope(gain, 0.02, 0.4, 0.3, 2.1);
      gain.gain.setValueAtTime(volume * 0.12 / frequencies.length, this.audioContext.currentTime);
      
      osc.start(this.audioContext.currentTime);
      osc.stop(this.audioContext.currentTime + duration);
    });
  }

  async synthesizeRide(volume: number = 1, speed: number = 1): Promise<void> {
    const duration = 1.8 / speed;
    
    // Bell-like fundamental and harmonics
    const fundamentalOsc = this.audioContext.createOscillator();
    const harmonicOsc = this.audioContext.createOscillator();
    const fundamentalGain = this.audioContext.createGain();
    const harmonicGain = this.audioContext.createGain();
    
    fundamentalOsc.connect(fundamentalGain);
    harmonicOsc.connect(harmonicGain);
    fundamentalGain.connect(this.masterGain);
    harmonicGain.connect(this.masterGain);
    
    fundamentalOsc.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    harmonicOsc.frequency.setValueAtTime(3000, this.audioContext.currentTime);
    
    fundamentalOsc.type = 'sine';
    harmonicOsc.type = 'triangle';
    
    // Sustained envelopes
    this.createEnvelope(fundamentalGain, 0.02, 0.3, 0.6, 1.5);
    this.createEnvelope(harmonicGain, 0.02, 0.2, 0.4, 1.3);
    
    fundamentalGain.gain.setValueAtTime(volume * 0.6, this.audioContext.currentTime);
    harmonicGain.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
    
    fundamentalOsc.start(this.audioContext.currentTime);
    harmonicOsc.start(this.audioContext.currentTime);
    
    fundamentalOsc.stop(this.audioContext.currentTime + duration);
    harmonicOsc.stop(this.audioContext.currentTime + duration);
  }

  async synthesizeClap(volume: number = 1, speed: number = 1): Promise<void> {
    const duration = 0.12 / speed;
    
    // Create multiple quick bursts for clap effect
    for (let i = 0; i < 4; i++) {
      const delay = i * 0.008;
      const bufferSize = this.audioContext.sampleRate * 0.04;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = buffer.getChannelData(0);
      
      for (let j = 0; j < bufferSize; j++) {
        output[j] = (Math.random() * 2 - 1) * (1 - j / bufferSize) * 0.8;
      }
      
      const source = this.audioContext.createBufferSource();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, this.audioContext.currentTime);
      filter.Q.setValueAtTime(2, this.audioContext.currentTime);
      
      gain.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + delay + 0.04);
      
      source.start(this.audioContext.currentTime + delay);
      source.stop(this.audioContext.currentTime + delay + 0.04);
    }
  }
}
