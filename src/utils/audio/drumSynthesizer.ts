
// Enhanced drum synthesizer for realistic drum sounds
export class EnhancedDrumSynthesizer {
  private audioContext: AudioContext;
  private gainNode: GainNode;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  async playDrumSound(type: string, volume: number = 0.7): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.gainNode);

    // Configure based on drum type
    switch (type.toLowerCase()) {
      case 'kick':
        oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, this.audioContext.currentTime);
        break;
      case 'snare':
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        break;
      case 'hihat':
        oscillator.frequency.setValueAtTime(8000, this.audioContext.currentTime);
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, this.audioContext.currentTime);
        break;
      default:
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    }

    oscillator.type = 'square';
    
    envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
    envelope.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);

    setTimeout(() => {
      try {
        oscillator.disconnect();
        filter.disconnect();
        envelope.disconnect();
      } catch (e) {
        // Already disconnected
      }
    }, 300);
  }
}
