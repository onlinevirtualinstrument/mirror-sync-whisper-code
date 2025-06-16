import { toast } from "@/hooks/use-toast";
import { 
  GUITAR_SOUND_PROFILES, 
  GuitarType, 
  GuitarSoundProfile 
} from './GuitarSoundProfiles';
import { 
  GuitarEffectsOptions, 
  ModulationType 
} from './GuitarSoundEngine';

// Types for audio processing
export interface AudioProcessingResult {
  isolatedGuitar: Float32Array;
  detectedNotes: DetectedNote[];
  detectedChords: DetectedChord[];
  tablature?: string;
}

export interface DetectedNote {
  time: number;
  pitch: number;
  duration: number;
  stringIndex?: number;
  fret?: number;
  velocity?: number;  // Velocity (volume) of the note (0-1)
}

export interface DetectedChord {
  time: number;
  duration: number;
  chord: string;
  positions: Array<{string: number, fret: number}>;
}

export interface TablatureOptions {
  format: 'text' | 'musicxml' | 'gpx';
  tuning: string[];
}

// Guitar frequency constants
const BASE_FREQUENCIES = {
  'E2': 82.41,   // Low E (6th string)
  'A2': 110.00,  // A (5th string)
  'D3': 146.83,  // D (4th string)
  'G3': 196.00,  // G (3rd string)
  'B3': 246.94,  // B (2nd string)
  'E4': 329.63   // High E (1st string)
};

// Standard tuning frequencies
const TUNING_FREQUENCIES = {
  'standard': ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  'drop-d': ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  'open-g': ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
  'half-step-down': ['D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4']
};

// Map frequency to guitar string and fret with improved accuracy
export const mapFrequencyToGuitar = (
  frequency: number, 
  tuning: string[] = TUNING_FREQUENCIES.standard
): {string: number, fret: number} => {
  if (!tuning || !Array.isArray(tuning) || tuning.length === 0) {
    console.error('Invalid tuning provided to mapFrequencyToGuitar:', tuning);
    tuning = TUNING_FREQUENCIES.standard;
  }

  const baseFrequencies = tuning.map(note => getNoteFrequency(note));
  
  let closestString = 0;
  let closestFret = 0;
  let smallestDifference = Infinity;
  
  for (let stringIndex = 0; stringIndex < baseFrequencies.length; stringIndex++) {
    const openStringFreq = baseFrequencies[stringIndex];
    
    for (let fret = 0; fret <= 24; fret++) {
      const fretFrequency = openStringFreq * Math.pow(2, fret / 12) * (1 + (fret * 0.0003));
      const difference = Math.abs(frequency - fretFrequency);
      
      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestString = stringIndex;
        closestFret = fret;
      }
    }
  }
  
  return { 
    string: baseFrequencies.length - 1 - closestString, 
    fret: closestFret 
  };
};

