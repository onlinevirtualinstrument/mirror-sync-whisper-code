
import { useEffect } from 'react';
import { guitarVariants } from './GuitarVariants';

interface UseGuitarKeyboardProps {
  activeStrings: string[];
  guitarVariant: string;
  playString: (stringName: string, frequency: number, guitarVariant: string) => void;
  stopString: (stringName: string) => void;
}

export function useGuitarKeyboard({
  activeStrings,
  guitarVariant,
  playString,
  stopString
}: UseGuitarKeyboardProps) {
  // Setup keyboard listeners
  useEffect(() => {
    const currentVariant = guitarVariants[guitarVariant] || guitarVariants.standard;
    const strings = currentVariant.strings;

    const handleKeyDown = (event: KeyboardEvent) => {
      const guitarString = strings.find(s => s.key === event.key.toLowerCase());
      if (guitarString && !activeStrings.includes(guitarString.name)) {
        playString(guitarString.name, guitarString.frequency, guitarVariant);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const guitarString = strings.find(s => s.key === event.key.toLowerCase());
      if (guitarString) {
        stopString(guitarString.name);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeStrings, guitarVariant, playString, stopString]);
}
