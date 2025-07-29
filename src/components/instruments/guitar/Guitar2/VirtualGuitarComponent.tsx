
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GuitarBody from './virtual-guitar/GuitarBody';
import { GuitarType } from './virtual-guitar/GuitarSoundProfiles';
import GuitarSettings from './virtual-guitar/GuitarSettings';
import GuitarSoundEngine from './virtual-guitar/GuitarSoundEngine';
import ThemeSelector, { GuitarTheme } from './virtual-guitar/ThemeSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TutorialContent from './virtual-guitar/TutorialContent';
import { HelpCircle, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lockToLandscape, toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import LandscapeInstrumentModal from '@/components/landscapeMode/LandscapeInstrumentModal';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // If using ShadCN

// Color themes for the guitar
export interface GuitarColors {
  accent?: string;  // Adding the accent property
  body: string;
  neck: string;
  fretboard: string;
  soundhole?: string;
  pickups?: string;
  strings: string;
  frets: string;
  inlays: string;
}

export type TuningType = 'standard' | 'drop-d' | 'open-g' | 'custom';

const VirtualGuitarComponent: React.FC = () => {
  const [guitarType, setGuitarType] = useState<GuitarType>('acoustic');
  const [volume, setVolume] = useState<number>(50);
  const [colors, setColors] = useState<GuitarColors>({
    body: '#3B82F6',
    neck: '#A3A371',
    fretboard: '#475569',
    soundhole: '#000000',
    pickups: '#4A360B',
    strings: '#D7D7D7',
    frets: '#AAAAAA',
    inlays: '#FFFFFF'
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeStrings, setActiveStrings] = useState<number[]>([]);
  const [activeFrets, setActiveFrets] = useState<{ string: number, fret: number }[]>([]);
  const [showNoteNames, setShowNoteNames] = useState<boolean>(false);
  const [showFretNumbers, setShowFretNumbers] = useState<boolean>(false);
  const [tuning, setTuning] = useState<string>('standard');
  const [customTuning, setCustomTuning] = useState<string[]>([
    'E2', 'A2', 'D3', 'G3', 'B3', 'E4'
  ]);
  const [effects, setEffects] = useState({
    distortion: 0,
    reverb: 0,
    delay: 0
  });
  const [showEffects, setShowEffects] = useState<boolean>(false);
  const [chordAssistMode, setChordAssistMode] = useState<boolean>(false);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  const guitarOptions = [
    { value: "acoustic", label: "Acoustic", color: "text-blue-600" },
    { value: "electric", label: "Electric", color: "text-red-600" },
    { value: "bass", label: "Bass", color: "text-green-600" },
    { value: "classical", label: "Classical", color: "text-yellow-600" },
    { value: "flamenco", label: "Flamenco", color: "text-pink-600" },
    { value: "steel", label: "Steel", color: "text-gray-600" },
    { value: "twelveString", label: "12-String", color: "text-purple-600" },
  ];

  const [soundEngine, setSoundEngine] = useState<GuitarSoundEngine | null>(null);

  useEffect(() => {
    const engine = new GuitarSoundEngine();
    setSoundEngine(engine);

    return () => {
      engine.stopAllStrings();
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (soundEngine) {
      soundEngine.setGuitarType(guitarType);
    }
  }, [guitarType, effects, soundEngine]);

  const handleStringPluck = useCallback((stringIndex: number, fret: number) => {
    if (soundEngine) {
      soundEngine.pluckString(stringIndex, fret);

      setActiveStrings(prev => [...prev, stringIndex]);
      setActiveFrets(prev => [...prev, { string: stringIndex, fret: fret }]);

      setTimeout(() => {
        setActiveStrings(prev => prev.filter(s => s !== stringIndex));
        setActiveFrets(prev => prev.filter(af => !(af.string === stringIndex && af.fret === fret)));
      }, 200);
    }
  }, [soundEngine]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const stringKeys = ['q', 'w', 'e', 'r', 't', 'y'];
      const fretKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

      const key = event.key.toLowerCase();
      const stringIndex = stringKeys.indexOf(key);

      if (stringIndex !== -1) {
        handleStringPluck(5 - stringIndex, 0);
        return;
      }

      const fretIndex = fretKeys.indexOf(key);
      if (fretIndex !== -1) {
        const lastActiveString = activeStrings.length > 0 ?
          activeStrings[activeStrings.length - 1] :
          5;

        handleStringPluck(lastActiveString, fretIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeStrings, handleStringPluck]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (soundEngine) {
      soundEngine.setVolume(newVolume);
    }
  };

  const handleGuitarTypeChange = (newType: GuitarType) => {
    setGuitarType(newType);
  };

  const handleThemeChange = (newColors: GuitarColors) => {
    setColors(newColors);
  };

  const handleToggleNoteNames = () => {
    setShowNoteNames(prev => !prev);
  };

  const handleToggleFretNumbers = () => {
    setShowFretNumbers(prev => !prev);
  };

  const handleTuningChange = (newTuning: string) => {
    setTuning(newTuning);
  };

  const handleCustomTuningChange = (newStrings: string[]) => {
    setCustomTuning(newStrings);
  };

  const handleEffectsChange = (effect: keyof typeof effects, value: number) => {
    setEffects(prev => ({ ...prev, [effect]: value }));
  };

  const handleToggleEffects = () => {
    setShowEffects(prev => !prev);
  };

  const handleToggleChordAssistMode = () => {
    setChordAssistMode(prev => !prev);
  };

  const handleActiveChordChange = (chord: string) => {
    setActiveChord(chord);
  };



  const [open, setOpen] = useState(false);
  const handleOpen = async () => {
    setOpen(true); // Open modal first
    // Wait for modal animation/frame to complete
    requestAnimationFrame(async () => {
      await new Promise(res => setTimeout(res, 150)); // delay stabilizes layout
      await lockToLandscape();
    });
  };


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-4">
          <ThemeSelector onThemeChange={handleThemeChange} />
          <GuitarSettings
            effects={effects}
            onEffectsChange={handleEffectsChange}
            showEffects={showEffects}
            onToggleEffects={handleToggleEffects}
            tuning={tuning}
            onTuningChange={handleTuningChange}
            customTuning={customTuning}
            onCustomTuningChange={handleCustomTuningChange}
            showNoteNames={showNoteNames}
            onToggleNoteNames={handleToggleNoteNames}
            showFretNumbers={showFretNumbers}
            onToggleFretNumbers={handleToggleFretNumbers}
            chordAssistMode={chordAssistMode}
            onToggleChordAssistMode={handleToggleChordAssistMode}
            activeChord={activeChord}
            onActiveChordChange={handleActiveChordChange}
          />

        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
            onClick={() => setShowTutorial(true)}
          >
            <HelpCircle className="h-4 w-4" />
            Tutorial
          </Button>

          <Select value={guitarType} onValueChange={handleGuitarTypeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Guitar Type" />
            </SelectTrigger>
            <SelectContent>
              {guitarOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={`font-medium ${option.color}`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant='outline'>
            <label htmlFor="volume" className="text-sm font-medium">Volume:</label>
            <input
              type="range"
              id="volume"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              className="w-24"
            /></Button>
        </div>
      </div>



      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
        <div className="text-center text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Use Q-Y keys for strings (top to bottom) and 1-0 keys for frets (1-10)
          </span>
        </div>
        <div className="text-center text-xs text-muted-foreground bg-purple-100 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-2">
          <p>For the best experience, expand to full screen.
            <strong onClick={handleOpen} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent ">
              Click here to expand
            </strong>
          </p>
          <LandscapeInstrumentModal isOpen={open} onClose={() => setOpen(false)}>
            <GuitarBody
              guitarType={guitarType}
              colors={colors}
              numStrings={6}
              numFrets={12}
              activeStrings={activeStrings}
              activeFrets={activeFrets}
              onStringPluck={handleStringPluck}
              showNoteNames={showNoteNames}
              showFretNumbers={showFretNumbers}
            />
          </LandscapeInstrumentModal>
        </div>
      </div>

      {/* <div ref={containerRef} className="flex items-center justify-center bg-white animate-scale-in" style={{ animationDelay: '200ms' }}> */}

      <GuitarBody
        guitarType={guitarType}
        colors={colors}
        numStrings={6}
        numFrets={12}
        activeStrings={activeStrings}
        activeFrets={activeFrets}
        onStringPluck={handleStringPluck}
        showNoteNames={showNoteNames}
        showFretNumbers={showFretNumbers}
      />
      {/* </div> */}
      {/* <div className="flex justify-center space-x-4">
        <button
          className={`px-4 py-2 rounded-md ${guitarType === 'acoustic' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleGuitarTypeChange('acoustic')}
        >
          Acoustic
        </button>
        <button
          className={`px-4 py-2 rounded-md ${guitarType === 'electric' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleGuitarTypeChange('electric')}
        >
          Electric
        </button>
        <button
          className={`px-4 py-2 rounded-md ${guitarType === 'bass' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleGuitarTypeChange('bass')}
        >
          Bass
        </button>
        <button
          className={`px-4 py-2 rounded-md ${guitarType === 'classical' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleGuitarTypeChange('classical')}
        >
          Classical
        </button>
        <button
          className={`px-4 py-2 rounded-md ${guitarType === 'flamenco' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleGuitarTypeChange('flamenco')}
        >
          Flamenco
        </button>
        <button
          className={`px-4 py-2 rounded-md ${guitarType === 'steel' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleGuitarTypeChange('steel')}
        >
          Steel
        </button>
        <button
          className={`px-4 py-2 rounded-md ${guitarType === 'twelveString' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleGuitarTypeChange('twelveString')}
        >
          12-String
        </button>
      </div> */}

      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Virtual Guitar Tutorial
            </DialogTitle>
          </DialogHeader>
          <TutorialContent onClose={() => setShowTutorial(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VirtualGuitarComponent;
