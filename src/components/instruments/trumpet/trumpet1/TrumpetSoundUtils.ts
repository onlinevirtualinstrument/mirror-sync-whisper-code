
import { trumpetVariants } from './TrumpetVariants';

export const createReverb = async (audioCtx: AudioContext): Promise<ConvolverNode> => {
  const convolver = audioCtx.createConvolver();
  
  const sampleRate = audioCtx.sampleRate;
  const length = sampleRate * 2;
  const impulse = audioCtx.createBuffer(2, length, sampleRate);
  const impulseL = impulse.getChannelData(0);
  const impulseR = impulse.getChannelData(1);
  
  for (let i = 0; i < length; i++) {
    const n = i / length;
    const decay = Math.exp(-n * 6);
    impulseL[i] = (Math.random() * 2 - 1) * decay;
    impulseR[i] = (Math.random() * 2 - 1) * decay;
  }
  
  convolver.buffer = impulse;
  return convolver;
};

export const generateTrumpetSound = (
  audioContext: AudioContext,
  frequency: number, 
  volume: number,
  reverbLevel: number,
  toneQuality: number,
  variantId: string,
  reverbNode: ConvolverNode | null,
  activeNotes: Set<number>,
  setActiveNotes: React.Dispatch<React.SetStateAction<Set<number>>>
) => {
  try {
    // Get variant settings from imported object directly
    const variant = trumpetVariants[variantId] || trumpetVariants.standard;
    
    console.log("Generating trumpet sound", { frequency, volume, variantId });
    
    // Create oscillators for trumpet sound
    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];
    
    // Create main oscillators based on harmonic ratios
    variant.soundProfile.harmonicRatios.forEach((ratio: number, index: number) => {
      const osc = audioContext.createOscillator();
      osc.type = variant.soundProfile.oscillatorTypes[index] || 'sine';
      osc.frequency.value = frequency * ratio;
      
      // Apply slight detune for brassy sound - unique per variant
      osc.detune.value = Math.random() * variant.soundProfile.detune * 2 - variant.soundProfile.detune;
      
      const gainNode = audioContext.createGain();
      // Each harmonic gets progressively quieter - with variant-specific curve
      const harmonicVolume = 1 / (index + 1) * 0.8;
      gainNode.gain.value = harmonicVolume * (variant.id === 'piccolo' ? 1.2 : 
                                             variant.id === 'flugelhorn' ? 0.9 : 1.0);
      
      // Connect oscillator to its gain node
      osc.connect(gainNode);
      
      oscillators.push(osc);
      gainNodes.push(gainNode);
    });
    
    // Create bandpass filter for trumpet brilliance - different for each variant
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    
    // Each variant has a different filter setting to create its unique tone
    switch(variant.id) {
      case 'standard':
        filter.frequency.value = 1800 + (toneQuality * 2000);
        filter.Q.value = 1 + (variant.soundProfile.brightness / 10) + (toneQuality * 2);
        break;
      case 'cornet':
        filter.frequency.value = 1500 + (toneQuality * 1500);
        filter.Q.value = 0.8 + (variant.soundProfile.brightness / 12) + (toneQuality * 1.5);
        break;
      case 'piccolo':
        filter.frequency.value = 2200 + (toneQuality * 2500);
        filter.Q.value = 1.2 + (variant.soundProfile.brightness / 8) + (toneQuality * 2.5);
        break;
      case 'flugelhorn':
        filter.frequency.value = 1300 + (toneQuality * 1200);
        filter.Q.value = 0.6 + (variant.soundProfile.brightness / 15) + (toneQuality * 1.2);
        break;
      default:
        filter.frequency.value = 1800 + (toneQuality * 2000);
        filter.Q.value = 1 + (variant.soundProfile.brightness / 10) + (toneQuality * 2);
    }
    
    // Create main gain node
    const mainGain = audioContext.createGain();
    
    // Connect gain nodes to filter
    gainNodes.forEach(gain => {
      gain.connect(filter);
    });
    
    // Connect filter to main gain
    filter.connect(mainGain);
    
    // Apply reverb if provided
    if (reverbNode && reverbLevel > 0) {
      const dryGain = audioContext.createGain();
      const wetGain = audioContext.createGain();
      
      dryGain.gain.value = 1 - reverbLevel * 0.5;
      wetGain.gain.value = reverbLevel * 0.5;
      
      mainGain.connect(dryGain);
      mainGain.connect(reverbNode);
      reverbNode.connect(wetGain);
      
      dryGain.connect(audioContext.destination);
      wetGain.connect(audioContext.destination);
    } else {
      mainGain.connect(audioContext.destination);
    }
    
    // Apply ADSR envelope - different for each variant
    // FIXED: Shortened sustain and added a definite end time
    const now = audioContext.currentTime;
    const sustainDuration = 0.8; // Shortened from indefinite sustain
    mainGain.gain.setValueAtTime(0, now);
    
    // Quick attack for trumpet - variant specific
    const attackTime = now + variant.soundProfile.attack;
    mainGain.gain.linearRampToValueAtTime(volume, attackTime);
    mainGain.gain.linearRampToValueAtTime(
      volume * (variant.id === 'flugelhorn' ? 0.95 : 0.9), 
      now + variant.soundProfile.attack + variant.soundProfile.decay
    );
    
    // FIXED: Add automatic fadeout after sustainDuration
    mainGain.gain.setValueAtTime(mainGain.gain.value, now + sustainDuration);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + sustainDuration + variant.soundProfile.release);
    
    // Add trumpet-like attack transient - different per variant
    if (variant.id !== 'flugelhorn') { // Flugelhorn has softer attack
      const transient = audioContext.createOscillator();
      const transientGain = audioContext.createGain();
      
      // Customize transient based on variant
      switch(variant.id) {
        case 'piccolo':
          transient.frequency.value = frequency * 1.7;
          transient.type = 'sawtooth';
          transientGain.gain.setValueAtTime(volume * 0.5, now);
          break;
        case 'cornet':
          transient.frequency.value = frequency * 1.4;
          transient.type = 'triangle';
          transientGain.gain.setValueAtTime(volume * 0.3, now);
          break;
        default:
          transient.frequency.value = frequency * 1.5;
          transient.type = 'sawtooth';
          transientGain.gain.setValueAtTime(volume * 0.4, now);
      }
      
      transientGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      transient.connect(transientGain);
      transientGain.connect(audioContext.destination);
      
      transient.start();
      transient.stop(now + 0.08);
    }
    
    console.log("Starting oscillators for trumpet sound");
    
    // Start oscillators
    oscillators.forEach(osc => osc.start());
    
    // FIXED: Set a definite end time for oscillators
    oscillators.forEach(osc => {
      try {
        osc.stop(now + sustainDuration + variant.soundProfile.release + 0.1);
      } catch (e) {
        console.log("Error scheduling oscillator stop", e);
      }
    });
    
    // Add to active notes
    activeNotes.add(frequency);
    setActiveNotes(new Set(activeNotes));
    
    console.log("Trumpet note added to active notes", Array.from(activeNotes));
    
    // Setup note release function
    const stopSound = () => {
      const releaseTime = audioContext.currentTime + variant.soundProfile.release;
      
      mainGain.gain.cancelScheduledValues(audioContext.currentTime);
      mainGain.gain.setValueAtTime(mainGain.gain.value, audioContext.currentTime);
      mainGain.gain.exponentialRampToValueAtTime(0.001, releaseTime);
      
      // FIXED: Ensure quick disconnection of nodes after release
      const cleanupTime = Math.min(variant.soundProfile.release * 1000, 300); // Maximum 300ms cleanup
      
      setTimeout(() => {
        oscillators.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (e) {
            console.log("Error stopping oscillator", e);
          }
        });
        
        gainNodes.forEach(gain => gain.disconnect());
        filter.disconnect();
        mainGain.disconnect();
        
        // Remove from active notes
        activeNotes.delete(frequency);
        setActiveNotes(new Set(activeNotes));
        
        console.log("Trumpet note removed from active notes", Array.from(activeNotes));
      }, cleanupTime);
    };
    
    // FIXED: Automatically clean up after the note's duration
    const autoCleanup = setTimeout(() => {
      if (activeNotes.has(frequency)) {
        stopSound();
      }
    }, (sustainDuration + variant.soundProfile.release + 0.2) * 1000);
    
    // Return the stop function, augmented to clear the auto-cleanup timeout
    return () => {
      clearTimeout(autoCleanup);
      stopSound();
    };
  } catch (error) {
    console.error("Error generating trumpet sound:", error);
    return () => {};
  }
};
