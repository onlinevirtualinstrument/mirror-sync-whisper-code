
import React, { useEffect, useState } from 'react';
import { useRoom } from './RoomContext';
import audioPlayer from '@/utils/music/audioPlayer';

interface SimpleInstrumentProps {
  instrument: string;
  isCollaborative?: boolean;
  roomId?: string;
}

const SimpleInstrument: React.FC<SimpleInstrumentProps> = ({ instrument, isCollaborative = false, roomId }) => {
  const { broadcastNotePlay, listenForRemoteNotes, userInfo } = useRoom();
  const [remotePlayers, setRemotePlayers] = useState<{[userId: string]: string}>({});
  const [lastNotePlayed, setLastNotePlayed] = useState<{ note: string; timestamp: number } | null>(null);

  // Set up listeners for remote note playing
  useEffect(() => {
    if (!isCollaborative || !roomId || !userInfo) return;
    
    // Listen for notes played by other users
    const unsubscribe = listenForRemoteNotes((noteData) => {
      if (noteData.userId !== userInfo.id) {
        // Play the note locally for collaborative music
        playRemoteNote(noteData.note, noteData.instrument, noteData.userId);
        
        // Update UI to show who's playing
        setRemotePlayers(prev => ({
          ...prev,
          [noteData.userId]: noteData.userName
        }));
        
        // Clear remote player indicator after a delay
        setTimeout(() => {
          setRemotePlayers(prev => {
            const updated = {...prev};
            delete updated[noteData.userId];
            return updated;
          });
        }, 2000);
      }
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isCollaborative, roomId, userInfo, listenForRemoteNotes]);

  // Play a note and broadcast it to other users
  const playNote = (note: string, octave: number = 4) => {
    // Play the note locally
    audioPlayer.playTone(getNoteFrequency(note, octave), 500);
    
    // Broadcast the note to other users
    if (isCollaborative && userInfo) {
      broadcastNotePlay({
        note,
        octave,
        instrument,
        timestamp: Date.now(),
        userId: userInfo.id,
        userName: userInfo.name
      });
    }
    
    // Update UI state
    setLastNotePlayed({ note, timestamp: Date.now() });
  };

  // Play a note received from another user
  const playRemoteNote = (note: string, remoteInstrument: string, userId: string) => {
    const octave = 4; // Default octave
    audioPlayer.playTone(getNoteFrequency(note, octave), 500);
  };
  
  // Calculate note frequency (same as in instrumentUtils.ts)
  const getNoteFrequency = (note: string, octave: number): number => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseFreq = 440; // A4 frequency
    const A4OctavePosition = 4;
    
    const noteIndex = notes.indexOf(note);
    if (noteIndex === -1) return 440; // Default to A4 if note not found
    
    const A_index = notes.indexOf('A');
    let semitonesFromA4 = (octave - A4OctavePosition) * 12 + (noteIndex - A_index);
    
    return baseFreq * Math.pow(2, semitonesFromA4 / 12);
  };

  // Create sample notes for demo purposes
  const sampleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-900">
      <div className="text-center p-4 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">
          {instrument.charAt(0).toUpperCase() + instrument.slice(1)} Instrument
        </h2>
        
        {isCollaborative && (
          <div className="mb-4 text-sm">
            <div className="text-primary-600 font-medium">
              {Object.keys(remotePlayers).length > 0 ? (
                <div className="animate-pulse">
                  {Object.values(remotePlayers).join(', ')} {Object.keys(remotePlayers).length === 1 ? 'is' : 'are'} playing...
                </div>
              ) : (
                <div className="text-muted-foreground">Play together with others in the room!</div>
              )}
            </div>
          </div>
        )}
        
        <div className="w-full max-w-md mx-auto border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
          <div className="text-xl text-primary mb-4">
            {instrument === 'piano' && '🎹'}
            {instrument === 'guitar' && '🎸'}
            {instrument === 'drums' && '🥁'}
            {instrument === 'flute' && '🎵'}
            {instrument === 'saxophone' && '🎷'}
            {instrument === 'trumpet' && '🎺'}
            {instrument === 'violin' && '🎻'}
            {['xylophone', 'marimba', 'kalimba'].includes(instrument) && '🔔'}
            {['drummachine', 'chordprogression'].includes(instrument) && '🎛️'}
            {['veena'].includes(instrument) && '🪕'}
            {instrument === 'theremin' && '👋'}
          </div>
          
          <div className="mt-4 mb-6">
            Play notes to share with others in the room
          </div>
          
          {/* Interactive note buttons for demo */}
          <div className="flex flex-wrap justify-center gap-2 my-4">
            {sampleNotes.map(note => (
              <button
                key={note}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  lastNotePlayed?.note === note && Date.now() - lastNotePlayed.timestamp < 300 
                    ? 'bg-primary text-white' 
                    : 'bg-secondary hover:bg-primary/80 hover:text-white'
                }`}
                onClick={() => playNote(note, 4)}
              >
                {note}
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Interactive {instrument} interface demonstrates collaborative music-making.
          <br />
          In a full implementation, this would connect to the actual {instrument} component.
        </div>
      </div>
    </div>
  );
};

export default SimpleInstrument;