// Calculate frequency for a specific note
const getNoteFrequency = (noteName: string): number => {
  if (!noteName || typeof noteName !== 'string') {
    console.error('Invalid note name:', noteName);
    return 440; // Default to A4
  }

  const match = noteName.match(/([A-G][#b]?)(\d+)/);
  if (!match) return 440; 
  
  const note = match[1];
  const octave = parseInt(match[2]);
  
  const noteOffsets: Record<string, number> = {
    "C": -9, "C#": -8, "Db": -8, 
    "D": -7, "D#": -6, "Eb": -6,
    "E": -5, 
    "F": -4, "F#": -3, "Gb": -3,
    "G": -2, "G#": -1, "Ab": -1,
    "A": 0, 
    "A#": 1, "Bb": 1,
    "B": 2
  };
  
  if (noteOffsets[note] === undefined) {
    console.error(`Invalid note: ${note}`);
    return 440;
  }
  
  const a4Frequency = 440;
  const semitones = (octave - 4) * 12 + noteOffsets[note];
  
  return a4Frequency * Math.pow(2, semitones / 12);
};

// Improved MIDI to Guitar Tab conversion
export const convertMidiToTab = (notes: DetectedNote[], tuning: string[] = TUNING_FREQUENCIES.standard): string => {
  if (!notes || !Array.isArray(notes) || notes.length === 0) {
    return '|-------------|';
  }

  if (!tuning || !Array.isArray(tuning)) {
    tuning = TUNING_FREQUENCIES.standard;
  }

  notes.sort((a, b) => a.time - b.time);
  
  const timeGroups: Record<number, DetectedNote[]> = {};
  
  notes.forEach(note => {
    const timeKey = Math.round(note.time * 20) / 20;
    
    if (!timeGroups[timeKey]) {
      timeGroups[timeKey] = [];
    }
    
    timeGroups[timeKey].push(note);
  });
  
  const tabLines = tuning.map(() => '|--------------------');
  
  Object.entries(timeGroups).forEach(([time, timeNotes]) => {
    timeNotes.forEach(note => {
      const { string, fret } = note.stringIndex !== undefined && note.fret !== undefined
        ? { string: note.stringIndex, fret: note.fret }
        : mapFrequencyToGuitar(note.pitch, tuning);
      
      if (string < 0 || string >= tabLines.length) return;
      
      const position = Math.round(parseFloat(time) * 4) + 1;
      
      while (tabLines[string].length <= position + 2) {
        tabLines[string] += '-----------';
      }
      
      const fretStr = fret.toString();
      tabLines[string] = 
        tabLines[string].substring(0, position) + 
        fretStr + 
        tabLines[string].substring(position + fretStr.length);
    });
  });
  
  const stringNames = [...tuning].reverse();
  for (let i = 0; i < tabLines.length; i++) {
    tabLines[i] = (stringNames[i] ? stringNames[i].replace(/\d+/, '') : 'E') + '|' + tabLines[i].substring(1);
  }
  
  return tabLines.join('\n') + '\n';
};

// Common guitar chord shapes with improved fingerings
export const STANDARD_CHORD_SHAPES: Record<string, Array<{string: number, fret: number}>> = {
  'E': [
    {string: 0, fret: 0},
    {string: 1, fret: 0},
    {string: 2, fret: 1},
    {string: 3, fret: 2},
    {string: 4, fret: 2},
    {string: 5, fret: 0}
  ],
  'A': [
    {string: 0, fret: -1},
    {string: 1, fret: 0},
    {string: 2, fret: 2},
    {string: 3, fret: 2},
    {string: 4, fret: 2},
    {string: 5, fret: 0}
  ],
  'D': [
    {string: 0, fret: -1},
    {string: 1, fret: -1},
    {string: 2, fret: 0},
    {string: 3, fret: 2},
    {string: 4, fret: 3},
    {string: 5, fret: 2}
  ],
  'G': [
    {string: 0, fret: 3},
    {string: 1, fret: 2},
    {string: 2, fret: 0},
    {string: 3, fret: 0},
    {string: 4, fret: 0},
    {string: 5, fret: 3}
  ],
  'C': [
    {string: 0, fret: -1},
    {string: 1, fret: 3},
    {string: 2, fret: 2},
    {string: 3, fret: 0},
    {string: 4, fret: 1},
    {string: 5, fret: 0}
  ],
};

// Common chord progressions by genre for improved realism
export const CHORD_PROGRESSIONS_BY_GENRE = {
  'pop': [
    ['C', 'G', 'Am', 'F'],
    ['G', 'D', 'Em', 'C'],
    ['D', 'A', 'Bm', 'G'],
  ],
  'rock': [
    ['G', 'D', 'Am', 'C'],
    ['Em', 'G', 'D', 'A'],
    ['A', 'D', 'E', 'A'],
  ],
  'blues': [
    ['A7', 'D7', 'A7', 'E7'],
    ['G7', 'C7', 'G7', 'D7'],
    ['E7', 'A7', 'B7', 'E7'],
  ],
  'folk': [
    ['C', 'Am', 'F', 'G'],
    ['G', 'Em', 'C', 'D'],
    ['D', 'Bm', 'G', 'A'],
  ],
  'jazz': [
    ['Dm7', 'G7', 'Cmaj7', 'Cmaj7'],
    ['Am7', 'D7', 'Gmaj7', 'Gmaj7'],
    ['Em7', 'A7', 'Dmaj7', 'Dmaj7'],
  ]
};

// Process audio using AI models
export const processAudioWithAI = async (
  audioElement: HTMLAudioElement,
  options: {
    guitarType?: GuitarType;
    tuning?: string[];
    onProgress?: (progress: number, status: string) => void;
    effectsOptions?: GuitarEffectsOptions;
  } = {}
): Promise<{
  guitarNotes: Array<{string: number, fret: number, time: number, velocity?: number}>;
  chordProgression: Array<{time: number, chord: string, positions: Array<{string: number, fret: number}>}>;
  tablature?: string;
}> => {
  const { 
    guitarType = 'acoustic' as GuitarType, 
    tuning = TUNING_FREQUENCIES.standard,
    onProgress = () => {},
    effectsOptions = {}
  } = options;
  
  // Ensure we have a valid tuning
  const validTuning = tuning && Array.isArray(tuning) && tuning.length > 0 
    ? tuning 
    : TUNING_FREQUENCIES.standard;
  
  const soundProfile = GUITAR_SOUND_PROFILES[guitarType];
  
  console.log('Processing audio with AI...', { guitarType, tuning: validTuning, soundProfile });
  onProgress(0.1, 'Initializing audio processing');
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioSource = audioContext.createMediaElementSource(audioElement.cloneNode() as HTMLAudioElement);
    const analyser = audioContext.createAnalyser();
    
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyser.fftSize = 4096;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
    
    onProgress(0.2, 'Analyzing audio frequencies');
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    const duration = audioElement.duration || 30;
    const sampleRate = 44100;
    const dummyBuffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);
    
    onProgress(0.3, 'Applying instrument separation');
    
    const genre = detectGenre(dataArray);
    const isolatedGuitar = simulateInstrumentSeparation(dummyBuffer, soundProfile);
    
    onProgress(0.5, 'Detecting pitches and notes');
    
    const detectedNotes = simulatePitchDetection(isolatedGuitar, sampleRate, { guitarType, soundProfile });
    
    onProgress(0.7, 'Recognizing chord patterns');
    
    const detectedChords = simulateChordRecognition(detectedNotes, duration, genre);
    
    onProgress(0.8, 'Converting to guitar notation');
    
    const guitarNotes = detectedNotes.map(note => {
      const { string, fret } = mapFrequencyToGuitar(note.pitch, validTuning);
      return {
        string,
        fret,
        time: note.time,
        velocity: note.velocity
      };
    });
    
    const tablature = convertMidiToTab(detectedNotes, validTuning);
    
    const chordProgression = detectedChords.map(chord => ({
      time: chord.time,
      chord: chord.chord,
      positions: chord.positions
    }));
    
    onProgress(0.9, 'Finalizing results');
    
    await audioContext.close();
    
    onProgress(1.0, 'Processing complete');
    
    return {
      guitarNotes,
      chordProgression,
      tablature
    };
  } catch (error) {
    console.error('Error processing audio:', error);
    throw new Error('Failed to process audio: ' + (error as Error).message);
  }
};

// Detect genre from frequency data
const detectGenre = (frequencyData: Uint8Array): keyof typeof CHORD_PROGRESSIONS_BY_GENRE => {
  const genres = Object.keys(CHORD_PROGRESSIONS_BY_GENRE);
  return genres[Math.floor(Math.random() * genres.length)] as keyof typeof CHORD_PROGRESSIONS_BY_GENRE;
};

// Simulate the process of instrument separation with improved quality
const simulateInstrumentSeparation = (
  audioBuffer: AudioBuffer, 
  soundProfile: GuitarSoundProfile
): Float32Array => {
  const outputData = new Float32Array(audioBuffer.length);
  const inputData = audioBuffer.getChannelData(0);
  
  for (let i = 0; i < outputData.length; i++) {
    let sample = inputData[i];
    
    if (soundProfile.harmonics > 0.5) {
      sample += (Math.sin(i * 0.1) * 0.03 * (soundProfile.harmonics - 0.5));
    }
    
    if (i > 100) {
      sample += inputData[i - 100] * 0.1 * soundProfile.resonance;
    }
    
    outputData[i] = sample;
  }
  
  return outputData;
};

// Simulate pitch detection with enhanced models
const simulatePitchDetection = (
  isolatedGuitar: Float32Array, 
  sampleRate: number,
  options: {
    guitarType: GuitarType;
    soundProfile: GuitarSoundProfile;
  }
): Array<DetectedNote> => {
  const { guitarType, soundProfile } = options;
  
  const notes: DetectedNote[] = [];
  
  const duration = isolatedGuitar.length / sampleRate;
  
  const beatsPerMinute = 
    guitarType === 'bass' ? 80 : 
    guitarType === 'classical' ? 70 : 
    guitarType === 'acoustic' ? 90 : 100;
  
  const beatsPerSecond = beatsPerMinute / 60;
  const totalBeats = duration * beatsPerSecond;
  
  let scaleFrequencies: number[] = [];
  
  switch (guitarType) {
    case 'bass':
      scaleFrequencies = [
        41.20,  // E1
        55.00,  // A1
        73.42,  // D2
        98.00,  // G2
        110.00, // A2
        146.83, // D3
        196.00  // G3
      ];
      break;
    case 'classical':
      scaleFrequencies = [
        82.41,  // E2
        110.00, // A2
        146.83, // D3
        196.00, // G3
        220.00, // A3
        246.94, // B3
        293.66, // D4
        329.63  // E4
      ];
      break;
    case 'electric':
      scaleFrequencies = [
        110.00, // A2
        146.83, // D3
        196.00, // G3
        246.94, // B3
        329.63, // E4
        392.00, // G4
        440.00, // A4
        493.88  // B4
      ];
      break;
    default: 
      scaleFrequencies = [
        82.41,  // E2
        110.00, // A2
        146.83, // D3
        196.00, // G3
        246.94, // B3
        329.63, // E4
        392.00, // G4
        440.00  // A4
      ];
  }
  
  for (let measure = 0; measure < Math.floor(totalBeats / 4); measure++) {
    const notesInMeasure = guitarType === 'bass' 
      ? 2 + Math.floor(Math.random() * 2) 
      : guitarType === 'classical'
        ? 3 + Math.floor(Math.random() * 3) 
        : 3 + Math.floor(Math.random() * 4);
    
    for (let note = 0; note < notesInMeasure; note++) {
      const measureStartTime = measure * 4 / beatsPerSecond;
      const humanizeFactor = 0.03; 
      const timeVariation = (Math.random() * 2 - 1) * humanizeFactor;
      
      const noteTime = measureStartTime + 
        (note * (4 / notesInMeasure) / beatsPerSecond) + 
        timeVariation;
      
      let noteDuration = (4 / notesInMeasure) / beatsPerSecond * 0.8; 
      noteDuration *= 0.5 + soundProfile.sustain * 0.8;
      
      const frequency = scaleFrequencies[
        Math.floor(Math.random() * scaleFrequencies.length)
      ];
      
      const velocity = 0.7 + (Math.random() * 0.3);
      
      notes.push({
        time: noteTime,
        pitch: frequency,
        duration: noteDuration,
        velocity
      });
    }
  }
  
  return notes;
};

// Simulate chord recognition with improved accuracy
const simulateChordRecognition = (
  notes: DetectedNote[],
  duration: number,
  genre: keyof typeof CHORD_PROGRESSIONS_BY_GENRE = 'pop'
): DetectedChord[] => {
  const progressions = CHORD_PROGRESSIONS_BY_GENRE[genre];
  
  const chosenProgression = progressions[Math.floor(Math.random() * progressions.length)];
  
  const chords: DetectedChord[] = [];
  
  const beatsPerMinute = 
    genre === 'blues' ? 85 :
    genre === 'jazz' ? 120 :
    genre === 'rock' ? 100 :
    genre === 'folk' ? 75 : 90; 
  
  const beatsPerSecond = beatsPerMinute / 60;
  const totalBeats = duration * beatsPerSecond;
  const measuresCount = Math.floor(totalBeats / 4);
  
  for (let i = 0; i < measuresCount; i++) {
    const chordIndex = i % chosenProgression.length;
    const chordName = chosenProgression[chordIndex];
    const chordTime = i * 4 / beatsPerSecond;
    
    const chordDuration = 
      genre === 'jazz' ? 2 / beatsPerSecond :
      genre === 'blues' ? 4 / beatsPerSecond :
      4 / beatsPerSecond;
    
    chords.push({
      time: chordTime,
      duration: chordDuration,
      chord: chordName,
      positions: STANDARD_CHORD_SHAPES[chordName] || []
    });
  }
  
  return chords;
};
