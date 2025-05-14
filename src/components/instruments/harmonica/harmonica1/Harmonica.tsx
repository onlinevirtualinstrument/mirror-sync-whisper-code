
import InstrumentVariantSelector from '../../../InstrumentVariantSelector';
import { harmonicaVariants } from './HarmonicaVariants';
import { HarmonicaBody } from './HarmonicaBody';
import { useHarmonicaAudio } from './HarmonicaAudio';
import { useHarmonicaKeyboard } from './HarmonicaKeyboard';
import { TutorialButton } from '../../../../utils/instrument-common/TutorialButton';
import { Slider } from "@/components/ui/slider";
import { useState } from 'react';

interface HarmonicaProps {
  variant?: string;
}

const Harmonica = ({ variant = 'standard' }: HarmonicaProps) => {
  const {
    activeHole,
    harmonicaVariant,
    setHarmonicaVariant,
    playHole
  } = useHarmonicaAudio(variant);

  // Customization options
  const [breathIntensity, setBreathIntensity] = useState<number>(0.5);
  const [toneColor, setToneColor] = useState<number>(0.5);

  // Setup keyboard control
  useHarmonicaKeyboard({
    activeHole,
    harmonicaVariant,
    playHole
  });
  
  // Tutorial content
  const harmonicaInstructions = [
    "Click on the holes to play different notes on the harmonica",
    "You can also use keyboard keys 1-8 to play different holes",
    "Try different harmonica types from the dropdown menu for different sounds",
    "Adjust the sound controls below for your preferred tone"
  ];

  const keyMappings = [
    { key: "1-8", description: "Play different holes" }
  ];

  return (
    <div className="glass-card p-8 rounded-xl">
      <div className="mb-4 flex justify-between items-center">
        <InstrumentVariantSelector
          currentVariant={harmonicaVariant}
          setVariant={setHarmonicaVariant}
          variants={Object.values(harmonicaVariants).map(v => ({ id: v.id, name: v.name }))}
          label="Select Harmonica Type"
        />
        
        <TutorialButton 
          instrumentName="Harmonica"
          instructions={harmonicaInstructions}
          keyMappings={keyMappings}
        />
      </div>
      
      <HarmonicaBody
        harmonicaVariant={harmonicaVariant}
        activeHole={activeHole}
        onHoleClick={playHole}
      />
      
      <div className="mt-8 space-y-4">
        <div className="bg-background/40 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-border/50">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Breath Intensity</span>
                <span className="text-xs text-muted-foreground">{Math.round(breathIntensity * 100)}%</span>
              </div>
              <Slider
                value={[breathIntensity]}
                max={1}
                step={0.01}
                onValueChange={(newValue) => setBreathIntensity(newValue[0])}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tone Color</span>
                <span className="text-xs text-muted-foreground">{Math.round(toneColor * 100)}%</span>
              </div>
              <Slider
                value={[toneColor]}
                max={1}
                step={0.01}
                onValueChange={(newValue) => setToneColor(newValue[0])}
              />
            </div>
          </div>
        </div>
      
        {/* <div className="text-center text-muted-foreground text-sm">
          Click on the holes to play or use keyboard keys 1-8
        </div> */}
      </div>
    </div>
  );
};

export default Harmonica;
