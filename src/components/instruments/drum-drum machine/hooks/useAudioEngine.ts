
import { useState, useCallback, useRef } from 'react';
import { EnhancedDrumSynthesizer } from '@/utils/audio/drumSynthesizer';
import { useAudioEffects, AudioEffects } from './useAudioEffects';
import { DrumPad } from '../data/drumKits';
import { createVisualFeedback } from '../utils/audio/visualEffects';

export const useAudioEngine = () => {
  const [isLoading, setIsLoading] = useState(false);
  const synthesizerRef = useRef<EnhancedDrumSynthesizer | null>(null);
  const { effects, handleEffectChange, handleEffectToggle } = useAudioEffects();

  const initializeAudio = useCallback(async () => {
    if (!synthesizerRef.current) {
      try {
        setIsLoading(true);
        synthesizerRef.current = new EnhancedDrumSynthesizer();
        console.log('Audio engine initialized');
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const playWithEffects = useCallback(async (pad: DrumPad) => {
    if (!synthesizerRef.current) {
      await initializeAudio();
    }

    try {
      await synthesizerRef.current?.playDrumSound(pad.id, 0.7);
      createVisualFeedback(pad);
    } catch (error) {
      console.error('Error playing drum sound:', error);
    }
  }, [initializeAudio]);

  return {
    effects,
    isLoading,
    playWithEffects,
    initializeAudio,
    handleEffectChange,
    handleEffectToggle
  };
};
