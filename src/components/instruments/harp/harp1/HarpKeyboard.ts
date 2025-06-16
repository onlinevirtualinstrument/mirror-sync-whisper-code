
import { useEffect } from 'react';
import { HarpString } from './HarpAudio';

interface HarpKeyboardProps {
  strings: HarpString[];
  pluckString: (stringId: string) => void;
}

export const useHarpKeyboard = ({
  strings,
  pluckString
}: HarpKeyboardProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const string = strings.find(s => s.key.toUpperCase() === key);
      
      if (string) {
        pluckString(string.id);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [strings, pluckString]);
};
