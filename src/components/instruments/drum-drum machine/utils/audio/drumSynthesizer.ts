import { AudioNodes } from './audioNodes';

export class EnhancedDrumSynthesizer {
  private audioContext: AudioContext;
  private audioNodes: AudioNodes;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.audioNodes = new AudioNodes(this.audioContext);
  }

  setEQ(low: number, mid: number, high: number) {
    this.audioNodes.setEQ(low, mid, high);
  }

  async synthesizeKick(volume: number = 0.8): Promise<void> {
    const duration = 0.8;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    const subOsc = this.audioContext.createOscillator();
    const subGain = this.audioContext.createGain();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    subOsc.connect(subGain);
    subGain.connect(this.audioNodes.getOutputNode());
    
    oscillator.frequency.setValueAtTime(65, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(25, this.audioContext.currentTime + 0.15);
    oscillator.type = 'sine';
    
    subOsc.frequency.setValueAtTime(40, this.audioContext.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.1);
    subOsc.type = 'sine';
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, this.audioContext.currentTime);
    filter.Q.setValueAtTime(1.5, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.005, 0.1, 0.3, 0.6);
    this.audioNodes.createEnvelope(subGain, 0.005, 0.05, 0.2, 0.4);
    
    gainNode.gain.setValueAtTime(volume * 0.8, this.audioContext.currentTime);
    subGain.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    oscillator.start(now);
    subOsc.start(now);
    oscillator.stop(now + duration);
    subOsc.stop(now + duration);
  }

  async synthesizeSnare(volume: number = 0.8): Promise<void> {
    const duration = 0.25;
    
    const toneOsc = this.audioContext.createOscillator();
    const toneGain = this.audioContext.createGain();
    const toneFilter = this.audioContext.createBiquadFilter();
    
    const noiseSource = this.audioContext.createBufferSource();
    const noiseGain = this.audioContext.createGain();
    const noiseFilter = this.audioContext.createBiquadFilter();
    
    noiseSource.buffer = this.audioNodes.createNoiseBuffer(duration, 0.7, 'pink');
    
    toneOsc.connect(toneFilter);
    toneFilter.connect(toneGain);
    toneGain.connect(this.audioNodes.getOutputNode());
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioNodes.getOutputNode());
    
    toneOsc.frequency.setValueAtTime(220, this.audioContext.currentTime);
    toneOsc.frequency.exponentialRampToValueAtTime(180, this.audioContext.currentTime + 0.05);
    toneOsc.type = 'triangle';
    
    toneFilter.type = 'bandpass';
    toneFilter.frequency.setValueAtTime(250, this.audioContext.currentTime);
    toneFilter.Q.setValueAtTime(1, this.audioContext.currentTime);
    
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    noiseFilter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(toneGain, 0.002, 0.04, 0.2, 0.2);
    this.audioNodes.createEnvelope(noiseGain, 0.002, 0.02, 0.1, 0.15);
    
    toneGain.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
    noiseGain.gain.setValueAtTime(volume * 0.7, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    toneOsc.start(now);
    noiseSource.start(now);
    toneOsc.stop(now + duration);
    noiseSource.stop(now + duration);
  }

  async synthesizeHiHat(isOpen: boolean = false, volume: number = 1): Promise<void> {
    const duration = isOpen ? 0.6 : 0.08;
    
    const noiseSource = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    const filter2 = this.audioContext.createBiquadFilter();
    
    noiseSource.buffer = this.audioNodes.createNoiseBuffer(duration, 0.4);
    
    noiseSource.connect(filter);
    filter.connect(filter2);
    filter2.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, this.audioContext.currentTime);
    filter.Q.setValueAtTime(0.8, this.audioContext.currentTime);
    
    filter2.type = 'bandpass';
    filter2.frequency.setValueAtTime(12000, this.audioContext.currentTime);
    filter2.Q.setValueAtTime(1.2, this.audioContext.currentTime);
    
    if (isOpen) {
      this.audioNodes.createEnvelope(gainNode, 0.005, 0.1, 0.4, 0.5);
    } else {
      this.audioNodes.createEnvelope(gainNode, 0.002, 0.01, 0.1, 0.05);
    }
    
    gainNode.gain.setValueAtTime(volume * 0.6, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    noiseSource.start(now);
    noiseSource.stop(now + duration);
  }

  async synthesizeTom(pitch: 'high' | 'mid' | 'low', volume: number = 1): Promise<void> {
    const duration = 1.0;
    const baseFreq = pitch === 'high' ? 180 : pitch === 'mid' ? 120 : 80;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, this.audioContext.currentTime + 0.4);
    oscillator.type = 'sine';
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq * 1.8, this.audioContext.currentTime);
    filter.Q.setValueAtTime(2.5, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.01, 0.3, 0.4, 0.7);
    gainNode.gain.setValueAtTime(volume * 0.7, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  async synthesizeCrash(volume: number = 1): Promise<void> {
    const duration = 2.5;
    
    const noiseSource = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    noiseSource.buffer = this.audioNodes.createNoiseBuffer(duration, 0.5);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, this.audioContext.currentTime);
    filter.Q.setValueAtTime(0.3, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.01, 0.4, 0.3, 2.1);
    gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    noiseSource.start(now);
    noiseSource.stop(now + duration);
  }

  async synthesizeRide(volume: number = 1): Promise<void> {
    const duration = 2.0;
    
    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const osc3 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    osc3.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(this.audioNodes.getOutputNode());
    
    osc1.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    osc2.frequency.setValueAtTime(1500, this.audioContext.currentTime);
    osc3.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    
    osc1.type = 'triangle';
    osc2.type = 'sawtooth';
    osc3.type = 'square';
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, this.audioContext.currentTime);
    filter.Q.setValueAtTime(0.8, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.01, 0.3, 0.5, 1.7);
    gainNode.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
    osc3.stop(now + duration);
  }

  async synthesizeClap(volume: number = 1): Promise<void> {
    const duration = 0.08;
    
    for (let i = 0; i < 4; i++) {
      const delay = i * 0.008;
      const noiseSource = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      noiseSource.buffer = this.audioNodes.createNoiseBuffer(0.04, 0.8);
      
      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioNodes.getOutputNode());
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, this.audioContext.currentTime);
      filter.Q.setValueAtTime(3, this.audioContext.currentTime);
      
      const intensity = 1 - (i * 0.15);
      gainNode.gain.setValueAtTime(volume * 0.4 * intensity, this.audioContext.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + delay + 0.04);
      
      noiseSource.start(this.audioContext.currentTime + delay);
      noiseSource.stop(this.audioContext.currentTime + delay + 0.04);
    }
  }

  // New drum sounds for missing types
  async synthesizeCowbell(volume: number = 1): Promise<void> {
    const duration = 0.4;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    oscillator.frequency.setValueAtTime(850, this.audioContext.currentTime);
    oscillator.type = 'square';
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    filter.Q.setValueAtTime(2, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.005, 0.08, 0.3, 0.3);
    gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  async synthesizeShaker(volume: number = 1): Promise<void> {
    const duration = 0.15;
    
    const noiseSource = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    noiseSource.buffer = this.audioNodes.createNoiseBuffer(duration, 0.4);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6000, this.audioContext.currentTime);
    filter.Q.setValueAtTime(1, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.002, 0.03, 0.7, 0.12);
    gainNode.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    noiseSource.start(now);
    noiseSource.stop(now + duration);
  }

  async synthesizeRimshot(volume: number = 1): Promise<void> {
    const duration = 0.03;
    
    const noiseSource = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    noiseSource.buffer = this.audioNodes.createNoiseBuffer(duration, 1.0);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, this.audioContext.currentTime);
    filter.Q.setValueAtTime(4, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(volume * 0.6, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    const now = this.audioContext.currentTime;
    noiseSource.start(now);
    noiseSource.stop(now + duration);
  }

  // African drum sounds
  async synthesizeDjembeBass(volume: number = 1): Promise<void> {
    const duration = 1.0;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    oscillator.frequency.setValueAtTime(90, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(45, this.audioContext.currentTime + 0.3);
    oscillator.type = 'sine';
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
    filter.Q.setValueAtTime(2, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.01, 0.2, 0.4, 0.8);
    gainNode.gain.setValueAtTime(volume * 0.7, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  async synthesizeDjembeTone(volume: number = 1): Promise<void> {
    const duration = 0.6;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    oscillator.frequency.setValueAtTime(250, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(180, this.audioContext.currentTime + 0.1);
    oscillator.type = 'triangle';
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
    filter.Q.setValueAtTime(1.5, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.008, 0.15, 0.3, 0.45);
    gainNode.gain.setValueAtTime(volume * 0.6, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  async synthesizeDjembeSlap(volume: number = 1): Promise<void> {
    const duration = 0.12;
    
    const noiseSource = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    noiseSource.buffer = this.audioNodes.createNoiseBuffer(duration, 0.6, 'pink');
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, this.audioContext.currentTime);
    filter.Q.setValueAtTime(2.5, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.003, 0.02, 0.2, 0.1);
    gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    noiseSource.start(now);
    noiseSource.stop(now + duration);
  }

  async synthesizeTalkingDrum(volume: number = 1): Promise<void> {
    const duration = 0.8;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    // Pitch bend characteristic of talking drums
    oscillator.frequency.setValueAtTime(140, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.4);
    oscillator.type = 'triangle';
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
    filter.Q.setValueAtTime(1.8, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.015, 0.2, 0.5, 0.6);
    gainNode.gain.setValueAtTime(volume * 0.6, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  async synthesizeUdu(volume: number = 1): Promise<void> {
    const duration = 0.5;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.1);
    oscillator.type = 'sine';
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, this.audioContext.currentTime);
    filter.Q.setValueAtTime(3, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.008, 0.12, 0.4, 0.38);
    gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  async synthesizeBells(volume: number = 1): Promise<void> {
    const duration = 1.5;
    
    const frequencies = [880, 1320, 1760];
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioNodes.getOutputNode());
      
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      this.audioNodes.createEnvelope(gainNode, 0.01, 0.4, 0.3, 1.1);
      gainNode.gain.setValueAtTime(volume * 0.25 / frequencies.length, this.audioContext.currentTime);
      
      const now = this.audioContext.currentTime;
      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  }

  async synthesizeBrushSwirl(volume: number = 1): Promise<void> {
    const duration = 0.4;
    
    const noiseSource = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    noiseSource.buffer = this.audioNodes.createNoiseBuffer(duration, 0.25, 'pink');
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, this.audioContext.currentTime);
    filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.08, 0.15, 0.6, 0.25);
    gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    noiseSource.start(now);
    noiseSource.stop(now + duration);
  }

  async synthesizeBrushTap(volume: number = 1): Promise<void> {
    const duration = 0.08;
    
    const noiseSource = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    noiseSource.buffer = this.audioNodes.createNoiseBuffer(duration, 0.35, 'pink');
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    filter.Q.setValueAtTime(1, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.005, 0.015, 0.3, 0.06);
    gainNode.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    noiseSource.start(now);
    noiseSource.stop(now + duration);
  }

  async synthesizeFX(volume: number = 1): Promise<void> {
    const duration = 0.6;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1600, this.audioContext.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.4);
    oscillator.type = 'sawtooth';
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    filter.Q.setValueAtTime(2, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.02, 0.15, 0.3, 0.45);
    gainNode.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  async synthesizePercussion(volume: number = 1): Promise<void> {
    const duration = 0.25;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioNodes.getOutputNode());
    
    oscillator.frequency.setValueAtTime(450, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.1);
    oscillator.type = 'triangle';
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, this.audioContext.currentTime);
    filter.Q.setValueAtTime(1.5, this.audioContext.currentTime);
    
    this.audioNodes.createEnvelope(gainNode, 0.008, 0.06, 0.3, 0.18);
    gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration);
  }
}
