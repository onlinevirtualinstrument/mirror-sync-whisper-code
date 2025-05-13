
// Definitions for different drum kit visual themes
import { DrumElement, commonDrumElements } from './DrumElements';

export interface DrumKitTheme {
  background: string;
  elements: (DrumElement & { color: string })[];
}

export interface DrumKitThemes {
  [key: string]: DrumKitTheme;
}

export const drumKitThemes: DrumKitThemes = {
  standard: {
    background: "bg-[url('https://images.unsplash.com/photo-1618424429013-64254806ea49?q=80&w=1000')]",
    elements: commonDrumElements.map(drum => ({
      ...drum,
      color: drum.id.includes('tom') || drum.id === 'snare' || drum.id === 'floor' 
        ? 'bg-red-600/80' 
        : drum.id.includes('crash') || drum.id.includes('ride') || drum.id === 'hihat'
          ? 'bg-yellow-600/80'
          : drum.id === 'pedal'
            ? 'bg-gray-400/80'
            : 'bg-white/80'
    }))
  },
  rock: {
    background: "bg-[url('https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1000')]",
    elements: commonDrumElements.map(drum => ({
      ...drum,
      color: drum.id.includes('tom') || drum.id === 'snare' || drum.id === 'floor' 
        ? 'bg-red-800/90' 
        : drum.id.includes('crash') || drum.id.includes('ride') || drum.id === 'hihat'
          ? 'bg-amber-700/90'
          : drum.id === 'pedal'
            ? 'bg-gray-600/90'
            : 'bg-slate-200/90'
    }))
  },
  jazz: {
    background: "bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000')]",
    elements: commonDrumElements.map(drum => ({
      ...drum,
      color: drum.id.includes('tom') || drum.id === 'snare' || drum.id === 'floor' 
        ? 'bg-amber-800/80' 
        : drum.id.includes('crash') || drum.id.includes('ride') || drum.id === 'hihat'
          ? 'bg-yellow-500/80'
          : drum.id === 'pedal'
            ? 'bg-gray-300/80'
            : 'bg-slate-100/80'
    }))
  },
  electronic: {
    background: "bg-gradient-to-b from-purple-900 to-black",
    elements: commonDrumElements.map(drum => ({
      ...drum,
      color: drum.id.includes('tom') || drum.id === 'snare' || drum.id === 'floor' 
        ? 'bg-blue-500/90' 
        : drum.id.includes('crash') || drum.id.includes('ride') || drum.id === 'hihat'
          ? 'bg-purple-500/90'
          : drum.id === 'pedal'
            ? 'bg-indigo-400/90'
            : 'bg-cyan-300/90'
    }))
  },
  indian: {
    background: "bg-[url('https://images.unsplash.com/photo-1515091943872-2c080995eecb?q=80&w=1000')]",
    elements: commonDrumElements.map(drum => ({
      ...drum,
      color: drum.id.includes('tom') || drum.id === 'snare' || drum.id === 'floor' 
        ? 'bg-orange-600/80' 
        : drum.id.includes('crash') || drum.id.includes('ride') || drum.id === 'hihat'
          ? 'bg-yellow-500/80'
          : drum.id === 'pedal'
            ? 'bg-brown-500/80'
            : 'bg-amber-100/80'
    }))
  },
};
