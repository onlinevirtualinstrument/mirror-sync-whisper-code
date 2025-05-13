
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'custom';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  customColors: CustomColors;
  setCustomColors: (colors: CustomColors) => void;
}

interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

const defaultCustomColors: CustomColors = {
  primary: '#646cff',
  secondary: '#535bf2',
  accent: '#747bff',
  background: '#242424',
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  setMode: () => {},
  customColors: defaultCustomColors,
  setCustomColors: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [customColors, setCustomColors] = useState<CustomColors>(defaultCustomColors);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    const savedColors = localStorage.getItem('customColors');
    
    if (savedMode) {
      setMode(savedMode);
    }
    
    if (savedColors) {
      try {
        setCustomColors(JSON.parse(savedColors));
      } catch (e) {
        console.error('Failed to parse saved custom colors');
      }
    }
  }, []);

  useEffect(() => {
    // Save theme preferences
    localStorage.setItem('themeMode', mode);
    localStorage.setItem('customColors', JSON.stringify(customColors));
    
    // Apply theme to document
    const root = document.documentElement;
    
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    if (mode === 'custom') {
      // Convert hex to HSL and apply it for CSS variables
      const hexToHSL = (hex: string) => {
        // Remove the # if present
        hex = hex.replace(/^#/, '');
        
        // Parse the hex values
        let r = parseInt(hex.slice(0, 2), 16) / 255;
        let g = parseInt(hex.slice(2, 4), 16) / 255;
        let b = parseInt(hex.slice(4, 6), 16) / 255;
        
        // Find the min and max values to calculate saturation
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        
        // Calculate HSL values
        let h = 0, s = 0, l = (max + min) / 2;
        
        if (max !== min) {
          let d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          
          h = Math.round(h * 60);
        }
        
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        
        return `${h} ${s}% ${l}%`;
      };
      
      // Apply both direct hex and HSL values for broader compatibility
      root.style.setProperty('--primary', customColors.primary);
      root.style.setProperty('--secondary', customColors.secondary);
      root.style.setProperty('--accent', customColors.accent);
      root.style.setProperty('--background', customColors.background);
      
      // Apply HSL values to CSS variables for shadcn compatibility
      root.style.setProperty('--primary-hsl', hexToHSL(customColors.primary));
      root.style.setProperty('--secondary-hsl', hexToHSL(customColors.secondary));
      root.style.setProperty('--accent-hsl', hexToHSL(customColors.accent));
      root.style.setProperty('--background-hsl', hexToHSL(customColors.background));
      
      // Apply additional color transformations
      document.body.style.backgroundColor = customColors.background;
      document.body.style.color = getContrastingTextColor(customColors.background);
    } else {
      // Clear custom properties
      root.style.removeProperty('--primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--background');
      root.style.removeProperty('--primary-hsl');
      root.style.removeProperty('--secondary-hsl');
      root.style.removeProperty('--accent-hsl');
      root.style.removeProperty('--background-hsl');
      
      // Reset body styles
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
  }, [mode, customColors]);
  
  // Function to determine if text should be white or black based on background color
  function getContrastingTextColor(hexColor: string) {
    // Remove the # if present
    const hex = hexColor.replace(/^#/, '');
    
    // Parse the hex values
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Calculate relative luminance using the formula
    // https://www.w3.org/TR/WCAG20/#relativeluminancedef
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, customColors, setCustomColors }}>
      {children}
    </ThemeContext.Provider>
  );
};
