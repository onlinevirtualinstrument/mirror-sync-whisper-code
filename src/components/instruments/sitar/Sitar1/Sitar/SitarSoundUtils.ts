import { sitarVariants } from './SitarVariants';

export const createSitarSound = (
  audioContext: AudioContext,
  note: string,
  frequency: number,
  volume: number,
  isMuted: boolean,
  sitarVariantId: string,
  detune: number = 0
) => {
  if (!audioContext || isMuted) return null;
  
  const variant = sitarVariants[sitarVariantId] || sitarVariants.standard;
  const soundProfile = variant.soundProfile;
  
  // Create oscillators for rich sitar sound
  const oscillators: OscillatorNode[] = [];
  const gainNodes: GainNode[] = [];
  
  // Create filter for tone shaping
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = soundProfile.filterFreq;
  filter.Q.value = soundProfile.resonance;
  
  // Master gain node
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0;
  
  // Create oscillators for each harmonic
  soundProfile.harmonics.forEach((harmonic, i) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = soundProfile.oscTypes[i % soundProfile.oscTypes.length];
    oscillator.frequency.value = frequency * harmonic;
    oscillator.detune.value = detune * (i + 1);
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = soundProfile.harmonicGains[i] || 0.1;
    
    oscillator.connect(gainNode);
    gainNode.connect(filter);
    
    oscillators.push(oscillator);
    gainNodes.push(gainNode);
  });
  
  // Create a modulator for sitar-like effect
  const modulator = audioContext.createOscillator();
  modulator.frequency.value = soundProfile.modulationFreq;
  
  const modulationGain = audioContext.createGain();
  modulationGain.gain.value = soundProfile.modulationAmount;
  
  modulator.connect(modulationGain);
  
  // Connect modulation to main oscillator frequencies
  oscillators.forEach(osc => {
    modulationGain.connect(osc.frequency);
  });
  
  // Add distortion if needed
  if (soundProfile.distortionAmount > 0) {
    const distortion = audioContext.createWaveShaper();
    distortion.curve = makeDistortionCurve(soundProfile.distortionAmount);
    distortion.oversample = '4x';
    
    filter.connect(distortion);
    distortion.connect(masterGain);
  } else {
    filter.connect(masterGain);
  }
  
  // Add reverb
  addReverb(audioContext, masterGain, soundProfile.reverbAmount);
  
  // Connect to destination
  masterGain.connect(audioContext.destination);
  
  // Envelope for sitar-like sound with a sharp attack and long decay
  masterGain.gain.setValueAtTime(0, audioContext.currentTime);
  masterGain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + soundProfile.attackTime);
  masterGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + soundProfile.releaseTime);
  
  // Start all oscillators
  oscillators.forEach(osc => osc.start());
  modulator.start();
  
  // Return cleanup function
  return {
    stop: () => {
      oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          console.log("Error stopping oscillator", e);
        }
      });
      try {
        modulator.stop();
      } catch (e) {
        console.log("Error stopping modulator", e);
      }
    },
    duration: soundProfile.releaseTime * 1000
  };
};

// Add the missing playSitarString function
export const playSitarString = (
  audioContext: AudioContext,
  frequency: number,
  volume: number,
  sitarVariantId: string,
  onFinish: () => void
) => {
  const sound = createSitarSound(audioContext, '', frequency, volume, false, sitarVariantId);
  
  if (sound) {
    // Set timeout to call onFinish when the sound is done
    setTimeout(() => {
      onFinish();
    }, sound.duration);
  }
  
  return sound;
};

// Helper function for distortion
export const makeDistortionCurve = (amount: number) => {
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < n_samples; i++) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  
  return curve;
};

// Add reverb to the signal path
export const addReverb = (
  audioContext: AudioContext,
  sourceNode: AudioNode,
  reverbAmount: number
) => {
  const convolver = audioContext.createConvolver();
  const reverbGain = audioContext.createGain();
  reverbGain.gain.value = reverbAmount;
  
  // Create simple reverb impulse
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * 2;
  const impulse = audioContext.createBuffer(2, length, sampleRate);
  const impulseL = impulse.getChannelData(0);
  const impulseR = impulse.getChannelData(1);
  
  for (let i = 0; i < length; i++) {
    const n = i / length;
    impulseL[i] = (Math.random() * 2 - 1) * Math.exp(-n * 3);
    impulseR[i] = (Math.random() * 2 - 1) * Math.exp(-n * 3);
  }
  
  convolver.buffer = impulse;
  
  // Connect through reverb
  const dryGain = audioContext.createGain();
  dryGain.gain.value = 0.8;
  
  sourceNode.connect(dryGain);
  sourceNode.connect(convolver);
  convolver.connect(reverbGain);
  
  dryGain.connect(audioContext.destination);
  reverbGain.connect(audioContext.destination);
};
