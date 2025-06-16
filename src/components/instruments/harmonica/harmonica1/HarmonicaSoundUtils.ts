
import { harmonicaVariants } from './HarmonicaVariants';

export const playHarmonicaHole = (
  audioContext: AudioContext,
  hole: number,
  holeProps: any,
  harmonicaVariantId: string,
  callback: () => void
) => {
  if (!audioContext) return { stop: () => {} };
  
  const variant = harmonicaVariants[harmonicaVariantId] || harmonicaVariants.standard;
  const soundProfile = variant.soundProfile;
  
  const frequency = holeProps.freq;
  const hasTremolo = holeProps.tremoloRate !== undefined;
  const waveform = holeProps.waveform || soundProfile.waveform;
  const harmonicRichness = holeProps.harmonicRichness || soundProfile.harmonicRichness;
  const breathiness = holeProps.breathiness || soundProfile.breathiness;
  const bendRange = holeProps.bendRange || soundProfile.bendRange;
  
  // Create oscillators for harmonica sound with multiple layers
  const mainOsc = audioContext.createOscillator();
  mainOsc.type = waveform as OscillatorType;
  mainOsc.frequency.value = frequency;
  
  // Second oscillator for richer sound
  const secondOsc = audioContext.createOscillator();
  secondOsc.type = 'square';
  secondOsc.frequency.value = frequency * (1 + bendRange);
  
  // Third oscillator for breath sound
  const breathOsc = audioContext.createOscillator();
  breathOsc.type = 'sawtooth';
  breathOsc.frequency.value = frequency * 2;
  
  // Create noise generator for breathiness
  const noiseBufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, noiseBufferSize, audioContext.sampleRate);
  const noiseOutput = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBufferSize; i++) {
    noiseOutput[i] = Math.random() * 2 - 1;
  }
  
  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;
  
  // Gain nodes for envelope control and mixing
  const mainGain = audioContext.createGain();
  const secondGain = audioContext.createGain();
  const breathGain = audioContext.createGain();
  const noiseGain = audioContext.createGain();
  const masterGain = audioContext.createGain();
  
  // Filters for shaping the sound
  const mainFilter = audioContext.createBiquadFilter();
  mainFilter.type = 'lowpass';
  
  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  
  // Apply variant-specific settings
  mainGain.gain.value = soundProfile.mainGain;
  secondGain.gain.value = soundProfile.secondGain * harmonicRichness;
  breathGain.gain.value = soundProfile.breathGain * breathiness;
  noiseGain.gain.value = soundProfile.noiseGain * breathiness;
  
  mainFilter.frequency.value = soundProfile.filterFrequency;
  mainFilter.Q.value = soundProfile.filterQ;
  
  noiseFilter.frequency.value = soundProfile.filterFrequency;
  noiseFilter.Q.value = soundProfile.filterQ / 1.5;
  
  // Connect oscillators through respective gain nodes
  mainOsc.connect(mainGain);
  secondOsc.connect(secondGain);
  breathOsc.connect(breathGain);
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  
  // Connect all sources to the main filter
  mainGain.connect(mainFilter);
  secondGain.connect(mainFilter);
  breathGain.connect(mainFilter);
  noiseGain.connect(mainFilter);
  
  // Connect filter to master gain
  mainFilter.connect(masterGain);
  
  // Connect master gain to output
  masterGain.connect(audioContext.destination);
  
  // Apply envelope
  masterGain.gain.setValueAtTime(0, audioContext.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.1);
  
  // Add vibrato for harmonica-like effect
  const vibratoOsc = audioContext.createOscillator();
  
  // Adjust vibrato based on variant
  let vibratoRate = soundProfile.vibratoRate;
  let vibratoDepth = soundProfile.vibratoDepth;
  
  if (hasTremolo) {
    vibratoRate = holeProps.tremoloRate || vibratoRate;
    vibratoDepth = holeProps.tremoloDepth || vibratoDepth;
  }
  
  vibratoOsc.frequency.value = vibratoRate;
  
  const vibratoGain = audioContext.createGain();
  vibratoGain.gain.value = vibratoDepth;
  
  vibratoOsc.connect(vibratoGain);
  vibratoGain.connect(mainOsc.frequency);
  vibratoGain.connect(secondOsc.frequency);
  
  // Add pitch bend effect for blues
  if (harmonicaVariantId === 'blues' && bendRange > 0) {
    mainOsc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    mainOsc.frequency.linearRampToValueAtTime(
      frequency * (1 - bendRange/2), 
      audioContext.currentTime + 0.3
    );
    mainOsc.frequency.linearRampToValueAtTime(
      frequency, 
      audioContext.currentTime + 0.6
    );
  }
  
  // Start all sound sources
  mainOsc.start();
  secondOsc.start();
  breathOsc.start();
  noiseSource.start();
  vibratoOsc.start();
  
  // Return object with stop function
  return {
    stop: () => {
      // Gradual release
      masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      // Stop all sources after release
      setTimeout(() => {
        try {
          mainOsc.stop();
          secondOsc.stop();
          breathOsc.stop();
          noiseSource.stop();
          vibratoOsc.stop();
          callback();
        } catch (e) {
          console.log("Error stopping oscillators", e);
          callback();
        }
      }, 500);
    }
  };
};
