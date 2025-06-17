import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  listenToInstrumentNotes, 
  broadcastNote, 
  updateRoomSettings 
} from '@/utils/firebase';
import { playInstrumentNote } from '@/utils/instruments/instrumentUtils';

interface InstrumentNote {
  note: string;
  instrument: string;
  userId: string;
  userName: string;
  timestamp?: string;
  velocity?: number;
  duration?: number;
}

export const useRoomInstruments = (room: any, setLastActivityTime: (time: number) => void, updateInstrumentPlayTime: () => void) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [remotePlaying, setRemotePlaying] = useState<InstrumentNote | null>(null);
  const [activeNotes, setActiveNotes] = useState<Map<string, any>>(new Map());

  // Enhanced audio synchronization with timing compensation
  const playRemoteNote = useCallback(async (noteData: InstrumentNote) => {
    try {
      const noteParts = noteData.note.split(':');
      if (noteParts.length >= 2) {
        const [note, octave] = noteParts;
        const velocity = noteData.velocity || 0.7;
        const duration = noteData.duration || 500;
        
        // Create unique note identifier with timestamp to prevent overlaps
        const noteId = `${noteData.userId}-${note}-${octave}-${Date.now()}`;
        
        // Check if this note is already playing to prevent echo
        const isAlreadyPlaying = Array.from(activeNotes.values()).some(
          activeNote => activeNote.noteData.note === noteData.note && 
                       activeNote.noteData.userId === noteData.userId &&
                       (Date.now() - activeNote.startTime) < 100 // 100ms overlap protection
        );
        
        if (isAlreadyPlaying) {
          console.log('Skipping duplicate note to prevent echo:', noteData.note);
          return;
        }

        // Play with enhanced audio settings to reduce noise
        await playInstrumentNote(
          noteData.instrument,
          note,
          parseInt(octave),
          duration,
          velocity * 0.8 // Slightly reduce volume for remote notes to prevent overwhelming
        );

        // Track active notes with improved cleanup
        setActiveNotes(prev => {
          const newMap = new Map(prev);
          newMap.set(noteId, {
            noteData,
            startTime: Date.now()
          });
          return newMap;
        });

        // Clean up note after duration with buffer
        setTimeout(() => {
          setActiveNotes(prev => {
            const newMap = new Map(prev);
            newMap.delete(noteId);
            return newMap;
          });
        }, duration + 50);

      } else {
        console.warn('Invalid note format:', noteData.note);
      }
    } catch (error) {
      console.error("Error playing remote note:", error);
    }
  }, [activeNotes]);

  useEffect(() => {
    if (!roomId || !user) return;

    const unsubscribeNotes = listenToInstrumentNotes(
      roomId,
      (noteData: InstrumentNote) => {
        if (noteData && noteData.userId !== user.uid) {
          console.log('Received remote note:', noteData);
          setRemotePlaying(noteData);

          // Enhanced timing with server timestamp compensation
          const serverTime = noteData.timestamp ? new Date(noteData.timestamp).getTime() : Date.now();
          const localTime = Date.now();
          const timeDiff = Math.abs(localTime - serverTime);
          
          // Only play if the note is recent (within 2 seconds) to avoid stale notes
          if (timeDiff < 2000) {
            playRemoteNote(noteData);
            updateInstrumentPlayTime();
          } else {
            console.log('Skipping stale note, time diff:', timeDiff);
          }

          // Clear remote playing indicator
          setTimeout(() => {
            setRemotePlaying(null);
          }, 150);
        }
      },
      (error) => {
        console.error("Instrument notes error:", error);
      }
    );

    return () => {
      unsubscribeNotes();
    };
  }, [roomId, user, updateInstrumentPlayTime, playRemoteNote]);

  const broadcastInstrumentNote = async (note: InstrumentNote): Promise<void> => {
    if (!roomId || !user) return;

    try {
      // Enhanced note data with precise timing
      const enhancedNote = {
        ...note,
        timestamp: new Date().toISOString(),
        serverTimestamp: Date.now(),
        velocity: note.velocity || 0.7,
        duration: note.duration || 500,
        sessionId: `${user.uid}-${Date.now()}` // Unique session identifier
      };

      await broadcastNote(roomId, enhancedNote);

      setLastActivityTime(Date.now());
      updateInstrumentPlayTime();

      if (room) {
        updateRoomSettings(roomId, {
          lastActivity: new Date().toISOString(),
          lastInstrumentPlay: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error broadcasting note:", error);
      addNotification({
        title: "Connection Error",
        message: "Failed to sync with other participants",
        type: "error"
      });
    }
  };

  // Enhanced cleanup for old active notes with better memory management
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setActiveNotes(prev => {
        const newMap = new Map();
        prev.forEach((value, key) => {
          // Keep notes for max 3 seconds instead of 5
          if (now - value.startTime < 3000) {
            newMap.set(key, value);
          }
        });
        return newMap;
      });
    }, 500); // More frequent cleanup

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    remotePlaying,
    broadcastInstrumentNote,
    activeNotes: Array.from(activeNotes.values())
  };
};