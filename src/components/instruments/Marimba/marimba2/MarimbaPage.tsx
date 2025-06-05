
import React, { useState, useRef } from 'react';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import Marimba from './Marimba';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';
import { marimbaVariants } from './MarimbaVariants';
import AudioPlayer from '@/utils/music/audioPlayer';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";

const MarimbaPage: React.FC = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVariant, setCurrentVariant] = useState('traditional');

  const handlePlaySoundSample = () => {
    if (isPlaying) {
      AudioPlayer.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    // Play a sequence of marimba notes
    const variant = marimbaVariants.find(v => v.id === currentVariant) || marimbaVariants[0];
    const baseNote = variant.id === 'bass' ? 130.81 : variant.id === 'soprano' ? 523.25 : 261.63;

    // Play a pentatonic scale pattern
    const notes = [0, 2, 4, 7, 9, 12, 9, 7, 4, 2, 0];
    let delay = 0;

    notes.forEach((semitone, index) => {
      setTimeout(() => {
        const frequency = baseNote * Math.pow(2, semitone / 12);
        AudioPlayer.playTone(frequency, 300, 'sine');

        // If last note, reset isPlaying
        if (index === notes.length - 1) {
          setTimeout(() => setIsPlaying(false), 400);
        }
      }, delay);
      delay += 250;
    });
  };

  // Handle variant change from MarimbaPage
  const handleVariantChange = (variantId: string) => {
    setCurrentVariant(variantId);
  };

  return (
    <InstrumentPageWrapper
      title="Virtual Marimba"
      description="Play marimba online with this interactive virtual percussion instrument. Create beautiful melodies with our digital marimba."
      instrumentType="Marimba"
      borderColor="border-amber-500"
      route="/marimba"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Marimba</h1>
        <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
          <p>Play the marimba by clicking on the wooden bars or using keyboard keys (A-L).</p>
        </div>

        <div className="landscape-warning text-xs text-muted-foreground bg-purple-100 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-2">
          <p>For the best experience, expand to full screen.
            <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
              Click here to expand
            </strong>
          </p>
        </div>
      </div>


      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 mb-4">
        <RecordingControlsShared instrumentName="Marimba" primaryColor="bg-purple-500" />
        </div> */}

       <div ref={containerRef} className="flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Marimba initialVariantId={currentVariant} />
      </div>
    </InstrumentPageWrapper>
  );
}; 

export default MarimbaPage;
