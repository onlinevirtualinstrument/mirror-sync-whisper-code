
import { ViolinType } from '../ViolinExperience';

// Add string resonance simulation for more realistic violin sound
export const addStringResonance = (
  context: AudioContext,
  inputNode: AudioNode,
  frequency: number,
  violinType: ViolinType
): AudioNode => {
  // Create resonant filter to simulate violin body resonance
  const bodyResonance = context.createBiquadFilter();
  bodyResonance.type = 'peaking';
  
  // Each violin type has different body resonance characteristics
  switch(violinType) {
    case 'classical':
      bodyResonance.frequency.value = 440;
      bodyResonance.Q.value = 9;
      bodyResonance.gain.value = 3.5;
      break;
    case 'baroque':
      bodyResonance.frequency.value = 415;
      bodyResonance.Q.value = 11;
      bodyResonance.gain.value = 4.5;
      break;
    case 'electric':
      bodyResonance.frequency.value = 500;
      bodyResonance.Q.value = 5.5;
      bodyResonance.gain.value = 2.5;
      break;
    case 'fiddle':
      bodyResonance.frequency.value = 470;
      bodyResonance.Q.value = 13;
      bodyResonance.gain.value = 5.5;
      break;
    case 'synth':
      bodyResonance.frequency.value = 520;
      bodyResonance.Q.value = 3.5;
      bodyResonance.gain.value = 2;
      break;
    case 'hardanger':
      bodyResonance.frequency.value = 430;
      bodyResonance.Q.value = 16;
      bodyResonance.gain.value = 6.5;
      break;
    case 'five-string':
      bodyResonance.frequency.value = 392; // G3 frequency - lower for five-string
      bodyResonance.Q.value = 10;
      bodyResonance.gain.value = 4;
      break;
    case 'semi-acoustic':
      bodyResonance.frequency.value = 460;
      bodyResonance.Q.value = 7;
      bodyResonance.gain.value = 3.2;
      break;
    default:
      bodyResonance.frequency.value = 440;
      bodyResonance.Q.value = 8;
      bodyResonance.gain.value = 3;
  }
  
  // Add a second resonance peak for more complex timbres
  const secondaryResonance = context.createBiquadFilter();
  secondaryResonance.type = 'peaking';
  
  // Different secondary resonance for each violin type
  switch(violinType) {
    case 'classical':
      secondaryResonance.frequency.value = bodyResonance.frequency.value * 2.2;
      secondaryResonance.Q.value = bodyResonance.Q.value * 0.7;
      secondaryResonance.gain.value = bodyResonance.gain.value * 0.6;
      break;
    case 'baroque':
      secondaryResonance.frequency.value = bodyResonance.frequency.value * 2.0;
      secondaryResonance.Q.value = bodyResonance.Q.value * 0.8;
      secondaryResonance.gain.value = bodyResonance.gain.value * 0.7;
      break;
    case 'electric':
      secondaryResonance.frequency.value = bodyResonance.frequency.value * 2.5;
      secondaryResonance.Q.value = bodyResonance.Q.value * 0.5;
      secondaryResonance.gain.value = bodyResonance.gain.value * 0.5;
      break;
    case 'fiddle':
      secondaryResonance.frequency.value = bodyResonance.frequency.value * 2.3;
      secondaryResonance.Q.value = bodyResonance.Q.value * 0.75;
      secondaryResonance.gain.value = bodyResonance.gain.value * 0.65;
      break;
    case 'hardanger':
      // Hardanger has more complex resonances due to sympathetic strings
      secondaryResonance.frequency.value = bodyResonance.frequency.value * 1.8;
      secondaryResonance.Q.value = bodyResonance.Q.value * 0.85;
      secondaryResonance.gain.value = bodyResonance.gain.value * 0.8;
      break;
    default:
      secondaryResonance.frequency.value = bodyResonance.frequency.value * 2.2;
      secondaryResonance.Q.value = bodyResonance.Q.value * 0.7;
      secondaryResonance.gain.value = bodyResonance.gain.value * 0.6;
  }
  
  // Add a third resonance for certain violin types for even richer sound
  if (['hardanger', 'baroque', 'classical', 'five-string'].includes(violinType)) {
    const tertiaryResonance = context.createBiquadFilter();
    tertiaryResonance.type = 'peaking';
    
    // Customize based on violin type
    if (violinType === 'hardanger') {
      // Hardanger's sympathetic strings create complex resonances
      tertiaryResonance.frequency.value = bodyResonance.frequency.value * 3.2;
      tertiaryResonance.Q.value = 12;
      tertiaryResonance.gain.value = 3.5;
    } else if (violinType === 'baroque') {
      tertiaryResonance.frequency.value = bodyResonance.frequency.value * 3.0;
      tertiaryResonance.Q.value = 9;
      tertiaryResonance.gain.value = 2.5;
    } else if (violinType === 'five-string') {
      tertiaryResonance.frequency.value = bodyResonance.frequency.value * 3.5;
      tertiaryResonance.Q.value = 8;
      tertiaryResonance.gain.value = 2.2;
    } else {
      tertiaryResonance.frequency.value = bodyResonance.frequency.value * 3.4;
      tertiaryResonance.Q.value = 10;
      tertiaryResonance.gain.value = 2.8;
    }
    
    // Connect everything
    inputNode.connect(bodyResonance);
    bodyResonance.connect(secondaryResonance);
    secondaryResonance.connect(tertiaryResonance);
    
    return tertiaryResonance;
  } else {
    // Connect the standard two resonances
    inputNode.connect(bodyResonance);
    bodyResonance.connect(secondaryResonance);
    
    return secondaryResonance;
  }
};

