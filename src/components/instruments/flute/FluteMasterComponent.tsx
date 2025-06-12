import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, BookOpen } from 'lucide-react';
import { defaultFluteSettings, FluteSettings, fluteTypes, getFluteNotes, FluteNote } from './utils/fluteData';
import fluteAudio from './utils/fluteAudio';
import Navbar from '../../layout/Navbar';

// Import UI components
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import RecordingControls from "./ui/RecordingControls";

// Import our extracted components
import FluteKey from './ui/FluteKey';
import FluteSettingsTabs from './ui/FluteSettingsTabs';
import { FluteDecoration, NoteParticles } from './effects/FluteEffects';
import { getFluteContainerClassName, getFluteRegionalStyle } from './helpers/fluteStyles';
import FluteNoteInfo from './ui/FluteNoteInfo';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";


interface FluteMasterComponentProps {
  className?: string;
  showControls?: boolean;
  showAppearanceSelector?: boolean;
  showRecordingControls?: boolean;
  initialFluteType?: string;
  initialSettings?: FluteSettings;
}

const FluteMasterComponent: React.FC<FluteMasterComponentProps> = ({
  className = "",
  showControls = true,
  showAppearanceSelector = true,
  showRecordingControls = true,
  initialFluteType = 'western',
  initialSettings = defaultFluteSettings
}) => {

  // const containerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);


  // State management
  const [selectedFluteType, setSelectedFluteType] = useState(initialFluteType);
  const [settings, setSettings] = useState<FluteSettings>(initialSettings);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fluteAppearance, setFluteAppearance] = useState('modern');
  const [activeTab, setActiveTab] = useState<'breath' | 'tuning' | 'reverb' | 'vibrato'>('breath');
  const [intonationMode, setIntonationMode] = useState("equal");
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [touchIntensity, setTouchIntensity] = useState(0);
  const [particlesVisible, setParticlesVisible] = useState(false);
  const [fluteNotes, setFluteNotes] = useState<FluteNote[]>([]);
  const { toast } = useToast();

  // Setup flute notes when flute type changes
  useEffect(() => {
    const notes = getFluteNotes(selectedFluteType);
    setFluteNotes(notes);
  }, [selectedFluteType]);

  // Update audio settings when settings change
  useEffect(() => {
    fluteAudio.updateSettings(settings);
  }, [settings, selectedFluteType]);

  // Event handlers - memoize with useCallback to prevent unnecessary re-renders
  const handleFluteTypeChange = useCallback((fluteType: string) => {
    setSelectedFluteType(fluteType);
    toast({
      title: "Flute Changed",
      description: `Switched to ${fluteType} flute type`,
    });
  }, [toast]);

  const handleSettingsChange = useCallback((newSettings: FluteSettings) => {
    setSettings(newSettings);
  }, []);

  const handlePlayingChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  const handleFluteAppearanceChange = useCallback((appearance: string) => {
    setFluteAppearance(appearance);
  }, []);

  // Settings handlers
  const handleBreathChange = useCallback((value: number[]) => {
    const newSettings = {
      ...settings,
      breathSensitivity: value[0]
    };
    setSettings(newSettings);
    fluteAudio.updateSettings({ breathSensitivity: value[0] });
  }, [settings]);

  const handleTuningChange = useCallback((value: number[]) => {
    const newSettings = {
      ...settings,
      tuning: value[0]
    };
    setSettings(newSettings);
    fluteAudio.updateSettings({ tuning: value[0] });
  }, [settings]);

  const handleReverbChange = useCallback((value: number[]) => {
    const newSettings = {
      ...settings,
      reverb: value[0]
    };
    setSettings(newSettings);
    fluteAudio.updateSettings({ reverb: value[0] });
  }, [settings]);

  const handleVibratoIntensityChange = useCallback((value: number[]) => {
    const newSettings = {
      ...settings,
      vibrato: {
        ...settings.vibrato,
        intensity: value[0]
      }
    };
    setSettings(newSettings);
    fluteAudio.updateSettings({ vibrato: newSettings.vibrato });
  }, [settings]);

  const handleVibratoSpeedChange = useCallback((value: number[]) => {
    const newSettings = {
      ...settings,
      vibrato: {
        ...settings.vibrato,
        speed: value[0]
      }
    };
    setSettings(newSettings);
    fluteAudio.updateSettings({ vibrato: newSettings.vibrato });
  }, [settings]);

  const handleIntonationModeChange = useCallback((value: string) => {
    setIntonationMode(value);
    toast({
      title: "Intonation Mode Changed",
      description: `Flute intonation set to ${value} temperament`,
    });
  }, [toast]);

  const handleOverblowingChange = useCallback((checked: boolean) => {
    const newSettings = {
      ...settings,
      allowOverblowing: checked
    };
    setSettings(newSettings);
    fluteAudio.updateSettings({ allowOverblowing: checked });
  }, [settings]);

  const handleMicInputChange = useCallback((checked: boolean) => {
    const newSettings = {
      ...settings,
      useMicrophone: checked
    };
    setSettings(newSettings);
    fluteAudio.updateSettings({ useMicrophone: checked });

    if (checked) {
      toast({
        title: "Microphone Access Requested",
        description: "Please allow microphone access for breath control",
      });
    }
  }, [settings, toast]);

  const handleTransposeChange = useCallback((checked: boolean) => {
    const newSettings = {
      ...settings,
      transpose: checked
    };
    setSettings(newSettings);
    fluteAudio.updateSettings({ transpose: checked });
  }, [settings]);

  const handleDelayChange = useCallback((checked: boolean) => {
    const newSettings = {
      ...settings,
      delay: checked
    };
    setSettings(newSettings);
    fluteAudio.updateSettings({ delay: checked });
  }, [settings]);

  const handleAutoVibratoChange = useCallback((checked: boolean) => {
    const newSettings = {
      ...settings,
      autoVibrato: checked
    };
    setSettings(newSettings);
    fluteAudio.updateSettings({ autoVibrato: checked });
  }, [settings]);

  const handleDynamicRangeChange = useCallback((value: number[]) => {
    const newSettings = {
      ...settings,
      dynamicRange: value[0]
    };
    setSettings(newSettings);
    fluteAudio.updateSettings({ dynamicRange: value[0] });
  }, [settings]);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultFluteSettings);
    fluteAudio.updateSettings(defaultFluteSettings);
    toast({
      title: "Settings Reset",
      description: "All flute settings have been reset to defaults",
    });
  }, [toast]);

  // Flute Player functions
  const playNote = useCallback((note: FluteNote, intensity = 1) => {
    if (activeNote !== note.note) {
      stopCurrentNote();
      fluteAudio.startNote(note.frequency, intensity);
      setActiveNote(note.note);
      setIsPlaying(true);
      setParticlesVisible(true);
    }
  }, [activeNote]);

  const stopCurrentNote = useCallback(() => {
    if (activeNote) {
      fluteAudio.stopNote();
      setActiveNote(null);
      setIsPlaying(false);
      setParticlesVisible(false);
    }
  }, [activeNote]);

  const handleMouseDown = useCallback((note: FluteNote) => {
    setIsHolding(true);
    playNote(note);
  }, [playNote]);

  const handleMouseUp = useCallback(() => {
    setIsHolding(false);
    stopCurrentNote();
  }, [stopCurrentNote]);

  const handleTouchStart = useCallback((note: FluteNote, e: React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(true);

    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const intensity = 1 - ((touch.clientY - rect.top) / rect.height);
    setTouchIntensity(intensity);

    playNote(note, intensity);
  }, [playNote]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(false);
    stopCurrentNote();
  }, [stopCurrentNote]);

  const handleTouchMove = useCallback((note: FluteNote, e: React.TouchEvent) => {
    if (!isHolding) return;

    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();

    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      const intensity = 1 - ((touch.clientY - rect.top) / rect.height);
      setTouchIntensity(intensity);

      if (activeNote === note.note) {
        fluteAudio.updateNoteIntensity(note.frequency, intensity);
      }
    } else {
      stopCurrentNote();
      setIsHolding(false);
    }
  }, [isHolding, activeNote, stopCurrentNote]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyToIndex: { [key: string]: number } = {
        '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7
      };

      const index = keyToIndex[e.key];

      if (index !== undefined && fluteNotes[index] && !e.repeat) {
        playNote(fluteNotes[index]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyToIndex: { [key: string]: number } = {
        '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7
      };

      const index = keyToIndex[e.key];

      if (index !== undefined && fluteNotes[index] && activeNote === fluteNotes[index].note) {
        stopCurrentNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [fluteNotes, activeNote, playNote, stopCurrentNote]);

  // Render functions for different component parts
  const renderFluteTypeSelector = useCallback(() => (
    <div className="w-full max-w-4xl mx-auto py-6 animate-fade-in">

      <h2 className="text-2xl font-display font-bold text-center mb-6">Select Your Flute</h2>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {fluteTypes.map((flute) => {
          const regionStyle = getFluteRegionalStyle(flute, selectedFluteType);
          return (
            <motion.div
              key={flute.id}
              className={`
                relative  rounded-2xl cursor-pointer transition-all duration-300 shadow-subtle
                ${regionStyle.background} backdrop-blur-sm border-2 ${regionStyle.border}
                ${regionStyle.hoverGlow}
              `}
              onClick={() => handleFluteTypeChange(flute.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{
                scale: 1.03,
                borderColor: 'rgba(255,255,255,0.3)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              {selectedFluteType === flute.id && (
                <motion.span
                  className={`absolute top-3 right-3 ${regionStyle.accent} text-white p-1 rounded-full`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.span>
              )}

              <div className="flex flex-col gap-3 items-center">
                <motion.div
                  className={`w-full h-1 flex items-center justify-center  overflow-hidden ${regionStyle.headerImage}`}
                  whileHover={{ scale: 1.05, rotate: selectedFluteType === flute.id ? 5 : 0 }}
                  animate={selectedFluteType === flute.id ? {
                    y: [0, -5, 0],
                    transition: {
                      y: {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }
                    }
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                </motion.div>

                <h3 className="font-display font-semibold text-lg">{flute.name}</h3>

                <div className={`text-xs px-2 py-1 rounded-full ${flute.difficulty === 'beginner' ? 'bg-green-500/20 text-green-700' :
                  flute.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-700' :
                    'bg-red-500/20 text-red-700'
                  }`}>
                  {flute.difficulty}
                </div>

                <p className="text-sm text-muted-foreground text-center mt-1">{flute.soundProfile.tone}</p>

                <motion.div
                  className="mt-2 text-xs text-center text-muted-foreground overflow-hidden"
                  initial={{ opacity: 0, height: 0 }}
                  animate={selectedFluteType === flute.id ?
                    { opacity: 1, height: 'auto' } :
                    { opacity: 0, height: 0 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  <p>Region: <span className="font-medium">{flute.origin}</span></p>
                  <p className="mt-1">Material: <span className="font-medium">{flute.material || 'Traditional'}</span></p>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  ), [selectedFluteType, handleFluteTypeChange]);

  const renderFlutePlayer = useCallback(() => (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="flex  mb-4  text-sm text-muted-foreground pt-6">
        <div className="flex-[3] text-center">

          <motion.div
            className=" "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >

            <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ">

              <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
                <p>Touch or click the keys to play. For keyboard, use keys 1-8.</p>
              </div>
              <div className="landscape-warning text-xs text-muted-foreground bg-purple-100 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-2">
                <p>For the best experience, expand to full screen.
                  <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
                    Click here to expand
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

          </motion.div>
        </div>
        {/* <div className="">
          <BookOpen  />
        </div> */}
      </div>
      <FullscreenWrapper ref={containerRef} instrumentName="flute">
        <div
          className={`w-full relative ${getFluteContainerClassName(selectedFluteType)}`}
          onMouseLeave={isHolding ? handleMouseUp : undefined}
        >
          <FluteDecoration fluteType={selectedFluteType} />
          <NoteParticles
            activeNote={activeNote}
            particlesVisible={particlesVisible}
            fluteType={selectedFluteType}
          />

          <div className="w-full grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 relative z-10">
            <AnimatePresence>
              {fluteNotes.map((note, index) => (
                <FluteKey
                  key={`${note.note}-${index}`}
                  note={note}
                  isActive={activeNote === note.note}
                  onMouseDown={() => handleMouseDown(note)}
                  onMouseUp={handleMouseUp}
                  onTouchStart={(e) => handleTouchStart(note, e)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={(e) => handleTouchMove(note, e)}
                  index={index}
                  fluteType={selectedFluteType}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
</FullscreenWrapper>

      <FluteNoteInfo
        isHolding={isHolding}
        activeNote={activeNote}
        touchIntensity={touchIntensity}
      />


    </div>
  ), [
    selectedFluteType,
    isHolding,
    activeNote,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    touchIntensity,
    particlesVisible,
    fluteNotes,
    isPlaying,
    showRecordingControls
  ]);

  return (

    <div className={`flex flex-col items-center w-full p-4 ${className}`}>
      <Navbar />
      <Toaster />

      {renderFluteTypeSelector()}
      {renderFlutePlayer()}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        <div className="w-full h-full mt-10 mb-6">
          <h2 className="text-2xl font-display font-bold text-center mb-6">Flute recording</h2>
          {showRecordingControls && (
            <RecordingControls isPlaying={isPlaying} />
          )}
        </div>
        <div >
          {showControls && (
            <div className="w-full mt-10 mb-6">
              <h2 className="text-2xl font-display font-bold text-center mb-6">Flute Settings</h2>
              <FluteSettingsTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                settings={settings}
                intonationMode={intonationMode}
                handleBreathChange={handleBreathChange}
                handleTuningChange={handleTuningChange}
                handleReverbChange={handleReverbChange}
                handleVibratoIntensityChange={handleVibratoIntensityChange}
                handleVibratoSpeedChange={handleVibratoSpeedChange}
                handleIntonationModeChange={handleIntonationModeChange}
                handleOverblowingChange={handleOverblowingChange}
                handleMicInputChange={handleMicInputChange}
                handleTransposeChange={handleTransposeChange}
                handleDelayChange={handleDelayChange}
                handleAutoVibratoChange={handleAutoVibratoChange}
                handleDynamicRangeChange={handleDynamicRangeChange}
                resetToDefaults={resetToDefaults}
              />
            </div>
          )}
        </div>

      </div></div>

  );
};

export default memo(FluteMasterComponent);
