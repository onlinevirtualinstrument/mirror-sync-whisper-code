
// Audio node utilities for effects processing
export const createReverbNode = (context: AudioContext, roomSize: number = 0.3): ConvolverNode => {
  const convolver = context.createConvolver();
  const length = context.sampleRate * roomSize;
  const impulse = context.createBuffer(2, length, context.sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }
  }
  
  convolver.buffer = impulse;
  return convolver;
};

export const createDelayNode = (context: AudioContext, delayTime: number = 0.3): DelayNode => {
  const delay = context.createDelay(1);
  delay.delayTime.setValueAtTime(delayTime, context.currentTime);
  return delay;
};

export const createDistortionNode = (context: AudioContext, amount: number = 50): WaveShaperNode => {
  const waveshaper = context.createWaveShaper();
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  
  waveshaper.curve = curve;
  waveshaper.oversample = '4x';
  return waveshaper;
};
