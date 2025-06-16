export interface SitarVariant {
  id: string;
  name: string;
  bodyStyle: {
    body: string;
    head: string;
    hole: string;
  };
  bodyClass: string;
  patternClass: string;
  soundHoleClass: string;
  stringColor: string;
  strings: {
    number: number;
    name: string;
    frequency: number;
  }[];
  soundProfile: {
    oscTypes: OscillatorType[];
    modulationFreq: number;
    modulationAmount: number;
    attackTime: number;
    releaseTime: number;
    harmonics: number[];
    harmonicGains: number[];
    filterFreq: number;
    resonance: number;
    distortionAmount: number;
    reverbAmount: number;
  };
}

export const sitarVariants: Record<string, SitarVariant> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    bodyStyle: {
      body: 'bg-gradient-to-r from-amber-800 to-amber-700',
      head: 'bg-gradient-to-br from-amber-200 to-amber-300 border-amber-400',
      hole: 'bg-amber-400/30'
    },
    bodyClass: 'bg-gradient-to-r from-amber-800 to-amber-700',
    patternClass: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-700/50 to-amber-900/30',
    soundHoleClass: 'w-24 h-24 rounded-full bg-amber-950/40 border border-amber-700/50',
    stringColor: 'bg-amber-200',
    strings: [
      { number: 1, name: 'Sa', frequency: 261.63 },
      { number: 2, name: 'Re', frequency: 293.66 },
      { number: 3, name: 'Ga', frequency: 329.63 },
      { number: 4, name: 'Ma', frequency: 349.23 },
      { number: 5, name: 'Pa', frequency: 392.00 },
      { number: 6, name: 'Dha', frequency: 440.00 },
      { number: 7, name: 'Ni', frequency: 493.88 }
    ],
    soundProfile: {
      oscTypes: ['triangle', 'sawtooth', 'triangle'],
      modulationFreq: 5.0,
      modulationAmount: 3.0,
      attackTime: 0.02,
      releaseTime: 2.5,
      harmonics: [1, 2, 3],
      harmonicGains: [0.7, 0.3, 0.1],
      filterFreq: 2000,
      resonance: 5,
      distortionAmount: 0,
      reverbAmount: 0.15
    }
  },
  
  gandhar: {
    id: 'gandhar',
    name: 'Gandhar',
    bodyStyle: {
      body: 'bg-gradient-to-r from-orange-800 to-orange-700',
      head: 'bg-gradient-to-br from-orange-200 to-orange-300 border-orange-400',
      hole: 'bg-orange-400/30'
    },
    bodyClass: 'bg-gradient-to-r from-orange-800 to-orange-700',
    patternClass: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-700/50 to-orange-900/30',
    soundHoleClass: 'w-24 h-24 rounded-full bg-orange-950/40 border border-orange-700/50',
    stringColor: 'bg-orange-200',
    strings: [
      { number: 1, name: 'Sa', frequency: 240.72 },
      { number: 2, name: 'Re', frequency: 270.17 },
      { number: 3, name: 'Ga', frequency: 303.26 },
      { number: 4, name: 'Ma', frequency: 321.29 },
      { number: 5, name: 'Pa', frequency: 360.64 },
      { number: 6, name: 'Dha', frequency: 404.80 },
      { number: 7, name: 'Ni', frequency: 454.37 }
    ],
    soundProfile: {
      oscTypes: ['triangle', 'triangle', 'sine'],
      modulationFreq: 7.0,
      modulationAmount: 5.0,
      attackTime: 0.03,
      releaseTime: 4.0,
      harmonics: [1, 1.5, 2, 2.5],
      harmonicGains: [0.6, 0.3, 0.2, 0.1],
      filterFreq: 1800,
      resonance: 8,
      distortionAmount: 0,
      reverbAmount: 0.2
    }
  },
  
  electric: {
    id: 'electric',
    name: 'Electric',
    bodyStyle: {
      body: 'bg-gradient-to-r from-blue-700 to-blue-600',
      head: 'bg-gradient-to-br from-blue-300 to-blue-400 border-blue-500',
      hole: 'bg-blue-500/30'
    },
    bodyClass: 'bg-gradient-to-r from-blue-700 to-blue-600',
    patternClass: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-700/50 to-blue-900/30',
    soundHoleClass: 'w-24 h-24 rounded-full bg-blue-950/40 border border-blue-700/50',
    stringColor: 'bg-blue-200',
    strings: [
      { number: 1, name: 'Sa', frequency: 274.71 },
      { number: 2, name: 'Re', frequency: 308.34 },
      { number: 3, name: 'Ga', frequency: 346.11 },
      { number: 4, name: 'Ma', frequency: 366.69 },
      { number: 5, name: 'Pa', frequency: 411.60 },
      { number: 6, name: 'Dha', frequency: 462.00 },
      { number: 7, name: 'Ni', frequency: 518.57 }
    ],
    soundProfile: {
      oscTypes: ['sawtooth', 'square', 'sawtooth'],
      modulationFreq: 3.0,
      modulationAmount: 1.5,
      attackTime: 0.01,
      releaseTime: 1.8,
      harmonics: [1, 2, 3, 4, 5],
      harmonicGains: [0.5, 0.4, 0.3, 0.2, 0.1],
      filterFreq: 3200,
      resonance: 3,
      distortionAmount: 30,
      reverbAmount: 0.1
    }
  },
  
  vilayat: {
    id: 'vilayat',
    name: 'Vilayat',
    bodyStyle: {
      body: 'bg-gradient-to-r from-red-800 to-red-700',
      head: 'bg-gradient-to-br from-red-200 to-red-300 border-red-400',
      hole: 'bg-red-400/30'
    },
    bodyClass: 'bg-gradient-to-r from-red-800 to-red-700',
    patternClass: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-700/50 to-red-900/30',
    soundHoleClass: 'w-24 h-24 rounded-full bg-red-950/40 border border-red-700/50',
    stringColor: 'bg-red-200',
    strings: [
      { number: 1, name: 'Sa', frequency: 222.39 },
      { number: 2, name: 'Re', frequency: 249.61 },
      { number: 3, name: 'Ga', frequency: 280.19 },
      { number: 4, name: 'Ma', frequency: 296.85 },
      { number: 5, name: 'Pa', frequency: 333.20 },
      { number: 6, name: 'Dha', frequency: 374.00 },
      { number: 7, name: 'Ni', frequency: 419.80 }
    ],
    soundProfile: {
      oscTypes: ['triangle', 'sine', 'triangle'],
      modulationFreq: 8.0,
      modulationAmount: 6.0,
      attackTime: 0.04,
      releaseTime: 5.0,
      harmonics: [1, 1.2, 2, 2.2, 3],
      harmonicGains: [0.5, 0.4, 0.3, 0.2, 0.1],
      filterFreq: 1500,
      resonance: 12,
      distortionAmount: 0,
      reverbAmount: 0.3
    }
  }
};

