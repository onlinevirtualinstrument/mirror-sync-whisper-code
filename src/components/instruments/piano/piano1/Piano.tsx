import { useState, useEffect, useRef } from 'react';
import PianoKey from '@/components/instruments/piano/piano1/PianoKey';
import PianoControls from '@/components/instruments/piano/piano1/PianoControls';
import PianoTheme, { ThemeType } from '@/components/instruments/piano/piano1/PianoTheme';
import PianoTutorial from '@/components/instruments/piano/piano1/PianoTutorial';
import { Helmet } from "react-helmet";
import { Music, Piano, Bookmark, ChevronDown } from "lucide-react";
import InstrumentInterlink from '@/components/instruments/InstrumentInterlink';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Mic2 as Record,
  Share2,
  Save,
  Pause,
  Timer as Metronome,
  Music as MusicIcon,
  BookOpen,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import audioPlayer from '@/utils/music/audioPlayer';
import { lockToLandscape } from "@/components/landscapeMode/lockToLandscape";
import LandscapeInstrumentModal from '@/components/landscapeMode/LandscapeInstrumentModal';


const NOTES = [
  { note: 'C', frequency: 261.63 },
  { note: 'C#', frequency: 277.18, isBlack: true },
  { note: 'D', frequency: 293.66 },
  { note: 'D#', frequency: 311.13, isBlack: true },
  { note: 'E', frequency: 329.63 },
  { note: 'F', frequency: 349.23 },
  { note: 'F#', frequency: 369.99, isBlack: true },
  { note: 'G', frequency: 392.00 },
  { note: 'G#', frequency: 415.30, isBlack: true },
  { note: 'A', frequency: 440.00 },
  { note: 'A#', frequency: 466.16, isBlack: true },
  { note: 'B', frequency: 493.88 }
];

const KEYBOARD_MAPPING: Record<string, { note: string, octave: number }> = {
  'a': { note: 'C', octave: 4 },
  'w': { note: 'C#', octave: 4 },
  's': { note: 'D', octave: 4 },
  'e': { note: 'D#', octave: 4 },
  'd': { note: 'E', octave: 4 },
  'f': { note: 'F', octave: 4 },
  't': { note: 'F#', octave: 4 },
  'g': { note: 'G', octave: 4 },
  'y': { note: 'G#', octave: 4 },
  'h': { note: 'A', octave: 4 },
  'u': { note: 'A#', octave: 4 },
  'j': { note: 'B', octave: 4 },
  'k': { note: 'C', octave: 5 },
  'o': { note: 'C#', octave: 5 },
  'l': { note: 'D', octave: 5 },
  'p': { note: 'D#', octave: 5 },
  ';': { note: 'E', octave: 5 },
};

const OCTAVES = [3, 4, 5];

const getKeyStyle = (theme: ThemeType, isBlack: boolean) => {
  switch (theme) {
    case 'classic':
      return isBlack
        ? 'bg-black text-white hover:bg-gray-900'
        : 'bg-white border-gray-300 text-black hover:bg-gray-50';
    case 'dark':
      return isBlack
        ? 'bg-gray-950 text-gray-300 hover:bg-gray-800'
        : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700';
    case 'neon':
      return isBlack
        ? 'bg-purple-900 text-pink-300 hover:bg-purple-800 shadow-[0_0_10px_rgba(219,39,119,0.5)]'
        : 'bg-cyan-900 border-cyan-700 text-cyan-100 hover:bg-cyan-800 shadow-[0_0_10px_rgba(6,182,212,0.5)]';
    case 'light':
    default:
      return isBlack
        ? 'bg-gray-900 text-white hover:bg-gray-800'
        : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50';
  }
};

