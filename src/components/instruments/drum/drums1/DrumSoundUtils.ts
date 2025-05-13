
// Sound generation utilities for different drum types

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

export const generateKickSound = (audioCtx: AudioContext, gainNode: GainNode, toneQuality: number, drumKitType: string) => {
  const osc = audioCtx.createOscillator();
  let baseFreq = 150;
  let duration = 0.5;
  
  switch (drumKitType) {
    case 'rock':
      baseFreq = 80;
      duration = 0.6;
      break;
    case 'jazz':
      baseFreq = 100;
      duration = 0.35;
      break;
    case 'electronic':
      baseFreq = 60;
      duration = 0.7;
      break;
    case 'indian':
      baseFreq = 120;
      duration = 0.4;
      break;
    default:
      baseFreq = 150;
      duration = 0.5;
  }
  
  osc.frequency.setValueAtTime(baseFreq * (0.8 + toneQuality * 0.4), audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  osc.connect(gainNode);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const generateSnareSound = (audioCtx: AudioContext, gainNode: GainNode, toneQuality: number, drumKitType: string) => {
  const bufferSize = audioCtx.sampleRate * 0.5;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  
  let filterFreq = 1000;
  let oscFreq = 180;
  let duration = 0.2;
  
  switch (drumKitType) {
    case 'rock':
      filterFreq = 800;
      oscFreq = 150;
      duration = 0.25;
      break;
    case 'jazz':
      filterFreq = 1200;
      oscFreq = 200;
      duration = 0.15;
      break;
    case 'electronic':
      filterFreq = 1500;
      oscFreq = 100;
      duration = 0.3;
      break;
    case 'indian':
      filterFreq = 1800;
      oscFreq = 220;
      duration = 0.18;
      break;
    default:
      filterFreq = 1000;
      oscFreq = 180;
      duration = 0.2;
  }
  
  noiseFilter.frequency.value = filterFreq + toneQuality * 2000;
  
  noise.connect(noiseFilter);
  noiseFilter.connect(gainNode);
  
  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = oscFreq * (0.8 + toneQuality * 0.4);
  
  const oscGain = audioCtx.createGain();
  oscGain.gain.setValueAtTime(0.7, audioCtx.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  osc.connect(oscGain);
  oscGain.connect(gainNode);
  
  noise.start();
  osc.start();
  noise.stop(audioCtx.currentTime + duration);
  osc.stop(audioCtx.currentTime + duration);
};

export const generateHiHatSound = (audioCtx: AudioContext, gainNode: GainNode, toneQuality: number, drumKitType: string) => {
  const bufferSize = audioCtx.sampleRate * 0.2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  const hihatFilter = audioCtx.createBiquadFilter();
  hihatFilter.type = 'highpass';
  
  let filterFreq = 7000;
  let duration = 0.1;
  
  switch (drumKitType) {
    case 'rock':
      filterFreq = 6000;
      duration = 0.12;
      break;
    case 'jazz':
      filterFreq = 8000;
      duration = 0.08;
      break;
    case 'electronic':
      filterFreq = 9000;
      duration = 0.15;
      break;
    case 'indian':
      filterFreq = 7500;
      duration = 0.09;
      break;
    default:
      filterFreq = 7000;
      duration = 0.1;
  }
  
  hihatFilter.frequency.value = filterFreq + toneQuality * 3000;
  
  noise.connect(hihatFilter);
  
  const envelopeGain = audioCtx.createGain();
  envelopeGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  envelopeGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  hihatFilter.connect(envelopeGain);
  envelopeGain.connect(gainNode);
  
  noise.start();
  noise.stop(audioCtx.currentTime + duration);
};

export const generateTomSound = (audioCtx: AudioContext, gainNode: GainNode, baseFreq: number, toneQuality: number, drumKitType: string) => {
  const osc = audioCtx.createOscillator();
  
  let freqMultiplier = 1.0;
  let duration = 0.4;
  let oscType: OscillatorType = 'sine';
  
  switch (drumKitType) {
    case 'rock':
      freqMultiplier = 0.9;
      duration = 0.5;
      oscType = 'triangle';
      break;
    case 'jazz':
      freqMultiplier = 1.1;
      duration = 0.3;
      oscType = 'sine';
      break;
    case 'electronic':
      freqMultiplier = 0.8;
      duration = 0.6;
      oscType = 'sawtooth';
      break;
    case 'indian':
      freqMultiplier = 1.2;
      duration = 0.35;
      oscType = 'sine';
      break;
    default:
      freqMultiplier = 1.0;
      duration = 0.4;
      oscType = 'sine';
  }
  
  osc.type = oscType;
  
  const adjustedFreq = baseFreq * freqMultiplier * (0.8 + toneQuality * 0.4);
  osc.frequency.setValueAtTime(adjustedFreq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(adjustedFreq * 0.5, audioCtx.currentTime + duration);
  
  const envelope = audioCtx.createGain();
  envelope.gain.setValueAtTime(0.9, audioCtx.currentTime);
  envelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  osc.connect(envelope);
  envelope.connect(gainNode);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const generateCrashSound = (audioCtx: AudioContext, gainNode: GainNode, toneQuality: number, drumKitType: string) => {
  const bufferSize = audioCtx.sampleRate * 1.5;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  const crashFilter = audioCtx.createBiquadFilter();
  crashFilter.type = 'bandpass';
  
  let filterFreq = 3000;
  let filterQ = 1;
  let duration = 1.0;
  
  switch (drumKitType) {
    case 'rock':
      filterFreq = 2500;
      filterQ = 0.8;
      duration = 1.2;
      break;
    case 'jazz':
      filterFreq = 3500;
      filterQ = 1.2;
      duration = 0.9;
      break;
    case 'electronic':
      filterFreq = 4000;
      filterQ = 2;
      duration = 1.4;
      break;
    case 'indian':
      filterFreq = 3200;
      filterQ = 1.5;
      duration = 0.8;
      break;
    default:
      filterFreq = 3000;
      filterQ = 1;
      duration = 1.0;
  }
  
  crashFilter.frequency.value = filterFreq + toneQuality * 3000;
  crashFilter.Q.value = filterQ;
  
  noise.connect(crashFilter);
  
  const envelope = audioCtx.createGain();
  envelope.gain.setValueAtTime(0.5, audioCtx.currentTime);
  envelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  crashFilter.connect(envelope);
  envelope.connect(gainNode);
  
  noise.start();
  noise.stop(audioCtx.currentTime + duration);
};

export const generateRideSound = (audioCtx: AudioContext, gainNode: GainNode, toneQuality: number, drumKitType: string) => {
  const bufferSize = audioCtx.sampleRate * 1.5;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  const rideFilter = audioCtx.createBiquadFilter();
  rideFilter.type = 'bandpass';
  
  let filterFreq = 5000;
  let filterQ = 2;
  let duration = 1.2;
  
  switch (drumKitType) {
    case 'rock':
      filterFreq = 4500;
      filterQ = 1.8;
      duration = 1.4;
      break;
    case 'jazz':
      filterFreq = 5500;
      filterQ = 2.2;
      duration = 1.6;
      break;
    case 'electronic':
      filterFreq = 6000;
      filterQ = 3;
      duration = 1.0;
      break;
    case 'indian':
      filterFreq = 5200;
      filterQ = 2.5;
      duration = 1.1;
      break;
    default:
      filterFreq = 5000;
      filterQ = 2;
      duration = 1.2;
  }
  
  rideFilter.frequency.value = filterFreq + toneQuality * 2000;
  rideFilter.Q.value = filterQ;
  
  noise.connect(rideFilter);
  
  const envelope = audioCtx.createGain();
  envelope.gain.setValueAtTime(0.3, audioCtx.currentTime);
  envelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  rideFilter.connect(envelope);
  envelope.connect(gainNode);
  
  noise.start();
  noise.stop(audioCtx.currentTime + duration);
};

export const generatePedalSound = (audioCtx: AudioContext, gainNode: GainNode, toneQuality: number, drumKitType: string) => {
  const osc = audioCtx.createOscillator();
  
  let baseFreq = 80;
  let duration = 0.3;
  let oscType: OscillatorType = 'sine';
  
  switch (drumKitType) {
    case 'rock':
      baseFreq = 60;
      duration = 0.4;
      oscType = 'triangle';
      break;
    case 'jazz':
      baseFreq = 90;
      duration = 0.25;
      oscType = 'sine';
      break;
    case 'electronic':
      baseFreq = 50;
      duration = 0.5;
      oscType = 'sawtooth';
      break;
    case 'indian':
      baseFreq = 100;
      duration = 0.2;
      oscType = 'sine';
      break;
    default:
      baseFreq = 80;
      duration = 0.3;
      oscType = 'sine';
  }
  
  osc.type = oscType;
  osc.frequency.setValueAtTime(baseFreq * (0.8 + toneQuality * 0.4), audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + duration);
  
  const envelope = audioCtx.createGain();
  envelope.gain.setValueAtTime(0.8, audioCtx.currentTime);
  envelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  osc.connect(envelope);
  envelope.connect(gainNode);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};
