
import { useState, useRef } from 'react';
import InstrumentVariantSelector from '@/pages/instruments/InstrumentVariantSelector';
import SoundControls from '@/utils/music/SoundControls';
import { useSitarAudio } from './SitarAudio';
import { useSitarKeyboard } from './SitarKeyboard';
import { sitarVariants } from './SitarVariants';
import { SitarBody } from './SitarBody';
import { TutorialButton } from '@/components/Tutorial/TutorialButton';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";

const Sitar = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

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

      <FullscreenWrapper ref={containerRef} instrumentName="sitar">
        <SitarBody
          sitarVariant={sitarVariant}
          activeString={activeString}
          onPlayString={playString}
        />
      </FullscreenWrapper>

      <div className="mt-8 space-y-6">
        <SoundControls
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          stringBrightness={stringBrightness}
          setStringBrightness={setStringBrightness}
          resonance={resonance}
          setResonance={setResonance}
        />

        {/* <div className="text-center text-muted-foreground text-sm">
          <p>Play the sitar strings by clicking on them or using keyboard keys (1-7)</p>
        </div> */}
      </div>
    </div>
  );
};

export default Sitar;
