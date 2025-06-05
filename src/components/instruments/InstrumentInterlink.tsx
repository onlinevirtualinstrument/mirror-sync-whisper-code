
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Music } from 'lucide-react';

type Instrument = {
  name: string;
  path: string;
  description: string;
  color: string;
  borderColor: string;
  icon?: React.ReactNode;
};

interface InstrumentInterlinkProps {
  currentInstrument: string;
}

const instruments: Instrument[] = [
  { 
    name: 'Piano', 
    path: '/piano', 
    description: 'Try your hand at the classic piano with 88 realistic keys.',
    color: 'bg-indigo-100 dark:bg-indigo-950/40',
    borderColor: 'border-indigo-300 dark:border-indigo-800',
  },
  { 
    name: 'Guitar', 
    path: '/guitar', 
    description: 'Strum the acoustic guitar and create beautiful melodies.',
    color: 'bg-amber-100 dark:bg-amber-950/40',
    borderColor: 'border-amber-300 dark:border-amber-800',
  },
  { 
    name: 'Drums', 
    path: '/drums', 
    description: 'Play rhythms and beats on this virtual drum kit.',
    color: 'bg-rose-100 dark:bg-rose-950/40',
    borderColor: 'border-rose-300 dark:border-rose-800',
  },
  { 
    name: 'Flute', 
    path: '/flute', 
    description: 'Create enchanting melodies with this virtual flute.',
    color: 'bg-teal-100 dark:bg-teal-950/40',
    borderColor: 'border-teal-300 dark:border-teal-800',
  },
  { 
    name: 'Violin', 
    path: '/violin', 
    description: 'Play the classical violin with authentic string sounds.',
    color: 'bg-purple-100 dark:bg-purple-950/40',
    borderColor: 'border-purple-300 dark:border-purple-800',
  },
  { 
    name: 'Saxophone', 
    path: '/saxophone', 
    description: 'Play jazzy tunes with this virtual saxophone.',
    color: 'bg-yellow-100 dark:bg-yellow-950/40',
    borderColor: 'border-yellow-300 dark:border-yellow-800',
  },
  { 
    name: 'Harp', 
    path: '/harp', 
    description: 'Create celestial sounds with this beautiful harp.',
    color: 'bg-sky-100 dark:bg-sky-950/40',
    borderColor: 'border-sky-300 dark:border-sky-800',
  },
  { 
    name: 'Banjo', 
    path: '/banjo', 
    description: 'Play folk and bluegrass on this virtual banjo.',
    color: 'bg-orange-100 dark:bg-orange-950/40',
    borderColor: 'border-orange-300 dark:border-orange-800',
  },
  { 
    name: 'Xylophone', 
    path: '/xylophone', 
    description: 'Tap colorful notes on this virtual xylophone.',
    color: 'bg-pink-100 dark:bg-pink-950/40',
    borderColor: 'border-pink-300 dark:border-pink-800',
  },
  { 
    name: 'Trumpet', 
    path: '/trumpet', 
    description: 'Play brassy notes with this virtual trumpet.',
    color: 'bg-lime-100 dark:bg-lime-950/40',
    borderColor: 'border-lime-300 dark:border-lime-800',
  },
  { 
    name: 'Harmonica', 
    path: '/harmonica', 
    description: 'Play blues and folk with this virtual harmonica.',
    color: 'bg-blue-100 dark:bg-blue-950/40',
    borderColor: 'border-blue-300 dark:border-blue-800',
  },
  { 
    name: 'Kalimba', 
    path: '/kalimba', 
    description: 'Create peaceful melodies with this thumb piano.',
    color: 'bg-emerald-100 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-300 dark:border-emerald-800',
  },
  { 
    name: 'Marimba', 
    path: '/marimba', 
    description: 'Play rich, resonant tones on this virtual marimba.',
    color: 'bg-fuchsia-100 dark:bg-fuchsia-950/40',
    borderColor: 'border-fuchsia-300 dark:border-fuchsia-800',
  },
  { 
    name: 'Tabla', 
    path: '/tabla', 
    description: 'Play rhythmic Indian percussion patterns.',
    color: 'bg-red-100 dark:bg-red-950/40',
    borderColor: 'border-red-300 dark:border-red-800',
  },
  { 
    name: 'Theremin', 
    path: '/theremin', 
    description: 'Play the electronic theremin with gesture controls.',
    color: 'bg-violet-100 dark:bg-violet-950/40',
    borderColor: 'border-violet-300 dark:border-violet-800',
  },
  { 
    name: 'Drum Machine', 
    path: '/drummachine', 
    description: 'Play the Drum Machine with beats controls.',
    color: 'bg-cyan-100 dark:bg-cyan-950/40',
    borderColor: 'border-cyan-300 dark:border-cyan-800',
  },
  { 
    name: 'Chord Progression', 
    path: '/chordprogression', 
    description: 'Play the Chord Progression with instrumental controls.',
    color: 'bg-stone-100 dark:bg-stone-950/40',
    borderColor: 'border-stone-300 dark:border-stone-800',
  },
];

const InstrumentInterlink: React.FC<InstrumentInterlinkProps> = ({ currentInstrument }) => {
  // Get two random instruments that aren't the current one
  const getRandomInstruments = (exclude: string): Instrument[] => {
    const filteredInstruments = instruments.filter(
      instrument => instrument.name.toLowerCase() !== exclude.toLowerCase()
    );
    
    const shuffled = [...filteredInstruments].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  };
  
  const suggestedInstruments = getRandomInstruments(currentInstrument);
  
  return (
    <div className="mr-10 ml-10 mt-10">
      <h3 className="text-xl font-semibold text-center mb-6">Try These Instruments Next</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestedInstruments.map((instrument) => (
          <div 
            key={instrument.name}
            className={`rounded-xl ${instrument.color} border ${instrument.borderColor}  p-4 transition-all hover:scale-105 duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{instrument.name}</h4>
              <div className="rounded-full bg-white/20 dark:bg-black/20 p-2">
                <Music className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{instrument.description}</p>
            <Link to={instrument.path}>
              <Button className="w-full">
                Play {instrument.name}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstrumentInterlink;
