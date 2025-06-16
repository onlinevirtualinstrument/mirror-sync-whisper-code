
import { DrumKit } from '../drumKits';

export const africanKit: DrumKit = {
  id: 'african',
  name: 'African Percussion',
  pads: [
    {
      id: 'djembe-bass',
      name: 'Djembe Bass',
      keyTrigger: 'Q',
      soundSrc: 'synthesized',
      color: '#8B4513',
      glowColor: 'rgba(139, 69, 19, 0.7)',
    },
    {
      id: 'djembe-tone',
      name: 'Djembe Tone',
      keyTrigger: 'W',
      soundSrc: 'synthesized',
      color: '#A0522D',
      glowColor: 'rgba(160, 82, 45, 0.7)',
    },
    {
      id: 'djembe-slap',
      name: 'Djembe Slap',
      keyTrigger: 'E',
      soundSrc: 'synthesized',
      color: '#CD853F',
      glowColor: 'rgba(205, 133, 63, 0.7)',
    },
    {
      id: 'talking-drum',
      name: 'Talking Drum',
      keyTrigger: 'R',
      soundSrc: 'synthesized',
      color: '#D2691E',
      glowColor: 'rgba(210, 105, 30, 0.7)',
    },
    {
      id: 'shekere',
      name: 'Shekere',
      keyTrigger: 'A',
      soundSrc: 'synthesized',
      color: '#DAA520',
      glowColor: 'rgba(218, 165, 32, 0.7)',
    },
    {
      id: 'udu',
      name: 'Udu Drum',
      keyTrigger: 'S',
      soundSrc: 'synthesized',
      color: '#BC8F8F',
      glowColor: 'rgba(188, 143, 143, 0.7)',
    },
    {
      id: 'kalimba',
      name: 'Kalimba',
      keyTrigger: 'D',
      soundSrc: 'synthesized',
      color: '#F4A460',
      glowColor: 'rgba(244, 164, 96, 0.7)',
    },
    {
      id: 'agogo',
      name: 'Agogo',
      keyTrigger: 'F',
      soundSrc: 'synthesized',
      color: '#D2B48C',
      glowColor: 'rgba(210, 180, 140, 0.7)',
    },
  ],
  theme: {
    background: '#FFF8DC',
    text: '#8B4513',
  },
};
