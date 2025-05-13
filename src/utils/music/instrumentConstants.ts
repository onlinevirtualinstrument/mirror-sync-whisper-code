
import { OscillatorTypeExtended } from './musicTypes';

export const instruments = [
  { id: 'piano', name: 'Piano' },
  { id: 'guitar', name: 'Acoustic Guitar' },
  { id: 'violin', name: 'Violin' },
  { id: 'flute', name: 'Flute' },
  { id: 'saxophone', name: 'Saxophone' },
  { id: 'trumpet', name: 'Trumpet' },
  { id: 'drums', name: 'Drums' },
  { id: 'harp', name: 'Harp' },
  { id: 'xylophone', name: 'Xylophone' },
  { id: 'kalimba', name: 'Kalimba' },
  { id: 'marimba', name: 'Marimba' },
  { id: 'tabla', name: 'Tabla' },
  { id: 'timpani', name: 'Timpani' },
];

export const instrumentBaseFrequencies = {
  piano: { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.00, A: 440.00, B: 493.88 },
  guitar: { C: 246.94, D: 277.18, E: 329.63, F: 349.23, G: 392.00, A: 440.00, B: 493.88 },
  violin: { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.00, A: 440.00, B: 493.88 },
  flute: { C: 523.25, D: 587.33, E: 659.26, F: 698.46, G: 783.99, A: 880.00, B: 987.77 },
  saxophone: { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.00, A: 440.00, B: 493.88 },
  trumpet: { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.00, A: 440.00, B: 493.88 },
  drums: { C: 80.00, D: 90.00, E: 100.00, F: 110.00, G: 120.00, A: 130.00, B: 140.00 },
  harp: { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.00, A: 440.00, B: 493.88 },
  xylophone: { C: 1046.50, D: 1174.66, E: 1318.51, F: 1396.91, G: 1567.98, A: 1760.00, B: 1975.53 },
  kalimba: { C: 523.25, D: 587.33, E: 659.26, F: 698.46, G: 783.99, A: 880.00, B: 987.77 },
  marimba: { C: 523.25, D: 587.33, E: 659.26, F: 698.46, G: 783.99, A: 880.00, B: 987.77 },
  tabla: { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.00, A: 440.00, B: 493.88 },
  timpani: { C: 65.41, D: 73.42, E: 82.41, F: 87.31, G: 98.00, A: 110.00, B: 123.47 },
};

export const instrumentWaveforms: Record<string, OscillatorType> = {
  piano: 'sine',
  guitar: 'triangle',
  violin: 'sine',
  flute: 'sine',
  saxophone: 'sawtooth',
  trumpet: 'square',
  drums: 'square',
  harp: 'triangle',
  xylophone: 'sine',
  kalimba: 'sine',
  marimba: 'sine',
  tabla: 'sine',
  timpani: 'sine',
};

export const instrumentSettings = {
  piano: { attack: 0.02, decay: 0.8, sustain: 0.4, release: 0.4 },
  guitar: { attack: 0.03, decay: 0.5, sustain: 0.3, release: 0.3 },
  violin: { attack: 0.1, decay: 0.3, sustain: 0.7, release: 0.6 },
  flute: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.2 },
  saxophone: { attack: 0.07, decay: 0.2, sustain: 0.7, release: 0.4 },
  trumpet: { attack: 0.04, decay: 0.1, sustain: 0.8, release: 0.2 },
  drums: { attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.1 },
  harp: { attack: 0.01, decay: 0.9, sustain: 0.2, release: 0.7 },
  xylophone: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.1 },
  kalimba: { attack: 0.01, decay: 1.0, sustain: 0.3, release: 1.0 },
  marimba: { attack: 0.001, decay: 0.5, sustain: 0.1, release: 0.3 },
  tabla: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.2 },
  timpani: { attack: 0.001, decay: 1.0, sustain: 0.2, release: 0.8 },
};
