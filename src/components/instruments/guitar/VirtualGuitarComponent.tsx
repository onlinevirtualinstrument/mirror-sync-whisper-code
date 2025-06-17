import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Music, Settings, Guitar } from 'lucide-react';
import GuitarBody from './GuitarBody';
import { GuitarTheme, THEME_COLORS } from './ThemeSelector';
import GuitarSettings from './GuitarSettings';
import NotesPopup from './NotesPopup';
import { processAudioWithAI } from './AIAudioProcessor';
import { GuitarType, GUITAR_TUNINGS, GUITAR_SOUND_PROFILES } from './GuitarSoundProfiles';
import { cn } from '@/lib/utils';
import GuitarTopControls from './GuitarTopControls';
import Navbar from '../../layout/Navbar';
import { lockToLandscape, toggleFullscreen } from "../../landscapeMode/lockToLandscape";
import LandscapeInstrumentModal from '../../landscapeMode/LandscapeInstrumentModal';

export type TuningType = 'standard' | 'drop-d' | 'open-g' | 'custom';

interface VirtualGuitarComponentProps {
  className?: string;
}

const OSCILLATOR_TYPES: Record<GuitarType, OscillatorType> = {
  acoustic: 'triangle',
  electric: 'sawtooth',
  bass: 'sine',
  classical: 'triangle',
  flamenco: 'triangle',
  steel: 'sawtooth',
  twelveString: 'triangle'
};

const DECAY_TIMES: Record<GuitarType, number[]> = {
  acoustic: [2.5, 2.3, 2.1, 1.9, 1.7, 1.5],
  electric: [3.0, 2.8, 2.6, 2.4, 2.2, 2.0],
  bass: [3.5, 3.3, 3.1, 2.9],
  classical: [2.0, 1.8, 1.6, 1.4, 1.2, 1.0],
  flamenco: [1.8, 1.6, 1.4, 1.2, 1.0, 0.8],
  steel: [2.8, 2.6, 2.4, 2.2, 2.0, 1.8],
  twelveString: [2.6, 2.4, 2.2, 2.0, 1.8, 1.6]
};

const NOTE_NAMES = [
  ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],
  ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G'],
  ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'],
  ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'],
  ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E']
];

const GUITAR_CHORDS = {
  'C Major': [
    { string: 5, fret: 3 },
    { string: 4, fret: 2 },
    { string: 3, fret: 0 },
    { string: 2, fret: 1 },
    { string: 1, fret: 0 },
    { string: 0, fret: 0 }
  ],
  'G Major': [
    { string: 5, fret: 3 },
    { string: 4, fret: 2 },
    { string: 3, fret: 0 },
    { string: 2, fret: 0 },
    { string: 1, fret: 0 },
    { string: 0, fret: 3 }
  ],
  'D Major': [
    { string: 4, fret: 0 },
    { string: 3, fret: 2 },
    { string: 2, fret: 3 },
    { string: 1, fret: 2 },
    { string: 0, fret: 0 }
  ],
  'A Major': [
    { string: 4, fret: 0 },
    { string: 3, fret: 2 },
    { string: 2, fret: 2 },
    { string: 1, fret: 2 },
    { string: 0, fret: 0 }
  ],
  'E Major': [
    { string: 5, fret: 0 },
    { string: 4, fret: 2 },
    { string: 3, fret: 2 },
    { string: 2, fret: 1 },
    { string: 1, fret: 0 },
    { string: 0, fret: 0 }
  ],
  'F Major': [
    { string: 5, fret: 1 },
    { string: 4, fret: 3 },
    { string: 3, fret: 3 },
    { string: 2, fret: 2 },
    { string: 1, fret: 1 },
    { string: 0, fret: 1 }
  ],
  'Am': [
    { string: 4, fret: 0 },
    { string: 3, fret: 2 },
    { string: 2, fret: 2 },
    { string: 1, fret: 1 },
    { string: 0, fret: 0 }
  ],
  'Em': [
    { string: 5, fret: 0 },
    { string: 4, fret: 2 },
    { string: 3, fret: 2 },
    { string: 2, fret: 0 },
    { string: 1, fret: 0 },
    { string: 0, fret: 0 }
  ],
  'Dm': [
    { string: 4, fret: 0 },
    { string: 3, fret: 2 },
    { string: 2, fret: 3 },
    { string: 1, fret: 1 },
    { string: 0, fret: 0 }
  ]
};

const isBrowser = typeof window !== 'undefined';

