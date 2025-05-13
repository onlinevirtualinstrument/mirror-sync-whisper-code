
import { ViolinType } from '../ViolinExperience';

// Define a comprehensive profile for each violin type
export interface ViolinSoundProfile {
  // Base characteristics
  baseGain: number;          // Base volume level
  attackTime: number;        // How quickly the note starts (seconds)
  releaseTime: number;       // How long it takes to fade out (seconds)
  sustainLength: number;     // Default sustain length in ms
  
  // Harmonic structure
  harmonicMultipliers: number[];  // Frequency multipliers for harmonics
  harmonicGains: number[];        // Gain values for each harmonic
  
  // Tonal qualities
  brightness: number;        // Higher values = brighter tone (0-10)
  warmth: number;            // Higher values = warmer tone (0-10)
  presence: number;          // Higher values = more presence (0-10)
  
  // Effects and character
  noiseLevel: number;        // Amount of bow/string noise (0-10)
  scratchiness: number;      // Bow scratch character (0-10)
  vibratoSpeed: number;      // Speed of vibrato in Hz
  vibratoDepth: number;      // Depth/intensity multiplier for vibrato
  naturalDetune: number;     // Amount of natural detuning in cents
  
  // Reverb characteristics
  reverbDecay: number;       // Length of reverb tail (0-10)
  reverbBrightness: number;  // Tonal character of reverb (0-10)
}

// Get the optimized sound profile for a specific violin type
export const getViolinSoundProfile = (violinType: ViolinType): ViolinSoundProfile => {
  switch(violinType) {
    case 'classical':
      return {
        // Modern classical violin - balanced, warm, rich tone
        baseGain: 0.28,
        attackTime: 0.035,
        releaseTime: 0.35,
        sustainLength: 4000,
        
        harmonicMultipliers: [1, 1.5, 2, 3, 4, 5, 6, 8],
        harmonicGains: [0.07, 0.09, 0.38, 0.28, 0.20, 0.14, 0.08, 0.04],
        
        brightness: 6.5,
        warmth: 7.5,
        presence: 8,
        
        noiseLevel: 2.5,
        scratchiness: 2,
        vibratoSpeed: 4.8,
        vibratoDepth: 1.2,
        naturalDetune: 0.4,
        
        reverbDecay: 4.5,
        reverbBrightness: 5.2
      };
    
    case 'baroque':
      return {
        // Historical baroque violin - warmer, earthier tone
        baseGain: 0.26,
        attackTime: 0.04,
        releaseTime: 0.38,
        sustainLength: 3800,
        
        harmonicMultipliers: [1, 1.5, 2, 3, 4, 6, 8],
        harmonicGains: [0.08, 0.10, 0.40, 0.33, 0.24, 0.14, 0.06],
        
        brightness: 4.8,
        warmth: 8.8,
        presence: 6.5,
        
        noiseLevel: 4.5,
        scratchiness: 4.7,
        vibratoSpeed: 4.0,
        vibratoDepth: 0.85,
        naturalDetune: 1.8,
        
        reverbDecay: 5.5,
        reverbBrightness: 3.8
      };
    
    case 'electric':
      return {
        // Electric violin - clean, bright, powerful
        baseGain: 0.32,
        attackTime: 0.022,
        releaseTime: 0.28,
        sustainLength: 4500,
        
        harmonicMultipliers: [1, 1.5, 2, 3, 5, 7, 9],
        harmonicGains: [0.05, 0.06, 0.45, 0.33, 0.25, 0.15, 0.07],
        
        brightness: 9.2,
        warmth: 3.8,
        presence: 9.5,
        
        noiseLevel: 0.8,
        scratchiness: 0.6,
        vibratoSpeed: 5.4,
        vibratoDepth: 1.4,
        naturalDetune: 0,
        
        reverbDecay: 3.2,
        reverbBrightness: 7.5
      };
    
    case 'fiddle':
      return {
        // Folk fiddle - bright, rustic, expressive
        baseGain: 0.30,
        attackTime: 0.025,
        releaseTime: 0.30,
        sustainLength: 3500,
        
        harmonicMultipliers: [1, 1.5, 2, 3, 4, 5, 7, 9],
        harmonicGains: [0.06, 0.09, 0.42, 0.35, 0.28, 0.20, 0.12, 0.06],
        
        brightness: 8.5,
        warmth: 5.8,
        presence: 9.0,
        
        noiseLevel: 6.0,
        scratchiness: 6.5,
        vibratoSpeed: 5.8,
        vibratoDepth: 1.6,
        naturalDetune: 2.2,
        
        reverbDecay: 3.2,
        reverbBrightness: 6.5
      };
    
    case 'hardanger':
      return {
        // Norwegian Hardanger fiddle - distinctive resonant sound with sympathetic strings
        baseGain: 0.28,
        attackTime: 0.045,
        releaseTime: 0.42,
        sustainLength: 3600,
        
        harmonicMultipliers: [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7],
        harmonicGains: [0.06, 0.09, 0.38, 0.30, 0.24, 0.18, 0.14, 0.10, 0.05],
        
        brightness: 7.8,
        warmth: 7.0,
        presence: 9.5,
        
        noiseLevel: 4.8,
        scratchiness: 5.2,
        vibratoSpeed: 4.1,
        vibratoDepth: 1.25,
        naturalDetune: 2.5,
        
        reverbDecay: 6.5,
        reverbBrightness: 6.8
      };
    
    case 'synth':
      return {
        // Synthesized violin-like sound - electronic, precise
        baseGain: 0.38,
        attackTime: 0.018,
        releaseTime: 0.22,
        sustainLength: 5000,
        
        harmonicMultipliers: [1, 1.5, 2, 2.5, 3, 4],
        harmonicGains: [0.08, 0.10, 0.48, 0.38, 0.28, 0.18],
        
        brightness: 9.8,
        warmth: 2.5,
        presence: 8.5,
        
        noiseLevel: 0.3,
        scratchiness: 0.2,
        vibratoSpeed: 6.2,
        vibratoDepth: 1.0,
        naturalDetune: 0,
        
        reverbDecay: 2.5,
        reverbBrightness: 8.5
      };
    
    case 'five-string':
      return {
        // Five-string violin - extended range, balanced
        baseGain: 0.27,
        attackTime: 0.038,
        releaseTime: 0.36,
        sustainLength: 3800,
        
        harmonicMultipliers: [1, 1.5, 2, 3, 4, 5, 6],
        harmonicGains: [0.09, 0.12, 0.36, 0.30, 0.22, 0.12, 0.06],
        
        brightness: 7.2,
        warmth: 6.8,
        presence: 7.8,
        
        noiseLevel: 3.2,
        scratchiness: 2.8,
        vibratoSpeed: 5.1,
        vibratoDepth: 1.1,
        naturalDetune: 0.6,
        
        reverbDecay: 4.8,
        reverbBrightness: 5.8
      };
    
    case 'semi-acoustic':
      return {
        // Semi-acoustic violin - hybrid sound
        baseGain: 0.29,
        attackTime: 0.032,
        releaseTime: 0.32,
        sustainLength: 4000,
        
        harmonicMultipliers: [1, 1.5, 2, 3, 4, 5, 6],
        harmonicGains: [0.06, 0.09, 0.38, 0.29, 0.22, 0.16, 0.09],
        
        brightness: 7.8,
        warmth: 5.8,
        presence: 8.2,
        
        noiseLevel: 2.2,
        scratchiness: 1.8,
        vibratoSpeed: 5.2,
        vibratoDepth: 1.15,
        naturalDetune: 0.3,
        
        reverbDecay: 3.8,
        reverbBrightness: 6.5
      };
    
    default:
      return {
        // Default fallback profile
        baseGain: 0.25,
        attackTime: 0.03,
        releaseTime: 0.3,
        sustainLength: 3000,
        
        harmonicMultipliers: [1, 1.5, 2, 3, 4, 5],
        harmonicGains: [0.05, 0.08, 0.35, 0.25, 0.15, 0.08],
        
        brightness: 6.5,
        warmth: 7,
        presence: 7.5,
        
        noiseLevel: 3,
        scratchiness: 3,
        vibratoSpeed: 5.0,
        vibratoDepth: 1.0,
        naturalDetune: 0.5,
        
        reverbDecay: 4,
        reverbBrightness: 5
      };
  }
};

