
import { ViolinType } from '../ViolinExperience';

// Enhanced frequency calculation for better intonation
export const getNoteFrequency = (noteName: string): number => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Handle invalid note format
  if (noteName.length < 2) return 440;
  
  const octave = parseInt(noteName.slice(-1));
  const note = noteName.slice(0, -1);
  
  const noteIndex = notes.indexOf(note);
  if (noteIndex === -1) return 440;
  
  // Apply slight tuning variations based on historical/regional traditions
  let frequency = 440 * Math.pow(2, (noteIndex - 9 + (octave - 4) * 12) / 12);
  
  // Return frequency with appropriate tuning
  return frequency;
};

// Refined waveform types for each violin variant for more distinct character
export const getWaveformType = (violinType: ViolinType): OscillatorType => {
  // We'll use different waveform types to help create distinct character for each violin
  switch (violinType) {
    case 'electric': return 'sine'; // Pure sine for electric violin
    case 'synth': return 'sine'; 
    case 'fiddle': return 'triangle'; // Triangle has more harmonics for fiddle
    case 'semi-acoustic': return 'sine';
    case 'five-string': return 'sine';
    case 'hardanger': return 'sine';
    case 'baroque': return 'sine';
    case 'classical': return 'sine';
    default: return 'sine';
  }
};

// Enhanced distortion curve with variable characteristics
export const makeDistortionCurve = (amount: number) => {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * Math.sin(x * 10 * deg)) / (Math.PI + k * Math.abs(x));
  }
  
  return curve;
};

// Enhanced harmonic profiles for different violin types
interface HarmonicProfile {
  multipliers: number[];
  gains: number[];
  detune: number; // Amount of natural detune in cents
}

const getHarmonicProfile = (violinType: ViolinType): HarmonicProfile => {
  switch(violinType) {
    case 'classical': 
      return {
        // Classical violins have a warm, rich tone with balanced harmonics
        multipliers: [1, 1.5, 2, 3, 4, 5, 6, 8],
        gains: [0.07, 0.09, 0.38, 0.28, 0.20, 0.14, 0.08, 0.04],
        detune: 0.4 // Minimal detuning for modern tuning
      };
    case 'baroque': 
      return { 
        // Baroque violins have stronger mid-range harmonics, tuned to A=415Hz historically
        multipliers: [1, 1.5, 2, 3, 4, 6, 8],
        gains: [0.08, 0.10, 0.40, 0.33, 0.24, 0.14, 0.06],
        detune: 1.8 // More detuning for baroque character
      };
    case 'electric': 
      return { 
        // Electric violins have stronger upper harmonics for a brighter sound
        multipliers: [1, 1.5, 2, 3, 5, 7, 9],
        gains: [0.05, 0.06, 0.45, 0.33, 0.25, 0.15, 0.07],
        detune: 0 // Electric violins can be very precisely tuned
      };
    case 'fiddle': 
      return { 
        // Fiddles emphasize certain harmonics for a brighter, more rustic sound
        multipliers: [1, 1.5, 2, 3, 4, 5, 7, 9],
        gains: [0.06, 0.09, 0.42, 0.35, 0.28, 0.20, 0.12, 0.06],
        detune: 2.2 // Folk fiddles often have more "character" in their tuning
      };
    case 'five-string':
      return { 
        // Five-string has lower fundamentals, a broader range
        multipliers: [1, 1.5, 2, 3, 4, 5, 6],
        gains: [0.09, 0.12, 0.36, 0.30, 0.22, 0.12, 0.06],
        detune: 0.6 // Slight detune due to the extended range
      };
    case 'hardanger': 
      return { 
        // Hardanger fiddle has a very rich harmonic profile due to sympathetic strings
        multipliers: [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7],
        gains: [0.06, 0.09, 0.38, 0.30, 0.24, 0.18, 0.14, 0.10, 0.05],
        detune: 2.5 // Traditional Norwegian tunings vary somewhat
      };
    case 'semi-acoustic': 
      return { 
        // Semi-acoustic has both acoustic and electric qualities
        multipliers: [1, 1.5, 2, 3, 4, 5, 6],
        gains: [0.06, 0.09, 0.38, 0.29, 0.22, 0.16, 0.09],
        detune: 0.3 // Minimal detune like modern instruments
      };
    case 'synth': 
      return { 
        // Synth violin has different, stronger harmonics for a more electronic sound
        multipliers: [1, 1.5, 2, 2.5, 3, 4],
        gains: [0.08, 0.10, 0.48, 0.38, 0.28, 0.18],
        detune: 0 // Perfect electronic tuning
      };
    default: 
      return { 
        multipliers: [1, 1.5, 2, 3, 4, 5],
        gains: [0.05, 0.08, 0.35, 0.25, 0.15, 0.08],
        detune: 0.5
      };
  }
};

