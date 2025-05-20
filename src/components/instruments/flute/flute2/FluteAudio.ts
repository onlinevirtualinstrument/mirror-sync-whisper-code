
import { useState, useCallback } from 'react';

interface FluteHole {
  id: string;
  note: string;
  name: string;
  freq: number;
  key: string;
}

export const useFluteAudio = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [activeHole, setActiveHole] = useState<string | null>(null);
  
  // Define the flute holes with their corresponding notes
  const holes: FluteHole[] = [
    { id: 'hole1', note: 'C5', name: 'C', freq: 523.25, key: '1' },
    { id: 'hole2', note: 'D5', name: 'D', freq: 587.33, key: '2' },
    { id: 'hole3', note: 'E5', name: 'E', freq: 659.25, key: '3' },
    { id: 'hole4', note: 'F5', name: 'F', freq: 698.46, key: '4' },
    { id: 'hole5', note: 'G5', name: 'G', freq: 783.99, key: '5' },
    { id: 'hole6', note: 'A5', name: 'A', freq: 880.00, key: '6' },
  ];
  
  const playNote = useCallback((note: string, variant: string = 'standard') => {
    // Initialize audio context if not already done
    if (!audioContext) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      setAudioContext(new AudioContext());
      return;
    }
    
    // Find the hole with the matching note
    const hole = holes.find(h => h.note === note);
    if (!hole) return;
    
    setActiveHole(note);
    
    // Create oscillator for the flute sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const mainFilter = audioContext.createBiquadFilter();
    const breathinessGain = audioContext.createGain();
    const modulationOsc = audioContext.createOscillator();
    const modulationGain = audioContext.createGain();
    
    // Create noise generator for breathiness
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    
    // Configure based on flute variant
    let freq = hole.freq;
    let attackTime = 0.02;
    let releaseTime = 1.5;
    let oscillatorType: OscillatorType = 'sine';
    let filterFrequency = 800;
    let filterQ = 1;
    let breathinessAmount = 0.05;
    let modulationFreq = 5;
    let modulationAmount = 0;
    let filterType: BiquadFilterType = 'lowpass';
    
    switch(variant) {
      case 'bamboo':
        freq *= 0.85; // Lower pitch
        oscillatorType = 'triangle';
        filterFrequency = 1200;
        filterQ = 3;
        breathinessAmount = 0.15;
        modulationFreq = 6;
        modulationAmount = 8;
        attackTime = 0.04;
        releaseTime = 1.7;
        filterType = 'bandpass';
        break;
        
      case 'silver':
        freq *= 1.1; // Higher pitch
        oscillatorType = 'sine';
        filterFrequency = 2000;
        filterQ = 0.5;
        breathinessAmount = 0.03;
        attackTime = 0.01;
        releaseTime = 1.3;
        filterType = 'highpass';
        break;
        
      case 'classical':
        oscillatorType = 'sine';
        filterFrequency = 1500;
        filterQ = 2;
        breathinessAmount = 0.08;
        modulationFreq = 4.5;
        modulationAmount = 3;
        attackTime = 0.03;
        releaseTime = 2;
        break;
        
      case 'alto':
        freq *= 0.7; // Much lower pitch
        oscillatorType = 'triangle';
        filterFrequency = 900;
        filterQ = 2.5;
        breathinessAmount = 0.12;
        modulationFreq = 4;
        modulationAmount = 5;
        attackTime = 0.05;
        releaseTime = 2.2;
        break;
        
      case 'bass':
        freq *= 0.5; // Very low pitch
        oscillatorType = 'triangle';
        filterFrequency = 700;
        filterQ = 3;
        breathinessAmount = 0.2;
        modulationFreq = 3;
        modulationAmount = 7;
        attackTime = 0.06;
        releaseTime = 3;
        break;
    }
    
    // Set up oscillator
    oscillator.type = oscillatorType;
    oscillator.frequency.value = freq;
    
    // Configure filter
    mainFilter.type = filterType;
    mainFilter.frequency.value = filterFrequency;
    mainFilter.Q.value = filterQ;
    
    // Configure noise filter
    noiseFilter.frequency.value = freq * 2;
    noiseFilter.Q.value = 1;
    
    // Configure breathiness
    breathinessGain.gain.value = breathinessAmount;
    
    // Set up modulation for vibrato effect
    if (modulationAmount > 0) {
      modulationOsc.type = 'sine';
      modulationOsc.frequency.value = modulationFreq;
      modulationGain.gain.value = modulationAmount;
      
      modulationOsc.connect(modulationGain);
      modulationGain.connect(oscillator.frequency);
      modulationOsc.start();
      modulationOsc.stop(audioContext.currentTime + releaseTime);
    }
    
    // Envelope shaping for flute sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + releaseTime);
    
    // Connect nodes
    oscillator.connect(mainFilter);
    mainFilter.connect(gainNode);
    
    // Connect breathiness if enabled
    if (breathinessAmount > 0) {
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(breathinessGain);
      breathinessGain.connect(gainNode);
      noiseSource.start();
      noiseSource.stop(audioContext.currentTime + releaseTime);
    }
    
    gainNode.connect(audioContext.destination);
    
    // Start and stop
    oscillator.start();
    oscillator.stop(audioContext.currentTime + releaseTime);
    
    // Clear active hole after sound finishes
    setTimeout(() => setActiveHole(null), releaseTime * 1000);
  }, [audioContext, holes]);
  
  return {
    activeHole,
    playNote,
    holes
  };
};
