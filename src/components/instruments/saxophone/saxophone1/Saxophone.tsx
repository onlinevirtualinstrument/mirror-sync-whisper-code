
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Music4 } from 'lucide-react';
import InstrumentVariantSelector from '@/pages/instruments/InstrumentVariantSelector';
import { saxophoneVariants } from './SaxophoneVariants';
import { useToast } from "@/hooks/use-toast";
import { TutorialButton } from '@/components/Tutorial/TutorialButton';
import AudioContextManager from '@/utils/music/AudioContextManager';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Saxophone = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [currentVariant, setCurrentVariant] = useState('alto');
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const activeNoteRefs = useRef<Record<string, () => void>>({});
  const { toast } = useToast();

  // Initialize audio context on first user interaction
  const initAudioContext = useCallback(() => {
    try {
      // Access AudioContextManager singleton to initialize it
      AudioContextManager.getInstance().getAudioContext();
    } catch (e) {
      console.error("Error initializing AudioContext:", e);
      toast({
        title: "Audio Error",
        description: "Could not initialize audio system. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Attach event listeners for initialization
  useEffect(() => {
    const handleInteraction = () => initAudioContext();

    // Add event listeners for user interaction to initialize audio
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      // Clean up event listeners
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);

      // Stop all active sounds
      Object.values(activeNoteRefs.current).forEach(stopFn => {
        if (typeof stopFn === 'function') stopFn();
      });
    };
  }, [initAudioContext]);

  // Keyboard event handling with useCallback for performance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const variant = saxophoneVariants[currentVariant];
      const note = variant.notes.find(note => note.key === e.key.toLowerCase());

      if (note && !activeNotes.has(note.frequency)) {
        playNote(note.frequency, note.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const variant = saxophoneVariants[currentVariant];
      const note = variant.notes.find(note => note.key === e.key.toLowerCase());

      if (note && activeNoteRefs.current[note.key]) {
        activeNoteRefs.current[note.key]();
        delete activeNoteRefs.current[note.key];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentVariant, activeNotes]);

  // Optimized note playing function using AudioContextManager
  const playNote = useCallback((noteFrequency: number, noteKey: string) => {
    initAudioContext();

    const audioManager = AudioContextManager.getInstance();
    const audioContext = audioManager.getAudioContext();
    if (!audioContext) return;

    console.log(`Playing note with frequency: ${noteFrequency}`);

    try {
      const variant = saxophoneVariants[currentVariant];

      // Create oscillators for rich saxophone sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();

      oscillator1.type = 'sawtooth';
      oscillator2.type = 'sine';

      oscillator1.frequency.value = noteFrequency;
      oscillator2.frequency.value = noteFrequency * 1.01; // Slight detune for richness

      // Create main gain nodes
      const gain1 = audioContext.createGain();
      const gain2 = audioContext.createGain();
      const mainGain = audioContext.createGain();

      gain1.gain.value = 0.5;
      gain2.gain.value = 0.3;

      // Create tone filter
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1500;
      filter.Q.value = 2;

      // Connect nodes
      oscillator1.connect(gain1);
      oscillator2.connect(gain2);

      gain1.connect(filter);
      gain2.connect(filter);

      // Get reverb
      audioManager.getReverbNode().then(reverbNode => {
        // Apply reverb
        const dryGain = audioContext.createGain();
        const wetGain = audioContext.createGain();

        dryGain.gain.value = 0.7;
        wetGain.gain.value = 0.3;

        filter.connect(dryGain);
        filter.connect(reverbNode);
        reverbNode.connect(wetGain);

        dryGain.connect(mainGain);
        wetGain.connect(mainGain);

        mainGain.connect(audioContext.destination);

        // Apply envelope
        const now = audioContext.currentTime;
        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(0.7, now + 0.1);
        mainGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

        // Start oscillators
        oscillator1.start();
        oscillator2.start();

        // Auto-stop to prevent memory leaks
        setTimeout(() => {
          try {
            oscillator1.stop();
            oscillator2.stop();
          } catch (e) {
            console.error("Error stopping oscillators:", e);
          }
        }, 1500);

        // Add to active notes
        const newActiveNotes = new Set(activeNotes);
        newActiveNotes.add(noteFrequency);
        setActiveNotes(newActiveNotes);

        // Create stop function
        const stopSound = () => {
          const releaseTime = audioContext.currentTime + 0.1;
          mainGain.gain.cancelScheduledValues(audioContext.currentTime);
          mainGain.gain.setValueAtTime(mainGain.gain.value || 0, audioContext.currentTime);
          mainGain.gain.exponentialRampToValueAtTime(0.01, releaseTime);

          setTimeout(() => {
            try {
              oscillator1.stop();
              oscillator2.stop();

              // Remove from active notes
              const updatedNotes = new Set(activeNotes);
              updatedNotes.delete(noteFrequency);
              setActiveNotes(updatedNotes);
            } catch (e) {
              console.error("Error in note release:", e);
            }
          }, 100);
        };

        // Store stop function
        activeNoteRefs.current[noteKey] = stopSound;

        // Auto-release after a short time for clicks
        if (noteKey.includes('click-')) {
          setTimeout(() => {
            stopSound();
            delete activeNoteRefs.current[noteKey];
          }, 1000);
        }
      });
    } catch (e) {
      console.error("Error playing saxophone note:", e);
    }
  }, [initAudioContext, currentVariant, activeNotes]);

  const handleNoteClick = useCallback((noteFrequency: number, noteKey: string) => {
    // Generate unique key for mouse clicks to distinguish from keyboard events
    const clickKey = `click-${noteKey}-${Date.now()}`;
    playNote(noteFrequency, clickKey);
  }, [playNote]);

  const variant = saxophoneVariants[currentVariant];
  const keyLabels: Record<string, string> = {
    'a': 'A', 's': 'S', 'd': 'D', 'f': 'F', 'g': 'G', 'h': 'H', 'j': 'J', 'k': 'K'
  };

  // Tutorial content
  const saxophoneInstructions = [
    "Click on the keys of the saxophone to play notes.",
    "You can also use keyboard keys A, S, D, F, G, H, J, K to play different notes.",
    "Try different saxophone types from the dropdown menu above."
  ];

  const keyboardMappings = variant.notes.map(note => ({
    key: note.key.toUpperCase(),
    description: `Play ${note.label} note`
  }));

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">

        <InstrumentVariantSelector
          currentVariant={currentVariant}
          setVariant={setCurrentVariant}
          variants={Object.values(saxophoneVariants).map(v => ({ id: v.id, name: v.name }))}
          label="Saxophone Type"
        />

        <TutorialButton
          instrumentName={variant.name}
          instructions={saxophoneInstructions}
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

      <FullscreenWrapper ref={containerRef} instrumentName="saxophone">
        <div className={`w-full max-w-3xl rounded-xl p-6 shadow-lg ${variant.backgroundPattern}`}>

          <div className="relative w-full h-64 flex justify-center items-center">
            <div className={`relative w-24 h-56 rounded-full ${variant.bodyClass} transform -rotate-12 transition-colors duration-300`}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 w-4 h-12 bg-black rounded-t-full"></div>
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 w-16 h-24 ${variant.bellColor} rounded-b-full transition-colors duration-300`}></div>
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-full flex flex-col items-center space-y-3">
                {variant.notes.map((note, index) => (
                  <button
                    key={note.key}
                    className={`${variant.keysColor} hover:opacity-80 active:opacity-70 w-6 h-6 rounded-full border border-gray-700 shadow-sm transition-transform ${activeNotes.has(note.frequency) ? 'scale-90 opacity-80' : ''}`}
                    onClick={() => {
                      // Initialize audio on click
                      initAudioContext();
                      handleNoteClick(note.frequency, note.key);
                    }}
                  >
                    <span className="sr-only">{note.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-4 mb-6">
            {variant.notes.map((note, index) => (
              <div
                key={note.key}
                className={`relative flex flex-col items-center justify-center p-2 rounded-md border ${activeNotes.has(note.frequency) ? 'bg-primary/20 border-primary' : 'bg-background/50 border-border'} cursor-pointer hover:bg-primary/10 transition-colors`}
                onClick={() => handleNoteClick(note.frequency, note.key)}
              >
                <div className="text-xs font-mono mb-1">{keyLabels[note.key]}</div>
                <div className="text-sm font-semibold">{note.label}</div>
              </div>
            ))}
          </div>
        </div>
      </FullscreenWrapper>
      
      <Accordion type="single" collapsible className="w-full mt-8">
        <AccordionItem value="history">
          <AccordionTrigger className="flex items-center gap-2">
            <Music4 className="mr-2" size={16} />
            About {variant.name}
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground text-sm">{variant.description}</p>
            <div className="mt-2 text-xs text-muted-foreground">Material: {variant.material}</div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </div>
  );
};

export default Saxophone;
