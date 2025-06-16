
// Defines unique sound profiles for different guitar types
export type GuitarType = 
  | 'acoustic' 
  | 'electric' 
  | 'bass' 
  | 'classical' 
  | 'flamenco' 
  | 'steel' 
  | 'twelveString';

// Create a more flexible interface for all guitar sound profiles
export interface GuitarSoundProfile {
  // Common tone characteristics
  harmonics: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  resonance: number;
  brightness: number;
  warmth: number;
  
  // Physical characteristics - all optional to accommodate different guitar types
  bodySize?: string;
  bodyType?: string;
  stringMaterial?: string;
  stringCount?: number;
  woodType?: string;
  pickupType?: string;
  pickupPosition?: string;
  doubleStrings?: boolean;
  fingerstyle?: boolean;
  percussive?: boolean;
  cone?: string;
  
  // Audio processing settings
  oscillatorType: string;
  filterFrequency: number;
  filterResonance: number;
  compressorThreshold: number;
  reverbMix: number;
  chorusMix: number;
  delayMix: number;
  distortion?: number;
  compression?: number;
  
  // EQ settings
  eq: Array<{ freq: number, gain: number }>;
}

// Standard guitar tunings
export const GUITAR_TUNINGS = {
  'standard': ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  'drop-d': ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  'open-g': ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
  'half-step-down': ['D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'],
  'bass-standard': ['E1', 'A1', 'D2', 'G2'],
  'bass-5-string': ['B0', 'E1', 'A1', 'D2', 'G2']
};

// Guitar descriptions for each type
export const GUITAR_DESCRIPTIONS = {
  acoustic: {
    title: "Acoustic Guitar",
    description: "A warm, natural sound with balanced tone. Great for folk, pop, and singer-songwriter styles.",
    features: [
      "Warm resonant body",
      "Balanced frequency response",
      "Natural harmonics",
      "Rich overtones"
    ],
    bestFor: ["Folk", "Pop", "Singer-songwriter", "Country"]
  },
  
  electric: {
    title: "Electric Guitar",
    description: "Versatile with a brighter tone and longer sustain. Perfect for rock, blues, and metal.",
    features: [
      "Bright crisp tone",
      "Extended sustain",
      "Powerful mid-range",
      "Responsive to dynamics"
    ],
    bestFor: ["Rock", "Blues", "Metal", "Jazz", "Pop"]
  },
  
  bass: {
    title: "Bass Guitar",
    description: "Deep, powerful low-end with punchy attack. Essential for providing rhythm and foundation.",
    features: [
      "Deep low frequency response",
      "Punchy attack",
      "Solid fundamental notes",
      "Extended low range"
    ],
    bestFor: ["All genres as rhythm foundation", "Funk", "R&B", "Rock"]
  },
  
  classical: {
    title: "Classical Guitar",
    description: "Soft, delicate tone with nylon strings. Ideal for classical, flamenco, and fingerstyle playing.",
    features: [
      "Soft attack with nylon strings",
      "Rich mid-range",
      "Clear separation between notes",
      "Smooth decay"
    ],
    bestFor: ["Classical", "Spanish", "Fingerstyle", "Brazilian"]
  },
  
  flamenco: {
    title: "Flamenco Guitar",
    description: "Bright, percussive tone with quick attack and decay. Perfect for flamenco and rhythmic styles.",
    features: [
      "Bright, cutting tone",
      "Percussive attack",
      "Quick decay",
      "Lower action for speed"
    ],
    bestFor: ["Flamenco", "Spanish", "Percussive fingerstyle"]
  },
  
  steel: {
    title: "Resonator/Steel Guitar",
    description: "Metallic, resonant tone with high sustain. Great for blues, country, and slide playing.",
    features: [
      "Metallic resonance",
      "Bright projection",
      "Long sustain",
      "Distinctive twang"
    ],
    bestFor: ["Blues", "Country", "Slide guitar", "Americana"]
  },
  
  twelveString: {
    title: "12-String Guitar",
    description: "Rich, chorus-like shimmer with doubled strings. Creates a full, lush sound for rhythm playing.",
    features: [
      "Chorus-like shimmer effect",
      "Rich harmonic content",
      "Full, wide stereo sound",
      "Distinctive jangle"
    ],
    bestFor: ["Folk", "Rock", "Pop", "Ballads"]
  }
};

