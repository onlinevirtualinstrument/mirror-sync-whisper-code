
import { useEffect } from 'react';
import { sitarVariants } from './SitarVariants';

interface UseSitarKeyboardProps {
  activeString: number | null;
  sitarVariant: string;
  playString: (stringNumber: number, frequency: number) => void;
}

export function useSitarKeyboard({
  activeString,
  sitarVariant,
  playString
}: UseSitarKeyboardProps) {
  // Setup keyboard listeners
  useEffect(() => {
    const currentVariant = sitarVariants[sitarVariant] || sitarVariants.standard;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeString) {
        const numKey = parseInt(e.key);
        if (!isNaN(numKey) && numKey >= 1 && numKey <= 7) {
          const string = currentVariant.strings.find(s => s.number === numKey);
          if (string) {
            playString(string.number, string.frequency);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeString, sitarVariant, playString]);
}
