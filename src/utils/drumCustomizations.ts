
import { DrumKit, DrumPad } from '@/components/instruments/drum-drum machine/data/drumKits';

export interface CustomDrumPad extends DrumPad {
  customName?: string;
  customColor?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface CustomDrumKit extends Omit<DrumKit, 'pads'> {
  pads: CustomDrumPad[];
}

export const saveCustomizations = (kitId: string, customizations: any) => {
  localStorage.setItem(`drum-customizations-${kitId}`, JSON.stringify(customizations));
};

export const loadCustomizations = (kitId: string) => {
  const saved = localStorage.getItem(`drum-customizations-${kitId}`);
  return saved ? JSON.parse(saved) : {};
};

export const resetCustomizations = (kitId: string) => {
  localStorage.removeItem(`drum-customizations-${kitId}`);
};

export const applyCustomizations = (kit: DrumKit, customizations: any): CustomDrumKit => {
  return {
    ...kit,
    pads: kit.pads.map(pad => ({
      ...pad,
      ...customizations[pad.id]
    }))
  };
};
