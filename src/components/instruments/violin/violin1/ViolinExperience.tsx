
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Music } from 'lucide-react';
import ViolinInterface from './ViolinInterface';
import RecordingPanel from './RecordingPanel';
import TutorialModal from './TutorialModal';
import ViolinSelector from './ViolinSelector';
import { useViolinAudio } from './useViolinAudio';
import { toast } from 'sonner';
import { ViolinSettings } from './types';
import { useViolinEventHandlers } from './handlers/violinEventHandlers';
import { Button } from '@/components/ui/button';
import LandscapeInstrumentModal from '@/components/landscapeMode/LandscapeInstrumentModal';
import { lockToLandscape } from "@/components/landscapeMode/lockToLandscape";

export type ViolinType = 'classical' | 'electric' | 'baroque' | 'fiddle' | 'synth' | 'five-string' | 'semi-acoustic' | 'hardanger';

interface ViolinExperienceProps {
  initialViolinType?: ViolinType;
}

// Memoized component to prevent unnecessary renders
const ViolinExperience: React.FC<ViolinExperienceProps> = memo(({ initialViolinType = 'classical' }) => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedViolinType, setSelectedViolinType] = useState<ViolinType>(initialViolinType);
  const [showTutorial, setShowTutorial] = useState(false);
  const [settings, setSettings] = useState<ViolinSettings>({
    bowPressure: 50,
    bowSpeed: 50,
    vibrato: 30,
    reverb: 20,
    stringTension: 60
  });

  const {
    playNote,
    stopNote,
    playNoteSequence,
    clearPlayedNotes,
    isReady,
    playedNotes,
    audioContext,
    masterGainNode,
    updateControlSettings
  } = useViolinAudio(selectedViolinType);

  const {
    isPlaying,
    setIsPlaying,
    activeString,
    handleStringPlay,
    handleSettingChange,
    forceStopPlayback,
    handleViolinTypeChange,
  } = useViolinEventHandlers(
    playNote,
    stopNote,
    playNoteSequence
  );

  const violinIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(`Violin type changed to: ${selectedViolinType}`);
    toast.success(`Violin type set to: ${selectedViolinType}`);

    document.dispatchEvent(new CustomEvent('violin-type-changed', {
      detail: { violinType: selectedViolinType }
    }));
  }, [selectedViolinType]);

  useEffect(() => {
    updateControlSettings(settings);
  }, [settings, updateControlSettings]);

  // Modified handleStringPlay to include animation
  const handleStringPlayWithAnimation = useCallback((stringNumber: number, noteName: string) => {
    handleStringPlay(stringNumber, noteName);

    if (violinIconRef.current) {
      violinIconRef.current.classList.add('animate-bounce');
      setTimeout(() => {
        if (violinIconRef.current) {
          violinIconRef.current.classList.remove('animate-bounce');
        }
      }, 300);
    }
  }, [handleStringPlay]);

  // Handle settings changes
  const handleSettingsChange = useCallback((setting: keyof ViolinSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));

    handleSettingChange(setting, value);
  }, [handleSettingChange]);

  const handleViolinTypeChangeWithState = useCallback((type: ViolinType) => {
    setSelectedViolinType(type);
    handleViolinTypeChange(type);
    setIsPlaying(false);
  }, [handleViolinTypeChange, setIsPlaying]);

  const handleTutorialToggle = useCallback(() => {
    setShowTutorial(!showTutorial);
    if (!showTutorial) {
      toast.success("Tutorial opened");
    }
  }, [showTutorial]);

  useEffect(() => {
    if (isPlaying) {
      const playDuration = playedNotes ? playedNotes.length * 200 + 300 : 1500;
      const timer = setTimeout(() => {
        setIsPlaying(false);
      }, playDuration);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, playedNotes, setIsPlaying]);

  useEffect(() => {
    return () => {
      stopNote();
    };
  }, [stopNote]);

  
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
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col items-center">
      <div className="w-full text-center mb-6 animate-fade-in">


        <div className="mt-4 max-w-xs mx-auto">
          <ViolinSelector
            selectedType={selectedViolinType}
            onTypeChange={handleViolinTypeChangeWithState}
          />
        </div>
      </div>

<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 p-2 rounded-md mb-2">
          <p>
            Use keys 1-9, Q-P, and A-L for different notes. Press Shift+Key for sharp notes (e.g., Shift+1 for G#).
            <span className="hidden md:inline"> Lower keys (1-9) represent lower octaves, middle row (Q-P) for middle octave,
              and upper row (A-L) for higher octave.</span>
            <Button
              variant="link" onClick={handleTutorialToggle}
            >
              <span className="text-xs font-medium">Complete Tutorial</span>
            </Button>
          </p>
        </div>
        <div className="landscape-warning text-xs text-muted-foreground bg-purple-100 p-2 border border-purple-400 dark:bg-white/5 p-2 rounded-md mb-6">
          <p>For the best experience, expand to full screen.
            <strong onClick={handleOpen} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]">
              Click here to expand
            </strong>
          </p>
          <LandscapeInstrumentModal isOpen={open} onClose={() => setOpen(false)}>
<ViolinInterface
              violinType={selectedViolinType}
              activeString={activeString}
              onStringPlay={handleStringPlayWithAnimation}
              bowPressure={settings.bowPressure}
              bowSpeed={settings.bowSpeed}
              playedNotes={playedNotes}
              onPlaySequence={playNoteSequence}
              onClearNotes={clearPlayedNotes}
            />
            </LandscapeInstrumentModal>
        </div> 


      </div>

      <div className="w-full grid grid-cols-1 mb-10">
        <div className="h-full flex flex-col">
            <ViolinInterface
              violinType={selectedViolinType}
              activeString={activeString}
              onStringPlay={handleStringPlayWithAnimation}
              bowPressure={settings.bowPressure}
              bowSpeed={settings.bowSpeed}
              playedNotes={playedNotes}
              onPlaySequence={playNoteSequence}
              onClearNotes={clearPlayedNotes}
            />
              <RecordingPanel
                isRecording={false}
                onRecordToggle={() => { }}
                // onTutorialToggle={handleTutorialToggle}
                onPlayToggle={() => { }}
                isPlaying={isPlaying}
                isPaused={false}
                settings={settings}
                onSettingChange={handleSettingsChange}
                selectedViolinType={selectedViolinType}
                onTypeChange={handleViolinTypeChangeWithState}
                recordingComplete={false}
                recordingDuration={0}
                onDownloadRecording={() => true}
                onPlayRecording={() => true}
                playedNotes={playedNotes}
                stopNote={forceStopPlayback}
              />
        </div>
      </div>

      {showTutorial && <TutorialModal onClose={handleTutorialToggle} />}
    </div>
  );
});

// Add display name for better debugging
ViolinExperience.displayName = 'ViolinExperience';

export default ViolinExperience;
