
import { useState, useRef } from 'react';
import InstrumentVariantSelector from '../../../../pages/instruments/InstrumentVariantSelector';
import { useVeenaAudio } from './Veena/VeenaAudio';
import { useVeenaKeyboard } from './Veena/VeenaKeyboard';
import { VeenaBody } from './Veena/VeenaBody';
import { veenaVariants } from './Veena/VeenaVariants';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";

interface VeenaProps {
  variant?: string;
}

const Veena = ({ variant = 'standard' }: VeenaProps) => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [veenaVariant, setVeenaVariant] = useState<string>(variant);

  // Use audio logic from VeenaAudio
  const { getStringsForVariant, playString } = useVeenaAudio(veenaVariant);

  // Get the strings for the current variant
  const strings = getStringsForVariant(veenaVariant);

  // Setup keyboard control
  useVeenaKeyboard(strings, playString);

  return (
    <div className="w-full ">
      <div className="">
        <div className="flex justify-between md:justify-center mb-6">
          <InstrumentVariantSelector
            currentVariant={veenaVariant}
            setVariant={setVeenaVariant}
            variants={veenaVariants} 
            label="Select Veena Type"
          />

          <div className="landscape-warning text-xs text-muted-foreground  dark:bg-white/5 p-2 rounded-md">
            <p>
              <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
                ⛶Zoom
              </strong>
            </p>
          </div>
          <style>{`
                            @media (min-width: 768px) {
                              .landscape-warning {
                                display: none;
                              }
                            }
                          `}</style>
        </div>
      </div>

      <FullscreenWrapper ref={containerRef} instrumentName="veena">
        <VeenaBody
          strings={strings}
          variant={veenaVariant}
          onStringClick={playString}
        />
      </FullscreenWrapper>

      {/* <div className="text-center text-sm text-muted-foreground mt-4">
        <p>Click on the strings to play or use keyboard keys (Q, W, E, R, T, Y, U)</p>
      </div> */}
    </div>
  );
};

export default Veena;
