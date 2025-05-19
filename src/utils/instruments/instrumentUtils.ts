
import audioPlayer from '@/utils/music/audioPlayer';

export interface InstrumentConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  imagePaths: string[];
  soundPath?: string;
  keyMapping?: Record<string, { note: string; octave: number }>;
  frequencies?: Record<string, number>;
}

/**
 * Loads instrument configuration
 * @param instrumentId The ID of the instrument to load
 * @returns The instrument configuration or null if not found
 */
export const loadInstrument = async (instrumentId: string): Promise<InstrumentConfig | null> => {
  try {
    // This would fetch the instrument configuration from an API or local storage
    console.log(`Loading instrument: ${instrumentId}`);
    
    // In a real app, you would fetch this data from your backend
    // return await fetch(`/api/instruments/${instrumentId}`).then(res => res.json());
    
    return null;
  } catch (error) {
    console.error(`Error loading instrument ${instrumentId}:`, error);
    return null;
  }
};

/**
 * Plays a note with the specified instrument
 * @param instrument The instrument ID
 * @param note The note name (e.g., 'C', 'D#')
 * @param octave The octave number
 * @param duration Duration in milliseconds
 */
export const playInstrumentNote = (
  instrument: string, 
  note: string, 
  octave: number, 
  duration = 1000
): void => {
  try {
    // Calculate the frequency for this note
    const baseFrequency = getNoteFrequency(note, octave);
    
    // Different instruments might have different wave types or processing
    let waveType: OscillatorType = 'sine';
    
    switch (instrument) {
      case 'piano':
        waveType = 'sine';
        break;
      case 'guitar':
        waveType = 'triangle';
        break;
      case 'violin':
        waveType = 'sine';
        break;
      default:
        waveType = 'sine';
    }
    
    // Play the note using the audio player
    audioPlayer.playTone(baseFrequency, duration, waveType);
  } catch (error) {
    console.error('Error playing instrument note:', error);
  }
};

/**
 * Calculates the frequency of a note
 * @param note The note name (e.g., 'C', 'D#')
 * @param octave The octave number
 * @returns The frequency in Hz
 */
export const getNoteFrequency = (note: string, octave: number): number => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const baseFreq = 440; // A4 frequency
  const A4OctavePosition = 4;
  
  // Find semitone distance from A4
  const noteIndex = notes.indexOf(note);
  if (noteIndex === -1) return 440; // Default to A4 if note not found
  
  const A_index = notes.indexOf('A');
  let semitonesFromA4 = (octave - A4OctavePosition) * 12 + (noteIndex - A_index);
  
  // Calculate frequency using equal temperament formula
  return baseFreq * Math.pow(2, semitonesFromA4 / 12);
};

/**
 * Gets the instrument type based on its ID
 * @param instrumentId The instrument ID
 * @returns The instrument type/category
 */
export const getInstrumentType = (instrumentId: string): string => {
  // Map instrument IDs to their types
  const instrumentTypes: Record<string, string> = {
    'piano': 'keyboard',
    'guitar': 'string',
    'violin': 'string',
    'double-bass': 'string',
    'flute': 'wind',
    'saxophone': 'woodwind',
    'trumpet': 'brass',
    'trombone': 'brass',
    'french-horn': 'brass',
    'drums': 'percussion',
    'xylophone': 'percussion',
    'marimba': 'percussion',
  };
  
  return instrumentTypes[instrumentId] || 'other';
};

/**
 * Adds a new instrument programmatically
 * @param instrument The instrument configuration
 * @returns The ID of the added instrument or null if failed
 */
export const registerInstrument = (instrument: Omit<InstrumentConfig, 'id'>): string => {
  try {
    // Generate an ID from the name
    const id = instrument.name.toLowerCase().replace(/\s+/g, '-');
    
    console.log('Registering new instrument:', instrument.name);
    console.log('Category:', instrument.category);
    
    // In a real application, you would store this in a database or state management
    
    return id;
  } catch (error) {
    console.error('Error registering instrument:', error);
    return '';
  }
};
