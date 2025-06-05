
import { useCallback } from 'react';
import { EnhancedDrumSynthesizer } from '@/utils/audio/drumSynthesizer';

export const useDrumSoundMapping = (synthesizer: EnhancedDrumSynthesizer | null) => {
  const playMappedSound = useCallback(async (drumType: string, volume: number = 0.7) => {
    if (!synthesizer) return;

    const soundMap: Record<string, string> = {
      'kick': 'kick',
      'snare': 'snare',
      'hihat': 'hihat',
      'hi-hat': 'hihat',
      'crash': 'crash',
      'ride': 'ride',
      'tom': 'tom',
      'clap': 'clap',
      'cowbell': 'cowbell',
      'shaker': 'shaker'
    };

    const mappedType = soundMap[drumType.toLowerCase()] || drumType;
    await synthesizer.playDrumSound(mappedType, volume);
  }, [synthesizer]);

  return { playMappedSound };
};
