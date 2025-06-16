
export interface KalimbaVariant {
  id: string;
  name: string;
  description: string;
  color: string;
  bodyColor: string;
  tineColor: string;
  tineCount: number;
  origin: string;
  soundModifier: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    toneQuality: number; // 0-1 value that affects the tone quality
  }
}

export const kalimbaVariants: KalimbaVariant[] = [
  {
    id: "traditional",
    name: "Traditional Mbira",
    description: "Classic African mbira with warm, mellow tones",
    color: "bg-amber-800",
    bodyColor: "bg-amber-700",
    tineColor: "bg-gray-300",
    tineCount: 9,
    origin: "Zimbabwe",
    soundModifier: {
      attack: 0.005,
      decay: 1.5,
      sustain: 0.3,
      release: 1.0,
      toneQuality: 0.9
    }
  },
  {
    id: "crystal",
    name: "Crystal Kalimba",
    description: "Modern crystal kalimba with bright, clear tones",
    color: "bg-blue-500",
    bodyColor: "bg-blue-800/80",
    tineColor: "bg-blue-100",
    tineCount: 9,
    origin: "Contemporary",
    soundModifier: {
      attack: 0.003,
      decay: 0.8,
      sustain: 0.1,
      release: 1.2,
      toneQuality: 0.95
    }
  },
  {
    id: "coconut",
    name: "Coconut Kalimba",
    description: "Handcrafted kalimba with natural coconut resonator",
    color: "bg-amber-900",
    bodyColor: "bg-amber-950",
    tineColor: "bg-amber-200",
    tineCount: 7,
    origin: "Caribbean",
    soundModifier: {
      attack: 0.01,
      decay: 1.2,
      sustain: 0.4,
      release: 1.5,
      toneQuality: 0.85
    }
  },
  {
    id: "bamboo",
    name: "Bamboo Kalimba",
    description: "Lightweight bamboo kalimba with sweet, airy tones",
    color: "bg-green-700",
    bodyColor: "bg-green-800",
    tineColor: "bg-yellow-100",
    tineCount: 11,
    origin: "Southeast Asia",
    soundModifier: {
      attack: 0.008,
      decay: 0.7,
      sustain: 0.2,
      release: 0.9,
      toneQuality: 0.8
    }
  }
];

export const getKalimbaVariantById = (id: string): KalimbaVariant => {
  return kalimbaVariants.find(variant => variant.id === id) || kalimbaVariants[0];
};
