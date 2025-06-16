
import React, { useState } from 'react';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import Kalimba from './Kalimba';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';
import { kalimbaVariants } from './KalimbaVariants';
import AudioPlayer from '@/utils/music/audioPlayer';

const KalimbaPage: React.FC = () => {

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVariant, setCurrentVariant] = useState('traditional');

  const handlePlaySoundSample = () => {
    if (isPlaying) {
      AudioPlayer.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    // Play a sequence of kalimba notes
    const variant = kalimbaVariants.find(v => v.id === currentVariant) || kalimbaVariants[0];
    const baseNote = variant.id === 'crystal' ? 523.25 : variant.id === 'bamboo' ? 440 : 261.63;

    // Play a pentatonic scale pattern typical of kalimba
    const notes = [0, 2, 4, 7, 9, 12, 9, 7, 4, 2, 0];
    let delay = 0;

    notes.forEach((semitone, index) => {
      setTimeout(() => {
        const frequency = baseNote * Math.pow(2, semitone / 12);
        AudioPlayer.playTone(frequency, 500, 'triangle');

        // If last note, reset isPlaying
        if (index === notes.length - 1) {
          setTimeout(() => setIsPlaying(false), 600);
        }
      }, delay);
      delay += 300;
    });
  };

  return (
    <InstrumentPageWrapper
      title="Virtual Kalimba"
      description="Play kalimba online with this interactive virtual thumb piano. Create beautiful melodies with our digital kalimba featuring multiple authentic designs."
      instrumentType="Kalimba"
      borderColor="border-purple-500"
      route="/kalimba"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Kalimba</h1>
         <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
          <p>Play the kalimba by clicking on the tines or using number keys (1-9)</p>
        </div>
      </div>
      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
        <RecordingControlsShared instrumentName="Kalimba" primaryColor="bg-purple-500" />
      </div> */}


       <div className="flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Kalimba initialVariantId={currentVariant} />
      </div>
    </InstrumentPageWrapper>
  );
};

export default KalimbaPage;
