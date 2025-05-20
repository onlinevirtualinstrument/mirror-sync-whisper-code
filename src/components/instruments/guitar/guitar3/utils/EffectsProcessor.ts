
/**
 * Handles audio effects processing for guitar sounds
 */
import { GuitarVariant } from '../GuitarVariants';

export interface FilterConfig {
  type: BiquadFilterType;
  frequency: number;
  Q: number;
}

export const createToneFilter = (
  audioContext: AudioContext,
  toneQuality: number,
  variant: GuitarVariant
): BiquadFilterNode => {
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  
  // Set filter parameters based on variant
  switch(variant.id) {
    case 'electric':
      filter.frequency.value = 2000 + (toneQuality * 8000);
      filter.Q.value = 2 + toneQuality * 8;
      break;
    case 'bass':
      filter.frequency.value = 400 + (toneQuality * 1600);
      filter.Q.value = 1 + toneQuality * 3;
      break;
    case 'resonator':
      filter.frequency.value = 1000 + (toneQuality * 6000);
      filter.Q.value = 3 + toneQuality * 6;
      break;
    case 'twelve':
      filter.frequency.value = 1000 + (toneQuality * 7000);
      filter.Q.value = 1 + toneQuality * 4;
      break;
    case 'classical':
      filter.frequency.value = 800 + (toneQuality * 5000);
      filter.Q.value = 0.5 + toneQuality * 2;
      break;
    default:
      filter.frequency.value = 500 + (toneQuality * 7500);
      filter.Q.value = 0.5 + toneQuality * 3;
  }
  
  return filter;
};

export const createDistortion = (
  audioContext: AudioContext,
  distortionAmount: number
): WaveShaperNode => {
  const distortion = audioContext.createWaveShaper();
  distortion.curve = makeDistortionCurve(distortionAmount);
  distortion.oversample = '4x';
  
  return distortion;
};

export const makeDistortionCurve = (amount = 20): Float32Array => {
  const k = typeof amount === 'number' ? amount : 20;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  
  return curve;
};

export const connectWithReverb = (
  audioContext: AudioContext,
  source: AudioNode,
  destination: AudioNode,
  reverbNode: ConvolverNode | null,
  reverbLevel: number,
  variantId: string
): void => {
  if (reverbLevel > 0 && reverbNode) {
    const dryGain = audioContext.createGain();
    const wetGain = audioContext.createGain();
    
    dryGain.gain.value = 1 - reverbLevel;
    wetGain.gain.value = reverbLevel * (variantId === 'classical' || variantId === 'resonator' ? 1.5 : 1);
    
    source.connect(dryGain);
    source.connect(reverbNode);
    reverbNode.connect(wetGain);
    
    dryGain.connect(destination);
    wetGain.connect(destination);
  } else {
    source.connect(destination);
  }
};
