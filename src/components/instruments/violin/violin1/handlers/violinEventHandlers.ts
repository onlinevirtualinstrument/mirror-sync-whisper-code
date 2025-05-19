
import { useState, useCallback } from 'react';
import { ViolinType } from '../ViolinExperience';
import { ViolinSettings } from '../types';
import { toast } from 'sonner';

export const useViolinEventHandlers = (
  playNote: (stringNumber: number, noteName: string, options?: any) => void,
  stopNote: () => void,
  playNoteSequence: () => boolean
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeString, setActiveString] = useState<number | null>(null);

  const handleStringPlay = useCallback((stringNumber: number, noteName: string) => {
    setActiveString(stringNumber);
    playNote(stringNumber, noteName);
    
    setTimeout(() => {
      setActiveString(null);
    }, 300);
  }, [playNote]);

  const handleSettingChange = useCallback((setting: keyof ViolinSettings, value: number) => {
    toast.success(`${setting} set to ${value}`);
    return value;
  }, []);

  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      stopNote();
      setIsPlaying(false);
      toast.success("Playback stopped");
    } else {
      const success = playNoteSequence();
      setIsPlaying(true);
      toast.success("Playback started");
      return success;
    }
    return true;
  }, [isPlaying, stopNote, playNoteSequence]);

  const forceStopPlayback = useCallback(() => {
    stopNote();
    setIsPlaying(false);
    return true;
  }, [stopNote]);

  const handleViolinTypeChange = useCallback((type: ViolinType) => {
    toast.success(`Violin type changed to ${type}`);
    stopNote();
  }, [stopNote]);

  return {
    isPlaying,
    setIsPlaying,
    activeString,
    handleStringPlay,
    handleSettingChange,
    handlePlayToggle,
    forceStopPlayback,
    handleViolinTypeChange
  };
};
