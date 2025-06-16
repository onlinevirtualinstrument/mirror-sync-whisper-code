
export interface GuitarVariant {
  id: string;
  name: string;
  bodyClass: string;
  backgroundPattern: string;
  soundHoleClass?: string;
  pickupClass?: string;
  strings: {
    name: string;
    key: string;
    frequency: number;
    color: string;
    thickness?: string;
  }[];
  soundProfile: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    harmonicRatios: number[];
    oscillatorTypes: OscillatorType[];
    detune: number;
    distortionAmount: number;
  };
}

export const guitarVariants: Record<string, GuitarVariant> = {
  standard: {
    id: 'standard',
    name: 'Acoustic',
    bodyClass: 'bg-gradient-to-r from-amber-800 to-amber-700',
    backgroundPattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-700 via-amber-800 to-amber-900',
    soundHoleClass: 'w-24 h-24 rounded-full bg-black/80 border-2 border-amber-600/50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    strings: [
      { name: 'E', key: 'q', frequency: 329.63, color: 'bg-red-500' },
      { name: 'B', key: 'w', frequency: 246.94, color: 'bg-orange-400' },
      { name: 'G', key: 'e', frequency: 196.00, color: 'bg-yellow-400' },
      { name: 'D', key: 'r', frequency: 146.83, color: 'bg-green-500' },
      { name: 'A', key: 't', frequency: 110.00, color: 'bg-blue-500' },
      { name: 'E', key: 'y', frequency: 82.41, color: 'bg-purple-500' },
    ],
    soundProfile: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.7,
      release: 1.5,
      harmonicRatios: [1, 2, 3, 4],
      oscillatorTypes: ['triangle', 'triangle', 'sine', 'sine'],
      detune: 3,
      distortionAmount: 10
    }
  },
  
  classical: {
    id: 'classical',
    name: 'Classical',
    bodyClass: 'bg-gradient-to-r from-amber-700 to-amber-900',
    backgroundPattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600 via-amber-700 to-amber-900',
    soundHoleClass: 'w-28 h-28 rounded-full bg-black/80 border-4 border-amber-500/50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    strings: [
      { name: 'E', key: 'q', frequency: 329.63, color: 'bg-red-400', thickness: '1' },
      { name: 'B', key: 'w', frequency: 246.94, color: 'bg-orange-300', thickness: '1' },
      { name: 'G', key: 'e', frequency: 196.00, color: 'bg-yellow-300', thickness: '1.5' },
      { name: 'D', key: 'r', frequency: 146.83, color: 'bg-green-400', thickness: '1.5' },
      { name: 'A', key: 't', frequency: 110.00, color: 'bg-blue-400', thickness: '2' },
      { name: 'E', key: 'y', frequency: 82.41, color: 'bg-purple-400', thickness: '2' },
    ],
    soundProfile: {
      attack: 0.04,
      decay: 0.2,
      sustain: 0.8,
      release: 1.8,
      harmonicRatios: [1, 1.5, 2, 2.5],
      oscillatorTypes: ['sine', 'sine', 'sine', 'sine'],
      detune: 1,
      distortionAmount: 5
    }
  },
  
  electric: {
    id: 'electric',
    name: 'Electric',
    bodyClass: 'bg-gradient-to-r from-blue-900 to-indigo-800',
    backgroundPattern: 'bg-[linear-gradient(to_right,_var(--tw-gradient-stops))] from-blue-700 via-blue-800 to-indigo-800',
    pickupClass: 'w-32 h-6 rounded-sm bg-black/80 border border-gray-500',
    strings: [
      { name: 'E', key: 'q', frequency: 329.63, color: 'bg-red-500', thickness: '0.5' },
      { name: 'B', key: 'w', frequency: 246.94, color: 'bg-orange-400', thickness: '0.5' },
      { name: 'G', key: 'e', frequency: 196.00, color: 'bg-yellow-400', thickness: '1' },
      { name: 'D', key: 'r', frequency: 146.83, color: 'bg-green-500', thickness: '1' },
      { name: 'A', key: 't', frequency: 110.00, color: 'bg-blue-500', thickness: '1.5' },
      { name: 'E', key: 'y', frequency: 82.41, color: 'bg-purple-500', thickness: '1.5' },
    ],
    soundProfile: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.9,
      release: 1.2,
      harmonicRatios: [1, 2, 3, 4.5],
      oscillatorTypes: ['sawtooth', 'square', 'sawtooth', 'square'],
      detune: 5,
      distortionAmount: 45
    }
  },
  
  bass: {
    id: 'bass',
    name: 'Bass',
    bodyClass: 'bg-gradient-to-r from-slate-800 to-slate-700',
    backgroundPattern: 'bg-[linear-gradient(to_right,_var(--tw-gradient-stops))] from-slate-700 via-slate-800 to-slate-900',
    pickupClass: 'w-36 h-8 rounded-sm bg-black/80 border border-gray-600',
    strings: [
      { name: 'G', key: 'q', frequency: 98.00, color: 'bg-amber-500', thickness: '3' },
      { name: 'D', key: 'w', frequency: 73.42, color: 'bg-yellow-500', thickness: '3' },
      { name: 'A', key: 'e', frequency: 55.00, color: 'bg-green-600', thickness: '4' },
      { name: 'E', key: 'r', frequency: 41.20, color: 'bg-blue-600', thickness: '4' },
    ],
    soundProfile: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.8,
      release: 1.5,
      harmonicRatios: [1, 1.5, 2, 2.5],
      oscillatorTypes: ['sine', 'triangle', 'sine', 'sine'],
      detune: 2,
      distortionAmount: 15
    }
  },
  
  resonator: {
    id: 'resonator',
    name: 'Resonator',
    bodyClass: 'bg-gradient-to-r from-gray-400 to-gray-500',
    backgroundPattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-300 via-gray-400 to-gray-500',
    soundHoleClass: 'w-32 h-32 rounded-full bg-gray-300/30 border-8 border-gray-400/50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    strings: [
      { name: 'E', key: 'q', frequency: 329.63, color: 'bg-red-400', thickness: '1.5' },
      { name: 'B', key: 'w', frequency: 246.94, color: 'bg-orange-400', thickness: '1.5' },
      { name: 'G', key: 'e', frequency: 196.00, color: 'bg-yellow-400', thickness: '2' },
      { name: 'D', key: 'r', frequency: 146.83, color: 'bg-green-500', thickness: '2' },
      { name: 'A', key: 't', frequency: 110.00, color: 'bg-blue-500', thickness: '2.5' },
      { name: 'E', key: 'y', frequency: 82.41, color: 'bg-purple-500', thickness: '2.5' },
    ],
    soundProfile: {
      attack: 0.01,
      decay: 0.5,
      sustain: 0.6,
      release: 2.0,
      harmonicRatios: [1, 2, 3, 3.5],
      oscillatorTypes: ['triangle', 'triangle', 'sine', 'sine'],
      detune: 8,
      distortionAmount: 25
    }
  },
  
  twelve: {
    id: 'twelve',
    name: '12-String',
    bodyClass: 'bg-gradient-to-r from-amber-600 to-amber-800',
    backgroundPattern: 'bg-[linear-gradient(to_right,_var(--tw-gradient-stops))] from-amber-600 via-amber-700 to-amber-800',
    soundHoleClass: 'w-28 h-28 rounded-full bg-black/80 border-2 border-amber-500/50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    strings: [
      { name: 'E/E', key: 'q', frequency: 329.63, color: 'bg-red-500' },
      { name: 'B/B', key: 'w', frequency: 246.94, color: 'bg-orange-400' },
      { name: 'G/G', key: 'e', frequency: 196.00, color: 'bg-yellow-400' },
      { name: 'D/D', key: 'r', frequency: 146.83, color: 'bg-green-500' },
      { name: 'A/A', key: 't', frequency: 110.00, color: 'bg-blue-500' },
      { name: 'E/E', key: 'y', frequency: 82.41, color: 'bg-purple-500' },
    ],
    soundProfile: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.7,
      release: 1.8,
      harmonicRatios: [1, 1.01, 2, 2.01, 3.02],
      oscillatorTypes: ['triangle', 'triangle', 'sine', 'sine', 'sine'],
      detune: 10,
      distortionAmount: 15
    }
  }
};