// Create string noise with optimized buffer size
const createStringNoise = (context: AudioContext, frequency: number, level: number, violinType: ViolinType) => {
  // Longer buffer for more natural sound (250ms)
  const bufferSize = context.sampleRate * 0.25;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Create filtered noise that changes with frequency and violin type
  const frequencyFactor = frequency / 440; // Adjust noise based on note frequency
  
  // Adjust noise character based on violin type
  let noiseColor = 1.0; // Default
  let scratchy = 1.0; // Default scratchiness
  
  switch(violinType) {
    case 'baroque':
      noiseColor = 1.3; // More warm mid-range noise
      scratchy = 1.3; // More textured
      break;
    case 'fiddle':
      noiseColor = 1.5; // Brighter noise
      scratchy = 1.7; // More scratchy
      break;
    case 'hardanger':
      noiseColor = 1.4; // Bright with resonance
      scratchy = 1.5; // Moderate scratchiness
      break;
    case 'electric':
      noiseColor = 0.5; // Less noise
      scratchy = 0.4; // Smoother
      break;
    case 'synth':
      noiseColor = 0.3; // Minimal noise
      scratchy = 0.2; // Very smooth
      break;
    case 'classical':
      noiseColor = 0.9; // Refined sound
      scratchy = 0.8; // Less scratchy than baroque
      break;
    case 'five-string':
      noiseColor = 1.0; // Balanced noise
      scratchy = 0.9; // Moderate scratchy
      break;
    case 'semi-acoustic':
      noiseColor = 0.7; // Between acoustic and electric
      scratchy = 0.6; // Moderate smoothness
      break;
  }
  
  for (let i = 0; i < bufferSize; i++) {
    // Noise amplitude decreases over time but not too quickly for more sustained sound
    const decay = Math.exp(-3 * i / bufferSize);
    
    // Higher frequencies have less noise
    const freqAdjustment = Math.max(0.25, 1 - (frequencyFactor - 0.5) * 0.5);
    
    // Generate noise with frequency-dependent characteristics
    data[i] = (Math.random() * 0.8 - 0.4) * decay * freqAdjustment * level * noiseColor;
    
    // Add periodic elements to simulate bow scratching 
    if (i % 2000 < 35 * scratchy) {
      data[i] *= 1.5;
    }
  }
  
  const noise = context.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true; // Loop noise for sustained note effect
  noise.start();
  
  // Add a low-pass filter to reduce harshness in the noise
  const noiseFilter = context.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  
  // Customize filter frequency based on violin type
  switch(violinType) {
    case 'baroque':
      noiseFilter.frequency.value = 1600;
      break;
    case 'classical':
      noiseFilter.frequency.value = 1800;
      break;
    case 'electric':
      noiseFilter.frequency.value = 2200;
      break;
    case 'fiddle':
      noiseFilter.frequency.value = 2000;
      break;
    case 'hardanger':
      noiseFilter.frequency.value = 1700;
      break;
    case 'synth':
      noiseFilter.frequency.value = 2500;
      break;
    default:
      noiseFilter.frequency.value = 1800;
  }
  
  noise.connect(noiseFilter);
  
  return noiseFilter;
};

