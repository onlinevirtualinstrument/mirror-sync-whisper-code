
import { useEffect, useState } from 'react';

interface ThereminAudioHookProps {
  volume: number;
  isMuted: boolean;
  sensitivity: number;
}

export const useThereminAudio = ({ volume, isMuted, sensitivity }: ThereminAudioHookProps) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      const context = new AudioContext();
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      // Setup oscillator
      osc.type = 'sine';
      osc.frequency.value = 440; // A4 note
      osc.connect(gain);
      
      // Setup gain node
      gain.connect(context.destination);
      gain.gain.value = 0; // Start silent
      
      // Start oscillator
      osc.start();
      
      setAudioContext(context);
      setOscillator(osc);
      setGainNode(gain);
      
      return () => {
        osc.stop();
        context.close();
      };
    };
    
    initAudio();
  }, []);
  
  // Handle volume changes
  useEffect(() => {
    if (gainNode) {
      const effectiveVolume = isMuted ? 0 : volume;
      gainNode.gain.value = effectiveVolume;
    }
  }, [volume, isMuted, gainNode]);
  
  const updateThereminSound = (x: number, y: number) => {
    if (!oscillator || !gainNode || !audioContext) return;
    
    // Map x position (0-1) to frequency (200-2000 Hz)
    // Apply sensitivity to make frequency changes more or less dramatic
    const minFreq = 100;
    const maxFreq = 2000;
    const frequencyRange = maxFreq - minFreq;
    const sensitivityFactor = 0.5 + sensitivity;
    const frequency = minFreq + (x * frequencyRange * sensitivityFactor);
    
    // Map y position (0-1) to volume
    const effectiveVolume = isMuted ? 0 : y * volume;
    
    // Apply changes smoothly
    const currentTime = audioContext.currentTime;
    oscillator.frequency.setTargetAtTime(frequency, currentTime, 0.01);
    gainNode.gain.setTargetAtTime(effectiveVolume, currentTime, 0.01);
    
    if (effectiveVolume > 0 && !isPlaying) {
      setIsPlaying(true);
    } else if (effectiveVolume <= 0 && isPlaying) {
      setIsPlaying(false);
    }
  };
  
  return {
    updateThereminSound,
    isPlaying
  };
};
