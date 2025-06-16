
/**
 * Handles oscillator creation and management for guitar sounds
 */
import { GuitarVariant } from '../GuitarVariants';

export interface OscillatorConfig {
  type: OscillatorType;
  frequency: number;
  detune: number;
  gainValue: number;
}

export const createOscillators = (
  audioContext: AudioContext, 
  frequency: number,
  variant: GuitarVariant
): {
  oscillators: OscillatorNode[];
  gains: GainNode[];
  configs: OscillatorConfig[];
} => {
  const soundProfile = variant.soundProfile;
  
  // Create oscillator configurations based on variant
  const configs: OscillatorConfig[] = [
    {
      type: soundProfile.oscillatorTypes[0] || 'triangle',
      frequency: frequency,
      detune: 0,
      gainValue: 0.5
    },
    {
      type: soundProfile.oscillatorTypes[1] || 'triangle',
      frequency: frequency * soundProfile.harmonicRatios[1],
      detune: variant.id === 'twelve' ? soundProfile.detune : 0,
      gainValue: getSecondaryGainValue(variant.id, soundProfile.harmonicRatios[1])
    },
    {
      type: soundProfile.oscillatorTypes[2] || 'sine',
      frequency: frequency * soundProfile.harmonicRatios[2],
      detune: soundProfile.detune / 2,
      gainValue: getTertiaryGainValue(variant.id)
    },
    {
      type: soundProfile.oscillatorTypes[3] || 'sine',
      frequency: frequency * soundProfile.harmonicRatios[3],
      detune: soundProfile.detune,
      gainValue: getQuaternaryGainValue(variant.id)
    }
  ];
  
  // Create oscillators and gain nodes
  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];
  
  configs.forEach(config => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
    oscillator.detune.setValueAtTime(config.detune, audioContext.currentTime);
    
    gain.gain.value = config.gainValue;
    
    oscillators.push(oscillator);
    gains.push(gain);
  });
  
  return { oscillators, gains, configs };
};

// Helper functions to determine gain values based on guitar variant
const getSecondaryGainValue = (variantId: string, harmonicRatio: number): number => {
  switch(variantId) {
    case 'electric': return 0.25;
    case 'bass': return 0.12;
    case 'twelve': return 0.4;
    case 'resonator': return 0.3;
    case 'classical': return 0.15;
    default: return 0.15;
  }
};

const getTertiaryGainValue = (variantId: string): number => {
  switch(variantId) {
    case 'electric': return 0.2;
    case 'bass': return 0.08;
    case 'twelve': return 0.25;
    case 'resonator': return 0.2;
    case 'classical': return 0.1;
    default: return 0.1;
  }
};

const getQuaternaryGainValue = (variantId: string): number => {
  switch(variantId) {
    case 'electric': return 0.15;
    case 'bass': return 0.05;
    case 'twelve': return 0.15;
    case 'resonator': return 0.2;
    case 'classical': return 0.05;
    default: return 0.1;
  }
};
