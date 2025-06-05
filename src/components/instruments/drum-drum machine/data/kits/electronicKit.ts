
import { DrumKit } from '../drumKits';

export const electronicKit: DrumKit = {
  id: 'electronic',
  name: 'Electronic Kit',
  pads: [
    {
      id: 'kick',
      name: 'Kick',
      keyTrigger: 'Q',
      soundSrc: 'synthesized',
      color: '#8C9EFF',
      glowColor: 'rgba(140, 158, 255, 0.6)'
    },
    {
      id: 'snare',
      name: 'Snare',
      keyTrigger: 'W',
      soundSrc: 'synthesized',
      color: '#536DFE',
      glowColor: 'rgba(83, 109, 254, 0.6)'
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      keyTrigger: 'E',
      soundSrc: 'synthesized',
      color: '#3D5AFE',
      glowColor: 'rgba(61, 90, 254, 0.6)'
    },
    {
      id: 'shaker',
      name: 'Shaker',
      keyTrigger: 'R',
      soundSrc: 'synthesized',
      color: '#304FFE',
      glowColor: 'rgba(48, 79, 254, 0.6)'
    },
    {
      id: 'clap',
      name: 'Clap',
      keyTrigger: 'A',
      soundSrc: 'synthesized',
      color: '#651FFF',
      glowColor: 'rgba(101, 31, 255, 0.6)'
    },
    {
      id: 'cowbell',
      name: 'Cowbell',
      keyTrigger: 'S',
      soundSrc: 'synthesized',
      color: '#6200EA',
      glowColor: 'rgba(98, 0, 234, 0.6)'
    },
    {
      id: 'crash',
      name: 'Crash',
      keyTrigger: 'D',
      soundSrc: 'synthesized',
      color: '#AA00FF',
      glowColor: 'rgba(170, 0, 255, 0.6)'
    },
    {
      id: 'fx',
      name: 'FX',
      keyTrigger: 'F',
      soundSrc: 'synthesized',
      color: '#D500F9',
      glowColor: 'rgba(213, 0, 249, 0.6)'
    }
  ]
};