// Create bowed string model for more realistic sustain
export const createBowedString = (
  context: AudioContext,
  oscillator: OscillatorNode,
  gainNode: GainNode,
  violinType: ViolinType
): void => {
  // Add bow noise and sustain characteristics
  const bowNoiseBuffer = context.createBuffer(1, context.sampleRate * 0.5, context.sampleRate);
  const bowNoiseData = bowNoiseBuffer.getChannelData(0);
  
  // Generate bow noise profile based on violin type
  let bowNoiseLevel = 0.03; // Default
  let scratchyFactor = 1.0; // Default scratchiness factor
  
  // Customize bow noise characteristics by violin type
  switch(violinType) {
    case 'classical':
      bowNoiseLevel = 0.025;
      scratchyFactor = 0.8;
      break;
    case 'baroque':
      bowNoiseLevel = 0.04;
      scratchyFactor = 1.3;
      break;
    case 'electric':
      bowNoiseLevel = 0.008;
      scratchyFactor = 0.3;
      break;
    case 'fiddle':
      bowNoiseLevel = 0.045;
      scratchyFactor = 1.6;
      break;
    case 'hardanger':
      bowNoiseLevel = 0.038;
      scratchyFactor = 1.4;
      break;
    case 'synth':
      bowNoiseLevel = 0.005;
      scratchyFactor = 0.2;
      break;
    case 'five-string':
      bowNoiseLevel = 0.028;
      scratchyFactor = 0.9;
      break;
    case 'semi-acoustic':
      bowNoiseLevel = 0.018;
      scratchyFactor = 0.6;
      break;
  }
  
  // Create a longer bow noise buffer for more natural sustained sound with slow decay
  for (let i = 0; i < bowNoiseBuffer.length; i++) {
    // Create an envelope that starts with stronger bow attack and slowly decays
    // This provides a more realistic bow sound throughout the note
    const envelope = Math.exp(-2.5 * i / bowNoiseBuffer.length);
    
    // Generate noise with characteristics specific to violin type
    let noise = (Math.random() * 2 - 1) * bowNoiseLevel * envelope;
    
    // Add periodic elements for bow scratch 
    if (i % 1000 < 50 * scratchyFactor && violinType !== 'electric' && violinType !== 'synth') {
      // Add more realistic bow scratches that vary in intensity
      const scratchIntensity = (Math.random() * 0.5 + 0.5) * 1.8 * scratchyFactor;
      noise *= scratchIntensity;
    }
    
    bowNoiseData[i] = noise;
  }
  
  // Create and connect a noise source that loops for continuous bow sound
  const bowNoise = context.createBufferSource();
  bowNoise.buffer = bowNoiseBuffer;
  bowNoise.loop = true; // Loop the bow noise for continuous sound
  
  // Filter the noise characteristics based on violin type
  const bowNoiseFilter = context.createBiquadFilter();
  bowNoiseFilter.type = 'lowpass';
  
  // Customize filter based on violin type
  switch(violinType) {
    case 'classical':
      bowNoiseFilter.frequency.value = 1800;
      break;
    case 'baroque':
      bowNoiseFilter.frequency.value = 1500;
      break;
    case 'electric':
      bowNoiseFilter.frequency.value = 2500;
      break;
    case 'fiddle':
      bowNoiseFilter.frequency.value = 2200;
      break;
    case 'hardanger':
      bowNoiseFilter.frequency.value = 1700;
      break;
    case 'synth':
      bowNoiseFilter.frequency.value = 3000;
      break;
    default:
      bowNoiseFilter.frequency.value = 2000;
  }
  
  bowNoiseFilter.Q.value = 0.8;
  
  // Connect the bow noise
  bowNoise.connect(bowNoiseFilter);
  bowNoiseFilter.connect(gainNode);
  
  // Start the bow noise
  bowNoise.start();
  
  // Set up cleanup for the bow noise when the main oscillator ends
  oscillator.onended = function() {
    try {
      bowNoise.stop();
      bowNoise.disconnect();
      bowNoiseFilter.disconnect();
    } catch (e) {
      console.error("Error stopping bow noise:", e);
    }
  };
};
