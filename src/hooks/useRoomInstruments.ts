
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

  useEffect(() => {
    if (!roomId || !user) return;

    const unsubscribeNotes = listenToInstrumentNotes(
      roomId,
      (noteData: InstrumentNote) => {
        if (noteData && noteData.userId !== user.uid) {
          console.log('Received remote note:', noteData);
          setRemotePlaying(noteData);

          try {
            // Enhanced note parsing with better error handling
            const noteParts = noteData.note.split(':');
            if (noteParts.length >= 2) {
              const [note, octave] = noteParts;
              const velocity = noteData.velocity || 0.7;
              const duration = noteData.duration || 500;
              
              // Create unique note identifier
              const noteId = `${noteData.userId}-${note}-${octave}-${Date.now()}`;
              
              // Play the note with proper timing and volume - fix function signature
              const audioPromise = playInstrumentNote(
                noteData.instrument,
                note,
                parseInt(octave),
                duration,
                velocity
              );

              // Track active notes to prevent overlapping
              setActiveNotes(prev => {
                const newMap = new Map(prev);
                newMap.set(noteId, {
                  noteData,
                  startTime: Date.now()
                });
                return newMap;
              });

              // Clean up note after duration
              setTimeout(() => {
                setActiveNotes(prev => {
                  const newMap = new Map(prev);
                  newMap.delete(noteId);
                  return newMap;
                });
              }, duration + 100); // Add small buffer

              // Update activity time when receiving notes
              updateInstrumentPlayTime();
            } else {
              console.warn('Invalid note format:', noteData.note);
            }
          } catch (error) {
            console.error("Error playing remote note:", error);
          }

          // Clear remote playing indicator after short delay
          setTimeout(() => {
            setRemotePlaying(null);
          }, 200);
        }
      },
      (error) => {
        console.error("Instrument notes error:", error);
      }
    );

    return () => {
      unsubscribeNotes();
    };
  }, [roomId, user, updateInstrumentPlayTime]);

  const broadcastInstrumentNote = async (note: InstrumentNote): Promise<void> => {
    if (!roomId || !user) return;

    try {
      // Enhanced note data with better timing and metadata
      const enhancedNote = {
        ...note,
        timestamp: new Date().toISOString(),
        serverTimestamp: Date.now(),
        velocity: note.velocity || 0.7,
        duration: note.duration || 500
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

  // Clean up old active notes periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setActiveNotes(prev => {
        const newMap = new Map();
        prev.forEach((value, key) => {
          if (now - value.startTime < 5000) { // Keep notes for max 5 seconds
            newMap.set(key, value);
          }
        });
        return newMap;
      });
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    remotePlaying,
    broadcastInstrumentNote,
    activeNotes: Array.from(activeNotes.values())
  };
};