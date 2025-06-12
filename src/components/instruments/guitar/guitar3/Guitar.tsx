
import { useState, useRef } from 'react';
import SoundControls from '../../../../utils/music/SoundControls';
import InstrumentVariantSelector from '../../../../pages/instruments/InstrumentVariantSelector';
import GuitarBody from './GuitarBody';
import { useGuitarAudio } from './GuitarAudio';
import { useGuitarKeyboard } from './GuitarKeyboard';
import { guitarVariants } from './GuitarVariants';
import { TutorialButton } from '../../../Tutorial/TutorialButton';
import { Slider } from "@/components/ui/slider";
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";

const Guitar = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [guitarVariant, setGuitarVariant] = useState<string>("standard");
  const {
    activeStrings,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    reverbLevel,
    setReverbLevel,
    toneQuality,
    setToneQuality,
    playString,
    stopString
  } = useGuitarAudio();

  // Additional customization
  const [stringTension, setStringTension] = useState<number>(0.5);
  const [pickPosition, setPickPosition] = useState<number>(0.5);

  // Handle keyboard input
  useGuitarKeyboard({
    activeStrings,
    guitarVariant,
    playString: (name, freq, variant) => playString(name, freq, variant),
    stopString
  });

  // Guitar string click handler
  const handleStringClick = (stringName: string, frequency: number) => {
    playString(stringName, frequency, guitarVariant);
  };
  
  // Tutorial content
  const guitarInstructions = [
    "Click on the strings to play different notes on the guitar",
    "You can also use keyboard keys to play different strings",
    "Try different guitar types from the dropdown menu for different sounds",
    "Adjust the sound controls below for your preferred tone"
  ];

  const keyMappings = Object.values(guitarVariants[guitarVariant]?.strings || []).map(s => ({
    key: s.key.toUpperCase(),
    description: `Play ${s.name} string`
  }));

  return (
    
    <div className="w-full  ">

      <div className="mb-12 flex justify-between items-center">
        <InstrumentVariantSelector
          currentVariant={guitarVariant}
          setVariant={setGuitarVariant}
          variants={Object.values(guitarVariants).map(v => ({ id: v.id, name: v.name }))}
          label="Select Guitar Type"
        />
        
        <TutorialButton 
          instrumentName="Guitar"
          instructions={guitarInstructions}
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
      
      <FullscreenWrapper ref={containerRef} instrumentName="guitar">
       {/* <div className="md:flex md:items-center md:justify-center md:bg-white md:animate-scale-in" style={{ animationDelay: '200ms' }}> */}
      <GuitarBody 
        guitarVariant={guitarVariant}
        activeStrings={activeStrings}
        playString={handleStringClick}
      />
      {/* </div> */}
      </FullscreenWrapper>
      
      <div className="mt-8 space-y-6">
        {/* <SoundControls
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          reverbLevel={reverbLevel}
          setReverbLevel={setReverbLevel}
          toneQuality={toneQuality}
          setToneQuality={setToneQuality}
        /> */}

        <SoundControls
  volume={volume}
  setVolume={setVolume}
  isMuted={isMuted}
  setIsMuted={setIsMuted}
  reverbLevel={reverbLevel}
  setReverbLevel={setReverbLevel}
  toneQuality={toneQuality}
  setToneQuality={setToneQuality}
  stringTension={stringTension}
  setStringTension={setStringTension}
  pickPosition={pickPosition}
  setPickPosition={setPickPosition}
/>

        
        {/* <div className="bg-background/40 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-border/50">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">String Tension</span>
                <span className="text-xs text-muted-foreground">{Math.round(stringTension * 100)}%</span>
              </div>
              <Slider
                value={[stringTension]}
                max={1}
                step={0.01}
                onValueChange={(newValue) => setStringTension(newValue[0])}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pick Position</span>
                <span className="text-xs text-muted-foreground">{Math.round(pickPosition * 100)}%</span>
              </div>
              <Slider
                value={[pickPosition]}
                max={1}
                step={0.01}
                onValueChange={(newValue) => setPickPosition(newValue[0])}
              />
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Guitar;
