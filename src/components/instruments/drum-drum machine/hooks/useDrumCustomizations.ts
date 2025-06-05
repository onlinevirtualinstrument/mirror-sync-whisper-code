
import { useState, useCallback } from 'react';
import { DrumKit } from '../data/drumKits';
import { 
  saveCustomizations, 
  loadCustomizations, 
  resetCustomizations,
  applyCustomizations,
  CustomDrumKit 
} from '@/utils/drumCustomizations';

export const useCustomizations = (kit: DrumKit) => {
  const [customizations, setCustomizations] = useState(() => 
    loadCustomizations(kit.id)
  );

  const updateCustomization = useCallback((padId: string, updates: any) => {
    const newCustomizations = {
      ...customizations,
      [padId]: { ...customizations[padId], ...updates }
    };
    
    setCustomizations(newCustomizations);
    saveCustomizations(kit.id, newCustomizations);
  }, [customizations, kit.id]);

  const resetAll = useCallback(() => {
    setCustomizations({});
    resetCustomizations(kit.id);
  }, [kit.id]);

  const customizedKit: CustomDrumKit = applyCustomizations(kit, customizations);

  return {
    customizations,
    customizedKit,
    updateCustomization,
    resetAll
  };
};