export const getSitarStrings = (variant: string) => {
  // Base strings (based on Indian classical music)
  const baseStrings = [
    { note: 'Sa', freq: 261.63, key: '1', color: 'bg-amber-200' },
    { note: 'Re', freq: 293.66, key: '2', color: 'bg-amber-200' },
    { note: 'Ga', freq: 329.63, key: '3', color: 'bg-amber-200' },
    { note: 'Ma', freq: 349.23, key: '4', color: 'bg-amber-200' },
    { note: 'Pa', freq: 392.00, key: '5', color: 'bg-amber-200' },
    { note: 'Dha', freq: 440.00, key: '6', color: 'bg-amber-200' },
    { note: 'Ni', freq: 493.88, key: '7', color: 'bg-amber-200' },
  ];
  
  let colorScheme;
  let freqAdjust = 1.0;
  let detuneAmount = 0;
  
  switch(variant) {
    case 'gandhar':
      colorScheme = Array(7).fill('bg-orange-200');
      freqAdjust = 0.92;
      detuneAmount = 5;
      break;
    case 'electric':
      colorScheme = Array(7).fill('bg-blue-200');
      freqAdjust = 1.05;
      detuneAmount = -3;
      break;
    case 'vilayat':
      colorScheme = Array(7).fill('bg-red-200');
      freqAdjust = 0.85;
      detuneAmount = 8;
      break;
    default:
      colorScheme = Array(7).fill('bg-amber-200');
  }
  
  return baseStrings.map((string, index) => ({
    ...string,
    color: colorScheme[index],
    freq: string.freq * freqAdjust,
    detune: detuneAmount
  }));
};
