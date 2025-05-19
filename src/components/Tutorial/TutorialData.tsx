import { Music, Piano, Guitar, Wind, Mic } from "lucide-react";

export interface InstrumentTutorial {
  id: string;
  name: string;
  about: string;
  icon: any;
  image: string;
  placement: {
    title: string;
    steps: {
      id: number;
      title: string;
      description: string;
      image?: string;
    }[];
  };
}

export const instrumentTutorials: InstrumentTutorial[] = [
  {
    id: "piano",
    name: "Piano",
    about: "Learn to play the piano with our step-by-step tutorials covering basic to advanced techniques.",
    icon: Piano,
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2070",
    placement: {
      title: "How to Play Piano",
      steps: [
        {
          id: 1,
          title: "Hand Position",
          description: "Place your hands on the keyboard with your thumbs on middle C (right hand) and the C below middle C (left hand).",
          image: "https://images.unsplash.com/photo-1530106074196-c0172a8ef505"
        },
        {
          id: 2,
          title: "Learn Basic Notes",
          description: "Start by learning the C major scale: C D E F G A B C. Practice with both hands separately, then together.",
          image: "https://images.unsplash.com/photo-1545665225-b23b99e4d45e"
        },
        {
          id: 3,
          title: "Practice Finger Exercises",
          description: "Build dexterity with simple exercises like five-finger patterns, moving up and down the scale.",
          image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad"
        }
      ]
    }
  },
  {
    id: "violin",
    name: "Violin",
    about: "Master the violin with comprehensive tutorials on bow technique, positioning, and music theory.",
    icon: Music,
    image: "https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b",
    placement: {
      title: "How to Play Violin",
      steps: [
        {
          id: 1,
          title: "Holding the Violin",
          description: "Rest the violin on your left shoulder, supporting it with your jaw. The scroll should point away from you.",
          image: "https://images.unsplash.com/photo-1576406473041-3eb49fbe2365"
        },
        {
          id: 2,
          title: "Bow Grip",
          description: "Hold the bow with a relaxed grip, placing your thumb under the frog and your fingers curved over the stick.",
          image: "https://images.unsplash.com/photo-1574791628823-8a14423c016e"
        },
        {
          id: 3,
          title: "First Position Notes",
          description: "Learn the notes in first position on each string: G, D, A, and E.",
          image: "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec"
        }
      ]
    }
  },
  {
    id: "guitar",
    name: "Guitar",
    about: "From basic chords to advanced fingerpicking, our guitar tutorials will help you become a confident guitarist.",
    icon: Guitar,
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0",
    placement: {
      title: "How to Play Guitar",
      steps: [
        {
          id: 1,
          title: "Guitar Basics",
          description: "Learn to hold the guitar properly, with the neck in your left hand and your right hand over the sound hole or pickups.",
          image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1"
        },
        {
          id: 2,
          title: "Basic Chords",
          description: "Master fundamental chords like G, C, D, Em, and Am to play countless songs.",
          image: "https://images.unsplash.com/photo-1517443191895-202c31142ccd"
        },
        {
          id: 3,
          title: "Strumming Patterns",
          description: "Practice common strumming patterns to add rhythm and dynamics to your playing.",
          image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02"
        }
      ]
    }
  },
  {
    id: "harp",
    name: "Harp",
    about: "Explore the ethereal sound of the harp with tutorials on hand positioning, plucking techniques, and song progressions.",
    icon: Music,
    image: "https://images.unsplash.com/photo-1576444356170-66073046b1ac",
    placement: {
      title: "How to Play Harp",
      steps: [
        {
          id: 1,
          title: "Proper Seating",
          description: "Sit with your back straight and the harp tilted slightly toward your right shoulder.",
          image: "https://images.unsplash.com/photo-1558642692-f4fac2d3e48c"
        },
        {
          id: 2,
          title: "Hand Position",
          description: "Position your hands with fingers curved and thumbs pointing upward.",
          image: "https://images.unsplash.com/photo-1605020420620-20c943cc4669"
        },
        {
          id: 3,
          title: "Basic Plucking",
          description: "Practice plucking strings with the pads of your fingers, not the tips.",
          image: "https://images.unsplash.com/photo-1621784166258-c6fdfff31879"
        }
      ]
    }
  },
  {
    id: "sitar",
    name: "Sitar",
    about: "Discover the rich tradition of Indian classical music with our sitar tutorials for beginners and intermediate players.",
    icon: Music,
    image: "https://images.unsplash.com/photo-1599083602312-d88a6d7dcae7",
    placement: {
      title: "How to Play Sitar",
      steps: [
        {
          id: 1,
          title: "Sitting Position",
          description: "Sit cross-legged on the floor with the sitar resting on your right foot.",
          image: "https://images.unsplash.com/photo-1599083602312-d88a6d7dcae7"
        },
        {
          id: 2,
          title: "Mizrab Technique",
          description: "Learn to use the mizrab (wire plectrum) on your right index finger to pluck the strings.",
          image: "https://images.unsplash.com/photo-1599083602312-d88a6d7dcae7"
        },
        {
          id: 3,
          title: "Basic Ragas",
          description: "Practice simple ragas to understand the melodic frameworks of Indian classical music.",
          image: "https://images.unsplash.com/photo-1599083602312-d88a6d7dcae7"
        }
      ]
    }
  },
  {
    id: "veena",
    name: "Veena",
    about: "Explore the ancient sounds of the veena with tutorials on proper technique and traditional compositions.",
    icon: Music,
    image: "https://images.unsplash.com/photo-1541689221366-d798f0ce9491",
    placement: {
      title: "How to Play Veena",
      steps: [
        {
          id: 1,
          title: "Posture",
          description: "Sit cross-legged with the veena's resonator resting on your left thigh and the neck extending to your right.",
          image: "https://images.unsplash.com/photo-1541689221366-d798f0ce9491"
        },
        {
          id: 2,
          title: "Finger Positions",
          description: "Learn to press the strings against the frets using your left hand while plucking with your right hand.",
          image: "https://images.unsplash.com/photo-1541689221366-d798f0ce9491"
        },
        {
          id: 3,
          title: "Basic Gamaka",
          description: "Master the ornamental techniques that give veena music its distinctive character.",
          image: "https://images.unsplash.com/photo-1541689221366-d798f0ce9491"
        }
      ]
    }
  },
  {
    id: "banjo",
    name: "Banjo",
    about: "Learn clawhammer and bluegrass techniques for the banjo with our step-by-step tutorials for all skill levels.",
    icon: Music,
    image: "https://images.unsplash.com/photo-1621784166258-c6fdfff31879",
    placement: {
      title: "How to Play Banjo",
      steps: [
        {
          id: 1,
          title: "Banjo Posture",
          description: "Hold the banjo with the neck at a slight upward angle, resting the rim on your right thigh.",
          image: "https://images.unsplash.com/photo-1621784166258-c6fdfff31879"
        },
        {
          id: 2,
          title: "Right Hand Technique",
          description: "Practice the basic roll patterns for bluegrass or the bum-ditty pattern for clawhammer style.",
          image: "https://images.unsplash.com/photo-1621784166258-c6fdfff31879"
        },
        {
          id: 3,
          title: "Basic Chords",
          description: "Learn G, C, and D7 chords to play simple songs in the key of G.",
          image: "https://images.unsplash.com/photo-1621784166258-c6fdfff31879"
        }
      ]
    }
  },
  {
    id: "flute",
    name: "Flute",
    about: "Master breath control and fingering techniques for the flute with our comprehensive tutorial series.",
    icon: Wind,
    image: "https://images.unsplash.com/photo-1619616077057-f2b1212be8ce",
    placement: {
      title: "How to Play Flute",
      steps: [
        {
          id: 1,
          title: "Embouchure",
          description: "Form a small opening in the center of your lips and direct air across the embouchure hole.",
          image: "https://images.unsplash.com/photo-1619616077057-f2b1212be8ce"
        },
        {
          id: 2,
          title: "Basic Fingerings",
          description: "Learn the fingerings for notes in the first octave, starting with B, A, and G.",
          image: "https://images.unsplash.com/photo-1595368062439-f30e77a89148"
        },
        {
          id: 3,
          title: "Breath Control",
          description: "Practice controlling your airstream to achieve consistent tone and dynamic range.",
          image: "https://images.unsplash.com/photo-1603998358053-13eba4104ccf"
        }
      ]
    }
  },
  {
    id: "saxophone",
    name: "Saxophone",
    about: "From jazz to classical, our saxophone tutorials cover embouchure, fingerings, and expressive techniques.",
    icon: Wind,
    image: "https://images.unsplash.com/photo-1622609184693-5c3c7b702c14",
    placement: {
      title: "How to Play Saxophone",
      steps: [
        {
          id: 1,
          title: "Assembly and Reed Preparation",
          description: "Learn to properly assemble your saxophone and prepare/attach the reed.",
          image: "https://images.unsplash.com/photo-1622609184693-5c3c7b702c14"
        },
        {
          id: 2,
          title: "Embouchure",
          description: "Form your embouchure by placing the mouthpiece in your mouth and creating a seal with your bottom lip over your bottom teeth.",
          image: "https://images.unsplash.com/photo-1622609184693-5c3c7b702c14"
        },
        {
          id: 3,
          title: "Basic Fingerings",
          description: "Practice the fingerings for B, A, G, and other notes in the first octave.",
          image: "https://images.unsplash.com/photo-1622609184693-5c3c7b702c14"
        }
      ]
    }
  },
  {
    id: "trumpet",
    name: "Trumpet",
    about: "Develop your trumpet skills with tutorials on embouchure, breathing techniques, and essential exercises.",
    icon: Wind,
    image: "https://images.unsplash.com/photo-1573871669414-010dbf73ca84",
    placement: {
      title: "How to Play Trumpet",
      steps: [
        {
          id: 1,
          title: "Forming the Embouchure",
          description: "Place the mouthpiece in the center of your lips, buzz your lips to produce sound.",
          image: "https://images.unsplash.com/photo-1573871669414-010dbf73ca84"
        },
        {
          id: 2,
          title: "Proper Breathing",
          description: "Practice diaphragmatic breathing for better control and tone quality.",
          image: "https://images.unsplash.com/photo-1573871669414-010dbf73ca84"
        },
        {
          id: 3,
          title: "Basic Fingerings",
          description: "Learn the valve combinations for notes in the middle register: C, D, E, F, G, A, B.",
          image: "https://images.unsplash.com/photo-1573871669414-010dbf73ca84"
        }
      ]
    }
  },
  {
    id: "harmonica",
    name: "Harmonica",
    about: "Explore blues, folk, and rock harmonica techniques with our beginner-friendly tutorials.",
    icon: Wind,
    image: "https://images.unsplash.com/photo-1621784166258-c6fdfff31879",
    placement: {
      title: "How to Play Harmonica",
      steps: [
        {
          id: 1,
          title: "Holding the Harmonica",
          description: "Hold the harmonica between your thumb and index finger, with the numbers/low notes to your left.",
          image: "https://images.unsplash.com/photo-1621784166258-c6fdfff31879"
        },
        {
          id: 2,
          title: "Single Notes",
          description: "Practice the pucker or tongue-blocking technique to isolate individual notes.",
          image: "https://images.unsplash.com/photo-1621784166258-c6fdfff31879"
        },
        {
          id: 3,
          title: "Basic Bending",
          description: "Learn to bend notes by changing the shape of your oral cavity while playing.",
          image: "https://images.unsplash.com/photo-1621784166258-c6fdfff31879"
        }
      ]
    }
  },
  {
    id: "drum",
    name: "Drums",
    about: "Build your drumming skills with tutorials on basic beats, fills, and proper stick technique.",
    icon: Mic,
    image: "https://images.unsplash.com/photo-1543443258-92b04ad5ec6b",
    placement: {
      title: "How to Play Drums",
      steps: [
        {
          id: 1,
          title: "Drum Throne Position",
          description: "Sit with your back straight, feet flat on the pedals, and sticks held with a relaxed grip.",
          image: "https://images.unsplash.com/photo-1543443258-92b04ad5ec6b"
        },
        {
          id: 2,
          title: "Basic Beat",
          description: "Practice the fundamental rock beat: bass drum on 1 and 3, snare on 2 and 4, hi-hat on eighth notes.",
          image: "https://images.unsplash.com/photo-1543443258-92b04ad5ec6b"
        },
        {
          id: 3,
          title: "Simple Fills",
          description: "Learn basic fills using eighth notes moving around the toms.",
          image: "https://images.unsplash.com/photo-1543443258-92b04ad5ec6b"
        }
      ]
    }
  },
  {
    id: "xylophone",
    name: "Xylophone",
    about: "Explore the bright tones of the xylophone with tutorials on mallet technique and music reading.",
    icon: Music,
    image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236",
    placement: {
      title: "How to Play Xylophone",
      steps: [
        {
          id: 1,
          title: "Mallet Grip",
          description: "Hold the mallets loosely between your thumb and first finger, with the handle resting on your second finger.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        },
        {
          id: 2,
          title: "Striking the Bars",
          description: "Strike the bars in the center with a firm but gentle motion, lifting the mallets after each strike.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        },
        {
          id: 3,
          title: "Simple Scales",
          description: "Practice C major and G major scales to develop coordination and accuracy.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        }
      ]
    }
  },
  {
    id: "marimba",
    name: "Marimba",
    about: "Master the marimba with tutorials on four-mallet technique, scales, and repertoire development.",
    icon: Music,
    image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236",
    placement: {
      title: "How to Play Marimba",
      steps: [
        {
          id: 1,
          title: "Mallet Selection",
          description: "Choose appropriate mallets based on the music - harder mallets for articulation, softer for warmth.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        },
        {
          id: 2,
          title: "Four-Mallet Grip",
          description: "Learn Stevens or Burton grip for holding two mallets in each hand to play chords and more complex music.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        },
        {
          id: 3,
          title: "Independence Exercises",
          description: "Practice exercises that develop independence between your hands for smoother playing.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        }
      ]
    }
  },
  {
    id: "kalimba",
    name: "Kalimba",
    about: "Discover the gentle sounds of the kalimba with tutorials on proper thumb technique and song arrangements.",
    icon: Music,
    image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236",
    placement: {
      title: "How to Play Kalimba",
      steps: [
        {
          id: 1,
          title: "Holding the Kalimba",
          description: "Hold the instrument with both hands, thumbs positioned over the tines, with the longer tines in the center.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        },
        {
          id: 2,
          title: "Plucking Technique",
          description: "Use the pads or tips of your thumbs to pluck the tines with a gentle downward and outward motion.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        },
        {
          id: 3,
          title: "Reading Tablature",
          description: "Learn to read kalimba tablature, which shows which tines to pluck in sequence.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        }
      ]
    }
  },
  {
    id: "tabla",
    name: "Tabla",
    about: "Learn the rhythmic patterns and finger techniques of tabla with our comprehensive tutorial series.",
    icon: Music,
    image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236",
    placement: {
      title: "How to Play Tabla",
      steps: [
        {
          id: 1,
          title: "Hand Position",
          description: "Position the tabla drums correctly and learn the proper hand placement for basic strokes.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        },
        {
          id: 2,
          title: "Basic Bols",
          description: "Practice the fundamental sounds (bols) like Na, Tin, Dha, and Dhin.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        },
        {
          id: 3,
          title: "Simple Taals",
          description: "Learn basic rhythmic cycles (taals) such as Teentaal and Keherwa.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        }
      ]
    }
  },
  {
    id: "theremin",
    name: "Theremin",
    about: "Learn to play the theremin, the unique electronic instrument controlled without physical contact.",
    icon: Music,
    image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236",
    placement: {
      title: "How to Play Theremin",
      steps: [
        {
          id: 1,
          title: "Hand Position",
          description: "Position your right hand near the vertical antenna to control pitch and your left hand near the horizontal loop to control volume.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        },
        {
          id: 2,
          title: "Pitch Control",
          description: "Practice moving your right hand steadily to produce consistent pitches without wavering.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        },
        {
          id: 3,
          title: "Simple Melodies",
          description: "Start with slow, simple melodies to develop pitch accuracy and control.",
          image: "https://images.unsplash.com/photo-1619461129861-d0c1889e6236"
        }
      ]
    }
  }
];

export const violinTutorials = [
  {
    title: "Getting Started",
    lessons: [
      {
        id: 1,
        title: "Holding the Violin",
        description: "Learn the correct posture and how to hold the violin and bow for optimal sound and comfort.",
        image: "https://images.unsplash.com/photo-1634314073930-7a4b1a83f19a"
      },
      {
        id: 2,
        title: "Basic Bowing Techniques",
        description: "Master the fundamental bowing techniques such as détaché, legato, and staccato to create different musical articulations.",
        image: "https://images.unsplash.com/photo-1569053337098-4355441bb451"
      },
      {
        id: 3,
        title: "Basic Scales",
        description: "Practice G, D, A, and E major scales to develop finger placement and intonation. Focus on consistent bow pressure and straight bowing across strings.",
        image: "https://images.unsplash.com/photo-1619032206564-5a179643d0a9"
      },
      {
        id: 4,
        title: "Tuning Your Violin",
        description: "Learn how to tune your violin accurately using a tuner or by ear, ensuring your instrument is ready to play in tune.",
        image: "https://images.unsplash.com/photo-1549480431-bca49ff09151"
      }
    ]
  },
  {
    title: "Advanced Techniques",
    lessons: [
      {
        id: 5,
        title: "Vibrato",
        description: "Develop a consistent and expressive vibrato technique to add warmth and emotion to your playing.",
        image: "https://images.unsplash.com/photo-1549480431-bca49ff09151"
      },
      {
        id: 6,
        title: "Shifting Positions",
        description: "Learn how to smoothly shift between different positions on the fingerboard to expand your range and access higher notes.",
        image: "https://images.unsplash.com/photo-1634314073930-7a4b1a83f19a"
      },
      {
        id: 7,
        title: "Harmonics",
        description: "Explore natural and artificial harmonics to create ethereal and ringing tones on the violin.",
        image: "https://images.unsplash.com/photo-1569053337098-4355441bb451"
      }
    ]
  }
]
