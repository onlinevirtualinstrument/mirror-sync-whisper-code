
// Guitar sound profiles and tunings

export type GuitarType = 'acoustic' | 'electric' | 'bass' | 'classical' | 'flamenco' | 'steel' | 'twelveString';

export interface GuitarSoundProfile {
  attack: number;       // Attack time in milliseconds
  decay: number;        // Decay rate
  sustain: number;      // Sustain level
  release: number;      // Release time in milliseconds
  resonance: number;    // Resonance factor
  harmonics: number;    // Harmonics intensity
  brightness: number;   // Brightness factor
}

// Sound profiles for different guitar types
export const GUITAR_SOUND_PROFILES: Record<GuitarType, GuitarSoundProfile> = {
  acoustic: {
    attack: 10,
    decay: 0.8,
    sustain: 0.7,
    release: 400,
    resonance: 0.6,
    harmonics: 0.5,
    brightness: 0.6
  },
  electric: {
    attack: 5,
    decay: 0.7,
    sustain: 0.8,
    release: 350,
    resonance: 0.4,
    harmonics: 0.7,
    brightness: 0.7
  },
  bass: {
    attack: 15,
    decay: 0.6,
    sustain: 0.9,
    release: 500,
    resonance: 0.8,
    harmonics: 0.4,
    brightness: 0.3
  },
  classical: {
    attack: 20,
    decay: 0.7,
    sustain: 0.6,
    release: 450,
    resonance: 0.7,
    harmonics: 0.5,
    brightness: 0.5
  },
  flamenco: {
    attack: 8,
    decay: 0.9,
    sustain: 0.5,
    release: 300,
    resonance: 0.6,
    harmonics: 0.6,
    brightness: 0.8
  },
  steel: {
    attack: 5,
    decay: 0.8,
    sustain: 0.8,
    release: 380,
    resonance: 0.9,
    harmonics: 0.8,
    brightness: 0.7
  },
  twelveString: {
    attack: 12,
    decay: 0.7,
    sustain: 0.7,
    release: 420,
    resonance: 0.7,
    harmonics: 0.9,
    brightness: 0.6
  }
};

// Tunings for different guitar types
export const GUITAR_TUNINGS: Record<string, Record<GuitarType, string[]>> = {
  standard: {
    acoustic: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    electric: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    bass: ['E1', 'A1', 'D2', 'G2'],
    classical: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    flamenco: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    steel: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    twelveString: ['E2', 'E3', 'A2', 'A3', 'D3', 'D4', 'G3', 'G4', 'B3', 'B3', 'E4', 'E4']
  },
  'drop-d': {
    acoustic: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    electric: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    bass: ['D1', 'A1', 'D2', 'G2'],
    classical: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    flamenco: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    steel: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    twelveString: ['D2', 'D3', 'A2', 'A3', 'D3', 'D4', 'G3', 'G4', 'B3', 'B3', 'E4', 'E4']
  },
  'open-g': {
    acoustic: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
    electric: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
    bass: ['D1', 'G1', 'D2', 'G2'],
    classical: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
    flamenco: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
    steel: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
    twelveString: ['D2', 'D3', 'G2', 'G3', 'D3', 'D4', 'G3', 'G4', 'B3', 'B3', 'D4', 'D4']
  }
};
