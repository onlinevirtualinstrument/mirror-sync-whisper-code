
export interface TrumpetVariant {
  id: string;
  name: string;
  description: string;
  bodyClass: string;
  backgroundPattern: string;
  valveColor: string;
  bellColor: string;
  material: string;
  notes: {
    key: string;
    label: string;
    frequency: number;
    valveCombination: number[];
  }[];
  soundProfile: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    harmonicRatios: number[];
    oscillatorTypes: OscillatorType[];
    detune: number;
    brightness: number;
  };
}

export const trumpetVariants: Record<string, TrumpetVariant> = {
  standard: {
    id: 'standard',
    name: 'Bb Trumpet',
    description: 'The classic trumpet with bright, projected tone - standard for orchestras and bands',
    bodyClass: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    backgroundPattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-yellow-400 to-amber-500',
    valveColor: 'bg-white',
    bellColor: 'bg-yellow-300',
    material: 'Yellow Brass',
    notes: [
      { key: 'a', label: 'C', frequency: 261.63, valveCombination: [0, 1, 2] },
      { key: 's', label: 'D', frequency: 293.66, valveCombination: [0, 1] },
      { key: 'd', label: 'E', frequency: 329.63, valveCombination: [0, 2] },
      { key: 'f', label: 'F', frequency: 349.23, valveCombination: [1] },
      { key: 'g', label: 'G', frequency: 392.00, valveCombination: [0] },
      { key: 'h', label: 'A', frequency: 440.00, valveCombination: [1, 2] },
      { key: 'j', label: 'B', frequency: 493.88, valveCombination: [2] },
      { key: 'k', label: 'C\'', frequency: 523.25, valveCombination: [] },
    ],
    soundProfile: {
      attack: 0.04,
      decay: 0.1,
      sustain: 0.8,
      release: 0.3,
      harmonicRatios: [1, 2, 3, 4, 5],
      oscillatorTypes: ['sawtooth', 'triangle', 'square', 'sine', 'sine'],
      detune: 3,
      brightness: 7,
    }
  },
  cornet: {
    id: 'cornet',
    name: 'Cornet',
    description: 'Mellow, warm tone with a compact design - perfect for brass bands',
    bodyClass: 'bg-gradient-to-r from-amber-500 to-amber-600',
    backgroundPattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400 via-amber-500 to-amber-600',
    valveColor: 'bg-gray-100',
    bellColor: 'bg-amber-400',
    material: 'Gold Brass',
    notes: [
      { key: 'a', label: 'C', frequency: 261.63, valveCombination: [0, 1, 2] },
      { key: 's', label: 'D', frequency: 293.66, valveCombination: [0, 1] },
      { key: 'd', label: 'E', frequency: 329.63, valveCombination: [0, 2] },
      { key: 'f', label: 'F', frequency: 349.23, valveCombination: [1] },
      { key: 'g', label: 'G', frequency: 392.00, valveCombination: [0] },
      { key: 'h', label: 'A', frequency: 440.00, valveCombination: [1, 2] },
      { key: 'j', label: 'B', frequency: 493.88, valveCombination: [2] },
      { key: 'k', label: 'C\'', frequency: 523.25, valveCombination: [] },
    ],
    soundProfile: {
      attack: 0.05,
      decay: 0.15,
      sustain: 0.75,
      release: 0.4,
      harmonicRatios: [1, 1.5, 2, 3, 4],
      oscillatorTypes: ['triangle', 'triangle', 'sine', 'sine', 'sine'],
      detune: 2,
      brightness: 5,
    }
  },
  piccolo: {
    id: 'piccolo',
    name: 'Piccolo Trumpet',
    description: 'Bright, clear tone in higher registers - essential for baroque music',
    bodyClass: 'bg-gradient-to-r from-yellow-300 to-yellow-500',
    backgroundPattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-200 via-yellow-300 to-yellow-500',
    valveColor: 'bg-gray-50',
    bellColor: 'bg-yellow-200',
    material: 'Silver-Plated',
    notes: [
      { key: 'a', label: 'F', frequency: 349.23, valveCombination: [0, 1, 2] },
      { key: 's', label: 'G', frequency: 392.00, valveCombination: [0, 1] },
      { key: 'd', label: 'A', frequency: 440.00, valveCombination: [0, 2] },
      { key: 'f', label: 'Bb', frequency: 466.16, valveCombination: [1] },
      { key: 'g', label: 'C', frequency: 523.25, valveCombination: [0] },
      { key: 'h', label: 'D', frequency: 587.33, valveCombination: [1, 2] },
      { key: 'j', label: 'E', frequency: 659.26, valveCombination: [2] },
      { key: 'k', label: 'F\'', frequency: 698.46, valveCombination: [] },
    ],
    soundProfile: {
      attack: 0.02,
      decay: 0.08,
      sustain: 0.7,
      release: 0.25,
      harmonicRatios: [1, 2, 3, 5, 7],
      oscillatorTypes: ['sawtooth', 'square', 'sine', 'sine', 'sine'],
      detune: 4,
      brightness: 9,
    }
  },
  flugelhorn: {
    id: 'flugelhorn',
    name: 'Flugelhorn',
    description: 'Dark, mellow tone with a conical bore - the jazz soloist\'s choice',
    bodyClass: 'bg-gradient-to-r from-amber-600 to-amber-800',
    backgroundPattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500 via-amber-600 to-amber-800',
    valveColor: 'bg-amber-200',
    bellColor: 'bg-amber-500',
    material: 'Rose Brass',
    notes: [
      { key: 'a', label: 'C', frequency: 261.63, valveCombination: [0, 1, 2] },
      { key: 's', label: 'D', frequency: 293.66, valveCombination: [0, 1] },
      { key: 'd', label: 'E', frequency: 329.63, valveCombination: [0, 2] },
      { key: 'f', label: 'F', frequency: 349.23, valveCombination: [1] },
      { key: 'g', label: 'G', frequency: 392.00, valveCombination: [0] },
      { key: 'h', label: 'A', frequency: 440.00, valveCombination: [1, 2] },
      { key: 'j', label: 'B', frequency: 493.88, valveCombination: [2] },
      { key: 'k', label: 'C\'', frequency: 523.25, valveCombination: [] },
    ],
    soundProfile: {
      attack: 0.07,
      decay: 0.2,
      sustain: 0.85,
      release: 0.5,
      harmonicRatios: [1, 1.2, 1.5, 2, 3],
      oscillatorTypes: ['triangle', 'sine', 'sine', 'sine', 'sine'],
      detune: 1,
      brightness: 3,
    }
  }
};
