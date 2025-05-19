
import { useState, useCallback } from 'react';

export interface BanjoString {
  id: string;
  note: string;
  freq: number;
  key: string;
}

export const useBanjoAudio = (variant: string = 'standard') => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [activeString, setActiveString] = useState<string | null>(null);
  
  // Define strings based on the variant
  const getStringsForVariant = (variant: string): BanjoString[] => {
    switch(variant) {
      case 'tenor':
        return [
          { id: 'string1', note: 'C3', freq: 130.81, key: 'Q' },
          { id: 'string2', note: 'G3', freq: 196.00, key: 'W' },
          { id: 'string3', note: 'D4', freq: 293.66, key: 'E' },
          { id: 'string4', note: 'A4', freq: 440.00, key: 'R' }
        ];
      case 'plectrum':
        return [
          { id: 'string1', note: 'D3', freq: 146.83, key: 'Q' },
          { id: 'string2', note: 'B3', freq: 246.94, key: 'W' },
          { id: 'string3', note: 'G3', freq: 196.00, key: 'E' },
          { id: 'string4', note: 'C4', freq: 261.63, key: 'R' }
        ];
      case 'bluegrass':
        return [
          { id: 'string1', note: 'G4', freq: 392.00, key: 'Q' },
          { id: 'string2', note: 'D4', freq: 293.66, key: 'W' },
          { id: 'string3', note: 'G3', freq: 196.00, key: 'E' },
          { id: 'string4', note: 'C4', freq: 261.63, key: 'R' },
          { id: 'string5', note: 'G2', freq: 98.00, key: 'T' }
        ];
      case 'openback':
        return [
          { id: 'string1', note: 'D4', freq: 293.66, key: 'Q' },
          { id: 'string2', note: 'B3', freq: 246.94, key: 'W' },
          { id: 'string3', note: 'G3', freq: 196.00, key: 'E' },
          { id: 'string4', note: 'D3', freq: 146.83, key: 'R' },
          { id: 'string5', note: 'A2', freq: 110.00, key: 'T' }
        ];
      default: // standard 5-string
        return [
          { id: 'string1', note: 'G4', freq: 392.00, key: 'Q' },
          { id: 'string2', note: 'D4', freq: 293.66, key: 'W' },
          { id: 'string3', note: 'G3', freq: 196.00, key: 'E' },
          { id: 'string4', note: 'B3', freq: 246.94, key: 'R' },
          { id: 'string5', note: 'D3', freq: 146.83, key: 'T' }
        ];
    }
  };
  
  const strings = getStringsForVariant(variant);
  
  const playString = useCallback((stringId: string) => {
    // Initialize audio context if not already done
    if (!audioContext) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      setAudioContext(new AudioContext());
      return;
    }
    
    // Find the string with the matching ID
    const stringToPlay = strings.find(s => s.id === stringId);
    if (!stringToPlay) return;
    
    setActiveString(stringId);
    
    // Create oscillator for main tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Create secondary oscillator for brightness/harmonics
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    
    // Create noise component for characteristic attack
    const noiseNode = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    const noiseFilter = audioContext.createBiquadFilter();
    
    // Generate noise buffer
    const bufferSize = audioContext.sampleRate * 0.2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    noiseNode.buffer = noiseBuffer;
    
    // Parameters based on banjo variant
    let mainOscType: OscillatorType = 'triangle';
    let secondOscType: OscillatorType = 'triangle';
    let attackTime = 0.01;
    let decayTime = 0.2;
    let releaseTime = 1.5;
    let mainGain = 0.8;
    let secondOscGain = 0.15;
    let secondOscFreqRatio = 3.0;
    let noiseAmount = 0.15;
    let filterFreq = 1000;
    let filterQ = 2;
    let distortionAmount = 20;
    let roomSize = 0.1;
    
    switch(variant) {
      case 'tenor':
        mainOscType = 'triangle';
        secondOscType = 'sine';
        attackTime = 0.02;
        decayTime = 0.25;
        releaseTime = 1.8;
        mainGain = 0.7;
        secondOscGain = 0.12;
        secondOscFreqRatio = 2.0;
        noiseAmount = 0.1;
        filterFreq = 900;
        filterQ = 1.5;
        distortionAmount = 15;
        roomSize = 0.15;
        break;
        
      case 'plectrum':
        mainOscType = 'triangle';
        secondOscType = 'triangle';
        attackTime = 0.01;
        decayTime = 0.15;
        releaseTime = 1.4;
        mainGain = 0.85;
        secondOscGain = 0.2;
        secondOscFreqRatio = 2.5;
        noiseAmount = 0.18;
        filterFreq = 1200;
        filterQ = 2.5;
        distortionAmount = 25;
        roomSize = 0.08;
        break;
        
      case 'bluegrass':
        mainOscType = 'sawtooth';
        secondOscType = 'square';
        attackTime = 0.005;
        decayTime = 0.1;
        releaseTime = 1.2;
        mainGain = 0.9;
        secondOscGain = 0.25;
        secondOscFreqRatio = 3.0;
        noiseAmount = 0.22;
        filterFreq = 1800;
        filterQ = 3;
        distortionAmount = 40;
        roomSize = 0.05;
        break;
        
      case 'openback':
        mainOscType = 'triangle';
        secondOscType = 'sine';
        attackTime = 0.03;
        decayTime = 0.3;
        releaseTime = 2.0;
        mainGain = 0.65;
        secondOscGain = 0.1;
        secondOscFreqRatio = 1.5;
        noiseAmount = 0.08;
        filterFreq = 800;
        filterQ = 1;
        distortionAmount = 10;
        roomSize = 0.2;
        break;
    }
    
    // Set up main oscillator
    oscillator.type = mainOscType;
    oscillator.frequency.value = stringToPlay.freq;
    
    // Set up secondary oscillator for brightness
    oscillator2.type = secondOscType;
    oscillator2.frequency.value = stringToPlay.freq * secondOscFreqRatio;
    gainNode2.gain.value = secondOscGain;
    
    // Set up noise for attack character
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = filterFreq;
    noiseFilter.Q.value = filterQ;
    noiseGain.gain.value = noiseAmount;
    
    // Set up distortion for characteristic banjo timbre
    const distortion = audioContext.createWaveShaper();
    function makeDistortionCurve(amount: number) {
      const k = amount;
      const samples = 44100;
      const curve = new Float32Array(samples);
      const deg = Math.PI / 180;
      
      for (let i = 0; i < samples; ++i) {
        const x = (i * 2) / samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
      }
      
      return curve;
    }
    
    distortion.curve = makeDistortionCurve(distortionAmount);
    distortion.oversample = '4x';
    
    // Create envelope for main tone
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(mainGain, audioContext.currentTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(mainGain * 0.3, audioContext.currentTime + attackTime + decayTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + attackTime + decayTime + releaseTime);
    
    // Envelope for secondary oscillator
    gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode2.gain.linearRampToValueAtTime(secondOscGain, audioContext.currentTime + attackTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + attackTime + decayTime + releaseTime * 0.7);
    
    // Envelope for noise component
    noiseGain.gain.setValueAtTime(noiseAmount, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + attackTime + 0.1);
    
    // Create simple reverb
    const convolver = audioContext.createConvolver();
    const reverbGain = audioContext.createGain();
    reverbGain.gain.value = roomSize;
    
    // Simple impulse response 
    const reverbTime = roomSize * 2;
    const decay = 0.1;
    const impulseLength = audioContext.sampleRate * reverbTime;
    const impulse = audioContext.createBuffer(2, impulseLength, audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const impulseData = impulse.getChannelData(channel);
        for (let i = 0; i < impulseLength; i++) {
            impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, decay);
        }
    }
    
    convolver.buffer = impulse;
    
    // Connect the signal path
    oscillator.connect(distortion);
    distortion.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);
    
    // Add reverb path
    gainNode.connect(convolver);
    gainNode2.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(audioContext.destination);
    
    // Start all sounds
    oscillator.start();
    oscillator2.start();
    noiseNode.start();
    
    // Stop the sounds
    const stopTime = audioContext.currentTime + attackTime + decayTime + releaseTime;
    oscillator.stop(stopTime);
    oscillator2.stop(stopTime);
    noiseNode.stop(audioContext.currentTime + attackTime + 0.1);
    
    // Clear active string after sound finishes
    setTimeout(() => setActiveString(null), (attackTime + decayTime + releaseTime) * 1000);
  }, [audioContext, strings]);
  
  return {
    strings,
    activeString,
    playString
  };
};
