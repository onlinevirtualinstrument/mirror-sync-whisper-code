
import { saxophoneVariants } from './SaxophoneVariants';

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

export const generateSaxophoneSound = (
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
    const variant = saxophoneVariants[variantId] || saxophoneVariants.alto;
    
    console.log("Generating saxophone sound", { frequency, volume, variantId });
    
    // Create oscillators for rich saxophone sound
    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];
    
    // Create main oscillators based on harmonic ratios - unique per variant
    variant.soundProfile.harmonicRatios.forEach((ratio: number, index: number) => {
      const osc = audioContext.createOscillator();
      osc.type = variant.soundProfile.oscillatorTypes[index] || 'sine';
      osc.frequency.value = frequency * ratio;
      
      // Apply slight detune for richness - unique per variant
      osc.detune.value = Math.random() * variant.soundProfile.detune * 2 - variant.soundProfile.detune;
      
      const gainNode = audioContext.createGain();
      
      // Customize harmonic balance based on saxophone type
      let harmonicGain = 1 / (index + 1);
      
      switch(variant.id) {
        case 'alto':
          harmonicGain *= index === 0 ? 0.9 : index === 1 ? 0.7 : 0.5;
          break;
        case 'tenor':
          harmonicGain *= index === 0 ? 1.0 : index === 1 ? 0.8 : 0.6;
          break;
        case 'soprano':
          harmonicGain *= index === 0 ? 0.8 : index === 1 ? 0.6 : 0.4;
          break;
        case 'baritone':
          harmonicGain *= index === 0 ? 1.1 : index === 1 ? 0.85 : 0.7;
          break;
        default:
          harmonicGain *= 0.7;
      }
      
      gainNode.gain.value = harmonicGain;
      
      // Connect oscillator to its gain node
      osc.connect(gainNode);
      
      oscillators.push(osc);
      gainNodes.push(gainNode);
    });
    
    // Create filter for sax tone - different for each variant
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    
    // Customize filter based on variant
    switch(variant.id) {
      case 'alto':
        filter.frequency.value = 1000 + (toneQuality * 3000);
        filter.Q.value = 1 + (toneQuality * 10);
        break;
      case 'tenor':
        filter.frequency.value = 800 + (toneQuality * 2800);
        filter.Q.value = 1.2 + (toneQuality * 8);
        break;
      case 'soprano':
        filter.frequency.value = 1200 + (toneQuality * 3500);
        filter.Q.value = 0.8 + (toneQuality * 12);
        break;
      case 'baritone':
        filter.frequency.value = 600 + (toneQuality * 2500);
        filter.Q.value = 1.5 + (toneQuality * 7);
        break;
      default:
        filter.frequency.value = 1000 + (toneQuality * 3000);
        filter.Q.value = 1 + (toneQuality * 10);
    }
    
    // Create distortion for breath/reed simulation
    const distortion = audioContext.createWaveShaper();
    const distortionAmount = variant.soundProfile.distortion * (1 - toneQuality * 0.5);
    
    // Create distortion curve - unique per variant
    const curve = new Float32Array(audioContext.sampleRate);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < audioContext.sampleRate; i++) {
      const x = (i * 2) / audioContext.sampleRate - 1;
      
      // Customize distortion curve based on variant
      switch(variant.id) {
        case 'alto':
          curve[i] = (3 + distortionAmount) * x * 20 * deg / (Math.PI + distortionAmount * Math.abs(x));
          break;
        case 'tenor':
          curve[i] = (4 + distortionAmount) * x * 18 * deg / (Math.PI + distortionAmount * Math.abs(x));
          break;
        case 'soprano':
          curve[i] = (2.5 + distortionAmount) * x * 22 * deg / (Math.PI + distortionAmount * Math.abs(x));
          break;
        case 'baritone':
          curve[i] = (5 + distortionAmount) * x * 16 * deg / (Math.PI + distortionAmount * Math.abs(x));
          break;
        default:
          curve[i] = (3 + distortionAmount) * x * 20 * deg / (Math.PI + distortionAmount * Math.abs(x));
      }
    }
    
    distortion.curve = curve;
    
    // Connect gain nodes to filter
    gainNodes.forEach(gain => {
      gain.connect(filter);
    });
    
    // Create main gain node
    const mainGain = audioContext.createGain();
    
    // Connect filter to distortion to main gain
    filter.connect(distortion);
    distortion.connect(mainGain);
    
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
    
    // Apply ADSR envelope - unique per variant
    // FIXED: Shortened sustain duration and added a definite end time
    const now = audioContext.currentTime;
    const sustainDuration = 0.8; // Shortened from indefinite sustain
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(volume, now + variant.soundProfile.attack);
    mainGain.gain.linearRampToValueAtTime(
      volume * (variant.id === 'soprano' ? 0.75 : 
                variant.id === 'tenor' ? 0.85 : 
                variant.id === 'baritone' ? 0.9 : 0.8), 
      now + variant.soundProfile.attack + variant.soundProfile.decay
    );
    
    // FIXED: Add automatic fadeout after sustainDuration
    mainGain.gain.setValueAtTime(mainGain.gain.value, now + sustainDuration);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + sustainDuration + variant.soundProfile.release);
    
    console.log("Starting oscillators for saxophone sound");
    
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
    
    console.log("Saxophone note added to active notes", Array.from(activeNotes));
    
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
        distortion.disconnect();
        mainGain.disconnect();
        
        // Remove from active notes
        activeNotes.delete(frequency);
        setActiveNotes(new Set(activeNotes));
        
        console.log("Saxophone note removed from active notes", Array.from(activeNotes));
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
    console.error("Error generating saxophone sound:", error);
    return () => {};
  }
};
