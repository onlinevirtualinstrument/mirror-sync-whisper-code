
export interface DetectedNote {
  note: string;
  octave: number;
  time: number;
  duration: number;
  stringIndex?: number;
  fret?: number;
  velocity?: number;
  startTime?: number;
  frequency?: number;
}

export interface DetectedChord {
  time: number;
  duration: number;
  chord: string;
  positions: Array<{string: number, fret: number}>;
}

export type OscillatorTypeExtended = OscillatorType | 'custom';

export interface RecordedNote {
  note: string;
  time: number;
  duration?: number;
  velocity?: number;
}
