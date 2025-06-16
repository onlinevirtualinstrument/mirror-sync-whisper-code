
import { DrumKit } from '../drumKits';

export const jazzKit: DrumKit = {
  id: 'jazz',
  name: 'Jazz Kit',
  pads: [
    {
      id: 'kick',
      name: 'Kick',
      keyTrigger: 'Q',
      soundSrc: 'synthesized',
      color: '#5D4037',
      glowColor: 'rgba(93, 64, 55, 0.6)'
    },
    {
      id: 'snare',
      name: 'Snare',
      keyTrigger: 'W',
      soundSrc: 'synthesized',
      color: '#795548',
      glowColor: 'rgba(121, 85, 72, 0.6)'
    },
    {
      id: 'hihat-closed',
      name: 'Hi-Hat Closed',
      keyTrigger: 'E',
      soundSrc: 'synthesized',
      color: '#8D6E63',
      glowColor: 'rgba(141, 110, 99, 0.6)'
    },
    {
      id: 'hihat-open',
      name: 'Hi-Hat Open',
      keyTrigger: 'R',
      soundSrc: 'synthesized',
      color: '#A1887F',
      glowColor: 'rgba(161, 136, 127, 0.6)'
    },
    {
      id: 'ride',
      name: 'Ride Cymbal',
      keyTrigger: 'A',
      soundSrc: 'synthesized',
      color: '#BCAAA4',
      glowColor: 'rgba(188, 170, 164, 0.6)'
    },
    {
      id: 'brush-swirl',
      name: 'Brush Swirl',
      keyTrigger: 'S',
      soundSrc: 'synthesized',
      color: '#D7CCC8',
      glowColor: 'rgba(215, 204, 200, 0.6)'
    },
    {
      id: 'brush-tap',
      name: 'Brush Tap',
      keyTrigger: 'D',
      soundSrc: 'synthesized',
      color: '#EFEBE9',
      glowColor: 'rgba(239, 235, 233, 0.6)'
    },
    {
      id: 'crash',
      name: 'Crash Cymbal',
      keyTrigger: 'F',
      soundSrc: 'synthesized',
      color: '#D7CCC8',
      glowColor: 'rgba(215, 204, 200, 0.6)'
    }
  ]
};
