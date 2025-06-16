
import { useRef, useCallback } from 'react';
import { EnhancedDrumSynthesizer } from '../utils/audio/drumSynthesizer';

export const useAudioContext = () => {
  const synthesizerRef = useRef<EnhancedDrumSynthesizer | null>(null);
  
  const initializeAudio = useCallback(async () => { 
    if (!synthesizerRef.current) {
      try {
        synthesizerRef.current = new EnhancedDrumSynthesizer();
        console.log('Enhanced audio synthesizer initialized successfully');
      } catch (error) {
        console.error('Failed to initialize audio synthesizer:', error);
      }
    }
  }, []);
  
  return {
    synthesizerRef,
    initializeAudio
  };
};
