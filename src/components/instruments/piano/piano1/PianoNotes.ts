
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const KEY_MAPPING: Record<string, { note: string; octave: number }> = {
  a: { note: 'C', octave: 4 },
  w: { note: 'C#', octave: 4 },
  s: { note: 'D', octave: 4 },
  e: { note: 'D#', octave: 4 },
  d: { note: 'E', octave: 4 },
  f: { note: 'F', octave: 4 },
  t: { note: 'F#', octave: 4 },
  g: { note: 'G', octave: 4 },
  y: { note: 'G#', octave: 4 },
  h: { note: 'A', octave: 4 },
  u: { note: 'A#', octave: 4 },
  j: { note: 'B', octave: 4 },
  k: { note: 'C', octave: 5 },
  o: { note: 'C#', octave: 5 },
  l: { note: 'D', octave: 5 },
  p: { note: 'D#', octave: 5 },
  ';': { note: 'E', octave: 5 },
};

export const KEY_TO_DISPLAY: Record<string, string> = {
  'C4': 'A',
  'C#4': 'W',
  'D4': 'S',
  'D#4': 'E',
  'E4': 'D',
  'F4': 'F',
  'F#4': 'T',
  'G4': 'G',
  'G#4': 'Y',
  'A4': 'H',
  'A#4': 'U',
  'B4': 'J',
  'C5': 'K',
  'C#5': 'O',
  'D5': 'L',
  'D#5': 'P',
  'E5': ';',
};

export const SOUND_TYPES = [
  { id: 'piano', label: 'Piano' },
  { id: 'grand-piano', label: 'Grand Piano' },
  { id: 'upright-piano', label: 'Upright Piano' },
  { id: 'electric-piano', label: 'Electric Piano' },
  { id: 'synthesizer', label: 'Synthesizer' },
];

export const getNoteFrequency = (note: string, octave: number): number => {
  const noteName = note.toLowerCase();
  const octaveNumber = parseInt(octave.toString());
  const noteIndex = NOTES.indexOf(note);
  const frequency = 440 * Math.pow(2, (noteIndex - 9 + (octaveNumber - 4) * 12) / 12);
  return frequency;
};
