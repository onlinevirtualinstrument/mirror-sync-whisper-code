
import React, { useState, useEffect, useCallback } from 'react';
import GuitarBody from './virtual-guitar/GuitarBody';
import { GuitarType } from './virtual-guitar/GuitarSoundProfiles';
import GuitarSettings from './virtual-guitar/GuitarSettings';
import GuitarSoundEngine from './virtual-guitar/GuitarSoundEngine';
import ThemeSelector, { GuitarTheme } from './virtual-guitar/ThemeSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TutorialContent from './virtual-guitar/TutorialContent';
import { HelpCircle, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [activeStrings, setActiveStrings] = useState<number[]>([]);
  const [activeFrets, setActiveFrets] = useState<{string: number, fret: number}[]>([]);
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
  const [showKeyboardControls, setShowKeyboardControls] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  
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
      setActiveFrets(prev => [...prev, {string: stringIndex, fret: fret}]);
      
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

  const toggleKeyboardControls = () => {
    setShowKeyboardControls(prev => !prev);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1.5"
            onClick={() => setShowTutorial(true)}
          >
            <HelpCircle className="h-4 w-4" />
            Tutorial
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="volume" className="text-sm font-medium">Volume:</label>
          <input
            type="range"
            id="volume"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="w-24"
          />
        </div>
      </div>
      
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        <div className="flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Keyboard Controls: Use Q-Y keys for strings (top to bottom) and 1-0 keys for frets (1-10)
          </span>
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
         
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-amber-700 dark:text-amber-400 hover:text-amber-900 hover:bg-amber-100 dark:hover:bg-amber-900"
          onClick={toggleKeyboardControls}
        >
          {showKeyboardControls ? 'Hide Details' : 'Show Details'}
        </Button>
      </div>

      {showKeyboardControls && (
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">String Keys:</h4>
            <ul className="space-y-1">
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Q</kbd> 
                <span>→ 1st string (high E)</span>
              </li>
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">W</kbd> 
                <span>→ 2nd string (B)</span>
              </li>
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">E</kbd> 
                <span>→ 3rd string (G)</span>
              </li>
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">R</kbd> 
                <span>→ 4th string (D)</span>
              </li>
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">T</kbd> 
                <span>→ 5th string (A)</span>
              </li>
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Y</kbd> 
                <span>→ 6th string (low E)</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Fret Keys:</h4>
            <ul className="space-y-1">
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">1-9</kbd> 
                <span>→ Frets 1-9</span>
              </li>
              <li className="text-sm flex items-center gap-2">
                <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">0</kbd> 
                <span>→ Fret 10</span>
              </li>
            </ul>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>To play: First press a string key, then a fret key.</p>
              <p>Example: Press <kbd className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">Y</kbd> then <kbd className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">3</kbd> to play the 3rd fret on the low E string.</p>
            </div>
          </div>
        </div>
      )}

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
      
      <div className="flex justify-center space-x-4">
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
      </div>

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
