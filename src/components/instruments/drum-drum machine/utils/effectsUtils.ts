
// Audio context for processing
let audioContext: AudioContext | null = null;

// Initialize audio context if needed
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Effect nodes cache
const effectNodes: {
  [padId: string]: {
    source?: AudioBufferSourceNode;
    gainNode?: GainNode;
    reverbNode?: ConvolverNode;
    delayNode?: DelayNode;
    distortionNode?: WaveShaperNode;
    eqLow?: BiquadFilterNode;
    eqMid?: BiquadFilterNode;
    eqHigh?: BiquadFilterNode;
  };
} = {};

// Create a convolver (reverb) impulse response
const createReverbImpulse = (duration = 2, decay = 2, reverse = false) => {
  const ctx = getAudioContext();
  const rate = ctx.sampleRate;
  const length = rate * duration;
  const impulse = ctx.createBuffer(2, length, rate);
  
  for (let channel = 0; channel < 2; channel++) {
    const impulseData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const n = reverse ? length - i : i;
      impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
  }
  
  return impulse;
};

// Create distortion curve for the waveshaper
const createDistortionCurve = (amount = 50) => {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < samples; ++i) {
    const x = i * 2 / samples - 1;
    // Convert linear value to exponential curve with adjustable amount
    curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
  }
  
  return curve;
};

// Setup audio nodes for a pad
export const setupAudioEffects = (padId: string, audioBuffer: AudioBuffer) => {
  const ctx = getAudioContext();
  
  // Create nodes if they don't exist for this pad
  if (!effectNodes[padId]) {
    effectNodes[padId] = {
      gainNode: ctx.createGain(),
      reverbNode: ctx.createConvolver(),
      delayNode: ctx.createDelay(2.0),
      distortionNode: ctx.createWaveShaper(),
      eqLow: ctx.createBiquadFilter(),
      eqMid: ctx.createBiquadFilter(),
      eqHigh: ctx.createBiquadFilter(),
    };
    
    // Setup reverb impulse
    const reverbNode = effectNodes[padId].reverbNode;
    if (reverbNode) {
      reverbNode.buffer = createReverbImpulse();
    }
    
    // Setup delay feedback
    const delayNode = effectNodes[padId].delayNode;
    if (delayNode) {
      const feedbackGain = ctx.createGain();
      feedbackGain.gain.value = 0.3;
      delayNode.connect(feedbackGain);
      feedbackGain.connect(delayNode);
    }
    
    // Setup distortion
    const distortionNode = effectNodes[padId].distortionNode;
    if (distortionNode) {
      distortionNode.curve = createDistortionCurve();
      distortionNode.oversample = '4x';
    }
    
    // Setup EQ bands
    const eqLow = effectNodes[padId].eqLow;
    if (eqLow) {
      eqLow.type = 'lowshelf';
      eqLow.frequency.value = 320;
      eqLow.gain.value = 0;
    }
    
    const eqMid = effectNodes[padId].eqMid;
    if (eqMid) {
      eqMid.type = 'peaking';
      eqMid.frequency.value = 1000;
      eqMid.Q.value = 0.5;
      eqMid.gain.value = 0;
    }
    
    const eqHigh = effectNodes[padId].eqHigh;
    if (eqHigh) {
      eqHigh.type = 'highshelf';
      eqHigh.frequency.value = 3200;
      eqHigh.gain.value = 0;
    }
  }
  
  return effectNodes[padId];
};

// Apply effects to audio
export const applyEffects = (
  padId: string, 
  audioBuffer: AudioBuffer, 
  volume: number,
  speed: number,
  effectSettings: {
    reverb: { enabled: boolean; value: number };
    delay: { enabled: boolean; value: number };
    distortion: { enabled: boolean; value: number };
    eq: { low: number; mid: number; high: number };
  }
) => {
  const ctx = getAudioContext();
  
  // Stop any currently playing sound for this pad
  if (effectNodes[padId]?.source) {
    try {
      const source = effectNodes[padId].source;
      if (source) {
        source.stop();
      }
    } catch (e) {
      // Already stopped
    }
  }
  
  // Create and setup nodes
  const nodes = setupAudioEffects(padId, audioBuffer);
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = speed;
  nodes.source = source;
  
  // Set volume
  const gainNode = nodes.gainNode;
  if (gainNode) {
    gainNode.gain.value = volume;
  }
  
  // Get first and last node in chain for connections
  let lastNode: AudioNode = source;
  
  // Connect EQ if any band has a non-zero value
  if (effectSettings.eq.low !== 0 || effectSettings.eq.mid !== 0 || effectSettings.eq.high !== 0) {
    const eqLow = nodes.eqLow;
    const eqMid = nodes.eqMid;
    const eqHigh = nodes.eqHigh;
    
    if (eqLow && eqMid && eqHigh) {
      eqLow.gain.value = effectSettings.eq.low;
      eqMid.gain.value = effectSettings.eq.mid;
      eqHigh.gain.value = effectSettings.eq.high;
      
      lastNode.connect(eqLow);
      eqLow.connect(eqMid);
      eqMid.connect(eqHigh);
      lastNode = eqHigh;
    }
  }
  
  // Connect reverb if enabled
  if (effectSettings.reverb.enabled && nodes.reverbNode && nodes.gainNode) {
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = effectSettings.reverb.value / 100;
    
    lastNode.connect(reverbGain);
    reverbGain.connect(nodes.reverbNode);
    nodes.reverbNode.connect(nodes.gainNode);
  }
  
  // Connect delay if enabled
  if (effectSettings.delay.enabled && nodes.delayNode && nodes.gainNode) {
    const delayGain = ctx.createGain();
    delayGain.gain.value = effectSettings.delay.value / 100;
    
    if (nodes.delayNode) {
      nodes.delayNode.delayTime.value = 0.3; // 300ms delay
      
      lastNode.connect(delayGain);
      delayGain.connect(nodes.delayNode);
      nodes.delayNode.connect(nodes.gainNode);
    }
  }
  
  // Connect distortion if enabled
  if (effectSettings.distortion.enabled && nodes.distortionNode) {
    const distortionAmount = effectSettings.distortion.value;
    nodes.distortionNode.curve = createDistortionCurve(distortionAmount);
    
    lastNode.connect(nodes.distortionNode);
    lastNode = nodes.distortionNode;
  }
  
  // Connect remaining nodes to gain node (which connects to destination)
  if (nodes.gainNode) {
    lastNode.connect(nodes.gainNode);
    nodes.gainNode.connect(ctx.destination);
  }
  
  // Play the sound
  source.start(0);
  
  return source;
};

// Update effect setting
export const updateEffect = (effect: string, value: number) => {
  // This would update global effect settings
  console.log(`Effect ${effect} updated to ${value}`);
};

// Clean up audio nodes
export const cleanupAudioEffects = (padId: string) => {
  if (effectNodes[padId]?.source) {
    try {
      const source = effectNodes[padId].source;
      if (source) {
        source.stop();
      }
    } catch (e) {
      // Already stopped
    }
  }
  
  // Remove references
  delete effectNodes[padId];
};