// Get recommended effects settings for each guitar type
export const getRecommendedEffectsForGuitar = (guitarType: GuitarType) => {
  switch (guitarType) {
    case 'acoustic':
      return {
        reverbMix: 0.35,
        delayMix: 0.2,
        compressorThreshold: -24,
        filterFrequency: 2200
      };
    
    case 'electric':
      return {
        distortion: 0.3,
        reverbMix: 0.2,
        delayMix: 0.25,
        chorusMix: 0.25,
        compressorThreshold: -25,
        filterFrequency: 1800
      };
    
    case 'bass':
      return {
        compressorThreshold: -18,
        compressorRatio: 4,
        filterFrequency: 800,
        reverbMix: 0.1
      };
    
    case 'classical':
      return {
        reverbMix: 0.4,
        delayMix: 0.15,
        filterFrequency: 2500
      };
    
    case 'flamenco':
      return {
        reverbMix: 0.25,
        filterFrequency: 3200,
        compressorThreshold: -20
      };
    
    case 'steel':
      return {
        reverbMix: 0.3,
        filterFrequency: 2000,
        filterResonance: 4.0,
        compressorThreshold: -18
      };
    
    case 'twelveString':
      return {
        chorusMix: 0.4,
        reverbMix: 0.4,
        delayMix: 0.25,
        filterFrequency: 2400
      };
    
    default:
      return {};
  }
};

