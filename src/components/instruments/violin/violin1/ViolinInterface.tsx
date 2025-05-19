
import React, { useEffect, useState, useRef } from 'react';
import { ViolinInterfaceProps } from './types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ViolinKeysDisplay from './interface/ViolinKeysDisplay';
import ViolinNoteDisplay from './interface/ViolinNoteDisplay';
import ViolinControls from './interface/ViolinControls';
import { toast } from 'sonner';

const ViolinInterface: React.FC<ViolinInterfaceProps> = ({
  violinType,
  activeString,
  onStringPlay,
  bowPressure,
  bowSpeed,
  playedNotes,
  onPlaySequence,
  onClearNotes
}) => {
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [displayNotes, setDisplayNotes] = useState<string>('');
  const [lastPlayedNote, setLastPlayedNote] = useState<string | null>(null);
  const [lastActiveString, setLastActiveString] = useState<number | null>(null);
  
  useEffect(() => {
    if (playedNotes && playedNotes.length > 0) {
      const noteText = playedNotes.join(' ');
      setDisplayNotes(noteText);
    } else {
      setDisplayNotes('');
    }
  }, [playedNotes]);

  useEffect(() => {
    if (activeString !== null) {
      setLastActiveString(activeString);
    }
  }, [activeString]);

  useEffect(() => {
    if (isPlayingSequence && playedNotes && playedNotes.length > 0) {
      const playbackDuration = playedNotes.length * 300 + 500;
      const timer = setTimeout(() => {
        setIsPlayingSequence(false);
      }, playbackDuration);
      return () => clearTimeout(timer);
    }
  }, [isPlayingSequence, playedNotes]);

  const handleNotePlay = (stringNumber: number, noteName: string) => {
    setLastPlayedNote(noteName);
    onStringPlay(stringNumber, noteName);
  };

  const handlePlaySequence = () => {
    if (!playedNotes || playedNotes.length === 0) {
      toast.error("No notes to play");
      return;
    }
    
    setIsPlayingSequence(true);
    onPlaySequence();
    toast.success("Playing note sequence");
  };

  const handleToggleEdit = () => {
    setIsEditingNotes(!isEditingNotes);
    if (!isEditingNotes) {
      toast.info("You can now edit the notes");
    } else {
      toast.success("Notes updated");
    }
  };

  const handleClearNotes = () => {
    onClearNotes();
    setDisplayNotes('');
    setIsPlayingSequence(false);
    toast.success("Notes cleared");
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayNotes(e.target.value);
  };

  const getViolinAppearance = () => {
    switch(violinType) {
      case 'classical':
        return "from-amber-700 to-amber-900 shadow-amber-200";
      case 'electric':
        return "from-blue-600 to-purple-900 shadow-blue-300";
      case 'baroque':
        return "from-yellow-700 to-red-800 shadow-yellow-200";
      case 'fiddle':
        return "from-orange-500 to-red-700 shadow-orange-200";
      case 'synth':
        return "from-cyan-500 to-blue-700 shadow-cyan-200";
      case 'five-string':
        return "from-green-600 to-emerald-900 shadow-green-200";
      case 'semi-acoustic':
        return "from-violet-500 to-purple-900 shadow-violet-200";
      case 'hardanger':
        return "from-indigo-600 to-blue-900 shadow-indigo-200";
      default:
        return "from-amber-700 to-amber-900 shadow-amber-200";
    }
  };

  const violinGradient = getViolinAppearance();

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className={`w-full bg-gradient-to-r ${violinGradient} p-2 rounded-t-xl flex justify-between items-center mb-1`}>
        <div className="text-yellow-100 font-bold uppercase tracking-wider">{violinType}</div>
        
        {/* <ViolinNoteDisplay 
          isEditingNotes={isEditingNotes}
          displayNotes={displayNotes}
          onNotesChange={handleNotesChange}
        /> */}
        
        {/* <ViolinControls 
          isPlayingSequence={isPlayingSequence}
          setIsPlayingSequence={setIsPlayingSequence}
          handleToggleEdit={handleToggleEdit}
          handleClearNotes={handleClearNotes}
          handlePlaySequence={handlePlaySequence}
          hasNotes={playedNotes && playedNotes.length > 0}
        /> */}
      </div>
      
      <ViolinKeysDisplay
        lastPlayedNote={lastPlayedNote}
        activeString={activeString}
        lastActiveString={lastActiveString}
        onNotePlay={handleNotePlay}
      />
      
      {/* Removed violin type display from the bottom */}
    </div>
  );
};

export default ViolinInterface;