const PianoPage = () => {
  const [activeNotes, setActiveNotes] = useState<Record<string, boolean>>({});
  const [volume, setVolume] = useState<number>(70);
  const [theme, setTheme] = useState<ThemeType>('classic');
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [showCords, setShowCords] = useState(true);
  const [showBlackCords, setShowBlackCords] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [metronomeVolume, setMetronomeVolume] = useState(50);
  const [canPlayRecording, setCanPlayRecording] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [notationOpen, setNotationOpen] = useState(false);
  const metronomeIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    audioPlayer.setVolume(volume);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (KEYBOARD_MAPPING[key] && !activeNotes[`${KEYBOARD_MAPPING[key].note}-${KEYBOARD_MAPPING[key].octave}`]) {
        const { note, octave } = KEYBOARD_MAPPING[key];
        playNote(note, octave);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (KEYBOARD_MAPPING[key]) {
        const { note, octave } = KEYBOARD_MAPPING[key];
        stopNote(note, octave);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (typeof AudioContext !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    };
  }, [activeNotes, volume]);

  const getNoteFrequency = (note: string, octave: number) => {
    const baseNote = NOTES.find(n => n.note === note);
    if (!baseNote) return 0;

    const octaveDiff = octave - 4; // Relative to octave 4
    return baseNote.frequency * Math.pow(2, octaveDiff);
  };

  const playNote = (note: string, octave: number) => {
    const noteKey = `${note}-${octave}`;
    setActiveNotes(prev => ({ ...prev, [noteKey]: true }));

    const frequency = getNoteFrequency(note, octave);
    audioPlayer.playNote(frequency);

    setTimeout(() => {
      setActiveNotes(prev => {
        const updated = { ...prev };
        delete updated[noteKey];
        return updated;
      });
    }, 300);
  };

  const stopNote = (note: string, octave: number) => {
    const noteKey = `${note}-${octave}`;
    setActiveNotes(prev => {
      const updated = { ...prev };
      delete updated[noteKey];
      return updated;
    });
  };

  const startRecording = () => {
    audioPlayer.startPianoRecording();
    setIsRecording(true);
    setCanPlayRecording(false);

    toast({
      title: "Recording started",
      description: "Play notes to record your performance."
    });
  };

  const stopRecording = () => {
    const recordedNotes = audioPlayer.stopPianoRecording();
    setIsRecording(false);
    setCanPlayRecording(recordedNotes.length > 0);

    toast({
      title: "Recording stopped",
      description: `Recorded ${recordedNotes.length} notes.`,
    });
  };

  const playRecording = () => {
    const recordedNotes = audioPlayer.getRecordedNotes();

    if (recordedNotes.length === 0) {
      toast({
        title: "No recording",
        description: "Record something first by clicking the record button.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Playing recording",
      description: `Playing ${recordedNotes.length} notes.`,
    });

    audioPlayer.playRecordedNotes();
  };

  const saveRecording = async () => {
    const recordedNotes = audioPlayer.getRecordedNotes();

    if (recordedNotes.length === 0) {
      toast({
        title: "No recording",
        description: "Record something first by clicking the record button.",
        variant: "destructive"
      });
      return;
    }

    try {
      await audioPlayer.downloadRecordedNotesAsMP3('piano-melody.mp3');

      toast({
        title: "Recording saved",
        description: "Your piano recording has been downloaded as an MP3 file.",
      });
    } catch (error) {
      console.error("Error saving recording:", error);
      toast({
        title: "Error saving",
        description: "Could not save recording. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startMetronome = () => {
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
    }

    const beatDuration = 60000 / bpm;
    let beat = 0;

    metronomeIntervalRef.current = window.setInterval(() => {
      if (audioContextRef.current) {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.type = beat % 4 === 0 ? 'sine' : 'triangle';
        oscillator.frequency.value = beat % 4 === 0 ? 1000 : 800;

        gainNode.gain.value = metronomeVolume / 100 * 0.2;

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 0.05);
      }

      beat++;
    }, beatDuration);

    setMetronomeActive(true);
  };

  const stopMetronome = () => {
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
      metronomeIntervalRef.current = null;
    }

    setMetronomeActive(false);
  };

  const toggleMetronome = () => {
    if (metronomeActive) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  const renderPianoKeys = () => {
    const pianoKeys = [];

    OCTAVES.forEach(octave => {
      const adjustedOctave = octave + octaveOffset;

      NOTES.forEach(({ note, isBlack }) => {
        const keyClass = getKeyStyle(theme, !!isBlack);

        let keyboardKey = '';
        for (const [key, mapping] of Object.entries(KEYBOARD_MAPPING)) {
          if (mapping.note === note && mapping.octave === adjustedOctave) {
            keyboardKey = key;
            break;
          }
        }

        pianoKeys.push(
          <PianoKey
            key={`${note}-${adjustedOctave}`}
            note={note}
            octave={adjustedOctave}
            isBlack={!!isBlack}
            onPlay={(note, octave) => playNote(note, octave)}
            isPlaying={!!activeNotes[`${note}-${adjustedOctave}`]}
            keyboardShortcut={keyboardKey}
            className={keyClass}
            showCord={isBlack ? showBlackCords : showCords}
            theme={theme}
          />
        );
      });
    });

    return pianoKeys;
  };

  const [open, setOpen] = useState(false);
  const handleOpen = async () => {
    await lockToLandscape();
    setOpen(true);
  };

  return (

    <>
      <Helmet>
        <title>Piano - Interactive Piano Guitar Experience</title>
        <meta name="description" content="Play, learn and create music with Guitarscape, a virtual guitar experience with multiple instrument types and realistic sounds." />
        <meta name="keywords" content="virtual guitar, online guitar, guitar simulator, learn guitar, acoustic guitar, electric guitar" />
        <link rel="canonical" href="/" />
      </Helmet>

      {/* <AppLayout> */}


      <div className="container mx-auto p-4 ">

        <div className="grid gap-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant={isRecording ? 'destructive' : 'default'}
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                className="flex items-center gap-2"
              >
                {isRecording ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Record className="h-4 w-4" />
                    Record
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={playRecording}
                disabled={!canPlayRecording}
              >
                <MusicIcon className="h-4 w-4 mr-2" />
                Play
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={saveRecording}
                disabled={!canPlayRecording}
              >
                <Save className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Metronome className="h-4 w-4 mr-2" />
                    Metronome Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Metronome Settings</DialogTitle>
                    <DialogDescription>
                      Adjust tempo and volume for the metronome.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Tempo (BPM): {bpm}
                      </label>
                      <Slider
                        min={40}
                        max={240}
                        step={1}
                        value={[bpm]}
                        onValueChange={(values) => setBpm(values[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Volume: {metronomeVolume}%
                      </label>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[metronomeVolume]}
                        onValueChange={(values) => setMetronomeVolume(values[0])}
                      />
                    </div>

                    <Button onClick={toggleMetronome}>
                      {metronomeActive ? 'Stop Metronome' : 'Start Metronome'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <PianoTheme
                currentTheme={theme}
                onThemeChange={(newTheme) => setTheme(newTheme as ThemeType)}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setTutorialOpen(true)}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Tutorial</span>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-wrap gap-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <PianoControls
                  volume={volume}
                  onVolumeChange={setVolume}
                  theme={theme}
                  onThemeChange={(newTheme) => setTheme(newTheme as ThemeType)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="octave-offset" className="text-sm whitespace-nowrap">
                  Octave: {octaveOffset >= 0 ? '+' : ''}{octaveOffset}
                </label>
                <div className="w-28">
                  <Slider
                    id="octave-offset"
                    min={-2}
                    max={2}
                    step={1}
                    value={[octaveOffset]}
                    onValueChange={(values) => setOctaveOffset(values[0])}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="show-cords" className="text-sm whitespace-nowrap">
                  White Cords
                </label>
                <Switch
                  id="show-cords"
                  checked={showCords}
                  onCheckedChange={setShowCords}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="landscape-warning text-center text-xs text-muted-foreground bg-purple-100 p-2 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-6">
          <p>For the best experience, expand to full screen.
            <strong onClick={handleOpen} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]">
              Click here to expand
            </strong>
          </p>
          <LandscapeInstrumentModal isOpen={open} onClose={() => setOpen(false)}>
            <div className={`piano-container rounded-lg overflow-hidden shadow-xl p-4 mb-8 ${theme === 'dark' ? 'bg-gray-900' :
                theme === 'neon' ? 'bg-gray-950 bg-opacity-90' :
                  theme === 'classic' ? 'bg-gray-900' : 'bg-white'
              }`}>
              <div id="piano-app" className="piano relative flex justify-center pb-6 overflow-x-auto">
                <div className="flex relative">
                  {renderPianoKeys()}
                </div>
              </div>
            </div>
          </LandscapeInstrumentModal>
        </div>
        <style>{`
                @media (min-width: 768px) {
          .landscape-warning {
            display: none;
          }
        }
      `}</style>
        <div className={`piano-container rounded-lg overflow-hidden shadow-xl p-4 mb-8 ${theme === 'dark' ? 'bg-gray-900' :
            theme === 'neon' ? 'bg-gray-950 bg-opacity-90' :
              theme === 'classic' ? 'bg-gray-900' : 'bg-white'
          }`}>
          <div id="piano-app" className="piano relative flex justify-center pb-6 overflow-x-auto">
            <div className="flex relative">
              {renderPianoKeys()}
            </div>
          </div>
        </div>


        {/* <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Keyboard Shortcuts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(KEYBOARD_MAPPING).map(([key, { note, octave }]) => (
            <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
                {key.toUpperCase()}
              </div>
              <span>
                {note}{octave} {note.includes('#') ? '(Sharp)' : ''}
              </span>
            </div>
          ))}
        </div>
      </section> */}

        <PianoTutorial isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      </div>

      {/* Add instrument interlink */}
      {/* <InstrumentInterlink currentInstrument="Piano" /> */}
      {/* </AppLayout> */}
    </>
  );
};

export default PianoPage;
