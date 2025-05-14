import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import PianoTheme, { ThemeType } from './PianoTheme';
import PianoTutorial from './PianoTutorial';
import PianoKeyboard from './PianoKeyboard';
import PianoRecording from './PianoRecording';
import PianoSettings from './PianoSettings';
import PianoAdvanced from './PianoAdvanced';
import { NOTES, KEY_MAPPING, KEY_TO_DISPLAY, SOUND_TYPES } from './PianoNotes';
import audioPlayer from '@/utils/audioPlayer';

interface PianoProps {
  startOctave?: number;
  endOctave?: number;
  theme?: ThemeType;
  defaultVolume?: number;
}

const Piano: React.FC<PianoProps> = ({
  startOctave = 4,
  endOctave = 5,
  theme: initialTheme = 'classic',
  defaultVolume = 80,
}) => {
  // State management
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [recording, setRecording] = useState<Array<{ note: string; time: number }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(true);
  const [currentOctave, setCurrentOctave] = useState(startOctave);
  const [theme, setTheme] = useState<ThemeType>(initialTheme);
  const [soundType, setSoundType] = useState('piano');
  const [showBlackCord, setShowBlackCord] = useState(false);
  const [learningMode, setLearningMode] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [metronomeSpeed, setMetronomeSpeed] = useState(120);
  const metronomeRef = useRef<number | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const { toast } = useToast();

  // Generate piano keys
  const generateKeys = useCallback(() => {
    const keys = [];
    
    for (let octave = currentOctave; octave <= currentOctave + 1; octave++) {
      for (let i = 0; i < NOTES.length; i++) {
        const note = NOTES[i];
        const isBlack = note.includes('#');
        
        const noteKey = `${note}${octave}`;
        const keyboardShortcut = showKeyboardShortcuts ? KEY_TO_DISPLAY[noteKey] : undefined;
        
        keys.push({
          note,
          octave, 
          isBlack,
          key: noteKey,
          isActive: activeNotes.has(noteKey),
          keyboardShortcut,
          showBlackCord: isBlack && showBlackCord
        });
      }
    }
    
    return keys;
  }, [currentOctave, activeNotes, showKeyboardShortcuts, showBlackCord]);

  // Set volume when it changes
  useEffect(() => {
    audioPlayer.setVolume(volume);
  }, [volume]);

  // Play note function
  const playNote = useCallback((note: string, octave: number) => {
    const noteKey = `${note}${octave}`;
    
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.add(noteKey);
      return newSet;
    });
    
    // Calculate frequency using standard formula
    const noteIndex = NOTES.indexOf(note);
    const semitoneOffset = (octave - 4) * 12 + (noteIndex - 9);
    const frequency = 440 * Math.pow(2, semitoneOffset / 12);
    
    audioPlayer.playNote(frequency);
    
    if (isRecording) {
      const currentTime = Date.now();
      const noteTime = currentTime - recordingStartTime;
      setRecording(prev => [...prev, { note: noteKey, time: noteTime }]);
    }
    
    setTimeout(() => {
      setActiveNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteKey);
        return newSet;
      });
    }, 300);
  }, [isRecording, recordingStartTime]);

  // Recording functions
  const startRecording = () => {
    setRecording([]);
    setIsRecording(true);
    setRecordingStartTime(Date.now());
    
    audioPlayer.startPianoRecording();
    
    toast({
      title: "Recording Started",
      description: "Play notes to record your melody",
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    const recordedNotes = audioPlayer.stopPianoRecording();
    
    toast({
      title: "Recording Stopped",
      description: `Recorded ${recordedNotes.length} notes`,
    });
  };

  const playRecording = () => {
    if (recording.length === 0) {
      toast({
        title: "Nothing to Play",
        description: "Record something first!",
        variant: "destructive"
      });
      return;
    }
    
    setIsPlaying(true);
    toast({
      title: "Playing Recording",
      description: `Playing ${recording.length} notes`,
    });
    
    let lastTime = 0;
    
    recording.forEach(({ note, time }) => {
      const [noteName, octave] = [note.slice(0, -1), parseInt(note.slice(-1))];
      
      setTimeout(() => {
        playNote(noteName, octave);
      }, time);
      
      lastTime = Math.max(lastTime, time);
    });
    
    setTimeout(() => {
      setIsPlaying(false);
    }, lastTime + 500);
  };

  // Metronome effect
  useEffect(() => {
    if (metronomeEnabled) {
      const interval = 60000 / metronomeSpeed;
      
      const tick = () => {
        const metronomeSound = new Audio('/sounds/metronome.mp3');
        metronomeSound.volume = volume / 200;
        metronomeSound.play().catch(e => console.error("Failed to play metronome sound", e));
      };
      
      tick();
      metronomeRef.current = window.setInterval(tick, interval);
      
      return () => {
        if (metronomeRef.current !== null) {
          clearInterval(metronomeRef.current);
        }
      };
    } else if (metronomeRef.current !== null) {
      clearInterval(metronomeRef.current);
    }
  }, [metronomeEnabled, metronomeSpeed, volume]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const key = e.key.toLowerCase();
      if (KEY_MAPPING[key]) {
        const { note, octave } = KEY_MAPPING[key];
        playNote(note, octave);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playNote]);

  // Change octave function
  const changeOctave = (delta: number) => {
    const newOctave = currentOctave + delta;
    if (newOctave >= 1 && newOctave <= 6) {
      setCurrentOctave(newOctave);
      
      toast({
        title: "Octave Changed",
        description: `Now playing octaves ${newOctave}-${newOctave + 1}`,
      });
    }
  };

  // Theme change function
  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    
    toast({
      title: "Theme Changed",
      description: `Piano theme set to ${newTheme}`,
    });
  };

  // Generate piano keys
  const pianoKeys = generateKeys();
  const whiteKeys = pianoKeys.filter(key => !key.isBlack);
  const blackKeys = pianoKeys.filter(key => key.isBlack);

  // Theme classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'classic':
        return {
          container: 'bg-[#362E21] p-4 rounded-lg',
          whiteKey: 'bg-ivory hover:bg-ivory-100',
          blackKey: 'bg-[#1A1A1A] hover:bg-[#333333]',
          activeWhiteKey: 'bg-[#E6E0D4]',
          activeBlackKey: 'bg-[#4A4A4A]'
        };
      case 'dark':
        return {
          container: 'bg-gray-900 p-4 rounded-lg',
          whiteKey: 'bg-gray-700 hover:bg-gray-600',
          blackKey: 'bg-black hover:bg-gray-950',
          activeWhiteKey: 'bg-gray-500',
          activeBlackKey: 'bg-gray-800'
        };
      case 'light':
        return {
          container: 'bg-gray-100 p-4 rounded-lg',
          whiteKey: 'bg-white hover:bg-gray-50',
          blackKey: 'bg-gray-800 hover:bg-gray-700',
          activeWhiteKey: 'bg-blue-100',
          activeBlackKey: 'bg-blue-800'
        };
      case 'neon':
        return {
          container: 'bg-gray-950 p-4 rounded-lg',
          whiteKey: 'bg-gray-900 hover:bg-gray-800 border border-cyan-500',
          blackKey: 'bg-black hover:bg-gray-950 border border-pink-500',
          activeWhiteKey: 'bg-cyan-900',
          activeBlackKey: 'bg-pink-900'
        };
      default:
        return {
          container: 'bg-gray-900 p-4 rounded-lg',
          whiteKey: 'bg-white hover:bg-gray-50',
          blackKey: 'bg-gray-900 hover:bg-gray-800',
          activeWhiteKey: 'bg-blue-100',
          activeBlackKey: 'bg-blue-800'
        };
    }
  };

  const themeClasses = getThemeClasses();

  // Listen for piano key events
  useEffect(() => {
    const handlePianoKeyEvent = (event: CustomEvent) => {
      const { note, octave, duration } = event.detail;
      const noteKey = `${note}${octave}`;
      
      setActiveNotes(prev => {
        const newSet = new Set(prev);
        newSet.add(noteKey);
        return newSet;
      });
      
      setTimeout(() => {
        setActiveNotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(noteKey);
          return newSet;
        });
      }, duration);
    };
    
    window.addEventListener('piano:playKey', handlePianoKeyEvent as EventListener);
    
    return () => {
      window.removeEventListener('piano:playKey', handlePianoKeyEvent as EventListener);
    };
  }, []);

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto">
      <PianoTutorial isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      
      <Tabs defaultValue="piano">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="piano">Piano</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="piano" className="space-y-4">
          <div className="flex flex-wrap justify-between items-center mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-4">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => changeOctave(-1)}
                disabled={currentOctave <= 1}
                className="h-8"
              >
                <ArrowLeft size={16} />
                <span className="ml-1">Octave Down</span>
              </Button>
              <span className="text-sm font-medium">Octave: {currentOctave}-{currentOctave + 1}</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => changeOctave(1)}
                disabled={currentOctave >= 6}
                className="h-8"
              >
                <span className="mr-1">Octave Up</span>
                <ArrowRight size={16} />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <div className="flex items-center space-x-1">
                <Switch 
                  id="show-shortcuts" 
                  checked={showKeyboardShortcuts} 
                  onCheckedChange={(checked) => setShowKeyboardShortcuts(!!checked)} 
                />
                <label htmlFor="show-shortcuts" className="text-sm cursor-pointer">
                  Keyboard Shortcuts
                </label>
              </div>
            </div>
          </div>
          
          <PianoRecording 
            isRecording={isRecording}
            isPlaying={isPlaying}
            recording={recording}
            startRecording={startRecording}
            stopRecording={stopRecording}
            playRecording={playRecording}
          />
          
          <div className="flex justify-center mb-4 items-center gap-2">
            <Select value={soundType} onValueChange={setSoundType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sound Type" />
              </SelectTrigger>
              <SelectContent>
                {SOUND_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <PianoTheme 
              currentTheme={theme} 
              onThemeChange={handleThemeChange}
            />
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => setTutorialOpen(true)}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden md:inline">Tutorial</span>
            </Button>
          </div>
          
          <PianoKeyboard 
            whiteKeys={whiteKeys}
            blackKeys={blackKeys}
            themeClasses={themeClasses}
            playNote={playNote}
            theme={theme}
          />
          
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Interactive Learning Mode</span>
              </div>
              <Switch checked={learningMode} onCheckedChange={setLearningMode} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Turn on to learn songs with visual note guides
            </p>
          </div>
        </TabsContent> 
        
        <TabsContent value="settings" className="space-y-4">
          <PianoSettings 
            volume={volume}
            setVolume={setVolume}
            soundType={soundType}
            setSoundType={setSoundType}
            metronomeEnabled={metronomeEnabled}
            setMetronomeEnabled={setMetronomeEnabled}
            metronomeSpeed={metronomeSpeed}
            setMetronomeSpeed={setMetronomeSpeed}
            showKeyboardShortcuts={showKeyboardShortcuts}
            setShowKeyboardShortcuts={setShowKeyboardShortcuts}
            showBlackCord={showBlackCord}
            setShowBlackCord={setShowBlackCord}
          />
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <PianoAdvanced 
            currentOctave={currentOctave}
            setCurrentOctave={setCurrentOctave}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Piano;
