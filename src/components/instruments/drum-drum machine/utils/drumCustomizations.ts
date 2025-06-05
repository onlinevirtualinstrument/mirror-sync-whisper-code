
import { DrumPad } from '@/data/drumKits';

// Store drum customizations in localStorage
const STORAGE_KEY = 'drum-kit-customizations';

interface DrumCustomization {
  id: string;
  name?: string;
  color?: string;
  glowColor?: string;
  size?: number;
  position?: { x: number; y: number };
}

// Load saved customizations
export const loadCustomizations = (): Record<string, DrumCustomization> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load drum customizations:', err);
  }
  return {};
};

// Save customizations to localStorage
export const saveCustomizations = (customizations: Record<string, DrumCustomization>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customizations));
  } catch (err) {
    console.error('Failed to save drum customizations:', err);
  }
};

// Apply customizations to drum pads
export const applyCustomizations = (
  pads: DrumPad[],
  customizations: Record<string, DrumCustomization>
): DrumPad[] => {
  return pads.map(pad => {
    const customization = customizations[pad.id];
    if (!customization) return pad;
    
    return {
      ...pad,
      name: customization.name ?? pad.name,
      color: customization.color ?? pad.color,
      glowColor: customization.glowColor ?? pad.glowColor,
      // Additional customization properties will be added here
    };
  });
};

// Update a single drum customization
export const updateDrumCustomization = (
  drumId: string,
  updates: Partial<DrumCustomization>
): Record<string, DrumCustomization> => {
  const customizations = loadCustomizations();
  
  customizations[drumId] = {
    ...customizations[drumId],
    id: drumId,
    ...updates
  };
  
  saveCustomizations(customizations);
  return customizations;
};

// Reset all customizations
export const resetCustomizations = () => {
  localStorage.removeItem(STORAGE_KEY);
  return {};
};
