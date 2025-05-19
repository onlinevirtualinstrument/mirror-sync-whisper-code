
import { ViolinType } from '../ViolinExperience';
import { makeDistortionCurve } from './audioUtils';
import { addStringResonance, createBowedString } from './advancedTechniques';

// Apply various playing techniques to the violin sound
export const applyTechnique = (
  context: AudioContext,
  oscillator: OscillatorNode,
  gainNode: GainNode,
  technique: string,
  dynamic: number,
  frequency: number,
  violinType: ViolinType,
  vibratoAmount: number
): AudioNode => {
  // Default to gainNode as the final node
  let finalNode: AudioNode = gainNode;
  
  // Store all created nodes to ensure they can be cleaned up
  const createdNodes: AudioNode[] = [];
  
  // Apply vibrato effect (LFO modulating the frequency)
  let vibratoLFO: OscillatorNode | null = null;
  if (vibratoAmount > 0) {
    vibratoLFO = context.createOscillator();
    const vibratoGain = context.createGain();
    createdNodes.push(vibratoGain);
    
    // Customize vibrato based on violin type
    let vibratoSpeed = 5; // Default vibrato speed in Hz
    let vibratoDepth = vibratoAmount * 7; // Increased for more expressive vibrato
    
    // Customize vibrato characteristics by violin type
    switch (violinType) {
      case 'baroque':
        vibratoSpeed = 4.0;
        vibratoDepth *= 0.75;
        break;
      case 'classical':
        vibratoSpeed = 4.8;
        vibratoDepth *= 1.1;
        break;
      case 'electric':
        vibratoSpeed = 5.4;
        vibratoDepth *= 1.4;
        break;
      case 'fiddle':
        vibratoSpeed = 5.8;
        vibratoDepth *= 1.6;
        break;
      case 'synth':
        vibratoSpeed = 6.2;
        vibratoDepth *= 1.0;
        break;
      case 'hardanger':
        vibratoSpeed = 4.1;
        vibratoDepth *= 1.25;
        break;
      case 'five-string':
        vibratoSpeed = 5.1;
        vibratoDepth *= 1.1;
        break;
      case 'semi-acoustic':
        vibratoSpeed = 5.2;
        vibratoDepth *= 1.15;
        break;
    }
    
    vibratoLFO.frequency.value = vibratoSpeed;
    vibratoGain.gain.value = vibratoDepth;
    
    vibratoLFO.connect(vibratoGain);
    vibratoGain.connect(oscillator.frequency);
    vibratoLFO.start();
  }
  
  // Track any oscillators that need to be stopped when the main oscillator stops
  const oscillatorsToStop: OscillatorNode[] = [];
  if (vibratoLFO) oscillatorsToStop.push(vibratoLFO);
  
  // Add bowed string characteristics for more realistic sound
  createBowedString(context, oscillator, gainNode, violinType);
  
  // Technique-specific effects
  switch (technique) {
    case 'pizzicato':
      // Create plucked string sound
      gainNode.gain.setValueAtTime(gainNode.gain.value * 1.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001, 
        context.currentTime + 0.8  // Longer for more natural pizzicato decay
      );
      
      // Add some high-pass filtering for pizzicato
      const hpFilter = context.createBiquadFilter();
      createdNodes.push(hpFilter);
      hpFilter.type = 'highpass';
      hpFilter.frequency.value = 180;
      gainNode.connect(hpFilter);
      finalNode = hpFilter;
      break;
      
    case 'tremolo':
      // Create a tremolo effect with an LFO
      const tremoloLFO = context.createOscillator();
      oscillatorsToStop.push(tremoloLFO);
      const tremoloGain = context.createGain();
      createdNodes.push(tremoloGain);
      
      // Customize tremolo based on violin type
      let tremoloSpeed = 8; // Default 8 Hz tremolo
      let tremoloDepth = 0.5; // Default depth
      
      // Adjust tremolo characteristics by violin type
      switch (violinType) {
        case 'baroque':
          tremoloSpeed = 7.5;
          tremoloDepth = 0.45;
          break;
        case 'fiddle':
          tremoloSpeed = 9.0;
          tremoloDepth = 0.65;
          break;
        case 'electric': 
          tremoloSpeed = 8.5;
          tremoloDepth = 0.70;
          break;
        case 'hardanger':
          tremoloSpeed = 7.8;
          tremoloDepth = 0.55;
          break;
      }
      
      tremoloLFO.frequency.value = tremoloSpeed;
      tremoloLFO.type = 'sine';
      tremoloGain.gain.value = tremoloDepth;
      
      tremoloLFO.connect(tremoloGain);
      tremoloGain.connect(gainNode.gain);
      tremoloLFO.start();
      break;
      
    case 'staccato':
      // Short notes but still with natural decay
      gainNode.gain.setValueAtTime(gainNode.gain.value * 1.2, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001, 
        context.currentTime + 0.2  // Slightly longer for more natural staccato
      );
      break;
      
    case 'spiccato':
      // Bouncing bow technique - similar to staccato but with different attack
      gainNode.gain.setValueAtTime(gainNode.gain.value * 1.4, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001, 
        context.currentTime + 0.15  // Still short but with more defined character
      );
      break;
      
    case 'distortion':
      if (violinType === 'electric' || violinType === 'synth') {
        // Create a subtle distortion effect for electric violin
        const distortion = context.createWaveShaper();
        createdNodes.push(distortion);
        
        // Customize distortion curve based on violin type
        const distortionAmount = violinType === 'electric' ? 25 : 15;
        distortion.curve = makeDistortionCurve(distortionAmount);
        distortion.oversample = '4x';
        
        gainNode.connect(distortion);
        finalNode = distortion;
      }
      break;
      
    default: // 'normal' playing technique
      // Add a subtle filter for natural bow sound based on dynamic and violin type
      const bpFilter = context.createBiquadFilter();
      createdNodes.push(bpFilter);
      bpFilter.type = 'bandpass';
      
      // Customize filter based on violin type for more unique sounds
      switch (violinType) {
        case 'classical':
          bpFilter.frequency.value = 850;
          bpFilter.Q.value = 0.8;
          break;
        case 'baroque':
          bpFilter.frequency.value = 750;
          bpFilter.Q.value = 0.9;
          break;
        case 'electric':
          bpFilter.frequency.value = 1200;
          bpFilter.Q.value = 0.6;
          break;
        case 'fiddle':
          bpFilter.frequency.value = 1000;
          bpFilter.Q.value = 1.0;
          break;
        case 'synth':
          bpFilter.frequency.value = 1500;
          bpFilter.Q.value = 0.5;
          break;
        case 'hardanger':
          bpFilter.frequency.value = 880;
          bpFilter.Q.value = 1.1;
          break;
        default:
          bpFilter.frequency.value = 800;
          bpFilter.Q.value = 0.7;
      }
      
      gainNode.connect(bpFilter);
      finalNode = bpFilter;
  }
  
  // Add string resonance for a more realistic violin sound
  finalNode = addStringResonance(context, finalNode, frequency, violinType);
  createdNodes.push(finalNode);
  
  // Setup cleanup when oscillator stops
  oscillator.onended = () => {
    // Stop all LFOs when the main oscillator stops
    oscillatorsToStop.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        console.error("Error stopping oscillator:", e);
      }
    });
    
    // Disconnect all created nodes after a small delay
    setTimeout(() => {
      createdNodes.forEach(node => {
        try {
          node.disconnect();
        } catch (e) {
          console.error("Error disconnecting node:", e);
        }
      });
    }, 150); // Increased to ensure proper cleanup
  };
  
  return finalNode;
};

