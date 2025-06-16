
// Audio handling logic for Veena

import { useState, useEffect } from 'react';

export interface VeenaStringData {
  note: string;
  freq: number;
  key: string;
  color: string;
}

export const useVeenaAudio = (variant: string) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  useEffect(() => {
    // Initialize Audio Context
    const initAudio = () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      setAudioContext(new AudioContext());
    };

    if (!audioContext) {
      initAudio();
    }

    return () => {
      // Cleanup if needed
      if (audioContext) {
        // Nothing to clean up for now
      }
    };
  }, [audioContext]);

  // Define the notes for the veena based on the variant
  const getStringsForVariant = (variant: string): VeenaStringData[] => {
    // Base strings (pentatonic scale)
    const baseStrings = [
      { note: 'Sa', freq: 261.63, key: 'Q', color: 'bg-amber-600' },
      { note: 'Re', freq: 293.66, key: 'W', color: 'bg-amber-500' },
      { note: 'Ga', freq: 329.63, key: 'E', color: 'bg-amber-400' },
      { note: 'Ma', freq: 349.23, key: 'R', color: 'bg-amber-300' },
      { note: 'Pa', freq: 392.00, key: 'T', color: 'bg-amber-200' },
      { note: 'Dha', freq: 440.00, key: 'Y', color: 'bg-amber-100' },
      { note: 'Ni', freq: 493.88, key: 'U', color: 'bg-amber-50' },
    ];
    
    let colorScheme;
    let freqAdjust = 1.0;
    
    switch(variant) {
      case 'saraswati':
        colorScheme = ['bg-orange-600', 'bg-orange-500', 'bg-orange-400', 'bg-orange-300', 'bg-orange-200', 'bg-orange-100', 'bg-orange-50'];
        freqAdjust = 0.85; // Much deeper tone for distinctive Saraswati sound
        break;
      case 'rudra':
        colorScheme = ['bg-red-600', 'bg-red-500', 'bg-red-400', 'bg-red-300', 'bg-red-200', 'bg-red-100', 'bg-red-50'];
        freqAdjust = 0.75; // Even deeper tone for powerful Rudra veena
        break;
      case 'modern':
        colorScheme = ['bg-amber-700', 'bg-amber-600', 'bg-amber-500', 'bg-amber-400', 'bg-amber-300', 'bg-amber-200', 'bg-amber-100'];
        freqAdjust = 1.15; // Higher pitch for modern veena - brighter sound
        break;
      default:
        colorScheme = ['bg-amber-600', 'bg-amber-500', 'bg-amber-400', 'bg-amber-300', 'bg-amber-200', 'bg-amber-100', 'bg-amber-50'];
    }
    
    return baseStrings.map((string, index) => ({
      ...string,
      color: colorScheme[index],
      freq: string.freq * freqAdjust
    }));
  };

  const playString = (frequency: number) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Secondary oscillator for harmonics
    const harmonicOsc = audioContext.createOscillator();
    const harmonicGain = audioContext.createGain();
    
    // Drone oscillator (tanpura effect) for authentic Indian sound
    const droneOsc = audioContext.createOscillator();
    const droneGain = audioContext.createGain();
    
    // Veena-like timbre settings adjusted by variant
    let oscType: OscillatorType = 'triangle';
    let harmonicType: OscillatorType = 'sine';
    let attackTime = 0.1;
    let releaseTime = 3.0;
    let droneFreq = frequency / 2; // One octave down
    let droneVolume = 0.15;
    let harmonicRatio = 2.0; // Default to one octave up
    let harmonicVolume = 0.12;
    let sympatheticResonance = 0.08; // Mimics sympathetic strings
    
    switch(variant) {
      case 'saraswati':
        oscType = 'triangle';
        harmonicType = 'sine';
        attackTime = 0.12;
        releaseTime = 4.0;
        droneFreq = frequency / 2;
        droneVolume = 0.25;
        harmonicRatio = 2.0;
        harmonicVolume = 0.18;
        sympatheticResonance = 0.15;
        break;
      case 'rudra':
        oscType = 'triangle';
        harmonicType = 'triangle';
        attackTime = 0.15;
        releaseTime = 5.0;
        droneFreq = frequency / 2;
        droneVolume = 0.3;
        harmonicRatio = 1.5; // Perfect fifth
        harmonicVolume = 0.2;
        sympatheticResonance = 0.2;
        break;
      case 'modern':
        oscType = 'sawtooth';
        harmonicType = 'triangle';
        attackTime = 0.08;
        releaseTime = 2.5;
        droneFreq = frequency / 4; // Two octaves down
        droneVolume = 0.1;
        harmonicRatio = 3.0; // Higher harmonics
        harmonicVolume = 0.15;
        sympatheticResonance = 0.04;
        break;
      default:
        oscType = 'triangle';
    }
    
    // Main string oscillator
    oscillator.type = oscType;
    oscillator.frequency.value = frequency;
    
    // Harmonic oscillator
    harmonicOsc.type = harmonicType;
    harmonicOsc.frequency.value = frequency * harmonicRatio;
    harmonicGain.gain.value = harmonicVolume;
    
    // Drone oscillator
    droneOsc.type = 'sine';
    droneOsc.frequency.value = droneFreq;
    droneGain.gain.value = droneVolume;
    
    // Envelope for main string
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime);
    
    // Envelope for harmonic
    harmonicGain.gain.setValueAtTime(0, audioContext.currentTime);
    harmonicGain.gain.linearRampToValueAtTime(harmonicVolume, audioContext.currentTime + (attackTime * 1.2));
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime * 0.8);
    
    // Envelope for drone
    droneGain.gain.setValueAtTime(0, audioContext.currentTime);
    droneGain.gain.linearRampToValueAtTime(droneVolume, audioContext.currentTime + (attackTime * 2));
    droneGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime * 1.3);
    
    // Create sympathetic resonance effect - subtle additional harmonics
    if (sympatheticResonance > 0) {
      const resonanceGain = audioContext.createGain();
      resonanceGain.gain.value = sympatheticResonance;
      
      // Create several sympathetic oscillators
      const resonanceFreqs = [1.2, 1.5, 1.8]; // Various harmonics
      resonanceFreqs.forEach(ratio => {
        const sympatheticOsc = audioContext.createOscillator();
        sympatheticOsc.type = 'sine';
        sympatheticOsc.frequency.value = frequency * ratio;
        
        const sympatheticGain = audioContext.createGain();
        sympatheticGain.gain.setValueAtTime(0, audioContext.currentTime);
        sympatheticGain.gain.linearRampToValueAtTime(sympatheticResonance * 0.3, audioContext.currentTime + attackTime * 3); 
        sympatheticGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime * 0.9);
        
        sympatheticOsc.connect(sympatheticGain);
        sympatheticGain.connect(audioContext.destination);
        
        sympatheticOsc.start();
        sympatheticOsc.stop(audioContext.currentTime + releaseTime);
      });
    }
    
    // Connect all oscillators to their respective gain nodes
    oscillator.connect(gainNode);
    harmonicOsc.connect(harmonicGain);
    droneOsc.connect(droneGain);
    
    // Connect all gain nodes to audio output
    gainNode.connect(audioContext.destination);
    harmonicGain.connect(audioContext.destination);
    droneGain.connect(audioContext.destination);
    
    // Start all oscillators
    oscillator.start();
    harmonicOsc.start();
    droneOsc.start();
    
    // Stop all oscillators
    oscillator.stop(audioContext.currentTime + releaseTime);
    harmonicOsc.stop(audioContext.currentTime + releaseTime);
    droneOsc.stop(audioContext.currentTime + releaseTime * 1.2);
    
    // Add visual feedback
    const stringElement = document.querySelector(`[data-freq="${frequency}"]`);
    if (stringElement) {
      stringElement.classList.add('active');
      setTimeout(() => {
        stringElement.classList.remove('active');
      }, 500);
    }
  };

  return {
    getStringsForVariant,
    playString
  };
};
