
import { useState, useRef, useEffect } from 'react';
import { playSitarString } from './SitarSoundUtils';

export function useSitarAudio() {
  const [activeString, setActiveString] = useState<number | null>(null);
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [sitarVariant, setSitarVariant] = useState<string>("standard");
  
  const audioContext = useRef<AudioContext | null>(null);
  const activeSound = useRef<{ stop: () => void } | null>(null);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    document.addEventListener('click', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      if (activeSound.current) {
        activeSound.current.stop();
      }
    };
  }, []);

  const playString = (stringNumber: number, frequency: number) => {
    if (!audioContext.current || isMuted) return;
    
    // Stop any currently playing sound
    if (activeSound.current) {
      activeSound.current.stop();
    }
    
    setActiveString(stringNumber);

    activeSound.current = playSitarString(
      audioContext.current,
      frequency,
      volume,
      sitarVariant,
      () => setActiveString(null)
    );
  };

  return {
    activeString,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    sitarVariant,
    setSitarVariant,
    playString
  };
}
