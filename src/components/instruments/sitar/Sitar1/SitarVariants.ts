
export interface SitarVariant {
  id: string;
  name: string;
  audioProfile?: {
    toneColor: number;
    resonance: number;
    attackSpeed: number;
    sustainTime: number;
  };
}

export const sitarVariants: Record<string, SitarVariant> = {
  standard: { 
    id: 'standard', 
    name: 'Standard Sitar',
    audioProfile: {
      toneColor: 0.5,
      resonance: 0.7,
      attackSpeed: 0.03,
      sustainTime: 3.0
    }
  },
  punjabi: { 
    id: 'punjabi', 
    name: 'Punjabi Style',
    audioProfile: {
      toneColor: 0.65,
      resonance: 0.8,
      attackSpeed: 0.02,
      sustainTime: 3.5
    }
  },
  bengali: { 
    id: 'bengali', 
    name: 'Bengali Style',
    audioProfile: {
      toneColor: 0.55,
      resonance: 0.75,
      attackSpeed: 0.025,
      sustainTime: 3.2
    }
  },
  electric: { 
    id: 'electric', 
    name: 'Electric Sitar',
    audioProfile: {
      toneColor: 0.4,
      resonance: 0.6,
      attackSpeed: 0.01,
      sustainTime: 2.5
    }
  }
};
