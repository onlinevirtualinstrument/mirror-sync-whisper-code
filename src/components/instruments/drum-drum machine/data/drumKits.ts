
import { classicKit } from './kits/classicKit';
import { electronicKit } from './kits/electronicKit';
import { hiphopKit } from './kits/hiphopKit';
import { jazzKit } from './kits/jazzKit';
import { africanKit } from './kits/africanKit';

// Define types for our drum kits
export interface DrumPad {
  id: string;
  name: string;
  keyTrigger: string;
  soundSrc: string;
  color: string;
  glowColor?: string;
}

export interface DrumKit {
  id: string;
  name: string;
  pads: DrumPad[];
  theme?: {
    background?: string;
    text?: string;
  };
}

export interface DrumKitsCollection {
  [key: string]: DrumKit;
}

// Collect all drum kits in one object
export const drumKits: DrumKitsCollection = {
  classic: classicKit,
  electronic: electronicKit,
  hiphop: hiphopKit,
  jazz: jazzKit,
  african: africanKit
};
