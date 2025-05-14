
// Keyboard handling for Veena

import { useEffect } from 'react';
import type { VeenaStringData } from './VeenaAudio';

export const useVeenaKeyboard = (
  strings: VeenaStringData[], 
  playString: (freq: number) => void
) => {
  useEffect(() => {
    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const stringObj = strings.find(s => s.key.toUpperCase() === key);
      if (stringObj) {
        playString(stringObj.freq);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [strings, playString]);
};
