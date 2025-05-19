
import { useState } from 'react';
import InstrumentVariantSelector from '@/pages/instruments/InstrumentVariantSelector';
import { useVeenaAudio } from './VeenaAudio';
import { useVeenaKeyboard } from './VeenaKeyboard';
import { VeenaBody } from './VeenaBody';
import { veenaVariants } from './VeenaVariants';

interface VeenaProps {
  variant?: string;
}

const Veena = ({ variant = 'standard' }: VeenaProps) => {
  const [veenaVariant, setVeenaVariant] = useState<string>(variant);
  
  // Use audio logic from VeenaAudio
  const { getStringsForVariant, playString } = useVeenaAudio(veenaVariant);
  
  // Get the strings for the current variant
  const strings = getStringsForVariant(veenaVariant);
  
  // Setup keyboard control
  useVeenaKeyboard(strings, playString);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <InstrumentVariantSelector
          currentVariant={veenaVariant}
          setVariant={setVeenaVariant}
          variants={veenaVariants}
          label="Select Veena Type"
        />
      </div>
      
      <VeenaBody 
        strings={strings} 
        variant={veenaVariant}
        onStringClick={playString}
      />
      
      <div className="text-center text-sm text-muted-foreground mt-4">
        <p>Click on the strings to play or use keyboard keys (Q, W, E, R, T, Y, U)</p>
      </div>
    </div>
  );
};

export default Veena;
