
export interface HarmonicaVariant {
  id: string;
  name: string;
  bodyColor: string;
  soundProfile: {
    waveform: OscillatorType;
    harmonicRichness: number;
    breathiness: number;
    bendRange: number;
    tremoloRate?: number;
    tremoloDepth?: number;
    filterFrequency: number;
    filterQ: number;
    mainGain: number;
    secondGain: number;
    breathGain: number;
    noiseGain: number;
    vibratoRate: number;
    vibratoDepth: number;
    pitchBend: boolean;
  };
}

export const harmonicaVariants: Record<string, HarmonicaVariant> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    bodyColor: 'from-blue-600 to-blue-800',
    soundProfile: {
      waveform: 'triangle',
      harmonicRichness: 0.3,
      breathiness: 0.2,
      bendRange: 0.05,
      filterFrequency: 2200,
      filterQ: 2,
      mainGain: 0.5,
      secondGain: 0.3,
      breathGain: 0.2,
      noiseGain: 0.08,
      vibratoRate: 5,
      vibratoDepth: 3,
      pitchBend: false
    }
  },
  
  blues: {
    id: 'blues',
    name: 'Blues',
    bodyColor: 'from-blue-700 to-blue-900',
    soundProfile: {
      waveform: 'square',
      harmonicRichness: 0.6,
      breathiness: 0.4,
      bendRange: 0.15,
      filterFrequency: 1800,
      filterQ: 3,
      mainGain: 0.4,
      secondGain: 0.6,
      breathGain: 0.24,
      noiseGain: 0.2,
      vibratoRate: 6.5,
      vibratoDepth: 6,
      pitchBend: true
    }
  },
  
  chromatic: {
    id: 'chromatic',
    name: 'Chromatic',
    bodyColor: 'from-gray-500 to-gray-700',
    soundProfile: {
      waveform: 'sine',
      harmonicRichness: 0.2,
      breathiness: 0.1,
      bendRange: 0,
      filterFrequency: 3500,
      filterQ: 1,
      mainGain: 0.65,
      secondGain: 0.1,
      breathGain: 0.03,
      noiseGain: 0.02,
      vibratoRate: 4,
      vibratoDepth: 2,
      pitchBend: false
    }
  },
  
  tremolo: {
    id: 'tremolo',
    name: 'Tremolo',
    bodyColor: 'from-green-600 to-green-800',
    soundProfile: {
      waveform: 'triangle',
      harmonicRichness: 0.3,
      breathiness: 0.2,
      bendRange: 0.05,
      tremoloRate: 8.5,
      tremoloDepth: 15,
      filterFrequency: 2500,
      filterQ: 2,
      mainGain: 0.5,
      secondGain: 0.21,
      breathGain: 0.08,
      noiseGain: 0.06,
      vibratoRate: 8,
      vibratoDepth: 10,
      pitchBend: false
    }
  }
};

export const getHarmonicaHoles = (variant: string) => {
  // Base holes
  const baseHoles = [
    { number: 1, note: 'C', freq: 261.63 },
    { number: 2, note: 'D', freq: 293.66 },
    { number: 3, note: 'E', freq: 329.63 },
    { number: 4, note: 'F', freq: 349.23 },
    { number: 5, note: 'G', freq: 392.00 },
    { number: 6, note: 'A', freq: 440.00 },
    { number: 7, note: 'B', freq: 493.88 },
    { number: 8, note: 'C2', freq: 523.25 },
  ];
  
  const variantConfig = harmonicaVariants[variant] || harmonicaVariants.standard;
  const hasTremolo = variantConfig.soundProfile.tremoloRate !== undefined;
  
  switch(variant) {
    case 'blues':
      // Blues harmonica with heavily modified frequencies and sound profile
      return baseHoles.map(hole => ({
        ...hole,
        freq: hole.freq * 0.9, // Much lower pitch for bluesy sound
        waveform: variantConfig.soundProfile.waveform,
        harmonicRichness: variantConfig.soundProfile.harmonicRichness,
        breathiness: variantConfig.soundProfile.breathiness,
        bendRange: variantConfig.soundProfile.bendRange
      }));
    case 'chromatic':
      // Chromatic harmonica with more precise, cleaner sound
      return [
        { number: 1, note: 'C', freq: 261.63, waveform: variantConfig.soundProfile.waveform, harmonicRichness: variantConfig.soundProfile.harmonicRichness, breathiness: variantConfig.soundProfile.breathiness, bendRange: 0 },
        { number: 2, note: 'C#', freq: 277.18, waveform: variantConfig.soundProfile.waveform, harmonicRichness: variantConfig.soundProfile.harmonicRichness, breathiness: variantConfig.soundProfile.breathiness, bendRange: 0 },
        { number: 3, note: 'D', freq: 293.66, waveform: variantConfig.soundProfile.waveform, harmonicRichness: variantConfig.soundProfile.harmonicRichness, breathiness: variantConfig.soundProfile.breathiness, bendRange: 0 },
        { number: 4, note: 'D#', freq: 311.13, waveform: variantConfig.soundProfile.waveform, harmonicRichness: variantConfig.soundProfile.harmonicRichness, breathiness: variantConfig.soundProfile.breathiness, bendRange: 0 },
        { number: 5, note: 'E', freq: 329.63, waveform: variantConfig.soundProfile.waveform, harmonicRichness: variantConfig.soundProfile.harmonicRichness, breathiness: variantConfig.soundProfile.breathiness, bendRange: 0 },
        { number: 6, note: 'F', freq: 349.23, waveform: variantConfig.soundProfile.waveform, harmonicRichness: variantConfig.soundProfile.harmonicRichness, breathiness: variantConfig.soundProfile.breathiness, bendRange: 0 },
        { number: 7, note: 'F#', freq: 369.99, waveform: variantConfig.soundProfile.waveform, harmonicRichness: variantConfig.soundProfile.harmonicRichness, breathiness: variantConfig.soundProfile.breathiness, bendRange: 0 },
        { number: 8, note: 'G', freq: 392.00, waveform: variantConfig.soundProfile.waveform, harmonicRichness: variantConfig.soundProfile.harmonicRichness, breathiness: variantConfig.soundProfile.breathiness, bendRange: 0 },
      ];
    case 'tremolo':
      // Tremolo harmonica with fast vibrato and warbling effects
      return baseHoles.map(hole => ({
        ...hole,
        freq: hole.freq * 1.02, // Slightly higher pitch
        waveform: variantConfig.soundProfile.waveform,
        harmonicRichness: variantConfig.soundProfile.harmonicRichness,
        breathiness: variantConfig.soundProfile.breathiness,
        tremoloRate: variantConfig.soundProfile.tremoloRate,
        tremoloDepth: variantConfig.soundProfile.tremoloDepth,
        bendRange: variantConfig.soundProfile.bendRange
      }));
    default:
      // Standard harmonica
      return baseHoles.map(hole => ({
        ...hole,
        waveform: variantConfig.soundProfile.waveform,
        harmonicRichness: variantConfig.soundProfile.harmonicRichness,
        breathiness: variantConfig.soundProfile.breathiness,
        bendRange: variantConfig.soundProfile.bendRange
      }));
  }
};
