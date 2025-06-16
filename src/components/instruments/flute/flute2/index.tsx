
import React, { useState, useEffect, useRef } from 'react';
import { useFluteAudio } from './FluteAudio';
import { fluteVariants } from './FluteVariants';
import InstrumentVariantSelector from '@/pages/instruments/InstrumentVariantSelector';
import { TutorialButton } from '@/components/Tutorial/TutorialButton';
import { motion } from 'framer-motion';

const Flute = () => {
  const [fluteVariant, setFluteVariant] = useState<string>('standard');
  const {
    activeHole,
    playNote,
    holes
  } = useFluteAudio();
  
  // Tutorial content
  const fluteInstructions = [
    "Click on the flute holes to play different notes",
    "You can also use number keys 1-6 to play different holes",
    "Try different flute types from the dropdown menu for different sounds",
    "Each hole corresponds to a different musical note"
  ];
  
  const keyMappings = [
    { key: "1-6", description: "Play different holes" }
  ];
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (/^[1-6]$/.test(key)) {
        const holeIndex = Number(key) - 1;
        playNote(holes[holeIndex].note, fluteVariant);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [holes, playNote, fluteVariant]);

  // Get flute colors based on variant
  const getFluteStyles = () => {
    switch(fluteVariant) {
      case 'bamboo':
        return {
          body: 'bg-gradient-to-b from-green-600 to-green-800',
          hole: 'bg-green-300 hover:bg-green-200',
          activeHole: 'bg-green-100',
          text: 'text-green-800'
        };
      case 'silver':
        return {
          body: 'bg-gradient-to-b from-gray-300 to-gray-500',
          hole: 'bg-gray-200 hover:bg-gray-100',
          activeHole: 'bg-white',
          text: 'text-gray-800'
        };
      case 'classical':
        return {
          body: 'bg-gradient-to-b from-amber-500 to-amber-700',
          hole: 'bg-amber-300 hover:bg-amber-200',
          activeHole: 'bg-amber-100',
          text: 'text-amber-800'
        };
      case 'alto':
        return {
          body: 'bg-gradient-to-b from-purple-500 to-purple-700',
          hole: 'bg-purple-300 hover:bg-purple-200',
          activeHole: 'bg-purple-100',
          text: 'text-purple-800'
        };
      case 'bass':
        return {
          body: 'bg-gradient-to-b from-indigo-600 to-indigo-800',
          hole: 'bg-indigo-300 hover:bg-indigo-200',
          activeHole: 'bg-indigo-100',
          text: 'text-indigo-800'
        };
      default:
        return {
          body: 'bg-gradient-to-b from-emerald-500 to-emerald-700',
          hole: 'bg-emerald-300 hover:bg-emerald-200',
          activeHole: 'bg-emerald-100',
          text: 'text-emerald-800'
        };
    }
  };

  const fluteStyles = getFluteStyles();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <InstrumentVariantSelector
          currentVariant={fluteVariant}
          setVariant={setFluteVariant}
          variants={fluteVariants}
          label="Select Flute Type"
        />
        
        <TutorialButton 
          instrumentName="Flute"
          instructions={fluteInstructions}
          keyMappings={keyMappings}
        />
      </div>
      
      <div className={`relative w-full ${fluteStyles.body} rounded-full h-16 flex items-center justify-between px-2 shadow-lg`}>
        {/* Mouthpiece */}
        <motion.div 
          className="absolute -left-4 bg-emerald-800 w-8 h-8 rounded-full"
          animate={{ scale: activeHole ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Flute holes */}
        <div className="flex justify-around items-center w-full">
          {holes.map((hole, index) => (
            <motion.div 
              key={hole.id}
              className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                activeHole === hole.note ? fluteStyles.activeHole : fluteStyles.hole
              }`}
              onClick={() => playNote(hole.note, fluteVariant)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={activeHole === hole.note ? {
                scale: [1, 1.2, 1],
                boxShadow: ['0px 0px 0px rgba(255,255,255,0)', '0px 0px 20px rgba(255,255,255,0.7)', '0px 0px 0px rgba(255,255,255,0)']
              } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full h-full flex items-center justify-center text-xs font-medium">
                {hole.key}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* <div className="mt-6 grid grid-cols-3 gap-4">
        {holes.map(hole => (
          <div key={hole.id} className={`text-center ${fluteStyles.text}`}>
            <div className="font-medium">{hole.name}</div>
            <div className="text-sm text-muted-foreground">({hole.note})</div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default Flute;