// Enhanced violin oscillator creator with optimized characteristics for each violin type
export const createViolinOscillator = (
  context: AudioContext, 
  frequency: number, 
  violinType: ViolinType
): [OscillatorNode, GainNode] => {
  const mainOscillator = context.createOscillator();
  const mainGain = context.createGain();
  
  // Set base characteristics
  mainOscillator.frequency.value = frequency;
  mainOscillator.type = getWaveformType(violinType);
  
  // Get harmonic profile for this violin type
  const { multipliers, gains, detune } = getHarmonicProfile(violinType);
  
  // Apply very subtle natural detuning based on violin type
  if (detune > 0) {
    mainOscillator.detune.value = (Math.random() * detune) - (detune/2);
  }
  
  // Adjust base gain based on violin type for optimal volume balance
  switch (violinType) {
    case 'electric':
      mainGain.gain.value = 0.32;
      break;
    case 'synth':
      mainGain.gain.value = 0.38;
      break;
    case 'baroque':
      mainGain.gain.value = 0.26;
      break;
    case 'fiddle':
      mainGain.gain.value = 0.30;
      break;
    case 'hardanger':
      mainGain.gain.value = 0.28;
      break;
    case 'classical':
      mainGain.gain.value = 0.28;
      break;
    case 'five-string':
      mainGain.gain.value = 0.27;
      break;
    case 'semi-acoustic':
      mainGain.gain.value = 0.29;
      break;
    default:
      mainGain.gain.value = 0.25;
  }
  
  // Connect the main oscillator to gain
  mainOscillator.connect(mainGain);
    
  // Add harmonics to enrich the sound (all violin types now have harmonics for richness)
  // Create harmonic oscillators with distinctive profiles for each type
  multipliers.forEach((multiplier, i) => {
    const harmonicOsc = context.createOscillator();
    harmonicOsc.frequency.value = frequency * multiplier;
    
    // Apply minimal detuning to harmonics for more natural sound
    if (detune > 0) {
      harmonicOsc.detune.value = (Math.random() * detune * 0.8) - (detune * 0.4);
    }
    
    // Use sine waves for harmonics
    harmonicOsc.type = 'sine';
    
    // Apply gain to the harmonic
    const harmonicGain = context.createGain();
    harmonicGain.gain.value = gains[i] || 0.02;
    
    // Connection
    harmonicOsc.connect(harmonicGain);
    harmonicGain.connect(mainGain);
    
    // Start the harmonic oscillator
    harmonicOsc.start();
  });
  
  // Add subtle string noise for all acoustic-based violins
  if (violinType !== 'synth' && violinType !== 'electric') {
    // Adjust noise level by violin type
    let noiseLevel = 0.02; // Increased for more authentic bow noise
    
    if (violinType === 'baroque') noiseLevel = 0.025;
    if (violinType === 'fiddle') noiseLevel = 0.03;
    if (violinType === 'hardanger') noiseLevel = 0.028;
    if (violinType === 'five-string') noiseLevel = 0.022;
    
    const noiseNode = createStringNoise(context, frequency, noiseLevel, violinType);
    noiseNode.connect(mainGain);
  }
  
  // Add a subtle compression to smooth out harsh peaks
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 15;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.005;
  compressor.release.value = 0.15; // Increased for smoother release
  
  mainGain.connect(compressor);
  
  // Add a gentle low-pass filter to cut harsh highs
  const smoothingFilter = context.createBiquadFilter();
  smoothingFilter.type = 'lowpass';
  
  // Customize filter frequency based on violin type for unique timbres
  switch(violinType) {
    case 'baroque':
      smoothingFilter.frequency.value = 7500;
      smoothingFilter.Q.value = 0.8;
      break;
    case 'classical':
      smoothingFilter.frequency.value = 8000;
      smoothingFilter.Q.value = 0.7;
      break;
    case 'electric':
      smoothingFilter.frequency.value = 9500;
      smoothingFilter.Q.value = 0.6;
      break;
    case 'fiddle':
      smoothingFilter.frequency.value = 8800;
      smoothingFilter.Q.value = 0.75;
      break;
    case 'hardanger':
      smoothingFilter.frequency.value = 7800;
      smoothingFilter.Q.value = 0.85;
      break;
    case 'synth':
      smoothingFilter.frequency.value = 10000;
      smoothingFilter.Q.value = 0.5;
      break;
    case 'five-string':
      smoothingFilter.frequency.value = 8200;
      smoothingFilter.Q.value = 0.72;
      break;
    case 'semi-acoustic':
      smoothingFilter.frequency.value = 8500;
      smoothingFilter.Q.value = 0.65;
      break;
    default:
      smoothingFilter.frequency.value = 8000;
      smoothingFilter.Q.value = 0.7;
  }
  
  compressor.connect(smoothingFilter);
  
  return [mainOscillator, smoothingFilter as unknown as GainNode];
};

