import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ViolinKeysDisplayProps {
  lastPlayedNote: string | null;
  activeString: number | null;
  lastActiveString: number | null;
  onNotePlay: (stringNumber: number, noteName: string) => void;
}

const ViolinKeysDisplay: React.FC<ViolinKeysDisplayProps> = ({
  lastPlayedNote,
  activeString,
  lastActiveString,
  onNotePlay
}) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const activeNoteRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyNotePlayed = useRef<string | null>(null);
  
  const [showKeyLabels, setShowKeyLabels] = useState(true);
  const [showNoteLabels, setShowNoteLabels] = useState(true);
  const [highlightKeys, setHighlightKeys] = useState(true);
  const [highlightNotes, setHighlightNotes] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      const keyLabels = localStorage.getItem('violin-key-labels');
      const noteLabels = localStorage.getItem('violin-note-labels');
      const keyHighlights = localStorage.getItem('violin-highlight-keys');
      const noteHighlights = localStorage.getItem('violin-highlight-notes');
      
      setShowKeyLabels(keyLabels === null ? true : keyLabels === 'true');
      setShowNoteLabels(noteLabels === null ? true : noteLabels === 'true');
      setHighlightKeys(keyHighlights === null ? true : keyHighlights === 'true');
      setHighlightNotes(noteHighlights === null ? true : noteHighlights === 'true');
    };
    
    loadSettings();
    
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { option, value } = customEvent.detail;
      
      switch(option) {
        case 'keyLabels':
          setShowKeyLabels(value);
          break;
        case 'noteLabels':
          setShowNoteLabels(value);
          break;
        case 'highlightKeys':
          setHighlightKeys(value);
          break;
        case 'highlightNotes':
          setHighlightNotes(value);
          break;
      }
    };
    
    document.addEventListener('violin-settings-changed', handleSettingsChange);
    
    return () => {
      document.removeEventListener('violin-settings-changed', handleSettingsChange);
    };
  }, []);

  const violinNotes = [
    { note: 'G3', label: 'G3', keyCode: '1', freq: 196.00 },
    { note: 'A3', label: 'A3', keyCode: '2', freq: 220.00 },
    { note: 'B3', label: 'B3', keyCode: '3', freq: 246.94 },
    { note: 'C4', label: 'C4', keyCode: '4', freq: 261.63 },
    { note: 'D4', label: 'D4', keyCode: '5', freq: 293.66 },
    { note: 'E4', label: 'E4', keyCode: '6', freq: 329.63 },
    { note: 'F4', label: 'F4', keyCode: '7', freq: 349.23 },
    { note: 'G4', label: 'G4', keyCode: '8', freq: 392.00 },
    { note: 'A4', label: 'A4', keyCode: '9', freq: 440.00 },
    { note: 'B4', label: 'B4', keyCode: '0', freq: 493.88 },
    { note: 'C5', label: 'C5', keyCode: 'q', freq: 523.25 },
    { note: 'D5', label: 'D5', keyCode: 'w', freq: 587.33 },
    { note: 'E5', label: 'E5', keyCode: 'e', freq: 659.25 },
    { note: 'F5', label: 'F5', keyCode: 'r', freq: 698.46 },
    { note: 'G5', label: 'G5', keyCode: 't', freq: 783.99 },
    { note: 'A5', label: 'A5', keyCode: 'y', freq: 880.00 },
    { note: 'B5', label: 'B5', keyCode: 'u', freq: 987.77 },
    { note: 'C6', label: 'C6', keyCode: 'i', freq: 1046.50 },
    { note: 'D6', label: 'D6', keyCode: 'o', freq: 1174.66 },
    { note: 'E6', label: 'E6', keyCode: 'p', freq: 1318.51 },
    { note: 'F6', label: 'F6', keyCode: 'a', freq: 1396.91 },
    { note: 'G6', label: 'G6', keyCode: 's', freq: 1567.98 },
    { note: 'A6', label: 'A6', keyCode: 'd', freq: 1760.00 },
  ];
  
  const sharpNotes = [
    { note: 'G#3', label: 'G#3', keyCode: '!', freq: 207.65 },
    { note: 'A#3', label: 'A#3', keyCode: '@', freq: 233.08 },
    { note: 'C#4', label: 'C#4', keyCode: '$', freq: 277.18 },
    { note: 'D#4', label: 'D#4', keyCode: '%', freq: 311.13 },
    { note: 'F#4', label: 'F#4', keyCode: '&', freq: 369.99 },
    { note: 'G#4', label: 'G#4', keyCode: '*', freq: 415.30 },
    { note: 'A#4', label: 'A#4', keyCode: '(', freq: 466.16 },
    { note: 'C#5', label: 'C#5', keyCode: 'Q', freq: 554.37 },
    { note: 'D#5', label: 'D#5', keyCode: 'W', freq: 622.25 },
    { note: 'F#5', label: 'F#5', keyCode: 'R', freq: 739.99 },
    { note: 'G#5', label: 'G#5', keyCode: 'T', freq: 830.61 },
    { note: 'A#5', label: 'A#5', keyCode: 'Y', freq: 932.33 },
    { note: 'C#6', label: 'C#6', keyCode: 'I', freq: 1108.73 },
    { note: 'D#6', label: 'D#6', keyCode: 'O', freq: 1244.51 },
    { note: 'F#6', label: 'F#6', keyCode: 'A', freq: 1479.98 },
    { note: 'G#6', label: 'G#6', keyCode: 'S', freq: 1661.22 },
  ];
  
  const noteToStringNumber = (note: string): number => {
    if (note.includes('G3') || note.includes('A3') || note.includes('B3') || 
        note.includes('C4') || note.includes('D4')) {
      return 1;
    }
    else if (note.includes('D4') || note.includes('E4') || note.includes('F4') || 
             note.includes('G4') || note.includes('A4')) {
      return 2;
    }
    else if (note.includes('A4') || note.includes('B4') || note.includes('C5') || 
             note.includes('D5') || note.includes('E5')) {
      return 3;
    }
    else {
      return 4;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore held keys
      
      setPressedKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.add(e.key);
        return newKeys;
      });
      
      const regularNote = violinNotes.find(k => k.keyCode === e.key);
      const sharpNote = sharpNotes.find(k => k.keyCode === e.key);
      
      if (regularNote || sharpNote) {
        const noteInfo = regularNote || sharpNote;
        if (noteInfo && lastKeyNotePlayed.current !== noteInfo.note) {
          const stringNumber = noteToStringNumber(noteInfo.note);
          
          activeNoteRef.current = noteInfo.note;
          lastKeyNotePlayed.current = noteInfo.note;
          
          onNotePlay(stringNumber, noteInfo.note);
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key);
        return newKeys;
      });
      
      const regularNote = violinNotes.find(k => k.keyCode === e.key);
      const sharpNote = sharpNotes.find(k => k.keyCode === e.key);
      
      if ((regularNote && regularNote.note === lastKeyNotePlayed.current) || 
          (sharpNote && sharpNote.note === lastKeyNotePlayed.current)) {
        lastKeyNotePlayed.current = null;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onNotePlay, violinNotes, sharpNotes]);

  return (
    <div className="relative w-full bg-gradient-to-b border-y border-gray-800 flex h-60 overflow-x-auto">
      <div className="relative flex w-full">
        {violinNotes.map((key) => {
          const isActive = lastPlayedNote === key.note || 
                         (activeString === noteToStringNumber(key.note) && lastActiveString === activeString);
          return (
            <div
              key={key.note}
              className={cn(
                "relative flex-1 h-full bg-white border-r border-gray-300 flex flex-col justify-end items-center pb-2 transition-all duration-300",
                (isActive && highlightNotes && lastPlayedNote === key.note) ? "bg-blue-100 animate-pulse" : "",
                (isActive && highlightKeys && activeString === noteToStringNumber(key.note)) ? "bg-blue-100 animate-pulse" : ""
              )}
              onClick={() => onNotePlay(noteToStringNumber(key.note), key.note)}
            >
              {showNoteLabels && <span className="text-gray-800 text-xs mb-1">{key.label}</span>}
              {showKeyLabels && <span className="text-gray-400 text-[10px]">{key.keyCode}</span>}
            </div>
          );
        })}
        
        <div className="absolute top-0 left-0 w-full flex h-2/3 pointer-events-none">
          {violinNotes.map((whiteKey, idx) => {
            const blackKey = sharpNotes.find(bk => {
              const whiteNote = whiteKey.note.charAt(0);
              const blackNote = bk.note.charAt(0);
              return whiteNote === blackNote && bk.note.includes('#');
            });
            
            if (!blackKey || whiteKey.note.charAt(0) === 'E' || whiteKey.note.charAt(0) === 'B') {
              return <div key={`space-${idx}`} className="w-[4.35%]"></div>;
            }
            
            const isActive = lastPlayedNote === blackKey.note || 
                         (activeString === noteToStringNumber(blackKey.note) && lastActiveString === activeString);
            
            return (
              <div key={`blackkey-${idx}`} className="w-[4.35%] flex justify-center">
                <div 
                  className={cn(
                    "w-[70%] h-full bg-black rounded-b-sm pointer-events-auto cursor-pointer flex flex-col justify-end items-center pb-1 transition-all duration-300",
                    (isActive && highlightNotes && lastPlayedNote === blackKey.note) ? "bg-gray-600 animate-pulse" : "",
                    (isActive && highlightKeys && activeString === noteToStringNumber(blackKey.note)) ? "bg-gray-600 animate-pulse" : ""
                  )}
                  onClick={() => onNotePlay(noteToStringNumber(blackKey.note), blackKey.note)}
                >
                  {showNoteLabels && <span className="text-white text-[8px]">{blackKey.label}</span>}
                  {showKeyLabels && <span className="text-white text-[6px] opacity-70">{blackKey.keyCode}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViolinKeysDisplay;