interface NoteEvent {
  type: 'note';
  stringIndex: number;
  fret: number;
  time: number;
  duration: number;
}

const DEFAULT_NOTE_NAMES = NOTE_NAMES;

const VirtualGuitarComponent: React.FC<VirtualGuitarComponentProps> = ({ className }) => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [guitarType, setGuitarType] = useState<GuitarType>('acoustic');
  const [guitarTheme, setGuitarTheme] = useState<GuitarTheme>('light');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [activeStrings, setActiveStrings] = useState<number[]>([]);
  const [activeFrets, setActiveFrets] = useState<{ string: number, fret: number }[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [effects, setEffects] = useState({ distortion: 0, reverb: 20, delay: 10 });
  const [showEffects, setShowEffects] = useState(false);
  const [tuning, setTuning] = useState<TuningType>('standard');
  const [customTuning, setCustomTuning] = useState<string[]>(['E2', 'A2', 'D3', 'G3', 'B3', 'E4']);
  const [showNoteNames, setShowNoteNames] = useState(false);
  const [showFretNumbers, setShowFretNumbers] = useState(false);
  const [chordAssistMode, setChordAssistMode] = useState(false);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [showNotesPopup, setShowNotesPopup] = useState(false);
  const [keyboardMappings, setKeyboardMappings] = useState({
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 10,
    'q': 5, 'w': 4, 'e': 3, 'r': 2, 't': 1, 'y': 0,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Record<string, OscillatorNode | null>>({});
  const { toast } = useToast();

  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(
      isBrowser ? window.innerWidth < 768 : false
    );

    useEffect(() => {
      if (!isBrowser) return;

      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
  };

  const isMobile = useIsMobile();

  const initializeAudio = () => {
    if (isInitialized || !isBrowser) return;

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      setIsInitialized(true);
      toast({
        title: "Audio engine initialized",
        description: "You can now play the virtual guitar",
      });
    } catch (error) {
      console.error("Web Audio API is not supported in this browser", error);
      toast({
        title: "Audio not supported",
        description: "Your browser doesn't support the Web Audio API",
        variant: "destructive",
      });
    }
  };

  const getCurrentTuning = () => {
    if (tuning === 'custom') {
      return customTuning;
    }

    return GUITAR_TUNINGS[tuning] && GUITAR_TUNINGS[tuning][guitarType]
      ? GUITAR_TUNINGS[tuning][guitarType]
      : ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
  };

  const generateNoteNames = () => {
    const tuningNotes = getCurrentTuning();
    const result: string[][] = [];

    if (!tuningNotes || !Array.isArray(tuningNotes)) {
      console.error('Invalid tuning notes:', tuningNotes);
      return DEFAULT_NOTE_NAMES || NOTE_NAMES;
    }

    for (let stringIndex = 0; stringIndex < tuningNotes.length; stringIndex++) {
      const baseNote = tuningNotes[tuningNotes.length - 1 - stringIndex] || 'E4';
      const noteName = baseNote.replace(/[0-9]/g, '');

      const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      const noteIndex = notes.indexOf(noteName);

      if (noteIndex === -1) {
        console.error(`Invalid note name: ${noteName}`);
        continue;
      }

      const stringNotes: string[] = [];
      for (let fret = 0; fret <= 12; fret++) {
        const newNoteIndex = (noteIndex + fret) % 12;
        stringNotes.push(notes[newNoteIndex]);
      }

      result.push(stringNotes);
    }

    return result.length > 0 ? result : DEFAULT_NOTE_NAMES || NOTE_NAMES;
  };

  const pluckString = (stringIndex: number, fret: number = 0) => {
    if (!audioContextRef.current || !isInitialized) {
      initializeAudio();
      return;
    }

    const stringKey = `${stringIndex}-${fret}`;

    if (oscillatorsRef.current[stringKey]) {
      oscillatorsRef.current[stringKey]?.stop();
      oscillatorsRef.current[stringKey] = null;
    }

    const baseFrequency = getBaseFrequency(guitarType, stringIndex);
    const frequency = calculateFrequency(baseFrequency, fret);

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = OSCILLATOR_TYPES[guitarType];

    if (oscillator.setPeriodicWave && audioContextRef.current) {
      try {
        if (guitarType === 'acoustic' || guitarType === 'classical') {
          const realCoefficients = new Float32Array([0, 1, 0.5, 0.3, 0.2, 0.1, 0.05]);
          const imagCoefficients = new Float32Array(realCoefficients.length);
          const wave = audioContextRef.current.createPeriodicWave(realCoefficients, imagCoefficients);
          oscillator.setPeriodicWave(wave);
        } else if (guitarType === 'electric') {
          const realCoefficients = new Float32Array([0, 1, 0.7, 0.5, 0.3, 0.2, 0.1]);
          const imagCoefficients = new Float32Array(realCoefficients.length);
          const wave = audioContextRef.current.createPeriodicWave(realCoefficients, imagCoefficients);
          oscillator.setPeriodicWave(wave);
        }
      } catch (e) {
        console.log('Periodic wave not supported, falling back to standard oscillator');
      }
    }

    oscillator.frequency.value = frequency;

    oscillator.detune.value = (Math.random() * 8) - 4;

    gainNode.gain.value = volume / 100;

    const soundProfile = GUITAR_SOUND_PROFILES[guitarType];
    const now = audioContextRef.current.currentTime;

    const attackTime = 0.01 + (soundProfile.attack * 0.05);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume / 100, now + attackTime);

    applyEffects(oscillator, gainNode, effects);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start();

    const decayTime = DECAY_TIMES[guitarType][stringIndex] || 2.0;

    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContextRef.current.currentTime + decayTime
    );

    setTimeout(() => {
      oscillator.stop();
      oscillatorsRef.current[stringKey] = null;

      setActiveStrings(prev => prev.filter(s => s !== stringIndex));
      setActiveFrets(prev => prev.filter(af => !(af.string === stringIndex && af.fret === fret)));
    }, decayTime * 1000);

    oscillatorsRef.current[stringKey] = oscillator;

    setActiveStrings(prev => [...prev, stringIndex]);
    setActiveFrets(prev => [...prev, { string: stringIndex, fret }]);
  };

  const applyEffects = (oscillator: OscillatorNode, gainNode: GainNode, effectSettings: typeof effects) => {
    if (!audioContextRef.current) return;

    let lastNode: AudioNode = oscillator;

    if (guitarType === 'electric' || guitarType === 'bass') {
      if (effectSettings.distortion > 0) {
        try {
          const distortionNode = audioContextRef.current.createWaveShaper();
          const distortionAmount = effectSettings.distortion / 100 * 50;

          const curve = new Float32Array(44100);
          for (let i = 0; i < 44100; i++) {
            const x = (i * 2) / 44100 - 1;
            curve[i] = distortionAmount < 25
              ? (Math.PI + distortionAmount) * x / (Math.PI + distortionAmount * Math.abs(x))
              : Math.sign(x) * (1 - Math.exp(-Math.abs(x) * distortionAmount / 15));
          }

          distortionNode.curve = curve;
          distortionNode.oversample = '4x';

          lastNode.connect(distortionNode);
          lastNode = distortionNode;
        } catch (e) {
          console.error("Error creating distortion effect", e);
        }
      }

      if (effectSettings.reverb > 0) {
        try {
          const numDelays = 5;
          const delayNodes: DelayNode[] = [];
          const feedbackNodes: GainNode[] = [];

          for (let i = 0; i < numDelays; i++) {
            const delayNode = audioContextRef.current.createDelay();
            const feedbackNode = audioContextRef.current.createGain();

            const delayBase = 0.03 + (effectSettings.reverb / 100) * 0.2;
            delayNode.delayTime.value = delayBase + (i * delayBase * 0.5);

            feedbackNode.gain.value = Math.min(0.05 + (effectSettings.reverb / 100) * 0.3, 0.7) / (i + 1);

            lastNode.connect(delayNode);
            delayNode.connect(feedbackNode);
            feedbackNode.connect(delayNode);

            feedbackNode.connect(audioContextRef.current.destination);

            delayNodes.push(delayNode);
            feedbackNodes.push(feedbackNode);
          }
        } catch (e) {
          console.error("Error creating reverb effect", e);
        }
      }

      if (effectSettings.delay > 0) {
        try {
          const delayNode = audioContextRef.current.createDelay();
          const delayGainNode = audioContextRef.current.createGain();
          const filterNode = audioContextRef.current.createBiquadFilter();

          delayNode.delayTime.value = 0.2 + (effectSettings.delay / 100) * 0.8;
          delayGainNode.gain.value = Math.min(effectSettings.delay / 100 * 0.6, 0.75);

          filterNode.type = 'lowpass';
          filterNode.frequency.value = 2000 - (effectSettings.delay / 100 * 800);

          lastNode.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);
          gainNode.connect(delayNode);
          delayNode.connect(filterNode);
          filterNode.connect(delayGainNode);
          delayGainNode.connect(delayNode);
          delayGainNode.connect(audioContextRef.current.destination);
        } catch (e) {
          console.error("Error creating delay effect", e);
        }
      }

      if (lastNode !== gainNode && lastNode !== oscillator) {
        lastNode.connect(gainNode);
        return;
      }
    }

    oscillator.connect(gainNode);
  };

  const getBaseFrequency = (type: GuitarType, stringIndex: number): number => {
    const currentTuning = getCurrentTuning();
    if (!currentTuning || !Array.isArray(currentTuning)) {
      console.error('Current tuning is undefined or not an array');
      return 440; // Default to A4 if tuning is undefined
    }

    const adjustedIndex = type === 'bass'
      ? stringIndex
      : Math.min(stringIndex, currentTuning.length - 1);

    const note = currentTuning[currentTuning.length - 1 - adjustedIndex] || 'E4';
    return noteToFrequency(note);
  };

  const noteToFrequency = (note: string): number => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    let noteName = note.slice(0, -1);
    if (noteName.length > 1 && noteName.includes('#')) {
      noteName = noteName.substring(0, 2);
    } else {
      noteName = noteName.substring(0, 1);
    }

    const octave = parseInt(note.slice(-1));

    const noteIndex = notes.indexOf(noteName);
    if (noteIndex === -1) {
      console.error(`Invalid note: ${note}, using A4 (440Hz) as fallback`);
      return 440;
    }

    const semitonesFromA4 = (octave - 4) * 12 + noteIndex - 9;

    return 440 * Math.pow(2, semitonesFromA4 / 12);
  };

  const calculateFrequency = (baseFrequency: number, fret: number): number => {
    return baseFrequency * Math.pow(2, fret / 12);
  };

  const handleGuitarTypeChange = (type: GuitarType) => {
    setGuitarType(type);
    toast({
      title: `Guitar changed to ${type}`,
      description: "Try playing it now!",
    });
  };

  const handleThemeChange = (theme: GuitarTheme) => {
    setGuitarTheme(theme);
    toast({
      title: `Theme changed to ${theme}`,
      description: "Looking good!",
    });
  };

  const handleTuningChange = (newTuning: TuningType) => {
    setTuning(newTuning);

    if (newTuning !== 'custom') {
      toast({
        title: `Tuning changed to ${newTuning}`,
        description: "Try playing with the new tuning!",
      });
    }
  };

  const handleCustomTuningChange = (strings: string[]) => {
    setCustomTuning(strings);
  };

  const handleToggleNoteNames = () => {
    setShowNoteNames(!showNoteNames);

    toast({
      title: showNoteNames ? "Note names hidden" : "Note names shown",
      description: showNoteNames
        ? "Note names are now hidden"
        : "Note names are now visible on the fretboard",
    });
  };

  const handleToggleFretNumbers = () => {
    setShowFretNumbers(!showFretNumbers);

    toast({
      title: showFretNumbers ? "Fret numbers hidden" : "Fret numbers shown",
      description: showFretNumbers
        ? "Fret numbers are now hidden"
        : "Fret numbers are now visible on the fretboard",
    });
  };

  const handleToggleChordAssistMode = () => {
    setChordAssistMode(!chordAssistMode);

    if (!chordAssistMode) {
      const firstChord = Object.keys(GUITAR_CHORDS)[0];
      setActiveChord(firstChord);
      setActiveFrets(GUITAR_CHORDS[firstChord as keyof typeof GUITAR_CHORDS]);
    } else {
      setActiveChord(null);
      setActiveFrets([]);
    }

    toast({
      title: chordAssistMode ? "Chord assist disabled" : "Chord assist enabled",
      description: chordAssistMode
        ? "Chord assist mode is now disabled"
        : "Chord fingerings will be shown on the fretboard",
    });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isInitialized) {
      initializeAudio();
      return;
    }

    if (event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = event.key.toLowerCase();

    const stringKeys = ['q', 'w', 'e', 'r', 't', 'y'];
    const fretKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

    if (stringKeys.includes(key)) {
      const stringIndex = keyboardMappings[key as keyof typeof keyboardMappings] as number;

      const fretToPlay = event.shiftKey && activeFrets.length > 0
        ? activeFrets[0]?.fret || 0
        : 0;

      pluckString(stringIndex, fretToPlay);
    } else if (fretKeys.includes(key)) {
      const fret = keyboardMappings[key as keyof typeof keyboardMappings] as number;

      const stringToPlay = activeStrings.length > 0
        ? activeStrings[0]
        : 0;

      pluckString(stringToPlay, fret);
    }
  };

  useEffect(() => {
    if (isBrowser) {
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isInitialized, activeStrings, activeFrets]);


  const [open, setOpen] = useState(false);
    const handleOpen = async () => {
      await lockToLandscape();
      setOpen(true);
    };

  return (
    <div className={cn("relative h-full w-full flex flex-col bg-gradient-to-b from-background to-background/80 overflow-auto", className)}>
      <Navbar />
      <div className="glass-morphism p-2 sm:p-4 rounded-xl m-2 sm:m-4 animate-fade-in">
        <header className="flex sm:flex-row sm:flex-nowrap md:justify-between items-start sm:items-center gap-2 mb-4">
          <div className="flex flex-row flex-nowrap items-center gap-2 ">
            <Guitar className="h-5 w-5 text-purple-500" />
            <h1 className="text-xl font-semibold">Virtual Guitar</h1>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowEffects(!showEffects)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              {showEffects ? "Hide Effects" : "Show Effects"}
            </button>

            <GuitarSettings
              effects={effects}
              onEffectsChange={(effectName, value) => {
                setEffects(prev => ({
                  ...prev,
                  [effectName]: value
                }));
              }}
              showEffects={showEffects}
              onToggleEffects={() => setShowEffects(!showEffects)}
              showNoteNames={showNoteNames}
              showFretNumbers={showFretNumbers}
              chordAssistMode={chordAssistMode}
              tuning={tuning}
              customTuning={customTuning}
              onToggleNoteNames={handleToggleNoteNames}
              onToggleFretNumbers={handleToggleFretNumbers}
              onToggleChordAssistMode={handleToggleChordAssistMode}
              onTuningChange={handleTuningChange}
              onCustomTuningChange={handleCustomTuningChange}
              activeChord={activeChord}
              onActiveChordChange={setActiveChord}
              availableChords={GUITAR_CHORDS}
            />
          </div>
        </header>

        <div className="flex flex-col gap-4">
          <GuitarTopControls
            volume={volume}
            onVolumeChange={setVolume}
            guitarType={guitarType}
            onGuitarTypeChange={handleGuitarTypeChange}
            theme={guitarTheme}
            onThemeChange={handleThemeChange}
          />

          <div className="w-full">
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
              <div className="text-center text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
                <p><strong>Keyboard Controls:</strong> Use Q-Y keys for strings (top to bottom) and 1-0 keys for frets (1-10)</p>
              </div>
              {/* <div className="landscape-warning text-xs text-muted-foreground bg-purple-100 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-2">
                <p>For the best experience, expand to full screen.
                  <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
                    Click here to expand
                  </strong>
                </p>
              </div> */} 
               <div className="text-center text-xs text-muted-foreground bg-purple-100 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-2">
                <p>For the best experience, expand to full screen.
                  <strong onClick={handleOpen} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent ">
                    Click here to expand
                  </strong>
                </p>
                <LandscapeInstrumentModal isOpen={open} onClose={() => setOpen(false)}>
                  <GuitarBody
                guitarType={guitarType}
                colors={THEME_COLORS[guitarTheme][guitarType]}
                numStrings={getCurrentTuning().length || 6}
                numFrets={13}
                activeStrings={activeStrings}
                activeFrets={activeFrets}
                onStringPluck={pluckString} 
                showNoteNames={showNoteNames}
                showFretNumbers={showFretNumbers}
                noteNames={generateNoteNames()}
              />
                </LandscapeInstrumentModal>
              </div>
            </div>
            
            {/* <div ref={containerRef} className="flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}> */}
              <GuitarBody
                guitarType={guitarType}
                colors={THEME_COLORS[guitarTheme][guitarType]}
                numStrings={getCurrentTuning().length || 6}
                numFrets={13}
                activeStrings={activeStrings}
                activeFrets={activeFrets}
                onStringPluck={pluckString} 
                showNoteNames={showNoteNames}
                showFretNumbers={showFretNumbers}
                noteNames={generateNoteNames()}
              />
            {/* </div> */}
          </div>

        </div>
      </div>

      <NotesPopup
        open={showNotesPopup}
        onOpenChange={setShowNotesPopup}
        notes={[]}
        onClose={() => setShowNotesPopup(false)}
      />
    </div>
  );
};

export default VirtualGuitarComponent;
