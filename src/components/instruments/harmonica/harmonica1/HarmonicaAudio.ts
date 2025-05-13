
import { useState, useRef, useEffect } from 'react';
import { playHarmonicaHole } from './HarmonicaSoundUtils';

export function useHarmonicaAudio(variant = 'standard') {
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [harmonicaVariant, setHarmonicaVariant] = useState<string>(variant);
  const audioContext = useRef<AudioContext | null>(null);
  const activeSound = useRef<{ stop: () => void } | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    // Initialize on first click
    document.addEventListener('click', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      if (activeSound.current) {
        activeSound.current.stop();
      }
    };
  }, []);

  const playHole = (hole: number, holeProps: any) => {
    if (!audioContext.current) return;
    
    // Stop any currently playing sound
    if (activeSound.current) {
      activeSound.current.stop();
    }
    
    setActiveHole(hole);
    
    activeSound.current = playHarmonicaHole(
      audioContext.current,
      hole,
      holeProps,
      harmonicaVariant,
      () => setActiveHole(null)
    );
  };

  return {
    activeHole,
    harmonicaVariant,
    setHarmonicaVariant,
    playHole
  };
}