// Apply reverb effect to the violin sound with optimized convolution
export const applyReverb = (
  context: AudioContext,
  inputNode: AudioNode,
  violinType: ViolinType,
  amount: number
): { nodes: AudioNode[], stopEffect: () => void } => {
  // Store all created nodes for later cleanup
  const createdNodes: AudioNode[] = [];
  
  if (amount <= 0.01) {
    // Return empty arrays if no reverb is applied
    return { 
      nodes: [], 
      stopEffect: () => {} 
    };
  }
  
  // Scale the reverb amount based on violin type
  let adjustedAmount = amount;
  switch(violinType) {
    case 'baroque':
      adjustedAmount = amount * 0.35; // More reverb for baroque sound
      break;
    case 'classical':
      adjustedAmount = amount * 0.32;
      break;
    case 'hardanger':
      adjustedAmount = amount * 0.36; // More reverb for hardanger
      break;
    case 'electric':
      adjustedAmount = amount * 0.25;
      break;
    case 'synth':
      adjustedAmount = amount * 0.22;
      break;
    default:
      adjustedAmount = amount * 0.3;
  }
  
  // Create a more realistic reverb effect with multiple delay lines
  const delay1 = context.createDelay();
  const delay2 = context.createDelay();
  const delay3 = context.createDelay();
  const delay4 = context.createDelay(); // Additional delay for richer reverb
  
  const gain1 = context.createGain();
  const gain2 = context.createGain();
  const gain3 = context.createGain();
  const gain4 = context.createGain();
  
  createdNodes.push(delay1, delay2, delay3, delay4, gain1, gain2, gain3, gain4);
  
  // Set delay times based on violin type for characteristic sound
  let baseDelayTime = 0.02;
  if (violinType === 'baroque' || violinType === 'hardanger') baseDelayTime = 0.025;
  if (violinType === 'electric' || violinType === 'synth') baseDelayTime = 0.015;
  if (violinType === 'fiddle') baseDelayTime = 0.018;
  if (violinType === 'five-string') baseDelayTime = 0.022;
  if (violinType === 'semi-acoustic') baseDelayTime = 0.019;
  
  delay1.delayTime.value = baseDelayTime;
  delay2.delayTime.value = baseDelayTime * 1.5;
  delay3.delayTime.value = baseDelayTime * 2.3;
  delay4.delayTime.value = baseDelayTime * 3.1;
  
  // Set feedback gains for realistic reverb decay
  gain1.gain.value = 0.25 * adjustedAmount;
  gain2.gain.value = 0.18 * adjustedAmount;
  gain3.gain.value = 0.12 * adjustedAmount; 
  gain4.gain.value = 0.08 * adjustedAmount;
  
  // Connect nodes to create feedback network
  inputNode.connect(delay1);
  delay1.connect(gain1);
  gain1.connect(delay2);
  delay2.connect(gain2);
  gain2.connect(delay3);
  delay3.connect(gain3);
  gain3.connect(delay4);
  delay4.connect(gain4);
  
  // Add filtering for more natural reverb based on violin type
  const lpFilter = context.createBiquadFilter();
  const hpFilter = context.createBiquadFilter();
  createdNodes.push(lpFilter, hpFilter);
  
  lpFilter.type = 'lowpass';
  hpFilter.type = 'highpass';
  
  // Customize filter characteristics based on violin type
  switch(violinType) {
    case 'baroque':
      lpFilter.frequency.value = 3200;
      hpFilter.frequency.value = 120;
      break;
    case 'classical':
      lpFilter.frequency.value = 3500;
      hpFilter.frequency.value = 130;
      break;
    case 'electric':
      lpFilter.frequency.value = 4000;
      hpFilter.frequency.value = 150;
      break;
    case 'synth':
      lpFilter.frequency.value = 4200;
      hpFilter.frequency.value = 180;
      break;
    case 'fiddle':
      lpFilter.frequency.value = 3800;
      hpFilter.frequency.value = 140;
      break;
    case 'hardanger':
      lpFilter.frequency.value = 3300;
      hpFilter.frequency.value = 110;
      break;
    default:
      lpFilter.frequency.value = 3500;
      hpFilter.frequency.value = 120;
  }
  
  gain4.connect(lpFilter);
  lpFilter.connect(hpFilter);
  
  // Connect all delay outputs to destination for a richer sound
  delay1.connect(context.destination);
  delay2.connect(context.destination);
  delay3.connect(context.destination);
  hpFilter.connect(context.destination);
  
  // Create a function to stop the effect and clean up all nodes
  const stopEffect = () => {
    try {
      // Gracefully reduce gain to avoid clicks
      const currentTime = context.currentTime;
      gain1.gain.setValueAtTime(gain1.gain.value, currentTime);
      gain2.gain.setValueAtTime(gain2.gain.value, currentTime);
      gain3.gain.setValueAtTime(gain3.gain.value, currentTime);
      gain4.gain.setValueAtTime(gain4.gain.value, currentTime);
      
      // Gradual fade out
      gain1.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.4);
      gain2.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.4);
      gain3.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.4);
      gain4.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.4);
      
      // Disconnect all nodes after the fade out completes
      setTimeout(() => {
        createdNodes.forEach(node => {
          try {
            node.disconnect();
          } catch (e) {
            console.error("Error disconnecting reverb node:", e);
          }
        });
      }, 450); // Longer timeout to allow for full reverb tail
    } catch (e) {
      console.error("Error stopping reverb effect:", e);
    }
  };
  
  return { nodes: createdNodes, stopEffect };
};