// Convert profile settings to Web Audio API parameters
export const applyProfileToAudioParams = (
  profile: ViolinSoundProfile,
  context: AudioContext,
  oscillator: OscillatorNode, 
  gainNode: GainNode
): void => {
  // Apply gain
  gainNode.gain.value = profile.baseGain;
  
  // Apply detune 
  if (profile.naturalDetune > 0) {
    oscillator.detune.value = (Math.random() * profile.naturalDetune) - (profile.naturalDetune/2);
  }
  
  // Note: The rest of profile application happens in other functions
  // This is a hook for direct parameter application
};

// Get frequency response curve parameters based on profile
export const getFrequencyResponse = (profile: ViolinSoundProfile) => {
  // Calculate EQ curve based on warmth and brightness
  return {
    lowShelfGain: (profile.warmth - 5) * 2,       // -10 to +10 dB
    lowShelfFreq: 200 + (profile.warmth * 10),    // 250-300 Hz range
    
    peakGain: (profile.presence - 5) * 1.5,       // -7.5 to +7.5 dB
    peakFreq: 800 + (profile.brightness * 80),    // 800-1600 Hz range  
    peakQ: 0.5 + (profile.presence * 0.1),        // 0.5-1.5 Q factor
    
    highShelfGain: (profile.brightness - 5) * 2,  // -10 to +10 dB
    highShelfFreq: 3000 + (profile.brightness * 300) // 3-6 kHz range
  };
};
