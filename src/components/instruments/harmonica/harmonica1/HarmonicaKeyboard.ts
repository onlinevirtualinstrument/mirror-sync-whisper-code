
import { useEffect } from 'react';
import { getHarmonicaHoles } from './HarmonicaVariants';

interface UseHarmonicaKeyboardProps {
  activeHole: number | null;
  harmonicaVariant: string;
  playHole: (hole: number, holeProps: any) => void;
}

export function useHarmonicaKeyboard({
  activeHole,
  harmonicaVariant,
  playHole
}: UseHarmonicaKeyboardProps) {
  const holes = getHarmonicaHoles(harmonicaVariant);

  // Setup keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= '1' && key <= '8') {
        const holeNumber = parseInt(key);
        const hole = holes.find(h => h.number === holeNumber);
        
        if (hole && !activeHole) {
          playHole(holeNumber, hole);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeHole, holes, playHole]);
}
