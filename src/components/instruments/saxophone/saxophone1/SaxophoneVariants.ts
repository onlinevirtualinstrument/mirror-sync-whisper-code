
export interface SaxophoneVariant {
  id: string;
  name: string;
  description: string;
  bodyClass: string;
  backgroundPattern: string;
  keysColor: string;
  bellColor: string;
  material: string;
  notes: {
    key: string;
    label: string;
    frequency: number;
  }[];
  soundProfile: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    harmonicRatios: number[];
    oscillatorTypes: OscillatorType[];
    detune: number;
    distortion: number;
  };
}

export const saxophoneVariants: Record<string, SaxophoneVariant> = {
  alto: {
    id: 'alto',
    name: 'Alto Saxophone',
    description: 'Warm, versatile tone - the standard saxophone for beginners and professionals alike',
    bodyClass: 'bg-gradient-to-r from-amber-600 to-amber-700',
    backgroundPattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500 via-amber-600 to-amber-700',
    keysColor: 'bg-yellow-300',
    bellColor: 'bg-amber-400',
    material: 'Brass',
    notes: [
      { key: 'a', label: 'C', frequency: 261.63 },
      { key: 's', label: 'D', frequency: 293.66 },
      { key: 'd', label: 'E', frequency: 329.63 },
      { key: 'f', label: 'F', frequency: 349.23 },
      { key: 'g', label: 'G', frequency: 392.00 },
      { key: 'h', label: 'A', frequency: 440.00 },
      { key: 'j', label: 'B', frequency: 493.88 },
      { key: 'k', label: 'C\'', frequency: 523.25 },
    ],
    soundProfile: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.7,
      release: 0.5,
      harmonicRatios: [1, 2, 3, 4, 5],
      oscillatorTypes: ['sawtooth', 'triangle', 'sine', 'sine', 'sine'],
      detune: 5,
      distortion: 2,
    }
  },
  tenor: {
    id: 'tenor',
    name: 'Tenor Saxophone',
    description: 'Rich, full-bodied tone with excellent projection - the jazz saxophone of choice',
    bodyClass: 'bg-gradient-to-r from-yellow-700 to-amber-800',
    backgroundPattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-600 via-amber-700 to-amber-800',
    keysColor: 'bg-yellow-400',
    bellColor: 'bg-amber-500',
    material: 'Brass with Gold Lacquer',
    notes: [
      { key: 'a', label: 'Bb', frequency: 233.08 },
      { key: 's', label: 'C', frequency: 261.63 },
      { key: 'd', label: 'D', frequency: 293.66 },
      { key: 'f', label: 'Eb', frequency: 311.13 },
      { key: 'g', label: 'F', frequency: 349.23 },
      { key: 'h', label: 'G', frequency: 392.00 },
      { key: 'j', label: 'A', frequency: 440.00 },
      { key: 'k', label: 'Bb\'', frequency: 466.16 },
    ],
    soundProfile: {
      attack: 0.08,
      decay: 0.3,
      sustain: 0.8,
      release: 0.6,
      harmonicRatios: [1, 1.5, 2, 2.5, 3],
      oscillatorTypes: ['sawtooth', 'triangle', 'sine', 'sine', 'sine'],
      detune: 7,
      distortion: 3,
    }
  },
  soprano: {
    id: 'soprano',
    name: 'Soprano Saxophone',
    description: 'Bright, clear tone with a sweet upper register - the highest-pitched common saxophone',
    bodyClass: 'bg-gradient-to-r from-yellow-500 to-amber-600',
    backgroundPattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400 via-yellow-500 to-amber-600',
    keysColor: 'bg-yellow-200',
    bellColor: 'bg-amber-300',
    material: 'Silver-Plated Brass',
    notes: [
      { key: 'a', label: 'D', frequency: 293.66 },
      { key: 's', label: 'E', frequency: 329.63 },
      { key: 'd', label: 'F#', frequency: 369.99 },
      { key: 'f', label: 'G', frequency: 392.00 },
      { key: 'g', label: 'A', frequency: 440.00 },
      { key: 'h', label: 'B', frequency: 493.88 },
      { key: 'j', label: 'C#', frequency: 554.37 },
      { key: 'k', label: 'D\'', frequency: 587.33 },
    ],
    soundProfile: {
      attack: 0.03,
      decay: 0.15,
      sustain: 0.7,
      release: 0.4,
      harmonicRatios: [1, 2, 3, 3.5, 4],
      oscillatorTypes: ['sawtooth', 'triangle', 'sine', 'sine', 'sine'],
      detune: 4,
      distortion: 1,
    }
  },
  baritone: {
    id: 'baritone',
    name: 'Baritone Saxophone',
    description: 'Deep, resonant tone with powerful low notes - the anchor of saxophone sections',
    bodyClass: 'bg-gradient-to-r from-amber-800 to-amber-900',
    backgroundPattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-700 via-amber-800 to-amber-900',
    keysColor: 'bg-yellow-500',
    bellColor: 'bg-amber-600',
    material: 'Vintage Brass',
    notes: [
      { key: 'a', label: 'Eb', frequency: 155.56 },
      { key: 's', label: 'F', frequency: 174.61 },
      { key: 'd', label: 'G', frequency: 196.00 },
      { key: 'f', label: 'Ab', frequency: 207.65 },
      { key: 'g', label: 'Bb', frequency: 233.08 },
      { key: 'h', label: 'C', frequency: 261.63 },
      { key: 'j', label: 'D', frequency: 293.66 },
      { key: 'k', label: 'Eb\'', frequency: 311.13 },
    ],
    soundProfile: {
      attack: 0.1,
      decay: 0.4,
      sustain: 0.9,
      release: 0.7,
      harmonicRatios: [1, 1.3, 1.6, 2, 2.5],
      oscillatorTypes: ['sawtooth', 'triangle', 'sine', 'sine', 'sine'],
      detune: 8,
      distortion: 4,
    }
  }
};
