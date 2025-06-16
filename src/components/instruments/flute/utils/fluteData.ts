
export interface FluteType {
  id: string;
  name: string;
  description: string;
  origin: string;
  image: string;
  notes: string[];
  soundProfile: {
    tone: string;
    range: string;
    quality: string;
  };
  difficulty: 'beginner' | 'intermediate' | 'expert';
  material?: string;
  backgroundImage?: string;
}

export const fluteTypes: FluteType[] = [
  {
    id: 'western',
    name: 'Western Concert Flute',
    description: 'The modern transverse flute with a bright and versatile sound.',
    origin: 'Europe',
    image: '/lovable-uploads/de01227d-7a6f-49d6-aa18-71d943558930.png',
    backgroundImage: 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 via-purple-900/20',
    material: 'Silver/Gold alloy',
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C2'],
    soundProfile: {
      tone: 'Bright and clear',
      range: 'Three octaves (C4-C7)',
      quality: 'Brilliant and projecting'
    },
    difficulty: 'intermediate'
  },
  {
    id: 'bansuri',
    name: 'Indian Bansuri',
    description: 'A side-blown bamboo flute with a soft, melodic tone.',
    origin: 'India',
    image: '/lovable-uploads/5d41ff7e-2a25-4063-aed6-b6f8a2f146b8.png',
    backgroundImage: 'bg-gradient-to-br from-amber-800/30 to-yellow-700/30 via-orange-800/20',
    material: 'Bamboo',
    notes: ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni', 'Sa2'],
    soundProfile: {
      tone: 'Soft and melodic',
      range: 'Two and a half octaves',
      quality: 'Warm and soulful'
    },
    difficulty: 'intermediate'
  },
  {
    id: 'pan',
    name: 'Pan Flute',
    description: 'A wind instrument consisting of multiple pipes of gradually increasing length.',
    origin: 'Ancient Greece/Romania',
    image: '/lovable-uploads/09eafb8b-353a-4fc1-829b-71ad231eeb98.png',
    backgroundImage: 'bg-gradient-to-br from-teal-800/30 to-emerald-700/30 via-green-800/20',
    material: 'Reed/Bamboo',
    notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F', 'G2'],
    soundProfile: {
      tone: 'Ethereal and breathy',
      range: 'Two octaves',
      quality: 'Haunting and evocative'
    },
    difficulty: 'beginner'
  },
  {
    id: 'native',
    name: 'Native American Flute',
    description: 'A wooden end-blown flute with a distinctive pentatonic scale.',
    origin: 'North America',
    image: '/lovable-uploads/83c0a189-9442-46d4-a987-74ba055632b8.png',
    backgroundImage: 'bg-gradient-to-br from-red-900/30 to-rose-800/30 via-red-800/20',
    material: 'Cedar wood',
    notes: ['A', 'C', 'D', 'E', 'G', 'A2'],
    soundProfile: {
      tone: 'Deep and soulful',
      range: 'One and a half octaves',
      quality: 'Earthy and resonant'
    },
    difficulty: 'beginner'
  }
];

export interface FluteSettings {
  breathSensitivity: number; // 1-10
  tuning: number; // -50 to +50 cents
  reverb: number; // 0-10
  vibrato: {
    intensity: number; // 0-10
    speed: number; // 0-10
  };
  // Add missing properties as defined in defaultFluteSettings
  useMicrophone: boolean;
  transpose: boolean;
  delay: boolean;
  autoVibrato: boolean;
  dynamicRange: number; // 0-10, for loudness range
  allowOverblowing: boolean; // Enable/disable overblowing technique
  acousticProps?: any; // Add support for acoustic properties
}

export const defaultFluteSettings: FluteSettings = {
  breathSensitivity: 5,
  tuning: 0,
  reverb: 3,
  vibrato: {
    intensity: 4,
    speed: 5
  },
  useMicrophone: false,
  transpose: false,
  delay: false,
  autoVibrato: false,
  dynamicRange: 7,
  allowOverblowing: true
};

export interface FluteNote {
  note: string;
  frequency: number;
  keyPosition: number;
}

export const getFluteNotes = (fluteType: string): FluteNote[] => {
  const baseNotes: { [key: string]: FluteNote[] } = {
    western: [
      { note: 'C', frequency: 261.63, keyPosition: 0 },
      { note: 'D', frequency: 293.66, keyPosition: 1 },
      { note: 'E', frequency: 329.63, keyPosition: 2 },
      { note: 'F', frequency: 349.23, keyPosition: 3 },
      { note: 'G', frequency: 392.00, keyPosition: 4 },
      { note: 'A', frequency: 440.00, keyPosition: 5 },
      { note: 'B', frequency: 493.88, keyPosition: 6 },
      { note: 'C2', frequency: 523.25, keyPosition: 7 }
    ],
    bansuri: [
      { note: 'Sa', frequency: 261.63, keyPosition: 0 },
      { note: 'Re', frequency: 294.33, keyPosition: 1 },
      { note: 'Ga', frequency: 327.03, keyPosition: 2 },
      { note: 'Ma', frequency: 348.83, keyPosition: 3 },
      { note: 'Pa', frequency: 392.44, keyPosition: 4 },
      { note: 'Dha', frequency: 436.05, keyPosition: 5 },
      { note: 'Ni', frequency: 490.55, keyPosition: 6 },
      { note: 'Sa2', frequency: 523.25, keyPosition: 7 }
    ],
    pan: [
      { note: 'G', frequency: 391.00, keyPosition: 0 },
      { note: 'A', frequency: 442.00, keyPosition: 1 },
      { note: 'B', frequency: 495.00, keyPosition: 2 },
      { note: 'C', frequency: 525.00, keyPosition: 3 },
      { note: 'D', frequency: 589.00, keyPosition: 4 },
      { note: 'E', frequency: 661.00, keyPosition: 5 },
      { note: 'F', frequency: 699.00, keyPosition: 6 },
      { note: 'G2', frequency: 785.00, keyPosition: 7 }
    ],
    native: [
      { note: 'A', frequency: 438.00, keyPosition: 0 },
      { note: 'C', frequency: 521.00, keyPosition: 1 },
      { note: 'D', frequency: 586.00, keyPosition: 2 },
      { note: 'E', frequency: 657.00, keyPosition: 3 },
      { note: 'G', frequency: 782.00, keyPosition: 4 },
      { note: 'A2', frequency: 876.00, keyPosition: 5 }
    ]
  };

  return baseNotes[fluteType] || baseNotes.western;
};

