
export interface MarimbaVariant {
  id: string;
  name: string;
  description: string;
  color: string;
  tuning: string;
  resonatorColor: string;
  woodType: string;
  numberOfBars: number;
  soundModifier: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    toneQuality: number; // 0-1 value that affects the tone quality
  }
}

export const marimbaVariants: MarimbaVariant[] = [
  {
    id: "traditional",
    name: "Traditional Rosewood",
    description: "Classic Central American rosewood marimba with rich, warm tones",
    color: "bg-amber-800",
    tuning: "Classic",
    resonatorColor: "bg-amber-900/90",
    woodType: "Rosewood",
    numberOfBars: 8,
    soundModifier: {
      attack: 0.01,
      decay: 1.2,
      sustain: 0.2,
      release: 0.8,
      toneQuality: 0.9
    }
  },
  {
    id: "synthetic",
    name: "Synthetic Padauk",
    description: "Modern synthetic padauk bars with bright, clear tones",
    color: "bg-orange-700",
    tuning: "Modern",
    resonatorColor: "bg-gray-600/90",
    woodType: "Synthetic Padauk",
    numberOfBars: 8,
    soundModifier: {
      attack: 0.005,
      decay: 0.9,
      sustain: 0.1,
      release: 0.5,
      toneQuality: 0.8
    }
  },
  {
    id: "bass",
    name: "Bass Marimba",
    description: "Low register bass marimba with deep, resonant tones",
    color: "bg-amber-900",
    tuning: "Low",
    resonatorColor: "bg-amber-950/90",
    woodType: "African Padauk",
    numberOfBars: 8,
    soundModifier: {
      attack: 0.02,
      decay: 1.8,
      sustain: 0.3,
      release: 1.2,
      toneQuality: 1.0
    }
  },
  {
    id: "soprano",
    name: "Soprano Marimba",
    description: "High register marimba with bright, crisp tones",
    color: "bg-amber-600",
    tuning: "High",
    resonatorColor: "bg-amber-700/90",
    woodType: "Honduras Rosewood",
    numberOfBars: 8,
    soundModifier: {
      attack: 0.005,
      decay: 0.7,
      sustain: 0.05,
      release: 0.4,
      toneQuality: 0.85
    }
  }
];

export const getMarimbaVariantById = (id: string): MarimbaVariant => {
  return marimbaVariants.find(variant => variant.id === id) || marimbaVariants[0];
};
