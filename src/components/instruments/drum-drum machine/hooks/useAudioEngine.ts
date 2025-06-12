
import { useEffect, useCallback } from 'react';
import { useAudioContext } from './useAudioContext';
import { useAudioEffects } from './useAudioEffects';
import { useDrumSoundMapping } from './useDrumSoundMapping';
import { createVisualFeedback } from '../utils/audio/visualEffects';

export const useAudioEngine = () => { 
  const { synthesizerRef, initializeAudio } = useAudioContext();
  const { effects, setEffects, handleEffectChange, handleEffectToggle } = useAudioEffects();
  const { mapDrumSound } = useDrumSoundMapping();
  
  // Initialize audio context on first user interaction
  useEffect(() => {
    const resumeAudioContext = async () => {
      if (synthesizerRef.current) {
        const context = (synthesizerRef.current as any).audioContext;
        if (context && context.state === 'suspended') {
          try {
            await context.resume();
            console.log('Audio context resumed');
          } catch (error) {
            console.error('Failed to resume audio context:', error);
          }
        }
      }
    };
    
    document.addEventListener('click', resumeAudioContext, { once: true });
    document.addEventListener('keydown', resumeAudioContext, { once: true });
    
    return () => {
      document.removeEventListener('click', resumeAudioContext);
      document.removeEventListener('keydown', resumeAudioContext);
    };
  }, [synthesizerRef]);
  
  const playWithEffects = useCallback(async (pad: any) => {
    console.log(`Playing ${pad.name} with enhanced synthesis`);
    
    try {
      await initializeAudio();
      
      if (!synthesizerRef.current) {
        console.error('Synthesizer not available');
        return;
      }
      
      const synthesizer = synthesizerRef.current;
      
      // Apply EQ settings
      synthesizer.setEQ(effects.eq.low, effects.eq.mid, effects.eq.high);
      
      // Create visual feedback
      createVisualFeedback(pad);
      
      // Map and play the drum sound
      await mapDrumSound(synthesizer, pad);
      
      console.log(`Successfully synthesized ${pad.name}`);
      
    } catch (error) {
      console.error(`Error synthesizing ${pad.name}:`, error);
    }
  }, [effects, initializeAudio, synthesizerRef, mapDrumSound]);
  
  return {
    effects,
    setEffects,
    handleEffectChange,
    handleEffectToggle,
    playWithEffects
  };
};

// Re-export AudioEffects for backward compatibility
export type { AudioEffects } from './useAudioEffects';
