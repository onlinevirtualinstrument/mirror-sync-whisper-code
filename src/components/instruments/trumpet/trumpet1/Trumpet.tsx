
import React, { useState, useRef, useEffect } from 'react';
import { Music4 } from 'lucide-react';
import SoundControls from '@/utils/music/SoundControls';
import InstrumentVariantSelector from '@/pages/instruments/InstrumentVariantSelector';
import { trumpetVariants } from './TrumpetVariants';
import { generateTrumpetSound, createReverb } from './TrumpetSoundUtils';
import { useToast } from "@/hooks/use-toast";
import { TutorialButton } from '@/components/Tutorial/TutorialButton';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Trumpet = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [reverbLevel, setReverbLevel] = useState(0.2);
  const [toneQuality, setToneQuality] = useState(0.5);
  const [currentVariant, setCurrentVariant] = useState('standard');
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [pressedValves, setPressedValves] = useState<number[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const reverbNode = useRef<ConvolverNode | null>(null);
  const activeNoteRefs = useRef<Record<string, () => void>>({});
  const { toast } = useToast();

  // Initialize audio context on first user interaction
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
        console.log("AudioContext initialized for Trumpet");

        // Create reverb node
        createReverb(audioContextRef.current).then((node) => {
          reverbNode.current = node;
          console.log("Reverb created for Trumpet");
        });
      } catch (e) {
        console.error("Error initializing AudioContext:", e);
        toast({
          title: "Audio Error",
          description: "Could not initialize audio system. Please try again.",
          variant: "destructive",
        });
      }
    }

    // Resume if suspended
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        console.log('AudioContext resumed successfully');
      }).catch(error => {
        console.error('Failed to resume AudioContext', error);
      });
    }
  };

  // Attach event listeners for initialization
  useEffect(() => {
    const handleInteraction = () => initAudioContext();

    // Add event listeners for user interaction to initialize audio
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      // Clean up event listeners
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);

      // Close audio context and clean up
      if (audioContextRef.current) {
        // Stop all active sounds
        Object.values(activeNoteRefs.current).forEach(stopFn => {
          if (typeof stopFn === 'function') stopFn();
        });

        // Close the audio context
        audioContextRef.current.close().catch(err => console.error("Error closing AudioContext:", err));
      }
    };
  }, []);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMuted) return;
      // Initialize audio context if needed
      initAudioContext();

      // Find note by key
      const variant = trumpetVariants[currentVariant];
      const note = variant.notes.find(note => note.key === e.key.toLowerCase());

      if (note && !activeNotes.has(note.frequency) && audioContextRef.current) {
        // Update pressed valves
        setPressedValves(note.valveCombination);
        console.log(`Valve ${note.valveCombination.join(', ')} pressed`);

        // Generate sound and store stop function
        const stopSound = generateTrumpetSound(
          audioContextRef.current,
          note.frequency,
          volume,
          reverbLevel,
          toneQuality,
          currentVariant,
          reverbNode.current,
          activeNotes,
          setActiveNotes
        );

        if (stopSound) {
          activeNoteRefs.current[note.key] = stopSound;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Find note by key
      const variant = trumpetVariants[currentVariant];
      const note = variant.notes.find(note => note.key === e.key.toLowerCase());

      if (note && activeNoteRefs.current[note.key]) {
        // Call stop function
        activeNoteRefs.current[note.key]();
        delete activeNoteRefs.current[note.key];
        setPressedValves([]);
        console.log(`Valve ${note.valveCombination.join(', ')} released`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentVariant, volume, reverbLevel, toneQuality, isMuted, activeNotes]);

  const handleNoteClick = (note: typeof trumpetVariants[keyof typeof trumpetVariants]['notes'][0]) => {
    if (isMuted) return;

    // Initialize audio context if needed
    initAudioContext();

    if (!audioContextRef.current) return;

    console.log(`Playing note: ${note.label} with frequency: ${note.frequency}`);

    // Update pressed valves
    setPressedValves(note.valveCombination);

    // Generate sound and store stop function
    const stopSound = generateTrumpetSound(
      audioContextRef.current,
      note.frequency,
      volume,
      reverbLevel,
      toneQuality,
      currentVariant,
      reverbNode.current,
      activeNotes,
      setActiveNotes
    );

    if (stopSound) {
      // Store stop function and auto-stop after 1.5 seconds
      activeNoteRefs.current[note.key] = stopSound;
      setTimeout(() => {
        if (activeNoteRefs.current[note.key]) {
          activeNoteRefs.current[note.key]();
          delete activeNoteRefs.current[note.key];
          setPressedValves([]);
        }
      }, 1500);
    }
  };

  const keyLabels: Record<string, string> = {
    'a': 'A', 's': 'S', 'd': 'D', 'f': 'F', 'g': 'G', 'h': 'H', 'j': 'J', 'k': 'K'
  };

  const variant = trumpetVariants[currentVariant];

  // Tutorial content
  const trumpetInstructions = [
    "Press the valves to play different trumpet notes.",
    "You can also use keyboard keys A, S, D, F, G, H to play various notes.",
    "Different valve combinations produce different pitches.",
    "Try different trumpet types from the dropdown menu above."
  ];

  const keyboardMappings = variant.notes.slice(0, 6).map(note => ({
    key: note.key.toUpperCase(),
    description: `Play ${note.label} note`
  }));

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <InstrumentVariantSelector
          currentVariant={currentVariant}
          setVariant={setCurrentVariant}
          variants={Object.values(trumpetVariants).map(v => ({ id: v.id, name: v.name }))}
          label="Trumpet Type"
        />
        <TutorialButton
          instrumentName={variant.name}
          instructions={trumpetInstructions}
          keyMappings={keyboardMappings}
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

      <FullscreenWrapper ref={containerRef} instrumentName="trumpet">
        <div className={`w-full max-w-3xl rounded-xl p-6 shadow-lg ${variant.backgroundPattern}`}>


          <div className="relative w-full h-64 flex justify-center items-center">
            {/* Trumpet body with styling based on variant */}
            <div className={`relative w-64 h-20 ${variant.bodyClass} rounded-r-full transition-colors duration-300`}>
              {/* Mouthpiece */}
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-6 w-8 h-4 bg-gray-300 rounded-l-full"></div>

              {/* Bell */}
              <div className={`absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-2 w-20 h-20 ${variant.bellColor} rounded-full transition-colors duration-300`}></div>

              {/* Valve section */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 flex space-x-4">
                {/* Valves */}
                {[0, 1, 2].map((valveIndex) => (
                  <button
                    key={valveIndex}
                    className={`${variant.valveColor} border border-gray-400 w-8 h-12 rounded-t-lg shadow-sm hover:opacity-90 transition-transform duration-150 ${pressedValves.includes(valveIndex) ? 'transform translate-y-2 bg-opacity-70' : ''}`}
                    onClick={() => {
                      // Initialize audio on click
                      initAudioContext();

                      const note = variant.notes.find(n =>
                        n.valveCombination.length === 1 && n.valveCombination[0] === valveIndex
                      );
                      if (note) handleNoteClick(note);
                    }}
                  >
                    <span className="sr-only">Valve {valveIndex + 1}</span>
                  </button>
                ))}
              </div>

              {/* Tubing */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-14 border-t-2 border-r-2 border-gray-400 rounded-tr-xl"></div>
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-4 mb-6">
            {variant.notes.map((note) => (
              <div
                key={note.key}
                className={`relative flex flex-col items-center justify-center p-2 rounded-md border ${activeNotes.has(note.frequency) ? 'bg-primary/20 border-primary' : 'bg-background/50 border-border'} cursor-pointer hover:bg-primary/10 transition-colors`}
                onClick={() => handleNoteClick(note)}
              >
                <div className="text-xs font-mono mb-1">{keyLabels[note.key]}</div>
                <div className="text-sm font-semibold">{note.label}</div>
                <div className="mt-1 flex gap-0.5">
                  {note.valveCombination.length === 0 ? (
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  ) : (
                    note.valveCombination.map((valve) => (
                      <div key={valve} className="w-2 h-2 rounded-full bg-gray-800"></div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </FullscreenWrapper>

      <div className="w-full max-w-3xl mt-6">
        <SoundControls
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          reverbLevel={reverbLevel}
          setReverbLevel={setReverbLevel}
          toneQuality={toneQuality}
          setToneQuality={setToneQuality}
        />

        <Accordion type="single" collapsible className="w-full mt-8">
          <AccordionItem value="about">
            <AccordionTrigger className="flex items-center gap-2">
              <Music4 className="h-4 w-4" />  About {variant.name}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground text-sm">{variant.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">Material: {variant.material}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </div>
    </div>
  );
};

export default Trumpet;
