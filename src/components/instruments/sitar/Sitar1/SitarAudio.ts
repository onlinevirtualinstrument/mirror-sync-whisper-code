
import { useState, useCallback } from 'react';

interface SitarString {
  id: string;
  note: string;
  freq: number;
  key: string;
}

export const useSitarAudio = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [activeString, setActiveString] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [sitarVariant, setSitarVariant] = useState<string>("standard");

  // Get strings based on variant
  const getStringsForVariant = (variant: string): SitarString[] => {
    switch (variant) {
      case 'punjabi':
        return [
          { id: 'string1', note: 'Sa', freq: 261.63 * 0.92, key: '1' },
          { id: 'string2', note: 'Re', freq: 293.66 * 0.92, key: '2' },
          { id: 'string3', note: 'Ga', freq: 329.63 * 0.92, key: '3' },
          { id: 'string4', note: 'Ma', freq: 349.23 * 0.92, key: '4' },
          { id: 'string5', note: 'Pa', freq: 392.00 * 0.92, key: '5' },
          { id: 'string6', note: 'Dha', freq: 440.00 * 0.92, key: '6' },
          { id: 'string7', note: 'Ni', freq: 493.88 * 0.92, key: '7' }
        ];
      case 'bengali':
        return [
          { id: 'string1', note: 'Sa', freq: 261.63 * 1.08, key: '1' },
          { id: 'string2', note: 'Re', freq: 293.66 * 1.08, key: '2' },
          { id: 'string3', note: 'Ga', freq: 329.63 * 1.08, key: '3' },
          { id: 'string4', note: 'Ma', freq: 349.23 * 1.08, key: '4' },
          { id: 'string5', note: 'Pa', freq: 392.00 * 1.08, key: '5' },
          { id: 'string6', note: 'Dha', freq: 440.00 * 1.08, key: '6' },
          { id: 'string7', note: 'Ni', freq: 493.88 * 1.08, key: '7' }
        ];
      case 'electric':
        return [
          { id: 'string1', note: 'Sa', freq: 261.63 * 1.05, key: '1' },
          { id: 'string2', note: 'Re', freq: 293.66 * 1.05, key: '2' },
          { id: 'string3', note: 'Ga', freq: 329.63 * 1.05, key: '3' },
          { id: 'string4', note: 'Ma', freq: 349.23 * 1.05, key: '4' },
          { id: 'string5', note: 'Pa', freq: 392.00 * 1.05, key: '5' },
          { id: 'string6', note: 'Dha', freq: 440.00 * 1.05, key: '6' },
          { id: 'string7', note: 'Ni', freq: 493.88 * 1.05, key: '7' }
        ];
      default:
        return [
          { id: 'string1', note: 'Sa', freq: 261.63, key: '1' },
          { id: 'string2', note: 'Re', freq: 293.66, key: '2' },
          { id: 'string3', note: 'Ga', freq: 329.63, key: '3' },
          { id: 'string4', note: 'Ma', freq: 349.23, key: '4' },
          { id: 'string5', note: 'Pa', freq: 392.00, key: '5' },
          { id: 'string6', note: 'Dha', freq: 440.00, key: '6' },
          { id: 'string7', note: 'Ni', freq: 493.88, key: '7' }
        ];
    }
  };
  
  const playString = useCallback((stringId: string) => {
    // Initialize audio context if needed
    if (!audioContext) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      setAudioContext(new AudioContext());
      return;
    }
    
    // Find the string by ID
    const strings = getStringsForVariant(sitarVariant);
    const stringToPlay = strings.find(s => s.id === stringId);
    
    if (!stringToPlay) return;
    
    setActiveString(stringId);
    
    // Skip audio processing if muted
    if (isMuted) {
      setTimeout(() => setActiveString(null), 500);
      return;
    }
    
    // Create oscillators for the sitar sound
    const oscillator = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const oscillator3 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const gainNode2 = audioContext.createGain();
    const gainNode3 = audioContext.createGain();
    
    // Parameters based on sitar variant
    let mainOscType: OscillatorType = 'triangle';
    let buzzerOscType: OscillatorType = 'sawtooth';
    let harmOscType: OscillatorType = 'sine';
    let attackTime = 0.02;
    let sustainTime = 0.2;
    let releaseTime = 3.0;
    let buzzFreq = 2.1;
    let buzzAmount = 0.2;
    let harmFreq = 3.0;
    let harmAmount = 0.15;
    let filterFreq = 1000;
    let filterQ = 5;
    let reverbAmount = 0.25;
    
    switch(sitarVariant) {
      case 'punjabi':
        mainOscType = 'triangle';
        buzzerOscType = 'square';
        harmOscType = 'triangle';
        attackTime = 0.03;
        sustainTime = 0.3;
        releaseTime = 3.5;
        buzzFreq = 2.2;
        buzzAmount = 0.25;
        harmFreq = 4.0;
        harmAmount = 0.18;
        filterFreq = 900;
        filterQ = 7;
        reverbAmount = 0.3;
        break;
        
      case 'bengali':
        mainOscType = 'triangle';
        buzzerOscType = 'sawtooth';
        harmOscType = 'triangle';
        attackTime = 0.02;
        sustainTime = 0.15;
        releaseTime = 3.2;
        buzzFreq = 2.0;
        buzzAmount = 0.15;
        harmFreq = 2.5;
        harmAmount = 0.12;
        filterFreq = 1200;
        filterQ = 4;
        reverbAmount = 0.2;
        break;
        
      case 'electric':
        mainOscType = 'sawtooth';
        buzzerOscType = 'square';
        harmOscType = 'sawtooth';
        attackTime = 0.01;
        sustainTime = 0.1;
        releaseTime = 2.5;
        buzzFreq = 3.0;
        buzzAmount = 0.3;
        harmFreq = 5.0;
        harmAmount = 0.25;
        filterFreq = 2000;
        filterQ = 3;
        reverbAmount = 0.15;
        break;
    }
    
    // Apply volume control
    const actualVolume = volume;
    
    // Main oscillator for tone
    oscillator.type = mainOscType;
    oscillator.frequency.value = stringToPlay.freq;
    
    // Create characteristic sitar buzz with second oscillator
    oscillator2.type = buzzerOscType;
    oscillator2.frequency.value = stringToPlay.freq * buzzFreq;
    gainNode2.gain.value = buzzAmount;
    
    // Create harmonic richness with third oscillator
    oscillator3.type = harmOscType;
    oscillator3.frequency.value = stringToPlay.freq * harmFreq;
    gainNode3.gain.value = harmAmount;
    
    // Create filter for tone shaping
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = filterQ;
    
    // Envelope shaping for plucked string sound
    // Attack
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(actualVolume * 0.9, audioContext.currentTime + attackTime);
    
    // Sustain and Release
    gainNode.gain.setValueAtTime(actualVolume * 0.9, audioContext.currentTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(actualVolume * 0.6, audioContext.currentTime + attackTime + sustainTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + attackTime + sustainTime + releaseTime);
    
    // Add buzz effect to main frequency
    oscillator2.connect(gainNode2);
    gainNode2.connect(oscillator.frequency);
    
    // Connect main oscillators to gain and filter
    oscillator.connect(filter);
    oscillator3.connect(gainNode3);
    gainNode3.connect(filter);
    filter.connect(gainNode);
    
    // Create reverb effect
    const convolver = audioContext.createConvolver();
    const reverbGain = audioContext.createGain();
    reverbGain.gain.value = reverbAmount;
    
    // Create impulse response for reverb
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * 2.5; // 2.5 seconds
    const impulse = audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 1.5);
        channelData[i] = (Math.random() * 2 - 1) * decay;
      }
    }
    
    convolver.buffer = impulse;
    
    // Connect main path
    gainNode.connect(audioContext.destination);
    
    // Connect reverb path
    gainNode.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(audioContext.destination);
    
    // Start and stop
    oscillator.start();
    oscillator2.start();
    oscillator3.start();
    
    oscillator.stop(audioContext.currentTime + attackTime + sustainTime + releaseTime);
    oscillator2.stop(audioContext.currentTime + attackTime + sustainTime + releaseTime);
    oscillator3.stop(audioContext.currentTime + attackTime + sustainTime + releaseTime);
    
    // Clear active string after sound finishes
    setTimeout(() => setActiveString(null), (attackTime + sustainTime + releaseTime) * 1000);
  }, [audioContext, sitarVariant, isMuted, volume]);
  
  return {
    activeString,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    sitarVariant,
    setSitarVariant,
    playString,
    getStringsForVariant
  };
};
