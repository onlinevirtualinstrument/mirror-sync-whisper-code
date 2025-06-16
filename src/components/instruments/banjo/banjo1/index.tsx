
import React, { useRef, useState, useEffect, memo } from 'react';
import { useBanjoAudio } from './BanjoAudio';
import { BanjoBody } from './BanjoBody';
import InstrumentVariantSelector from '@/pages/instruments/InstrumentVariantSelector';
import { TutorialButton } from '@/components/Tutorial/TutorialButton';
import SEOHead from '@/components/SEO/SEOHead';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";

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

  const containerRef = useRef<HTMLDivElement | null>(null);

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
          <BanjoBody
            banjoVariant={banjoVariant}
            strings={strings}
            activeString={activeString}
            onStringClick={playString}
          />
        </FullscreenWrapper>

      </div>
    </>
  );
};

export default Banjo;
