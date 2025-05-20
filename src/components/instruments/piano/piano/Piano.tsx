import React, { useState, useEffect, useCallback, useRef } from 'react';
import PianoKey from './PianoKey';
import PianoControls from './PianoControls';
import PianoTheme, { ThemeType } from './PianoTheme';
import PianoTutorial from './PianoTutorial';
import audioPlayer from '@/utils/music/audioPlayer';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Music, Mic, Play, Save, Volume, Sparkles, Layers, BookOpen } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const KEY_MAPPING: Record<string, { note: string; octave: number }> = {
  a: { note: 'C', octave: 4 },
  w: { note: 'C#', octave: 4 },
  s: { note: 'D', octave: 4 },
  e: { note: 'D#', octave: 4 },
  d: { note: 'E', octave: 4 },
  f: { note: 'F', octave: 4 },
  t: { note: 'F#', octave: 4 },
  g: { note: 'G', octave: 4 },
  y: { note: 'G#', octave: 4 },
  h: { note: 'A', octave: 4 },
  u: { note: 'A#', octave: 4 },
  j: { note: 'B', octave: 4 },
  k: { note: 'C', octave: 5 },
  o: { note: 'C#', octave: 5 },
  l: { note: 'D', octave: 5 },
  p: { note: 'D#', octave: 5 },
  ';': { note: 'E', octave: 5 },
};

const KEY_TO_DISPLAY: Record<string, string> = {
  'C4': 'A',
  'C#4': 'W',
  'D4': 'S',
  'D#4': 'E',
  'E4': 'D',
  'F4': 'F',
  'F#4': 'T',
  'G4': 'G',
  'G#4': 'Y',
  'A4': 'H',
  'A#4': 'U',
  'B4': 'J',
  'C5': 'K',
  'C#5': 'O',
  'D5': 'L',
  'D#5': 'P',
  'E5': ';',
};

interface PianoProps {
  startOctave?: number;
  endOctave?: number;
  theme?: ThemeType;
  defaultVolume?: number;
}

const SOUND_TYPES = [
  { id: 'piano', label: 'Piano' },
  { id: 'grand-piano', label: 'Grand Piano' },
  { id: 'upright-piano', label: 'Upright Piano' },
  { id: 'electric-piano', label: 'Electric Piano' },
  { id: 'synthesizer', label: 'Synthesizer' },
];

