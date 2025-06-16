import React, { memo, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GuitarType } from './GuitarSoundProfiles';
import { GuitarTheme, THEME_COLORS } from './ThemeSelector';

// Guitar type metadata for better accessibility and UX
const GUITAR_TYPE_METADATA = {
  acoustic: {
    label: 'Acoustic Guitar',
    description: 'Rich, balanced sound with strong mid-range'
  },
  electric: {
    label: 'Electric Guitar',
    description: 'Modern, amplified tones perfect for rock'
  },
  bass: {
    label: 'Bass Guitar',
    description: 'Deep, low-end frequencies for rhythm section'
  },
  classical: {
    label: 'Classical Guitar',
    description: 'Nylon strings with warm, mellow tone'
  },
  flamenco: {
    label: 'Flamenco Guitar',
    description: 'Bright, percussive Spanish sound'
  },
  steel: {
    label: 'Steel Guitar',
    description: 'Resonant, metallic tone with clarity'
  },
  twelveString: {
    label: '12-String Guitar',
    description: 'Full, chorus-like effect with doubled strings'
  }
};

interface GuitarTopControlsProps {
  volume: number;
  onVolumeChange: (value: number) => void;
  guitarType: GuitarType;
  onGuitarTypeChange: (type: GuitarType) => void;
  theme: GuitarTheme;
  onThemeChange: (theme: GuitarTheme) => void;
}

const GuitarTopControls: React.FC<GuitarTopControlsProps> = ({
  volume,
  onVolumeChange,
  guitarType,
  onGuitarTypeChange,
  theme,
  onThemeChange
}) => {
  // Memoize handlers to prevent unnecessary re-renders
  const handleVolumeChange = useCallback((value: number[]) => {
    onVolumeChange(value[0]);
  }, [onVolumeChange]);
  
  const toggleMute = useCallback(() => {
    onVolumeChange(volume === 0 ? 80 : 0);
  }, [volume, onVolumeChange]);
  
  const guitarTypes: GuitarType[] = ['acoustic', 'electric', 'bass', 'classical', 'flamenco', 'steel', 'twelveString'];
  const themes: GuitarTheme[] = ['light', 'dark', 'neon', 'vintage', 'studio'];
  
  const getGuitarTypeLabel = (type: GuitarType): string => {
    return GUITAR_TYPE_METADATA[type]?.label || type;
  };
  
  const getGuitarTypeDescription = (type: GuitarType): string => {
    return GUITAR_TYPE_METADATA[type]?.description || '';
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
      {/* Volume Control */}
      <div className="flex items-center gap-3 w-full sm:w-1/3">
        <button 
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-black/10 transition-all duration-300"
          aria-label={volume === 0 ? "Unmute" : "Mute"}
        >
          {volume === 0 ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
        
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="w-full"
          aria-label="Volume control"
        />
        
        <span className="text-sm font-medium w-8">{volume}%</span>
      </div>
      
      {/* Guitar Type Selector */}
      <div className="w-full sm:w-1/3">
        <Select 
          value={guitarType} 
          onValueChange={(value) => onGuitarTypeChange(value as GuitarType)}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <span className="text-amber-500">🎸</span>
              <SelectValue placeholder="Select guitar type" />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectGroup>
              {guitarTypes.map((type) => (
                <SelectItem 
                  key={type} 
                  value={type}
                  className="flex flex-col items-start py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">🎸</span>
                    <div>
                      <div className="font-medium text-blue-600">{getGuitarTypeLabel(type)}</div>
                      <div className="text-xs text-gray-500">{getGuitarTypeDescription(type)}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {/* Theme Selector */}
      <div className="w-full sm:w-1/3">
        <Select value={theme} onValueChange={(value) => onThemeChange(value as GuitarTheme)}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <div 
                className="h-4 w-4 rounded-full" 
                style={{ background: THEME_COLORS[theme].accent }}
                aria-hidden="true"
              />
              <SelectValue placeholder="Select theme" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {themes.map((themeOption) => (
                <SelectItem 
                  key={themeOption} 
                  value={themeOption}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="h-4 w-4 rounded-full" 
                    style={{ background: THEME_COLORS[themeOption].accent }}
                    aria-hidden="true"
                  />
                  <span className="capitalize">{themeOption}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(GuitarTopControls);
