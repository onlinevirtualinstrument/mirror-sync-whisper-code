
import { playRemoteNote, initializeRealtimeAudio } from '@/utils/audio/realtimeAudio';

// Initialize audio system
let audioInitialized = false;

const ensureAudioInitialized = async () => {
  if (!audioInitialized) {
    try {
      await initializeRealtimeAudio();
      audioInitialized = true;
      console.log('instrumentUtils: Audio system initialized');
    } catch (error) {
      console.error('instrumentUtils: Failed to initialize audio:', error);
      throw error;
    }
  }
};

// Convert note name to frequency
export const noteToFrequency = (note: string, octave: number): number => {
  const noteMap: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };

  const noteIndex = noteMap[note];
  if (noteIndex === undefined) {
    console.warn('instrumentUtils: Unknown note:', note);
    return 440;
  }

  // Calculate frequency using A4 = 440Hz as reference
  const A4 = 440;
  const A4_KEY = 69; // A4 is MIDI key 69
  const midiKey = (octave + 1) * 12 + noteIndex;
  return A4 * Math.pow(2, (midiKey - A4_KEY) / 12);
};

// Play instrument note using real-time audio system
export const playInstrumentNote = async (
  instrument: string,
  note: string,
  octave: number,
  duration: number = 500,
  velocity: number = 0.7
): Promise<void> => {
  try {
    await ensureAudioInitialized();
    
    const frequency = noteToFrequency(note, octave);
    
    console.log(`instrumentUtils: Playing ${instrument} note ${note}${octave} at ${frequency}Hz`);
    
    await playRemoteNote(
      instrument,
      frequency,
      velocity,
      duration,
      'local-user'
    );
  } catch (error) {
    console.error('instrumentUtils: Error playing instrument note:', error);
    throw error;
  }
};

// Get instrument-specific settings
export const getInstrumentSettings = (instrument: string) => {
  const settings: { [key: string]: any } = {
    piano: { attack: 0.01, decay: 0.3, sustain: 0.8, release: 1.0 },
    guitar: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 2.0 },
    violin: { attack: 0.1, decay: 0.1, sustain: 0.9, release: 1.5 },
    flute: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 1.0 },
    drums: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.5 },
    saxophone: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1.2 },
    trumpet: { attack: 0.05, decay: 0.15, sustain: 0.7, release: 1.0 }
  };

  return settings[instrument.toLowerCase()] || settings.piano;
};

export default {
  playInstrumentNote,
  noteToFrequency,
  getInstrumentSettings
};