// Define guitar sound profiles with unique characteristics for each type
export const GUITAR_SOUND_PROFILES: Record<GuitarType, GuitarSoundProfile> = {
  acoustic: {
    // Tone characteristics
    harmonics: 0.75,
    attack: 0.35,
    decay: 0.65,
    sustain: 0.7,
    release: 0.6,
    resonance: 0.85,
    brightness: 0.55,
    warmth: 0.75,
    
    // Specific acoustic guitar characteristics
    bodySize: 'dreadnought',
    stringMaterial: 'phosphor-bronze',
    woodType: 'spruce',
    pickupType: 'piezo',
    
    // Audio processing settings
    oscillatorType: 'custom',
    filterFrequency: 2200,
    filterResonance: 1.5,
    compressorThreshold: -20,
    reverbMix: 0.35,
    chorusMix: 0.15,
    delayMix: 0.2,
    
    // EQ settings
    eq: [
      { freq: 100, gain: 1.5 },
      { freq: 400, gain: -1.0 },
      { freq: 1800, gain: 2.0 },
      { freq: 5000, gain: 1.5 }
    ]
  },
  
  electric: {
    // Tone characteristics
    harmonics: 0.6,
    attack: 0.45,
    decay: 0.8,
    sustain: 0.85,
    release: 0.7,
    resonance: 0.4,
    brightness: 0.7,
    warmth: 0.5,
    
    // Specific electric guitar characteristics
    pickupType: 'humbucker',
    pickupPosition: 'bridge',
    stringMaterial: 'nickel',
    bodyType: 'solid',
    
    // Audio processing settings
    oscillatorType: 'sawtooth',
    filterFrequency: 1800,
    filterResonance: 3.0,
    distortion: 0.3,
    compressorThreshold: -25,
    reverbMix: 0.2,
    chorusMix: 0.25,
    delayMix: 0.25,
    
    // EQ settings
    eq: [
      { freq: 80, gain: 1.0 },
      { freq: 500, gain: -1.5 },
      { freq: 1200, gain: 2.5 },
      { freq: 3500, gain: 2.0 }
    ]
  },
  
  bass: {
    // Tone characteristics
    harmonics: 0.3,
    attack: 0.25,
    decay: 0.5,
    sustain: 0.9,
    release: 0.6,
    resonance: 0.65,
    brightness: 0.25,
    warmth: 0.85,
    
    // Specific bass guitar characteristics
    pickupType: 'split-coil',
    stringCount: 4,
    stringMaterial: 'roundwound',
    bodyType: 'solid',
    
    // Audio processing settings
    oscillatorType: 'sine',
    filterFrequency: 800,
    filterResonance: 1.0,
    compression: 0.6,
    compressorThreshold: -18,
    reverbMix: 0.1,
    chorusMix: 0.05,
    delayMix: 0.0,
    
    // EQ settings
    eq: [
      { freq: 40, gain: 3.0 },
      { freq: 100, gain: 2.0 },
      { freq: 800, gain: -1.0 },
      { freq: 2500, gain: 1.0 }
    ]
  },
  
  classical: {
    // Tone characteristics
    harmonics: 0.6,
    attack: 0.15,
    decay: 0.45,
    sustain: 0.65,
    release: 0.7,
    resonance: 0.9,
    brightness: 0.35,
    warmth: 0.95,
    
    // Specific classical guitar characteristics
    stringMaterial: 'nylon',
    bodySize: 'concert',
    woodType: 'cedar',
    fingerstyle: true,
    
    // Audio processing settings
    oscillatorType: 'triangle',
    filterFrequency: 2500,
    filterResonance: 1.2,
    compressorThreshold: -22,
    reverbMix: 0.4,
    chorusMix: 0.05,
    delayMix: 0.15,
    
    // EQ settings
    eq: [
      { freq: 120, gain: 1.5 },
      { freq: 600, gain: -0.5 },
      { freq: 1500, gain: 1.5 },
      { freq: 4000, gain: 0.5 }
    ]
  },
  
  flamenco: {
    // Tone characteristics
    harmonics: 0.5,
    attack: 0.1,
    decay: 0.4,
    sustain: 0.5,
    release: 0.5,
    resonance: 0.95,
    brightness: 0.65,
    warmth: 0.6,
    
    // Specific flamenco guitar characteristics
    stringMaterial: 'nylon',
    bodySize: 'flamenco',
    woodType: 'cypress',
    percussive: true,
    
    // Audio processing settings
    oscillatorType: 'triangle',
    filterFrequency: 3200,
    filterResonance: 2.0,
    compressorThreshold: -20,
    reverbMix: 0.25,
    chorusMix: 0.0,
    delayMix: 0.1,
    
    // EQ settings
    eq: [
      { freq: 100, gain: 0.5 },
      { freq: 800, gain: 1.0 },
      { freq: 2500, gain: 2.5 },
      { freq: 6000, gain: 1.5 }
    ]
  },
  
  steel: {
    // Tone characteristics - Dobro/resonator style
    harmonics: 0.7,
    attack: 0.3,
    decay: 0.7,
    sustain: 0.8,
    release: 0.6,
    resonance: 0.9,
    brightness: 0.6,
    warmth: 0.5,
    
    // Specific resonator guitar characteristics
    bodyType: 'resonator',
    cone: 'single',
    stringMaterial: 'steel',
    
    // Audio processing settings
    oscillatorType: 'custom',
    filterFrequency: 2000,
    filterResonance: 4.0,
    compressorThreshold: -18,
    reverbMix: 0.3,
    chorusMix: 0.1,
    delayMix: 0.2,
    
    // EQ settings
    eq: [
      { freq: 80, gain: 0.5 },
      { freq: 500, gain: -1.0 },
      { freq: 1800, gain: 3.0 },
      { freq: 4000, gain: 2.0 }
    ]
  },
  
  twelveString: {
    // Tone characteristics
    harmonics: 0.85,
    attack: 0.3,
    decay: 0.65,
    sustain: 0.7,
    release: 0.6,
    resonance: 0.8,
    brightness: 0.65,
    warmth: 0.7,
    
    // Specific 12-string characteristics
    stringCount: 12,
    stringMaterial: 'phosphor-bronze',
    bodySize: 'jumbo',
    doubleStrings: true,
    
    // Audio processing settings
    oscillatorType: 'custom',
    filterFrequency: 2400,
    filterResonance: 1.8,
    compressorThreshold: -22,
    reverbMix: 0.4,
    chorusMix: 0.4,
    delayMix: 0.25,
    
    // EQ settings
    eq: [
      { freq: 100, gain: 1.0 },
      { freq: 500, gain: -0.5 },
      { freq: 2000, gain: 2.5 },
      { freq: 5000, gain: 2.0 }
    ]
  }
};

// Get string names for given guitar type
export const getStringNamesForGuitar = (guitarType: GuitarType): string[] => {
  switch (guitarType) {
    case 'bass':
      return ['G', 'D', 'A', 'E'];
    default:
      return ['E', 'B', 'G', 'D', 'A', 'E'];
  }
};

// Get number of strings for a guitar type
export const getStringCountForGuitar = (guitarType: GuitarType): number => {
  switch (guitarType) {
    case 'bass':
      return 4;
    case 'twelveString':
      return 6; // Still 6 string pairs, displayed as 6 strings
    default:
      return 6;
  }
};
