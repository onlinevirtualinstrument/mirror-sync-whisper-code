
import { DrumKit } from '../drumKits';

export const hiphopKit: DrumKit = {
  id: 'hiphop',
  name: 'Hip-Hop Kit',
  pads: [
    {
      id: 'kick',
      name: 'Kick',
      keyTrigger: 'Q',
      soundSrc: 'synthesized',
      color: '#FF6F00',
      glowColor: 'rgba(255, 111, 0, 0.6)'
    },
    {
      id: 'snare',
      name: 'Snare',
      keyTrigger: 'W',
      soundSrc: 'synthesized',
      color: '#FF8F00',
      glowColor: 'rgba(255, 143, 0, 0.6)'
    },
    {
      id: '808',
      name: '808 Bass',
      keyTrigger: 'E',
      soundSrc: 'synthesized',
      color: '#FFA000',
      glowColor: 'rgba(255, 160, 0, 0.6)'
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      keyTrigger: 'R',
      soundSrc: 'synthesized',
      color: '#FFB300',
      glowColor: 'rgba(255, 179, 0, 0.6)'
    },
    {
      id: 'clap',
      name: 'Clap',
      keyTrigger: 'A',
      soundSrc: 'synthesized',
      color: '#FFC107',
      glowColor: 'rgba(255, 193, 7, 0.6)'
    },
    {
      id: 'rimshot',
      name: 'Rimshot',
      keyTrigger: 'S',
      soundSrc: 'synthesized',
      color: '#FFCA28',
      glowColor: 'rgba(255, 202, 40, 0.6)'
    },
    {
      id: 'openhat',
      name: 'Open Hat',
      keyTrigger: 'D',
      soundSrc: 'synthesized',
      color: '#FFD54F',
      glowColor: 'rgba(255, 213, 79, 0.6)'
    },
    {
      id: 'perc',
      name: 'Percussion',
      keyTrigger: 'F',
      soundSrc: 'synthesized',
      color: '#FFE082',
      glowColor: 'rgba(255, 224, 130, 0.6)'
    }
  ]
};
