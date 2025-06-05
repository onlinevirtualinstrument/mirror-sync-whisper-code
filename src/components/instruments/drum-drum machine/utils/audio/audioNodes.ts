
export class AudioNodes {
  private audioContext: AudioContext;
  public masterGain: GainNode;
  public eqNodes: { low: BiquadFilterNode; mid: BiquadFilterNode; high: BiquadFilterNode } | null = null;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.masterGain = this.audioContext.createGain();
    
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.setValueAtTime(0.8, this.audioContext.currentTime);
    
    this.initializeEQ();
  }

  private initializeEQ() {
    this.eqNodes = {
      low: this.audioContext.createBiquadFilter(),
      mid: this.audioContext.createBiquadFilter(),
      high: this.audioContext.createBiquadFilter()
    };
    
    this.eqNodes.low.type = 'lowshelf';
    this.eqNodes.low.frequency.setValueAtTime(320, this.audioContext.currentTime);
    
    this.eqNodes.mid.type = 'peaking';
    this.eqNodes.mid.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    this.eqNodes.mid.Q.setValueAtTime(0.5, this.audioContext.currentTime);
    
    this.eqNodes.high.type = 'highshelf';
    this.eqNodes.high.frequency.setValueAtTime(3200, this.audioContext.currentTime);
    
    // Set up effect chain: EQ -> Master
    this.eqNodes.low.connect(this.eqNodes.mid);
    this.eqNodes.mid.connect(this.eqNodes.high);
    this.eqNodes.high.connect(this.masterGain);
  }

  setEQ(low: number, mid: number, high: number) {
    if (this.eqNodes) {
      const now = this.audioContext.currentTime;
      this.eqNodes.low.gain.setValueAtTime(low, now);
      this.eqNodes.mid.gain.setValueAtTime(mid, now);
      this.eqNodes.high.gain.setValueAtTime(high, now);
      console.log(`EQ set - Low: ${low}dB, Mid: ${mid}dB, High: ${high}dB`);
    }
  }

  getOutputNode(): AudioNode {
    return this.eqNodes ? this.eqNodes.low : this.masterGain;
  }

  createEnvelope(gainNode: GainNode, attack: number, decay: number, sustain: number, release: number) {
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.001), now + attack + decay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + attack + decay + release);
  }

  createNoiseBuffer(duration: number, intensity: number = 1, filterType: 'white' | 'pink' = 'white'): AudioBuffer {
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    if (filterType === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * intensity * 0.11;
        b6 = white * 0.115926;
      }
    } else {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * intensity;
      }
    }
    
    return buffer;
  }
}
