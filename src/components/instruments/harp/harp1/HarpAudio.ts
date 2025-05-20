
import { useState, useCallback } from 'react';

export interface HarpString {
  id: string;
  note: string;
  freq: number;
  key: string;
  length: number;
}

export const useHarpAudio = (variant: string = 'standard') => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [activeString, setActiveString] = useState<string | null>(null);
  
  // Define strings based on the variant
  const getStringsForVariant = (variant: string): HarpString[] => {
    const baseNotes = [
      { note: 'C4', freq: 261.63, key: 'A' },
      { note: 'D4', freq: 293.66, key: 'S' },
      { note: 'E4', freq: 329.63, key: 'D' },
      { note: 'F4', freq: 349.23, key: 'F' },
      { note: 'G4', freq: 392.00, key: 'G' },
      { note: 'A4', freq: 440.00, key: 'H' },
      { note: 'B4', freq: 493.88, key: 'J' },
      { note: 'C5', freq: 523.25, key: 'K' }
    ];
    
    let strings: HarpString[] = [];
    let freqMultiplier = 1.0;
    
    switch(variant) {
      case 'celtic':
        freqMultiplier = 0.85;
        break;
      case 'concert':
        freqMultiplier = 1.0;
        break;
      case 'classical':
        freqMultiplier = 0.9;
        break;
      case 'electric':
        freqMultiplier = 1.05;
        break;
    }
    
    // Create strings with varying lengths for visual effect
    strings = baseNotes.map((note, index) => ({
      id: `string${index + 1}`,
      note: note.note,
      freq: note.freq * freqMultiplier,
      key: note.key,
      length: 60 + index * 5  // Increasing length for each string
    }));
    
    return strings;
  };
  
  const strings = getStringsForVariant(variant);
  
  const pluckString = useCallback((stringId: string) => {
    // Initialize audio context if not already done
    if (!audioContext) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      setAudioContext(new AudioContext());
      return;
    }
    
    // Find the string with the matching ID
    const stringToPluck = strings.find(s => s.id === stringId);
    if (!stringToPluck) return;
    
    setActiveString(stringId);
    
    // Create oscillator for harp sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Secondary oscillator for richer timbre
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    
    // Parameters that change based on variant
    let oscType: OscillatorType = 'triangle';
    let osc2Type: OscillatorType = 'sine';
    let attackTime = 0.01;
    let sustainLevel = 0.4;
    let releaseTime = 3.0;
    let harmonicRatio = 2.0;
    let harmonic2Level = 0.2;
    let filterFreq = 2000;
    let filterQ = 2;
    let reverbAmount = 0.3;
    
    // Set parameters based on harp variant
    switch(variant) {
      case 'celtic':
        oscType = 'triangle';
        osc2Type = 'sine';
        attackTime = 0.02;
        sustainLevel = 0.5;
        releaseTime = 3.5;
        harmonicRatio = 1.5; // Perfect fifth up
        harmonic2Level = 0.25;
        filterFreq = 1800;
        filterQ = 1;
        reverbAmount = 0.4;
        break;
        
      case 'concert':
        oscType = 'triangle';
        osc2Type = 'sine';
        attackTime = 0.015;
        sustainLevel = 0.6;
        releaseTime = 4.0;
        harmonicRatio = 2.0; // Octave up
        harmonic2Level = 0.15;
        filterFreq = 2200;
        filterQ = 0.8;
        reverbAmount = 0.5;
        break;
        
      case 'classical':
        oscType = 'triangle';
        osc2Type = 'sine';
        attackTime = 0.025;
        sustainLevel = 0.45;
        releaseTime = 3.2;
        harmonicRatio = 1.5; // Perfect fifth up
        harmonic2Level = 0.2;
        filterFreq = 1600;
        filterQ = 1.5;
        reverbAmount = 0.35;
        break;
        
      case 'electric':
        oscType = 'sawtooth';
        osc2Type = 'square';
        attackTime = 0.005;
        sustainLevel = 0.7;
        releaseTime = 2.5;
        harmonicRatio = 3.0; // Octave + fifth up
        harmonic2Level = 0.3;
        filterFreq = 3000;
        filterQ = 3;
        reverbAmount = 0.2;
        break;
    }
    
    // Harp-like timbre using chosen wave type
    oscillator.type = oscType;
    oscillator.frequency.value = stringToPluck.freq;
    
    // Set up second oscillator for harmonic richness
    oscillator2.type = osc2Type;
    oscillator2.frequency.value = stringToPluck.freq * harmonicRatio;
    gainNode2.gain.value = harmonic2Level;
    
    // Create filter
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = filterQ;
    
    // Envelope shaping for plucked string
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, audioContext.currentTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime);
    
    gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode2.gain.linearRampToValueAtTime(harmonic2Level, audioContext.currentTime + attackTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime * 0.8);
    
    // Add reverb effect
    const convolver = audioContext.createConvolver();
    const reverbGain = audioContext.createGain();
    reverbGain.gain.value = reverbAmount;
    
    // Create a simple reverb impulse response
    const sampleRate = audioContext.sampleRate;
    const impulseLength = sampleRate * 2; // 2 seconds
    const impulse = audioContext.createBuffer(2, impulseLength, sampleRate);
    
    // Fill impulse with decaying white noise
    for (let channel = 0; channel < 2; channel++) {
      const impulseData = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i++) {
        impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 1.5);
      }
    }
    
    convolver.buffer = impulse;
    
    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    // Connect reverb path
    gainNode.connect(convolver);
    gainNode2.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(audioContext.destination);
    
    // Start and stop
    oscillator.start();
    oscillator2.start();
    oscillator.stop(audioContext.currentTime + releaseTime);
    oscillator2.stop(audioContext.currentTime + releaseTime);
    
    // Clear active string after visual effect duration
    setTimeout(() => setActiveString(null), 1000);
  }, [audioContext, strings]);
  
  return {
    activeString,
    strings,
    pluckString
  };
};
