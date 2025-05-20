
import { useEffect } from 'react';
import { BanjoString } from './BanjoAudio';

interface BanjoKeyboardProps {
  strings: BanjoString[];
  playString: (stringId: string) => void;
}

export const useBanjoKeyboard = ({
  strings,
  playString
}: BanjoKeyboardProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      
      // Prevent event handling if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const string = strings.find(s => s.key.toUpperCase() === key);
      
      if (string) {
        e.preventDefault(); // Prevent default browser behavior
        playString(string.id);
        
        // Add visual feedback for pressed key
        const keyElement = document.querySelector(`[data-key="${string.key}"]`);
        if (keyElement) {
          keyElement.classList.add('active-key');
          setTimeout(() => keyElement.classList.remove('active-key'), 200);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [strings, playString]);
};