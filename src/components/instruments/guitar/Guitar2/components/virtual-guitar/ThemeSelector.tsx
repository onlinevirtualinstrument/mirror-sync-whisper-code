
import React from 'react';
import { Guitar } from 'lucide-react';
import { GuitarColors } from '../VirtualGuitarComponent';

// Define the GuitarTheme type
export type GuitarTheme = 'light' | 'dark' | 'neon' | 'vintage' | 'studio';

// Define the themes and their colors
export const THEME_COLORS: Record<GuitarTheme, GuitarColors> = {
  light: {
    accent: '#3b82f6',
    body: '#cd9b62',
    neck: '#c7a978',
    fretboard: '#42332e',
    soundhole: '#2c1e1a',
    pickups: '#4A360B',
    strings: '#D7D7D7',
    frets: '#AAAAAA',
    inlays: '#FFFFFF'
  },
  dark: {
    accent: '#8b5cf6',
    body: '#774936',
    neck: '#705030',
    fretboard: '#2a1a18',
    soundhole: '#1a0e0c',
    pickups: '#3E2723',
    strings: '#C0C0C0',
    frets: '#8B8B8B',
    inlays: '#F5F5DC'
  },
  neon: {
    accent: '#ec4899',
    body: '#590995',
    neck: '#c8a2c8',
    fretboard: '#31393c',
    soundhole: '#1a0e0c',
    pickups: '#4A360B',
    strings: '#D7D7D7',
    frets: '#AAAAAA',
    inlays: '#FFFFFF'
  },
  vintage: {
    accent: '#10b981',
    body: '#92694b',
    neck: '#816f5a',
    fretboard: '#3a2b23',
    soundhole: '#291f19',
    pickups: '#3E2723',
    strings: '#C0C0C0',
    frets: '#8B8B8B',
    inlays: '#F5F5DC'
  },
  studio: {
    accent: '#f59e0b',
    body: '#2c3e50',
    neck: '#34495e',
    fretboard: '#1a1a2e',
    soundhole: '#16213e',
    pickups: '#4A360B',
    strings: '#D7D7D7',
    frets: '#AAAAAA',
    inlays: '#FFFFFF'
  }
};

const ThemeSelector: React.FC<{
  onThemeChange: (colors: GuitarColors) => void;
}> = ({ onThemeChange }) => {
  
  // Sample themes
  const themes = [
    {
      name: 'Classic',
      colors: {
        body: '#CD9B62',
        neck: '#A3A371',
        fretboard: '#5D4037',
        soundhole: '#2C1810',
        pickups: '#4A360B',
        strings: '#D7D7D7',
        frets: '#AAAAAA',
        inlays: '#FFFFFF'
      }
    },
    {
      name: 'Modern',
      colors: {
        body: '#3B82F6',
        neck: '#A3A371',
        fretboard: '#475569',
        soundhole: '#000000',
        pickups: '#4A360B',
        strings: '#D7D7D7',
        frets: '#AAAAAA',
        inlays: '#FFFFFF'
      }
    },
    {
      name: 'Vintage',
      colors: {
        body: '#8B4513',
        neck: '#A0522D',
        fretboard: '#3E2723',
        soundhole: '#1A120B',
        pickups: '#3E2723',
        strings: '#C0C0C0',
        frets: '#8B8B8B',
        inlays: '#F5F5DC'
      }
    }
  ];
  
  return (
    <div className="flex items-center space-x-2">
      <Guitar className="w-4 h-4" />
      <div className="flex items-center space-x-1">
        {themes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => onThemeChange(theme.colors)}
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ background: theme.colors.body }}
            title={theme.name}
          />
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
