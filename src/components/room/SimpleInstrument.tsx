
import React, { useState } from 'react';
import { useSitarAudio } from '@/components/instruments/sitar/Sitar1/SitarAudio';
import { lazy, Suspense } from "react";


// Instrument Pages - grouped by instrument type for better code splitting
const AllInstruments: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  Piano: lazy(() => import("@/pages/Piano")),

  Guitar: lazy(() => import("@/components/instruments/guitar/Index")),
  Violin: lazy(() => import("@/components/instruments/violin/violin2/Violin")),  
  Veena: lazy(() => import("@/components/instruments/veena/Veena1/Veena")),

  Flute: lazy(() => import("@/components/instruments/flute/flute2/index")),
  Saxophone: lazy(() => import("@/components/instruments/saxophone/saxophone1/Saxophone")),
  Trumpet: lazy(() => import("@/components/instruments/trumpet/trumpet1/Trumpet")),

  Drums: lazy(() => import("@/components/instruments/drum/drums1/Drums")),
  Xylophone: lazy(() => import("@/components/instruments/xylophone/xylophone1/Xylophone")),
  Kalimba: lazy(() => import("@/components/instruments/Kalimba/kalimba2/Kalimba")),
  Marimba: lazy(() => import("@/components/instruments/Marimba/marimba2/Marimba")),

  DrumMachine: lazy(() => import("@/components/instruments/drum-machine/DrumMachine")),
  ChordProgression: lazy(() => import("@/components/instruments/chord-Progression/ChordProgressionPlayer")),
};

type InstrumentType = 'piano' | 'guitar' | 'drummachine' | 'chordprogression' | 'drums' | 'flute' | 'violin' | 'veena' | 'Saxophone' | 'Trumpet' |'Xylophone' | 'kalimba' | 'marimba';


const getInstrumentComponent = (type: string) => {
  const key = Object.keys(AllInstruments).find(k => k.toLowerCase().startsWith(type.toLowerCase()));
  return key ? AllInstruments[key] : null;
};

interface SimpleInstrumentProps {
  type: string;
}

const SimpleInstrument: React.FC<SimpleInstrumentProps> = ({ type }) => {
  const InstrumentComponent = getInstrumentComponent(type);
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});
  const sitarAudio = type === 'sitar' ? useSitarAudio() : null;

  const handlePlayNote = (note: string) => {
    setIsPlaying(prev => ({ ...prev, [note]: true }));

    // Optional: call specific audio function if applicable
    if (type === 'sitar' && sitarAudio) {
      const stringIndex = parseInt(note);
      if (!isNaN(stringIndex) && stringIndex >= 1 && stringIndex <= 7) {
        sitarAudio.playString((stringIndex - 1).toString());
      }
    }

    setTimeout(() => {
      setIsPlaying(prev => ({ ...prev, [note]: false }));
    }, 500);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-4">
        <span className="font-medium">Playing: {type.charAt(0).toUpperCase() + type.slice(1)}</span>
      </div>

      {InstrumentComponent ? (
        <Suspense fallback={<div>Loading {type}...</div>}>
          <InstrumentComponent onPlayNote={handlePlayNote} />
        </Suspense>
      ) : (
        <p className="text-red-500">Instrument "{type}" not found.</p>
      )}

      {/* <p className="text-sm text-gray-500 max-w-xs text-center">
        This is a simplified representation. In a full implementation, this would connect to the actual instrument interface.
      </p> */}
    </div>
  );
};


export default SimpleInstrument;
