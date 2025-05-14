
import { useEffect } from 'react';

interface SitarKeyboardProps {
  activeString: string | null;
  sitarVariant: string;
  playString: (stringId: string) => void;
}

export const useSitarKeyboard = ({
  activeString,
  sitarVariant,
  playString
}: SitarKeyboardProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger on key press if not already playing
      if (activeString !== null) return;
      
      const key = e.key;
      
      // Map number keys 1-7 to strings
      if (/^[1-7]$/.test(key)) {
        playString(`string${key}`);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeString, playString]);
};
