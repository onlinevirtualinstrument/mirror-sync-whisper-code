
/**
 * Main guitar sound generation utility
 */
import { guitarVariants, GuitarVariant } from './GuitarVariants';
import { createOscillators } from './utils/OscillatorManager';
import { createToneFilter, createDistortion, connectWithReverb } from './utils/EffectsProcessor';
import { applyEnvelope, applyReleaseEnvelope } from './utils/EnvelopeGenerator';

export const generateGuitarSound = (
  audioContext: AudioContext,
  stringName: string,
  frequency: number,
  volume: number,
  reverbLevel: number,
  toneQuality: number,
  guitarVariantId: string,
  reverbNode: ConvolverNode | null,
  oscillatorsMap: Map<string, OscillatorNode>,
  setActiveStrings: React.Dispatch<React.SetStateAction<string[]>>
) => {
  try {
    // Get guitar variant directly from the imported object
    const variant = guitarVariants[guitarVariantId] || guitarVariants.standard;
    
    // Create and configure oscillators
    const { oscillators, gains } = createOscillators(audioContext, frequency, variant);
    
    // Create main gain node and tone filter
    const gainNode = audioContext.createGain();
    const toneFilter = createToneFilter(audioContext, toneQuality, variant);
    
    // Connect oscillators through gain nodes
    oscillators.forEach((osc, i) => {
      osc.connect(gains[i]);
    });
    
    // Apply distortion for electric guitar
    if (guitarVariantId === 'electric') {
      const distortion = createDistortion(audioContext, variant.soundProfile.distortionAmount + (toneQuality * 20));
      
      gains.forEach(gain => {
        gain.connect(distortion);
      });
      
      distortion.connect(toneFilter);
    } else {
      // Connect all gains to tone filter
      gains.forEach(gain => {
        gain.connect(toneFilter);
      });
    }
    
    // Connect with or without reverb
    connectWithReverb(audioContext, toneFilter, gainNode, reverbNode, reverbLevel, variant.id);
    
    // Connect to output
    gainNode.connect(audioContext.destination);
    
    // Apply envelope
    const totalDuration = applyEnvelope(audioContext, gainNode, volume, variant);
    
    // Start oscillators
    oscillators.forEach(osc => osc.start());
    
    // Keep track of primary oscillator to stop it later
    oscillatorsMap.set(stringName, oscillators[0]);
    
    // Stop after total duration
    setTimeout(() => {
      try {
        oscillators.forEach(osc => {
          osc.stop();
        });
        oscillatorsMap.delete(stringName);
        setActiveStrings(prev => prev.filter(s => s !== stringName));
      } catch (e) {
        console.log("Error stopping oscillators", e);
      }
    }, totalDuration * 1000);
  } catch (error) {
    console.error("Error in generateGuitarSound", error);
  }
};
