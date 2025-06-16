
import Kalimba from '@/components/instruments/Kalimba/kalimba1/Kalimba';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import { useState, useRef } from 'react';
import InstrumentVariantSelector, { VariantOption } from '@/pages/instruments/InstrumentVariantSelector';
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";
import { Music, History } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define kalimba variants
const kalimbaVariants: VariantOption[] = [
  { id: 'standard', name: 'Standard Kalimba' },
  { id: 'electric', name: 'Electric Kalimba' },
  { id: 'bass', name: 'Bass Kalimba' },
  { id: 'chromatic', name: 'Chromatic Kalimba' },
  { id: 'african', name: 'African Kalimba' }
];

const KalimbaPage = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

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
      <div className="text-center mb-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Kalimba</h1>

        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
            <p>Play the kalimba by clicking on the tines or using keyboard keys (1-8).</p>
          </div>
        </div>

        <div className="my-4 flex justify-between items-center">
          <div className="w-full text-center md:text-center md:w-full">
            <InstrumentVariantSelector
              currentVariant={currentVariant}
              setVariant={handleVariantChange}
              variants={kalimbaVariants}
              label="Select Kalimba Type"
            />
          </div>

          <div className="landscape-warning block md:hidden text-xs text-muted-foreground  dark:bg-white/5 p-2 rounded-md">
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

      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 mb-4">
        <RecordingControlsShared instrumentName="Marimba" primaryColor="bg-purple-500" />
        </div>
       */}
       <FullscreenWrapper ref={containerRef} instrumentName="kalimba">
      <div className="w-full flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Kalimba variant={currentVariant} />
      </div>
      </FullscreenWrapper>



      {/* Kalimba information section for SEO */}
      <div className="mt-8 text-sm text-muted-foreground">

        <Accordion type="single" collapsible className="w-full mt-8">
          <AccordionItem value="history">
            <AccordionTrigger className="flex items-center gap-2">
              <History className="h-4 w-4" /> About the {kalimbaVariants.find(v => v.id === currentVariant)?.name}
              
            </AccordionTrigger>
            <AccordionContent>
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
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                The kalimba, also known as the thumb piano, is a musical instrument of African origin. Its sound is created by plucking metal tines attached to a wooden resonator.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="about">
            <AccordionTrigger className="flex items-center gap-2">
              <Music className="h-4 w-4" /> Playing Techniques
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-4">
                <p>
                  The kalimba is typically played by holding it with both hands and using the thumbs to pluck the tines. Advanced techniques include tremolo (rapidly alternating between two notes), glissando (sliding across multiple tines), and dampening (using fingers to mute certain tones).
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </InstrumentPageWrapper>
  );
};

export default KalimbaPage;
