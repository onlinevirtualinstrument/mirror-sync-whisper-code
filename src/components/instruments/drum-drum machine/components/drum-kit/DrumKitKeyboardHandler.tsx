
import { useEffect, useCallback } from 'react';
import { DrumPad } from '../../data/drumKits';

interface DrumKitKeyboardHandlerProps {
  pads: DrumPad[];
  onKeyPress: (pad: DrumPad) => void;
  enabled: boolean;
}

export const DrumKitKeyboardHandler = ({ pads, onKeyPress, enabled }: DrumKitKeyboardHandlerProps) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    const key = e.key.toLowerCase();
    const pad = pads.find(p => p.keyTrigger.toLowerCase() === key);
    
    if (pad) {
      e.preventDefault();
      onKeyPress(pad);
    }
  }, [pads, onKeyPress, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
};
