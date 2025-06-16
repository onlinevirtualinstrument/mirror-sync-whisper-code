
import { useState, useCallback } from 'react';

export interface AudioEffects {
  eq: { low: number; mid: number; high: number };
}

export const useAudioEffects = () => {
  const [effects, setEffects] = useState<AudioEffects>({
    eq: { low: 0, mid: 0, high: 0 }
  });
  
  const handleEffectChange = useCallback((effect: string, value: number) => {
    console.log(`Effect ${effect} changed to ${value}`);
    
    setEffects(prev => {
      if (effect.startsWith('eq-')) {
        const band = effect.split('-')[1];
        return {
          ...prev,
          eq: { ...prev.eq, [band]: value }
        };
      }
      
      return prev;
    });
  }, []);
  
  const handleEffectToggle = useCallback((effect: string, enabled: boolean) => {
    console.log(`Effect ${effect} toggled to ${enabled}`);
  }, []);
  
  return {
    effects,
    setEffects,
    handleEffectChange,
    handleEffectToggle
  };
};
