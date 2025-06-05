
import { useState } from 'react';
import { DrumPad } from '@/data/drumKits';
import { loadCustomizations as loadSaved, updateDrumCustomization as updateDrum } from '@/utils/drumCustomizations';
import { toast } from '@/hooks/use-toast';

export interface DrumCustomization {
  id: string;
  name?: string;
  color?: string;
  glowColor?: string;
  size?: number;
}

export const useCustomizations = () => {
  const [customizations, setCustomizations] = useState<Record<string, DrumCustomization>>({});
  
  // Apply customizations to drum pads
  const applyCustomizations = (pads: DrumPad[]): DrumPad[] => {
    return pads.map(pad => {
      const customization = customizations[pad.id];
      if (!customization) return pad;
      
      return {
        ...pad,
        name: customization.name ?? pad.name,
        color: customization.color ?? pad.color,
        glowColor: customization.glowColor ?? pad.glowColor,
        // Add any other customizable properties here
      };
    });
  };

  // Function to handle drum customization
  const handleDrumCustomize = (drumId: string, updates: Partial<DrumCustomization>) => {
    const updatedCustomizations = updateDrum(drumId, updates);
    setCustomizations(updatedCustomizations);
    toast({
      title: "Drum pad customized",
      description: "Your changes have been saved",
      duration: 3000,
    });
  };
  
  // Load saved customizations
  const loadCustomizations = () => {
    const saved = loadSaved();
    return saved;
  };

  return {
    customizations,
    setCustomizations,
    applyCustomizations,
    handleDrumCustomize,
    loadCustomizations
  };
};
