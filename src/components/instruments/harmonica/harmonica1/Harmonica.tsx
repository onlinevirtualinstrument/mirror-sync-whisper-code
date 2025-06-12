
import InstrumentVariantSelector from '../../../../pages/instruments/InstrumentVariantSelector';
import { harmonicaVariants } from './HarmonicaVariants';
import { HarmonicaBody } from './HarmonicaBody';
import { useHarmonicaAudio } from './HarmonicaAudio';
import { useHarmonicaKeyboard } from './HarmonicaKeyboard';
import { TutorialButton } from '../../../Tutorial/TutorialButton';
import { Slider } from "@/components/ui/slider";
import { useRef, useState } from 'react';
import SoundControls from '../../../../utils/music/SoundControls';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";

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

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Customization options
  const [breathIntensity, setBreathIntensity] = useState<number>(0.5);
  const [toneColor, setToneColor] = useState<number>(0.5);
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);

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
    <div className="w-full rounded-xl">
      <div className="mb-8 flex justify-between items-center">
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

      <FullscreenWrapper ref={containerRef} instrumentName="banjo">
        <HarmonicaBody
          harmonicaVariant={harmonicaVariant}
          activeHole={activeHole}
          onHoleClick={playHole}
        />
      </FullscreenWrapper>

      <div className="mt-8 space-y-4">

        <SoundControls
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          breathIntensity={breathIntensity}
          setBreathIntensity={setBreathIntensity}
          toneColor={toneColor}
          setToneColor={setToneColor}
        />


        {/* <div className="text-center text-muted-foreground text-sm">
          Click on the holes to play or use keyboard keys 1-8
        </div> */}
      </div>
    </div>
  );
};

export default Harmonica;
