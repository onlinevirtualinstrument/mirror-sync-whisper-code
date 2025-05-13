
import { useState, useRef, useEffect } from 'react';
import { generateGuitarSound } from './GuitarSoundUtils';
import { guitarVariants } from './GuitarVariants';

export function useGuitarAudio() {
  const [activeStrings, setActiveStrings] = useState<string[]>([]);
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [reverbLevel, setReverbLevel] = useState<number>(0.2);
  const [toneQuality, setToneQuality] = useState<number>(0.5);
  
  const audioContext = useRef<AudioContext | null>(null);
  const oscillators = useRef<Map<string, OscillatorNode>>(new Map());
  const reverbNode = useRef<ConvolverNode | null>(null);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initializeAudioContext = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        createReverb(audioContext.current);
      }
    };
    
    document.addEventListener('click', initializeAudioContext, { once: true });
    
    return () => {
      document.removeEventListener('click', initializeAudioContext);
      if (audioContext.current) {
        oscillators.current.forEach(osc => {
          try {
            osc.stop();
          } catch (e) {
            // Ignore errors when stopping already stopped oscillators
          }
        });
      }
    };
  }, []);

  // Create reverb impulse response
  const createReverb = (audioCtx: AudioContext) => {
    if (reverbNode.current) return;
    
    const convolver = audioCtx.createConvolver();
    
    // Create impulse response for reverb
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * 2.5; // 2.5 seconds reverb
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);
    
    // Generate guitar space reverb impulse response
    for (let i = 0; i < length; i++) {
      const n = i / length;
      // Exponential decay with some early reflections
      const decay = Math.exp(-n * 2.5);
      // Add early reflections
      const reflectionL = i % 4000 === 0 ? 0.7 : 0;
      const reflectionR = i % 3700 === 0 ? 0.6 : 0;
      
      impulseL[i] = ((Math.random() * 2 - 1) * decay) + reflectionL;
      impulseR[i] = ((Math.random() * 2 - 1) * decay) + reflectionR;
    }
    
    convolver.buffer = impulse;
    reverbNode.current = convolver;
  };

  const playString = (stringName: string, frequency: number, guitarVariant: string) => {
    if (!audioContext.current || isMuted) return;
    
    // Set the string as active
    setActiveStrings(prev => [...prev, stringName]);
    
    generateGuitarSound(
      audioContext.current, 
      stringName, 
      frequency, 
      volume, 
      reverbLevel, 
      toneQuality, 
      guitarVariant, 
      reverbNode.current, 
      oscillators.current,
      setActiveStrings
    );
  };

  const stopString = (stringName: string) => {
    setActiveStrings(prev => prev.filter(s => s !== stringName));
    
    const oscillator = oscillators.current.get(stringName);
    if (oscillator && audioContext.current) {
      const gainNode = audioContext.current.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      
      gainNode.gain.setValueAtTime(volume * 0.5, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 0.1);
      
      setTimeout(() => {
        oscillator.stop();
        oscillators.current.delete(stringName);
      }, 100);
    }
  };

  return {
    activeStrings,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    reverbLevel,
    setReverbLevel,
    toneQuality,
    setToneQuality,
    playString,
    stopString
  };
}
