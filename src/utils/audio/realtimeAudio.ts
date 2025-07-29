
import ToneAudioEngine from './toneAudioEngine';

let audioEngine: ToneAudioEngine | null = null;

export const initializeRealtimeAudio = async (): Promise<void> => {
  if (!audioEngine) {
    audioEngine = ToneAudioEngine.getInstance();
    await audioEngine.initialize();
    console.log('Realtime audio initialized');
  }
};

export const playRemoteNote = async (
  instrument: string,
  frequency: number,
  velocity: number = 0.7,
  duration: number = 500,
  userId?: string
): Promise<void> => {
  if (!audioEngine) {
    await initializeRealtimeAudio();
  }
  
  if (audioEngine) {
    await audioEngine.playNote(instrument, frequency, velocity, duration, userId);
  }
};

export const setMasterVolume = (volume: number): void => {
  if (audioEngine) {
    audioEngine.setMasterVolume(volume);
  }
};

export const disposeAudio = (): void => {
  if (audioEngine) {
    audioEngine.dispose();
    audioEngine = null;
  }
};
