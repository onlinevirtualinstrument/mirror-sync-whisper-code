
import React, { useState, useEffect, useRef } from 'react';
import InstrumentPageWrapper from '@/components/instruments/InstrumentPageWrapper';
import { Button } from "@/components/ui/button";
import { Music, Info, History } from "lucide-react";
import { toast } from "sonner";
import RecordingControlsShared from '@/components/recording/RecordingControlsShared';
import Marimba from './Marimba';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";


// Links to other instruments to try
const relatedInstruments = [
  {
    name: "Kalimba",
    path: "/kalimba",
    description: "Try the soothing tones of the kalimba"
  },
  {
    name: "Xylophone",
    path: "/xylophone",
    description: "Experience the bright sounds of the xylophone"
  }
];

// Marimba notes configuration
const marimbaKeys = [
  { note: 'C4', label: 'C', frequency: 261.63, color: 'bg-red-500' },
  { note: 'D4', label: 'D', frequency: 293.66, color: 'bg-orange-500' },
  { note: 'E4', label: 'E', frequency: 329.63, color: 'bg-yellow-500' },
  { note: 'F4', label: 'F', frequency: 349.23, color: 'bg-green-500' },
  { note: 'G4', label: 'G', frequency: 392.00, color: 'bg-teal-500' },
  { note: 'A4', label: 'A', frequency: 440.00, color: 'bg-blue-500' },
  { note: 'B4', label: 'B', frequency: 493.88, color: 'bg-indigo-500' },
  { note: 'C5', label: 'C', frequency: 523.25, color: 'bg-violet-500' }
];

const MarimbaPage = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeNote, setActiveNote] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize the audio context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playNote = (note: string, frequency: number) => {
    if (!audioContextRef.current) return;

    setActiveNote(note);

    const now = audioContextRef.current.currentTime;

    // Create oscillator
    const oscillator = audioContextRef.current.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Create gain node for envelope
    const gainNode = audioContextRef.current.createGain();
    gainNode.gain.setValueAtTime(0.00001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.8, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 1.5);

    // Apply filters for more realistic marimba sound
    const filter = audioContextRef.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    // Start and stop
    oscillator.start(now);
    oscillator.stop(now + 1.5);

    // Show toast
    toast.success(`Playing ${note}`, { duration: 1000 });

    // Reset active state
    setTimeout(() => setActiveNote(null), 300);
  };

  return (
    <InstrumentPageWrapper
      title="Virtual Marimba - Play Online Marimba"
      description="Play marimba online with this interactive virtual instrument. Learn marimba techniques and enjoy creating music with our digital marimba simulator."
      instrumentType="Marimba"
      borderColor="border-purple-500"
      route="/marimba"
    >
      <div className="text-center mb-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 animate-fade-in">Virtual Marimba</h1>

        <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
          <p>Click on the bars to play or use keyboard keys A-L, ;, ', \</p>
        </div>
      </div>

      {/* <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 ">
        <RecordingControlsShared instrumentName="Marimba" primaryColor="bg-purple-500" />
        </div> */}

      <div ref={containerRef} className="flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}>
        <Marimba />

      </div>


      <Accordion type="single" collapsible className="w-full mt-8">
        <AccordionItem value="about">
          <AccordionTrigger className="flex items-center gap-2">
            <Info className="h-4 w-4" /> About Marimba
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-4">
              <p>
                The marimba is a percussion instrument consisting of wooden bars struck with mallets to produce musical tones.
                The bars are arranged like a piano keyboard, with the natural notes (white keys) in the front row and accidentals (black keys) raised in the back row.
              </p>
              <p>
                Modern marimbas typically feature resonator tubes under each bar, which amplify the sound and give the instrument its rich, resonant tone.
                The bars are usually made of rosewood, though synthetic materials are sometimes used in student models.
              </p>
              <p>
                Marimbas range in size, with concert models spanning 4 to 5 octaves. Players use 2-4 mallets, allowing for melodic playing as well as harmony and chords.
                The instrument is versatile, appearing in classical, contemporary, jazz, and world music contexts.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="history">
          <AccordionTrigger className="flex items-center gap-2">
            <History className="h-4 w-4" /> History
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-4">
              <p>
                The marimba originated in Africa and was later developed in Central America, particularly Guatemala and Mexico, where it became a national symbol.
                Early marimbas were simple wooden bars placed over a hole in the ground, which served as a resonator.
              </p>
              <p>
                In the early 20th century, the marimba was refined with the addition of metal resonator tubes and a standardized layout.
                Companies like Deagan and Leedy helped popularize the instrument in the United States and Europe.
              </p>
              <p>
                The marimba gained prominence in classical music through the works of composers like Darius Milhaud and Paul Creston.
                Today, it's a staple in percussion ensembles, orchestras, and is featured in many contemporary solo and chamber works.
                Notable marimba virtuosos include Keiko Abe, Leigh Howard Stevens, and Evelyn Glennie.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </InstrumentPageWrapper>
  );
};

export default MarimbaPage;
