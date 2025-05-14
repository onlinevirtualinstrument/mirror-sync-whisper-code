
import Kalimba from '@/components/instruments/Kalimba/kalimba1/Kalimba';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import { useState } from 'react';
import InstrumentVariantSelector, { VariantOption } from '@/components/InstrumentVariantSelector';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';

// Define kalimba variants
const kalimbaVariants: VariantOption[] = [
  { id: 'standard', name: 'Standard Kalimba' },
  { id: 'electric', name: 'Electric Kalimba' },
  { id: 'bass', name: 'Bass Kalimba' },
  { id: 'chromatic', name: 'Chromatic Kalimba' },
  { id: 'african', name: 'African Kalimba' }
];

const KalimbaPage = () => {
  const [currentVariant, setCurrentVariant] = useState<'standard' | 'electric' | 'bass' | 'chromatic' | 'african'>('standard');
  
  const handleVariantChange = (variant: string) => {
    setCurrentVariant(variant as 'standard' | 'electric' | 'bass' | 'chromatic' | 'african');
  };
  
  return (
    <InstrumentPageWrapper
      title="Virtual Kalimba"
      description="Play kalimba online with this interactive virtual thumb piano. Learn kalimba techniques and create beautiful melodies with our virtual instrument."
      instrumentType="Kalimba"
      borderColor="border-amber-500"
      route="/kalimba"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Kalimba</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          The kalimba, also known as the thumb piano, is a musical instrument of African origin. Its sound is created by plucking metal tines attached to a wooden resonator.
        </p>
        
        <div className="flex justify-center mb-6">
          <InstrumentVariantSelector
            currentVariant={currentVariant}
            setVariant={handleVariantChange}
            variants={kalimbaVariants}
            label="Select Kalimba Type"
          />
        </div>
        
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p>Play the kalimba by clicking on the tines or using keyboard keys (1-8).</p>
          </div>
          <div className="landscape-warning text-xs text-muted-foreground bg-black/5 dark:bg-white/5 p-2 rounded-md mb-2">
            <p>For the best experience, please rotate your device to <strong>landscape mode</strong></p>
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
      
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 mb-4">
        <RecordingControlsShared instrumentName="Marimba" primaryColor="bg-purple-500" />
        </div>
      
      <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Kalimba variant={currentVariant} />
      </div>
      
     
      
      {/* Kalimba information section for SEO */}
      <div className="mt-8 text-sm text-muted-foreground">
        <h2 className="text-lg font-medium mb-2">About the {kalimbaVariants.find(v => v.id === currentVariant)?.name}</h2>
        <p className="mb-2">
          {currentVariant === 'standard' && 
            "The standard kalimba typically has 8-17 metal tines and produces a gentle, bell-like sound. It's perfect for relaxation music, meditation, and simple melodies. Traditional kalimbas are made with a wooden resonator box that enhances the sound."}
          {currentVariant === 'electric' && 
            "The electric kalimba incorporates pickups to amplify its sound electronically. This modern variant allows players to connect to amplifiers and add effects like reverb or delay, expanding the instrument's sonic possibilities for contemporary music."}
          {currentVariant === 'bass' && 
            "The bass kalimba features longer tines that produce deeper, resonant tones. With its lower octave range, it provides rich bass notes that complement standard kalimbas in ensemble playing or can be used as a standalone instrument for bass melodies."}
          {currentVariant === 'chromatic' && 
            "The chromatic kalimba includes additional tines for sharps and flats, allowing players to perform in any key and play more complex music. This versatile variant enables a wider range of musical styles and modulations between different keys."}
          {currentVariant === 'african' && 
            "The traditional African kalimba (also called mbira) has deep cultural significance in many African communities. Its unique tuning systems and playing techniques have been passed down through generations, and it's often used in spiritual ceremonies and traditional music."}
        </p>
        
        <h3 className="text-md font-medium mt-4 mb-1">Playing Techniques</h3>
        <p>
          The kalimba is typically played by holding it with both hands and using the thumbs to pluck the tines. Advanced techniques include tremolo (rapidly alternating between two notes), glissando (sliding across multiple tines), and dampening (using fingers to mute certain tones).
        </p>
      </div>
    </InstrumentPageWrapper>
  );
};

export default KalimbaPage;
