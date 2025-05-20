
import SoundControls from '../../../../utils/music/SoundControls';
import InstrumentVariantSelector from '../../../../pages/instruments/InstrumentVariantSelector';
import { sitarVariants } from './SitarVariants';
import { SitarBody } from './SitarBody';
import { useSitarAudio } from './SitarAudio';
import { useSitarKeyboard } from './SitarKeyboard';
import { TutorialButton } from '../../../Tutorial/TutorialButton';
import { useState } from 'react';

const Sitar = () => {
  const {
    activeString,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    sitarVariant,
    setSitarVariant,
    playString
  } = useSitarAudio();

  // Custom settings
  const [stringBrightness, setStringBrightness] = useState<number>(0.5);
  const [resonance, setResonance] = useState<number>(0.6);

  // Setup keyboard control
  useSitarKeyboard({
    activeString,
    sitarVariant,
    playString
  });

  // Tutorial content
  const sitarInstructions = [
    "Click on the strings to play different notes on the sitar",
    "You can also use keyboard keys 1-7 to play different strings",
    "Try different sitar types from the dropdown menu for different sounds",
    "Adjust the sound controls below for your preferred tone"
  ];

  const keyMappings = [
    { key: "1-7", description: "Play different strings" }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <InstrumentVariantSelector
          currentVariant={sitarVariant}
          setVariant={setSitarVariant}
          variants={Object.values(sitarVariants).map(v => ({ id: v.id, name: v.name }))}
          label="Select Sitar Type"
        />
        
        <TutorialButton 
          instrumentName="Sitar"
          instructions={sitarInstructions}
          keyMappings={keyMappings}
        />
      </div>
      
      <SitarBody
        sitarVariant={sitarVariant}
        activeString={activeString}
        onPlayString={playString}
      />
      
      <div className="mt-8 space-y-6">
        <SoundControls
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
        
        <div className="bg-background/40 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-border/50">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">String Brightness</span>
                <span className="text-xs text-muted-foreground">{Math.round(stringBrightness * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={stringBrightness}
                onChange={(e) => setStringBrightness(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Resonance</span>
                <span className="text-xs text-muted-foreground">{Math.round(resonance * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={resonance}
                onChange={(e) => setResonance(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        <div className="text-center text-muted-foreground text-sm">
          <p>Play the sitar strings by clicking on them or using keyboard keys (1-7)</p>
        </div>
      </div>
    </div>
  );
};

export default Sitar;