export const placeholderImages = {
  western: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='80' viewBox='0 0 300 80'%3E%3Crect width='300' height='20' rx='10' fill='%234a7dfc'/%3E%3C/svg%3E",
  bansuri: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='80' viewBox='0 0 300 80'%3E%3Crect width='300' height='20' rx='10' fill='%23a991ff'/%3E%3C/svg%3E",
  pan: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='80' viewBox='0 0 300 80'%3E%3Cg%3E%3Crect x='20' width='20' height='65' rx='5' fill='%2363b3ed'/%3E%3Crect x='50' width='20' height='55' rx='5' fill='%2363b3ed'/%3E%3Crect x='80' width='20' height='70' rx='5' fill='%2363b3ed'/%3E%3Crect x='110' width='20' height='50' rx='5' fill='%2363b3ed'/%3E%3Crect x='140' width='20' height='60' rx='5' fill='%2363b3ed'/%3E%3Crect x='170' width='20' height='45' rx='5' fill='%2363b3ed'/%3E%3Crect x='200' width='20' height='65' rx='5' fill='%2363b3ed'/%3E%3Crect x='230' width='20' height='55' rx='5' fill='%2363b3ed'/%3E%3Crect x='260' width='20' height='40' rx='5' fill='%2363b3ed'/%3E%3C/g%3E%3C/svg%3E",
  native: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='80' viewBox='0 0 300 80'%3E%3Crect width='280' height='30' rx='5' fill='%23805ad5'/%3E%3Ccircle cx='30' cy='15' r='5' fill='white'/%3E%3Ccircle cx='60' cy='15' r='5' fill='white'/%3E%3Ccircle cx='90' cy='15' r='5' fill='white'/%3E%3Ccircle cx='120' cy='15' r='5' fill='white'/%3E%3Ccircle cx='150' cy='15' r='5' fill='white'/%3E%3Ccircle cx='180' cy='15' r='5' fill='white'/%3E%3C/svg%3E"
};

export const fluteInformation = {
  western: {
    history: "The Western concert flute evolved from the wooden simple system flute. The modern flute was developed by Theobald Boehm in the 19th century.",
    materials: "Typically made from silver, gold, or platinum, though student models often use nickel silver.",
    techniques: ["Vibrato", "Flutter-tonguing", "Double-tonguing", "Whisper tones"],
    famousPlayers: ["James Galway", "Emmanuel Pahud", "Jean-Pierre Rampal"]
  },
  bansuri: {
    history: "The bansuri is one of the oldest musical instruments of India, with references dating back to 1500 BCE.",
    materials: "Traditionally made from a single bamboo shaft with six or seven finger holes.",
    techniques: ["Gamak (oscillating notes)", "Meend (gliding from one note to another)", "Kan-swar (grace notes)"],
    famousPlayers: ["Hariprasad Chaurasia", "Pannalal Ghosh", "Ronu Majumdar"]
  },
  pan: {
    history: "The pan flute is named after Pan, the Greek god of nature. It has been used for thousands of years across Europe, Asia, and South America.",
    materials: "Traditionally made from cane, bamboo, or reeds, modern versions may use wood, plastic, or metal.",
    techniques: ["Vibratory breathing", "Articulation techniques", "Position shifting"],
    famousPlayers: ["Gheorghe Zamfir", "Damian Draghici", "Simion Stanciu"]
  },
  native: {
    history: "Native American flutes have been used by indigenous peoples for ceremonial, healing, and recreational purposes for thousands of years.",
    materials: "Traditionally crafted from cedar, redwood, or other local woods.",
    techniques: ["Breath control", "Finger vibrato", "Vocalization while playing"],
    famousPlayers: ["R. Carlos Nakai", "Mary Youngblood", "Kevin Locke"]
  }
};

export const fluteAcousticProperties = {
  western: {
    attackTime: 0.08,
    releaseTime: 0.2,
    harmonicProfile: [1, 0.5, 0.3, 0.2, 0.1],
    noiseAmount: 0.05,
    resonance: 0.7
  },
  bansuri: {
    attackTime: 0.12,
    releaseTime: 0.3,
    harmonicProfile: [1, 0.6, 0.15, 0.1, 0.05],
    noiseAmount: 0.1,
    resonance: 0.8
  },
  pan: {
    attackTime: 0.05,
    releaseTime: 0.15,
    harmonicProfile: [1, 0.4, 0.35, 0.25, 0.15],
    noiseAmount: 0.07,
    resonance: 0.65
  },
  native: {
    attackTime: 0.15,
    releaseTime: 0.4,
    harmonicProfile: [1, 0.7, 0.2, 0.05, 0.02],
    noiseAmount: 0.12,
    resonance: 0.9
  }
};