const Piano: React.FC<PianoProps> = ({
  startOctave = 4,
  endOctave = 5,
  theme: initialTheme = 'classic',
  defaultVolume = 80,
}) => {
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

  useEffect(() => {
    audioPlayer.setVolume(volume);
  }, [volume]);

  const getNoteFrequency = (note: string, octave: number) => {
    const noteName = note.toLowerCase();
    const octaveNumber = parseInt(octave.toString());
    const noteIndex = NOTES.indexOf(noteName);
    const frequency = 440 * Math.pow(2, (noteIndex - 9 + octaveNumber) / 12);
    return frequency;
  };

  const playNote = useCallback((note: string, octave: number) => {
    const noteKey = `${note}${octave}`;
    
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.add(noteKey);
      return newSet;
    });
    
    const frequency = getNoteFrequency(note, octave);
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

  const saveRecording = async () => {
    try {
      await audioPlayer.downloadRecordedNotesAsMP3('piano-melody.mp3');
      
      toast({
        title: "Recording Saved",
        description: "Your melody has been saved as an MP3 file",
      });
    } catch (error) {
      console.error("Error saving recording:", error);
      toast({
        title: "Error Saving",
        description: "Could not save recording. Try again or record a new melody.",
        variant: "destructive"
      });
    }
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

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    
    toast({
      title: "Theme Changed",
      description: `Piano theme set to ${newTheme}`,
    });
  };

  const pianoKeys = generateKeys();
  
  const whiteKeys = pianoKeys.filter(key => !key.isBlack);
  const blackKeys = pianoKeys.filter(key => key.isBlack);

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
              <Volume size={16} />
              <Slider 
                className="w-24" 
                value={[volume]} 
                onValueChange={values => setVolume(values[0])} 
                min={0} 
                max={100} 
                step={1}
              />
              <span className="text-xs">{volume}%</span>
            </div>
            
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <div className="flex items-center space-x-1">
                <Checkbox 
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
          
          <div className="flex justify-center space-x-2 mb-4">
            {!isRecording && (
              <Button 
                onClick={startRecording}
                variant="outline"
                className="flex items-center space-x-1"
                disabled={isPlaying}
              >
                <Mic size={16} />
                <span>Start Recording</span>
              </Button>
            )}
            
            {isRecording && (
              <Button 
                onClick={stopRecording}
                variant="destructive"
                className="flex items-center space-x-1"
              >
                <span>Stop Recording</span>
              </Button>
            )}
            
            <Button 
              onClick={playRecording}
              variant="outline"
              className="flex items-center space-x-1"
              disabled={recording.length === 0 || isRecording || isPlaying}
            >
              <Play size={16} />
              <span>Play Recording</span>
            </Button>
            
            <Button 
              variant="outline"
              className="flex items-center space-x-1"
              disabled={recording.length === 0}
              onClick={saveRecording}
            >
              <Save size={16} />
              <span>Save</span>
            </Button>
          </div>
          
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
          
          <div className={`relative ${themeClasses.container}`}>
            <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
              <div className="flex">
                {blackKeys.map(({ note, octave, isActive, keyboardShortcut, showBlackCord }) => (
                  <PianoKey
                    key={`${note}${octave}`}
                    note={note}
                    octave={octave}
                    isBlack
                    onPlay={playNote}
                    isPlaying={isActive}
                    keyboardShortcut={keyboardShortcut}
                    className={isActive ? themeClasses.activeBlackKey : themeClasses.blackKey}
                    showCord={showBlackCord}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              {whiteKeys.map(({ note, octave, isActive, keyboardShortcut }) => (
                <PianoKey
                  key={`${note}${octave}`}
                  note={note}
                  octave={octave}
                  onPlay={playNote}
                  isPlaying={isActive}
                  keyboardShortcut={keyboardShortcut}
                  className={isActive ? themeClasses.activeWhiteKey : themeClasses.whiteKey}
                  theme={theme}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-3">Visual Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Theme</label>
                  <PianoTheme 
                    currentTheme={theme} 
                    onThemeChange={handleThemeChange} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm">Show Keyboard Shortcuts</label>
                  <Switch 
                    checked={showKeyboardShortcuts} 
                    onCheckedChange={setShowKeyboardShortcuts} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    Show Black Cord
                  </label>
                  <Switch 
                    checked={showBlackCord} 
                    onCheckedChange={setShowBlackCord} 
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-3">Sound Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Sound Type</label>
                  <Select value={soundType} onValueChange={setSoundType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Piano Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOUND_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm">Volume</label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      className="w-32" 
                      value={[volume]} 
                      onValueChange={values => setVolume(values[0])} 
                      min={0} 
                      max={100} 
                      step={1}
                    />
                    <span className="text-xs w-8">{volume}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm">Metronome</label>
                  <Switch 
                    checked={metronomeEnabled} 
                    onCheckedChange={setMetronomeEnabled} 
                  />
                </div>
                
                {metronomeEnabled && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Tempo (BPM)</label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        className="w-32" 
                        value={[metronomeSpeed]} 
                        onValueChange={values => setMetronomeSpeed(values[0])} 
                        min={40} 
                        max={240} 
                        step={1}
                      />
                      <span className="text-xs w-10">{metronomeSpeed}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-3">Advanced Settings</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Starting Octave</label>
                    <Select value={currentOctave.toString()} onValueChange={(val) => setCurrentOctave(parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select octave" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(octave => (
                          <SelectItem key={octave} value={octave.toString()}>
                            Octave {octave}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recording Quality</label>
                    <Select defaultValue="high">
                      <SelectTrigger>
                        <SelectValue placeholder="Recording Quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (16kHz)</SelectItem>
                        <SelectItem value="medium">Medium (32kHz)</SelectItem>
                        <SelectItem value="high">High (44.1kHz)</SelectItem>
                        <SelectItem value="studio">Studio (48kHz)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">MIDI Settings</label>
                  <div className="p-3 border rounded-md bg-white dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Enable MIDI Input</span>
                      <Switch />
                    </div>
                    <p className="text-xs text-gray-500">
                      Connect an external MIDI keyboard to play. Compatible with most USB MIDI devices.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Performance</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Quality Sound Engine</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Background Animations</span>
                      <Switch defaultChecked={theme === 'neon'} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Advanced Effects (Reverb, Delay)</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Piano;