// Create realistic attack and release envelope profiles based on violin type
export const createEnvelope = (
  context: AudioContext,
  gainNode: GainNode,
  violinType: ViolinType,
  duration: number = 500 // Default increased to 500ms for more realistic violin sustain
) => {
  // Define attack and release times based on violin type for realistic profiles
  let attackTime = 0.03;
  let releaseTime = 0.3;
  
  // Customize envelope based on violin type
  switch(violinType) {
    case 'baroque':
      attackTime = 0.04;
      releaseTime = 0.38;
      break;
    case 'classical':
      attackTime = 0.035;
      releaseTime = 0.35;
      break;
    case 'electric':
      attackTime = 0.022;
      releaseTime = 0.28;
      break;
    case 'synth':
      attackTime = 0.018;
      releaseTime = 0.22;
      break;
    case 'fiddle':
      attackTime = 0.025;
      releaseTime = 0.30;
      break;
    case 'hardanger':
      attackTime = 0.045;
      releaseTime = 0.42;
      break;
    case 'semi-acoustic':
      attackTime = 0.032;
      releaseTime = 0.32;
      break;
    case 'five-string':
      attackTime = 0.038;
      releaseTime = 0.36;
      break;
  }
  
  // Convert duration from ms to seconds
  // For very short requested durations, still use a minimum of 500ms for realistic violin sound
  const durationInSeconds = Math.max(duration, 500) / 1000;
  
  // Create envelope with smoother curves for a more natural violin sound
  const now = context.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  
  // Start from a non-zero value for both initial value and target value
  // This fixes the exponential ramp error which can't handle zero values
  const initialGain = 0.01; // Start from a non-zero value
  const peakGain = gainNode.gain.value || 0.5; // Use existing gain value or default to 0.5
  
  // Set initial gain value
  gainNode.gain.setValueAtTime(initialGain, now);
  
  // Attack curve - linear to avoid zero value issues, simulate bow attack
  gainNode.gain.linearRampToValueAtTime(peakGain, now + attackTime);
  
  // Schedule release based on the provided duration
  if (duration > 0) {
    // For longer sustained notes, add a slight natural variation in the sustain
    if (durationInSeconds > 0.5) {
      // Add subtle bow pressure variations for more realistic sustained notes
      const sustainMidpoint = now + (durationInSeconds * 0.5);
      let sustainVariation = peakGain * 0.05; // 5% variation
      
      // Different types have different sustain characteristics
      if (violinType === 'baroque' || violinType === 'hardanger') {
        sustainVariation = peakGain * 0.07; // More variation
      }
      if (violinType === 'electric' || violinType === 'synth') {
        sustainVariation = peakGain * 0.02; // Less variation
      }
      
      // Add subtle variation in the sustain part
      gainNode.gain.setValueAtTime(peakGain, now + attackTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(
        peakGain - sustainVariation, 
        sustainMidpoint
      );
      gainNode.gain.linearRampToValueAtTime(
        peakGain, 
        sustainMidpoint + (durationInSeconds * 0.25)
      );
    }
    
    // Schedule a smoother, more realistic release curve
    const releaseStart = now + Math.max(durationInSeconds - releaseTime, attackTime);
    
    // Use linear ramp for release
    gainNode.gain.setValueAtTime(peakGain, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0.01, releaseStart + releaseTime);
    
    // Final zero setting
    gainNode.gain.setValueAtTime(0, releaseStart + releaseTime + 0.01);
  }
  
  return {
    attackTime,
    releaseTime,
    scheduledEndTime: now + durationInSeconds + releaseTime
  };
};
