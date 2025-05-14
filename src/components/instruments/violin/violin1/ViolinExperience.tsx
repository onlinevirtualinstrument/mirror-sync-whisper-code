
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

export type ViolinType = 'classical' | 'electric' | 'baroque' | 'fiddle' | 'synth' | 'five-string' | 'semi-acoustic' | 'hardanger';

interface ViolinExperienceProps {
  initialViolinType?: ViolinType;
}

// Memoized component to prevent unnecessary renders
const ViolinExperience: React.FC<ViolinExperienceProps> = memo(({ initialViolinType = 'classical' }) => {
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

      <div className="w-full mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold">Keyboard Controls:</span> Use keys 1-9, Q-P, and A-L for different notes. 
          Press Shift+Key for sharp notes (e.g., Shift+1 for G#). 
          <span className="hidden md:inline"> Lower keys (1-9) represent lower octaves, middle row (Q-P) for middle octave, 
          and upper row (A-L) for higher octave.</span> 
          <Button
                variant="link" onClick={handleTutorialToggle}
              >
              <span className="text-xs font-medium">Complete Tutorial</span>
              </Button>
        </p>
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

      
      </div>

      <div className="w-full grid grid-cols-1 gap-8 mb-10">
        <div className="h-full flex flex-col">
          <div className="glass-panel p-6 h-full flex flex-col justify-between animate-scale-up">
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
            
            <div className="mt-6">
              <RecordingPanel 
                isRecording={false} 
                onRecordToggle={() => {}} 
                // onTutorialToggle={handleTutorialToggle}
                onPlayToggle={() => {}}
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
        </div>
      </div>

      {showTutorial && <TutorialModal onClose={handleTutorialToggle} />}
    </div>
  );
});

// Add display name for better debugging
ViolinExperience.displayName = 'ViolinExperience';

export default ViolinExperience;
