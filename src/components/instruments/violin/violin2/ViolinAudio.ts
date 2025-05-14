
import { useState, useCallback } from 'react';

interface ViolinString {
  note: string;
  freq: number;
  key: string;
  color: string;
}

export const useViolinAudio = (variant: string = 'standard') => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [violinVariant, setViolinVariant] = useState<string>(variant);
  
  // Define the violin strings based on the variant
  const getStringsForVariant = (variant: string): ViolinString[] => {
    // Base strings: G3, D4, A4, E5
    const baseStrings = [
      { note: 'G3', freq: 196.00, key: 'Z', color: 'bg-amber-700' },
      { note: 'D4', freq: 293.66, key: 'X', color: 'bg-amber-600' },
      { note: 'A4', freq: 440.00, key: 'C', color: 'bg-amber-500' },
      { note: 'E5', freq: 659.25, key: 'V', color: 'bg-amber-400' },
    ];
    
    let colorScheme;
    let freqAdjust = 1.0;
    
    switch(variant) {
      case 'stradivarius':
        colorScheme = ['bg-amber-800', 'bg-amber-700', 'bg-amber-600', 'bg-amber-500'];
        freqAdjust = 1.02; // Slight adjustment for richer tone
        break;
      case 'electric':
        colorScheme = ['bg-blue-700', 'bg-blue-600', 'bg-blue-500', 'bg-blue-400'];
        freqAdjust = 1.0; // Same pitch, different timbre
        break;
      case 'baroque':
        colorScheme = ['bg-amber-900', 'bg-amber-800', 'bg-amber-700', 'bg-amber-600'];
        freqAdjust = 0.98; // Slightly lower for baroque tuning
        break;
      default:
        colorScheme = ['bg-amber-700', 'bg-amber-600', 'bg-amber-500', 'bg-amber-400'];
    }
    
    return baseStrings.map((string, index) => ({
      ...string,
      color: colorScheme[index],
      freq: string.freq * freqAdjust
    }));
  };

  const strings = getStringsForVariant(violinVariant);
  
  const playString = useCallback((frequency: number) => {
    // Initialize audio context if not already done
    if (!audioContext) {
      const AudioContext = window.AudioContext;
      setAudioContext(new AudioContext());
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Violin-like timbre, adjusted by variant
    let oscType: OscillatorType = 'sawtooth';
    let attackTime = 0.1;
    let releaseTime = 2.0;
    
    switch(violinVariant) {
      case 'stradivarius':
        oscType = 'sawtooth';
        attackTime = 0.08;
        releaseTime = 2.5;
        break;
      case 'electric':
        oscType = 'square'; 
        attackTime = 0.05;
        releaseTime = 1.8;
        break;
      case 'baroque':
        oscType = 'triangle';
        attackTime = 0.12;
        releaseTime = 2.2;
        break;
      default:
        oscType = 'sawtooth';
    }
    
    oscillator.type = oscType;
    oscillator.frequency.value = frequency;
    
    // Simple violin envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + releaseTime);
    
    // Add visual feedback
    const stringElement = document.querySelector(`[data-freq="${frequency}"]`);
    if (stringElement) {
      stringElement.classList.add('active');
      setTimeout(() => {
        stringElement.classList.remove('active');
      }, 500);
    }
  }, [audioContext, violinVariant]);
  
  return {
    violinVariant,
    setViolinVariant,
    strings,
    playString
  };
};
