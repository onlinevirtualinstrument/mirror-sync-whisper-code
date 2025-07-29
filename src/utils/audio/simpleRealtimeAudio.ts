
import { broadcastNote } from '@/utils/firebase/instrumentNotes';
import { InstrumentNote } from '@/types/InstrumentNote';

class SimpleRealtimeAudio {
  private static instance: SimpleRealtimeAudio;
  private audioContext: AudioContext | null = null;
  private userMediaStream: MediaStream | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): SimpleRealtimeAudio {
    if (!SimpleRealtimeAudio.instance) {
      SimpleRealtimeAudio.instance = new SimpleRealtimeAudio();
    }
    return SimpleRealtimeAudio.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log('SimpleRealtimeAudio: Initialized successfully');
    } catch (error) {
      console.error('SimpleRealtimeAudio: Failed to initialize:', error);
      throw error;
    }
  }

  public async enableMicrophone(): Promise<boolean> {
    try {
      this.userMediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      console.log('SimpleRealtimeAudio: Microphone enabled');
      return true;
    } catch (error) {
      console.error('SimpleRealtimeAudio: Failed to enable microphone:', error);
      return false;
    }
  }

  public broadcastInstrumentNote = async (
    roomId: string,
    noteData: InstrumentNote
  ): Promise<void> => {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const enhancedNote: InstrumentNote = {
        ...noteData,
        timestamp: new Date().toISOString(),
        serverTimestamp: Date.now(),
        sessionId: `${noteData.userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      await broadcastNote(roomId, enhancedNote);
      console.log('SimpleRealtimeAudio: Note broadcasted successfully');
    } catch (error) {
      console.error('SimpleRealtimeAudio: Failed to broadcast note:', error);
    }
  };

  public playTone = (frequency: number, duration: number = 500): void => {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.error('SimpleRealtimeAudio: Failed to play tone:', error);
    }
  };

  public dispose(): void {
    if (this.userMediaStream) {
      this.userMediaStream.getTracks().forEach(track => track.stop());
      this.userMediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
  }
}

export default SimpleRealtimeAudio;
