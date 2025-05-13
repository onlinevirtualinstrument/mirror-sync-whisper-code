
export interface InstrumentVariation {
  id: string;
  name: string;
  price: string;
}

export interface RelatedInstrument {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Instrument {
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  moreImages: string[];
  specs: Record<string, string>;
  variations: InstrumentVariation[];
  relatedInstruments: RelatedInstrument[];
}

// Sound sample URLs for each instrument
export const instrumentSoundURLs: Record<string, string> = {
  "1": "/sounds/violin.mp3",
  "2": "/sounds/piano.mp3",
  "3": "/sounds/saxophone.mp3",
  "4": "/sounds/guitar.mp3",
  "5": "/sounds/drums.mp3",
  "6": "/sounds/trumpet.mp3",
  "7": "/sounds/cello.mp3", 
  "8": "/sounds/synthesizer.mp3",
  "9": "/sounds/xylophone.mp3",
  "10": "/sounds/flute.mp3",
  "11": "/sounds/accordion.mp3",
  "12": "/sounds/electric-guitar.mp3",
  "violin": "/sounds/violin.mp3",
  "piano": "/sounds/piano.mp3",
  "viola": "/sounds/viola.mp3",
  "cello": "/sounds/cello.mp3",
  "upright-piano": "/sounds/upright-piano.mp3",
  "digital-piano": "/sounds/digital-piano.mp3",
  "ukulele": "/sounds/ukulele.mp3",
  "bongos": "/sounds/bongos.mp3",
  "trombone": "/sounds/trombone.mp3"
};

// Extended instrument data with more instruments
export const instrumentData: Record<string, Instrument> = {
  violin: {
    name: 'Classical Violin',
    category: 'String',
    description: 'A beautiful classical violin crafted with premium materials for exceptional sound quality. This instrument features a solid spruce top and maple back, with ebony fingerboard and fittings.',
    imageUrl: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1621784562807-14b1a1fc530d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    ],
    specs: {
      'Body': 'Solid spruce top, maple back and sides',
      'Fingerboard': 'Ebony',
      'Strings': 'Dominant strings',
      'Length': '23.5 inches (4/4 size)',
      'Weight': '480g',
      'Bow': 'Included, pernambuco wood',
      'Case': 'Included, hardshell'
    },
    variations: [
      { id: '1', name: '4/4 Size (Full)', price: '$899' },
      { id: '2', name: '3/4 Size', price: '$849' },
      { id: '3', name: '1/2 Size', price: '$799' }
    ],
    relatedInstruments: [
      { id: 'viola', name: 'Viola', imageUrl: 'https://images.unsplash.com/photo-1621372061897-a90b9e38995f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHZpb2xhfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' },
      { id: 'cello', name: 'Cello', imageUrl: 'https://images.unsplash.com/photo-1622987572239-21b59dd8d50a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80' }
    ]
  },
  piano: {
    name: 'Grand Piano',
    category: 'Keyboard',
    description: 'An exceptional grand piano with rich, resonant sound and responsive action. This premium instrument is perfect for performances and professional recordings.',
    imageUrl: 'https://images.unsplash.com/photo-1552422535-c45813c61732?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1552422535-c45813c61732?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1545293527-e26058c5b48b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
      'https://images.unsplash.com/photo-1551970634-747846a548cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    ],
    specs: {
      'Type': 'Grand Piano',
      'Length': '6\'1" (185 cm)',
      'Keys': '88 weighted keys',
      'Pedals': '3 (Sustain, Sostenuto, Soft)',
      'Finish': 'Polished Ebony',
      'Soundboard': 'Solid Spruce',
      'Warranty': '10 years'
    },
    variations: [
      { id: '1', name: 'Classic Black', price: '$24,999' },
      { id: '2', name: 'Polished White', price: '$25,999' }
    ],
    relatedInstruments: [
      { id: 'upright-piano', name: 'Upright Piano', imageUrl: 'https://images.unsplash.com/photo-1568219656418-15c329312bf1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
      { id: 'digital-piano', name: 'Digital Piano', imageUrl: 'https://images.unsplash.com/photo-1619428752199-80dbbaecf94c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80' }
    ]
  },
  // Add more instruments to match the ones in the Explore page
  "1": {
    name: 'Classical Violin',
    category: 'String',
    description: 'A beautiful classical violin crafted with premium materials for exceptional sound quality. Perfect for professionals and serious students.',
    imageUrl: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1621784562807-14b1a1fc530d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    ],
    specs: {
      'Body': 'Solid spruce top, maple back and sides',
      'Fingerboard': 'Ebony',
      'Strings': 'Dominant strings',
      'Length': '23.5 inches (4/4 size)',
      'Weight': '480g'
    },
    variations: [
      { id: '1', name: '4/4 Size (Full)', price: '$899' },
      { id: '2', name: '3/4 Size', price: '$849' }
    ],
    relatedInstruments: [
      { id: 'viola', name: 'Viola', imageUrl: 'https://images.unsplash.com/photo-1621372061897-a90b9e38995f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHZpb2xhfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' },
      { id: 'cello', name: 'Cello', imageUrl: 'https://images.unsplash.com/photo-1622987572239-21b59dd8d50a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80' }
    ]
  },
  "2": {
    name: 'Grand Piano',
    category: 'Keyboard',
    description: 'An exceptional grand piano with rich, resonant sound and responsive action. This premium instrument is perfect for performances and professional recordings.',
    imageUrl: 'https://images.unsplash.com/photo-1552422535-c45813c61732?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1552422535-c45813c61732?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1545293527-e26058c5b48b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
      'https://images.unsplash.com/photo-1551970634-747846a548cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    ],
    specs: {
      'Type': 'Grand Piano',
      'Length': '6\'1" (185 cm)',
      'Keys': '88 weighted keys',
      'Pedals': '3 (Sustain, Sostenuto, Soft)',
      'Finish': 'Polished Ebony'
    },
    variations: [
      { id: '1', name: 'Classic Black', price: '$24,999' },
      { id: '2', name: 'Polished White', price: '$25,999' }
    ],
    relatedInstruments: [
      { id: 'upright-piano', name: 'Upright Piano', imageUrl: 'https://images.unsplash.com/photo-1568219656418-15c329312bf1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
      { id: 'digital-piano', name: 'Digital Piano', imageUrl: 'https://images.unsplash.com/photo-1619428752199-80dbbaecf94c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80' }
    ]
  },
  "3": {
    name: 'Professional Saxophone',
    category: 'Wind',
    description: 'A professional-grade saxophone with exceptional tonal quality. Perfect for jazz, classical, and contemporary music performances.',
    imageUrl: 'https://images.unsplash.com/photo-1605020420620-20c943cc4669?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1605020420620-20c943cc4669?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1572868369902-25283b9bbcd4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1573871668960-832d1ed8ba7b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
    ],
    specs: {
      'Type': 'Alto Saxophone',
      'Material': 'Brass with gold lacquer finish',
      'Key': 'Eb',
      'Range': 'Low Bb to high F#',
      'Weight': '2.8kg'
    },
    variations: [
      { id: '1', name: 'Alto Saxophone', price: '$1,899' },
      { id: '2', name: 'Tenor Saxophone', price: '$2,149' }
    ],
    relatedInstruments: [
      { id: '6', name: 'Trumpet', imageUrl: 'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
      { id: '10', name: 'Flute', imageUrl: 'https://images.unsplash.com/photo-1621368286550-f54551f39b91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' }
    ]
  },
  "4": {
    name: 'Acoustic Guitar',
    category: 'String',
    description: 'A versatile acoustic guitar with warm, rich tone. Perfect for beginners and seasoned musicians alike.',
    imageUrl: 'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
      'https://images.unsplash.com/photo-1588449668365-d15e397f6787?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    ],
    specs: {
      'Top': 'Solid Sitka Spruce',
      'Back & Sides': 'Mahogany',
      'Neck': 'Mahogany',
      'Fingerboard': 'Rosewood',
      'Strings': '6-string, steel',
      'Scale Length': '25.5 inches'
    },
    variations: [
      { id: '1', name: 'Dreadnought', price: '$599' },
      { id: '2', name: 'Concert', price: '$549' }
    ],
    relatedInstruments: [
      { id: '12', name: 'Electric Guitar', imageUrl: 'https://images.unsplash.com/photo-1606133950236-3df232c661cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
      { id: 'ukulele', name: 'Ukulele', imageUrl: 'https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' }
    ]
  },
  "5": {
    name: 'Drum Kit',
    category: 'Percussion',
    description: 'A complete drum kit with premium components, delivering exceptional sound and durability for live performances and recording sessions.',
    imageUrl: 'https://images.unsplash.com/photo-1543443258-92b04ad5ec6b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1543443258-92b04ad5ec6b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1617249703734-9b7b0394a2a4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGRydW18ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    ],
    specs: {
      'Bass Drum': '22" x 18"',
      'Snare': '14" x 5.5"',
      'Tom-Toms': '10", 12", 14"',
      'Hardware': 'Chrome plated',
      'Cymbals': 'Hi-hat, Crash, Ride',
      'Throne': 'Included'
    },
    variations: [
      { id: '1', name: 'Standard Kit', price: '$1,199' },
      { id: '2', name: 'Professional Kit', price: '$1,899' }
    ],
    relatedInstruments: [
      { id: 'bongos', name: 'Bongos', imageUrl: 'https://images.unsplash.com/photo-1611859508006-a3891f5c1e9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym9uZ28lMjBkcnVtfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' },
      { id: '9', name: 'Xylophone', imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' }
    ]
  },
  "6": {
    name: 'Trumpet',
    category: 'Wind',
    description: 'A professional trumpet with brilliant tone and precise intonation. Perfect for orchestral, jazz, and solo performances.',
    imageUrl: 'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHRydW1wZXR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1695539239680-fe90532157d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHRydW1wZXR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
    ],
    specs: {
      'Key': 'Bb',
      'Bore': 'Medium Large 0.459"',
      'Bell': '4.8" diameter, yellow brass',
      'Finish': 'Silver plated',
      'Valves': 'Monel piston',
      'Case': 'Included, hard shell'
    },
    variations: [
      { id: '1', name: 'Student Model', price: '$899' },
      { id: '2', name: 'Professional Model', price: '$2,299' }
    ],
    relatedInstruments: [
      { id: '3', name: 'Saxophone', imageUrl: 'https://images.unsplash.com/photo-1605020420620-20c943cc4669?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
      { id: 'trombone', name: 'Trombone', imageUrl: 'https://images.unsplash.com/photo-1701420613502-03b644bc9501?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dHJvbWJvbmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60' }
    ]
  },
  "7": {
    name: 'Cello',
    category: 'String',
    description: 'A fine cello known for its deep, resonant sound, ideal for both solo performances and orchestral settings.',
    imageUrl: 'https://images.unsplash.com/photo-1622987572239-21b59dd8d50a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1622987572239-21b59dd8d50a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
      'https://images.unsplash.com/photo-1575739849379-918e6a916a61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2VsbG98ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1593371256584-ac70d0ab43d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNlbGxvfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
    ],
    specs: {
      'Type': 'Acoustic Cello',
      'Size': '4/4 (Full size)',
      'Top': 'Spruce',
      'Back & Sides': 'Maple',
      'Fingerboard': 'Ebony',
      'Strings': 'Larsen or equivalent',
      'Bow': 'Included, brazilwood'
    },
    variations: [
      { id: '1', name: 'Student Model', price: '$1,499' },
      { id: '2', name: 'Professional Model', price: '$4,999' }
    ],
    relatedInstruments: [
      { id: 'violin', name: 'Violin', imageUrl: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
      { id: 'viola', name: 'Viola', imageUrl: 'https://images.unsplash.com/photo-1621372061897-a90b9e38995f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHZpb2xhfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' }
    ]
  }
};
