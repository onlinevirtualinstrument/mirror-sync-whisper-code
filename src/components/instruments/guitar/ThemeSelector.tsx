
import React from 'react';
import { Sun, Moon, Palette, Guitar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GuitarType } from './GuitarSoundProfiles';

export type GuitarTheme = 'light' | 'dark' | 'neon' | 'vintage' | 'studio';

interface ThemeSelectorProps {
  theme: GuitarTheme;
  guitarType: GuitarType;
  onThemeChange: (theme: GuitarTheme) => void;
  onGuitarTypeChange: (type: GuitarType) => void;
}

export const THEME_COLORS = {
  light: {
    primary: '#F9FAFB',
    accent: '#2563EB',
    text: '#111827',
    acoustic: {
      body: '#C87533',
      neck: '#D2B48C',
      fretboard: '#5D4037',
      strings: '#D7D7D7'
    },
    electric: {
      body: '#E74C3C',
      neck: '#D2B48C',
      fretboard: '#5D4037',
      strings: '#D7D7D7'
    },
    bass: {
      body: '#34495E',
      neck: '#A0522D',
      fretboard: '#3E2723',
      strings: '#D7D7D7'
    },
    classical: {
      body: '#D2B48C',
      neck: '#C87533',
      fretboard: '#5D4037',
      strings: '#F5F5DC'
    },
    flamenco: {
      body: '#F5DEB3',
      neck: '#D2B48C',
      fretboard: '#8B4513',
      strings: '#F5F5DC'
    },
    steel: {
      body: '#C0C0C0',
      neck: '#A0A0A0',
      fretboard: '#808080',
      strings: '#D7D7D7'
    },
    twelveString: {
      body: '#CD853F',
      neck: '#D2B48C',
      fretboard: '#5D4037',
      strings: '#D7D7D7'
    }
  },
  dark: {
    primary: '#1F2937',
    accent: '#6366F1',
    text: '#F9FAFB',
    acoustic: {
      body: '#8B4513',
      neck: '#A0522D',
      fretboard: '#3E2723',
      strings: '#BBBBBB'
    },
    electric: {
      body: '#7B241C',
      neck: '#A0522D',
      fretboard: '#3E2723',
      strings: '#BBBBBB'
    },
    bass: {
      body: '#1B2631',
      neck: '#8B4513',
      fretboard: '#2A1910',
      strings: '#BBBBBB'
    },
    classical: {
      body: '#8B7355',
      neck: '#8B4513',
      fretboard: '#3E2723',
      strings: '#E8E8DC'
    },
    flamenco: {
      body: '#D2B48C',
      neck: '#8B4513',
      fretboard: '#5D2906',
      strings: '#E8E8DC'
    },
    steel: {
      body: '#A0A0A0',
      neck: '#808080',
      fretboard: '#505050',
      strings: '#BBBBBB'
    },
    twelveString: {
      body: '#8B5A2B',
      neck: '#8B4513',
      fretboard: '#3E2723',
      strings: '#BBBBBB'
    }
  },
  neon: {
    primary: '#0F172A',
    accent: '#EC4899',
    text: '#ECFDF5',
    acoustic: {
      body: '#FF4081',
      neck: '#7E57C2',
      fretboard: '#311B92',
      strings: '#80DEEA'
    },
    electric: {
      body: '#00BCD4',
      neck: '#7E57C2',
      fretboard: '#311B92',
      strings: '#FF4081'
    },
    bass: {
      body: '#673AB7',
      neck: '#4527A0',
      fretboard: '#311B92',
      strings: '#18FFFF'
    },
    classical: {
      body: '#FF7043',
      neck: '#7E57C2',
      fretboard: '#311B92',
      strings: '#64FFDA'
    },
    flamenco: {
      body: '#FFC107',
      neck: '#7E57C2',
      fretboard: '#311B92',
      strings: '#EEFF41'
    },
    steel: {
      body: '#40C4FF',
      neck: '#7E57C2',
      fretboard: '#311B92',
      strings: '#CCFF90'
    },
    twelveString: {
      body: '#FF9800',
      neck: '#7E57C2',
      fretboard: '#311B92',
      strings: '#B2FF59'
    }
  },
  vintage: {
    primary: '#F5F5DC',
    accent: '#A0522D',
    text: '#3E2723',
    acoustic: {
      body: '#A0522D',
      neck: '#CD853F',
      fretboard: '#5D4037',
      strings: '#D2B48C'
    },
    electric: {
      body: '#800000',
      neck: '#CD853F',
      fretboard: '#5D4037',
      strings: '#D2B48C'
    },
    bass: {
      body: '#556B2F',
      neck: '#8B4513',
      fretboard: '#3E2723',
      strings: '#D2B48C'
    },
    classical: {
      body: '#DEB887',
      neck: '#CD853F',
      fretboard: '#5D4037',
      strings: '#F5F5DC'
    },
    flamenco: {
      body: '#F5DEB3',
      neck: '#CD853F',
      fretboard: '#8B4513',
      strings: '#F5F5DC'
    },
    steel: {
      body: '#B38B6D',
      neck: '#CD853F',
      fretboard: '#5D4037',
      strings: '#D2B48C'
    },
    twelveString: {
      body: '#BC8F8F',
      neck: '#CD853F',
      fretboard: '#5D4037',
      strings: '#D2B48C'
    }
  },
  studio: {
    primary: '#121212',
    accent: '#FF0000',
    text: '#E0E0E0',
    acoustic: {
      body: '#2C3E50',
      neck: '#34495E',
      fretboard: '#1B2631',
      strings: '#E0E0E0'
    },
    electric: {
      body: '#2C3E50',
      neck: '#34495E',
      fretboard: '#1B2631',
      strings: '#E0E0E0'
    },
    bass: {
      body: '#1B2631',
      neck: '#2C3E50',
      fretboard: '#1B2631',
      strings: '#E0E0E0'
    },
    classical: {
      body: '#2C3E50',
      neck: '#34495E',
      fretboard: '#1B2631',
      strings: '#E0E0E0'
    },
    flamenco: {
      body: '#2C3E50',
      neck: '#34495E',
      fretboard: '#1B2631',
      strings: '#E0E0E0'
    },
    steel: {
      body: '#2C3E50',
      neck: '#34495E',
      fretboard: '#1B2631',
      strings: '#E0E0E0'
    },
    twelveString: {
      body: '#2C3E50',
      neck: '#34495E',
      fretboard: '#1B2631',
      strings: '#E0E0E0'
    }
  }
};

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ theme, guitarType, onThemeChange, onGuitarTypeChange }) => {
  return (
    <div className="glass-morphism p-4 rounded-xl">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Theme</h3>
          <Palette className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(THEME_COLORS) as GuitarTheme[]).map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => onThemeChange(themeOption)}
              className={cn(
                "p-2 rounded-md flex flex-col items-center gap-1 transition-all",
                theme === themeOption ? "ring-2 ring-black/50 dark:ring-white/50 scale-105" : "hover:bg-black/5 dark:hover:bg-white/5"
              )}
              style={{
                background: THEME_COLORS[themeOption].primary,
                color: THEME_COLORS[themeOption].text
              }}
            >
              {themeOption === 'light' && <Sun className="h-4 w-4" style={{ color: THEME_COLORS[themeOption].accent }} />}
              {themeOption === 'dark' && <Moon className="h-4 w-4" style={{ color: THEME_COLORS[themeOption].accent }} />}
              {themeOption !== 'light' && themeOption !== 'dark' && (
                <div className="h-4 w-4 rounded-full" style={{ background: THEME_COLORS[themeOption].accent }} />
              )}
              <span className="text-xs capitalize" style={{ color: THEME_COLORS[themeOption].text }}>{themeOption}</span>
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <h3 className="text-sm font-medium">Guitar Type</h3>
          <Guitar className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {(['acoustic', 'electric', 'bass', 'classical', 'flamenco', 'steel', 'twelveString'] as GuitarType[]).map((type) => (
            <button
              key={type}
              onClick={() => onGuitarTypeChange(type)}
              className={cn(
                "p-2 rounded-md flex flex-col items-center text-xs gap-1 transition-all",
                guitarType === type ? "ring-2 ring-black/50 dark:ring-white/50 scale-105" : "hover:bg-black/5 dark:hover:bg-white/5"
              )}
              style={{
                background: THEME_COLORS[theme][type]?.body || THEME_COLORS.light[type].body,
                color: THEME_COLORS[theme].text
              }}
            >
              <span className="capitalize">{type === 'twelveString' ? '12-String' : type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
