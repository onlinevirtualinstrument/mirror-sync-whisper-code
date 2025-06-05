
import React, { useState, useEffect, memo } from 'react';
import { useBanjoAudio } from './BanjoAudio';
import { BanjoBody } from './BanjoBody';
import InstrumentVariantSelector from '@/pages/instruments/InstrumentVariantSelector';
import { TutorialButton } from '@/components/Tutorial/TutorialButton';
import SEOHead from '@/components/SEO/SEOHead';

const banjoVariants = [
  { id: 'standard', name: 'Standard 5-String' },
  { id: 'tenor', name: 'Tenor Banjo' },
  { id: 'plectrum', name: 'Plectrum Banjo' },
  { id: 'bluegrass', name: 'Bluegrass Banjo' },
  { id: 'openback', name: 'Open Back Banjo' }
];

// Memoize variant selector for better performance
const MemoizedVariantSelector = memo(InstrumentVariantSelector);

const Banjo = () => {
  const [banjoVariant, setBanjoVariant] = useState<string>('standard');
  const {
    strings,
    activeString,
    playString
  } = useBanjoAudio(banjoVariant);
  
  // Tutorial content
  const banjoInstructions = [
    "Click on the strings to play different notes on the banjo",
    "You can also use keyboard keys Q, W, E, R, T to play different strings",
    "Try different banjo types from the dropdown menu for different sounds",
    "Each banjo variant has its own unique sound character"
  ];

  const keyMappings = [
    { key: "Q-T", description: "Play different strings" }
  ];
  
  // Pre-calculate variant name only when variant changes
  const currentVariantName = React.useMemo(() => {
    return banjoVariants.find(v => v.id === banjoVariant)?.name || 'Standard';
  }, [banjoVariant]);

  return (
    <>
     
      
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <MemoizedVariantSelector
            currentVariant={banjoVariant}
            setVariant={setBanjoVariant}
            variants={banjoVariants}
            label="Select Banjo Type"
          />
          
          <TutorialButton 
            instrumentName="Banjo"
            instructions={banjoInstructions}
            keyMappings={keyMappings}
          />
        </div>
        
        <BanjoBody 
          banjoVariant={banjoVariant}
          strings={strings}
          activeString={activeString}
          onStringClick={playString}
        />
        
      </div>
    </>
  );
};

export default Banjo;
