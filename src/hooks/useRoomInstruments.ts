import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useErrorHandler } from '@/hooks/useErrorHandler';
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
  sessionId?: string;
}

export const useRoomInstruments = (
  room: any, 
  setLastActivityTime: (time: number) => void, 
  updateInstrumentPlayTime: () => void
) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { handleFirebaseError, handleAsyncError } = useErrorHandler();
  const [remotePlaying, setRemotePlaying] = useState<InstrumentNote | null>(null);
  const [activeNotes, setActiveNotes] = useState<Map<string, any>>(new Map());
  const [echoPreventionSet, setEchoPreventionSet] = useState<Set<string>>(new Set());

  // Enhanced audio synchronization with advanced echo prevention
  const playRemoteNote = useCallback(async (noteData: InstrumentNote) => {
    try {
      console.log('useRoomInstruments: Received remote note:', noteData);
      
      const noteParts = noteData.note.split(':');
      if (noteParts.length >= 2) {
        const [note, octave] = noteParts;
        const velocity = noteData.velocity || 0.7;
        const duration = noteData.duration || 500;
        
        // Enhanced echo prevention with session ID and timestamp
        const noteIdentifier = `${noteData.userId}-${noteData.note}-${noteData.sessionId || 'default'}`;
        const timeBasedIdentifier = `${noteData.userId}-${noteData.note}-${Math.floor((Date.now()) / 100)}`; // 100ms window
        
        // Check for recent similar notes to prevent echo
        if (echoPreventionSet.has(noteIdentifier) || echoPreventionSet.has(timeBasedIdentifier)) {
          console.log('useRoomInstruments: Skipping duplicate note to prevent echo:', noteData.note);
          return;
        }
        
        // Add to echo prevention set with TTL
        echoPreventionSet.add(noteIdentifier);
        echoPreventionSet.add(timeBasedIdentifier);
        
        // Clean up echo prevention set after delay
        setTimeout(() => {
          echoPreventionSet.delete(noteIdentifier);
          echoPreventionSet.delete(timeBasedIdentifier);
        }, 200);

        // Additional check for overlapping notes
        const isAlreadyPlaying = Array.from(activeNotes.values()).some(
          activeNote => activeNote.noteData.note === noteData.note && 
                       activeNote.noteData.userId === noteData.userId &&
                       (Date.now() - activeNote.startTime) < 150 // 150ms overlap protection
        );
        
        if (isAlreadyPlaying) {
          console.log('useRoomInstruments: Skipping overlapping note:', noteData.note);
          return;
        }

        // Enhanced audio processing with noise reduction
        const processedVelocity = Math.min(velocity * 0.75, 0.8); // Reduce volume for remote notes
        
        await playInstrumentNote(
          noteData.instrument,
          note,
          parseInt(octave),
          duration,
          processedVelocity
        );

        // Track active notes with improved metadata
        const noteId = `${noteData.userId}-${note}-${octave}-${Date.now()}`;
        setActiveNotes(prev => {
          const newMap = new Map(prev);
          newMap.set(noteId, {
            noteData,
            startTime: Date.now(),
            duration,
            velocity: processedVelocity
          });
          return newMap;
        });

        console.log('useRoomInstruments: Successfully played remote note:', noteData.note);

        // Clean up note after duration with buffer
        setTimeout(() => {
          setActiveNotes(prev => {
            const newMap = new Map(prev);
            newMap.delete(noteId);
            return newMap;
          });
        }, duration + 100);

      } else {
        console.warn('useRoomInstruments: Invalid note format:', noteData.note);
      }
    } catch (error) {
      console.error("useRoomInstruments: Error playing remote note:", error);
      handleAsyncError(error as Error, 'play remote note', user?.uid, roomId);
    }
  }, [activeNotes, echoPreventionSet, handleAsyncError, user, roomId]);

  useEffect(() => {
    if (!roomId || !user) return;

    console.log(`useRoomInstruments: Setting up instrument notes listener for room ${roomId}`);

    const unsubscribeNotes = listenToInstrumentNotes(
      roomId,
      (noteData: InstrumentNote) => {
        if (noteData && noteData.userId !== user.uid) {
          console.log('useRoomInstruments: Received remote note from user:', noteData.userId);
          setRemotePlaying(noteData);

          // Enhanced timing validation with server timestamp compensation
          const serverTime = noteData.timestamp ? new Date(noteData.timestamp).getTime() : Date.now();
          const localTime = Date.now();
          const timeDiff = Math.abs(localTime - serverTime);
          
          // Play note if it's recent (within 3 seconds) and not stale
          if (timeDiff < 3000) {
            console.log(`useRoomInstruments: Playing note with time diff: ${timeDiff}ms`);
            playRemoteNote(noteData);
            updateInstrumentPlayTime();
          } else {
            console.log(`useRoomInstruments: Skipping stale note, time diff: ${timeDiff}ms`);
          }

          // Clear remote playing indicator
          setTimeout(() => {
            setRemotePlaying(null);
          }, 200);
        }
      },
      (error) => {
        console.error("useRoomInstruments: Instrument notes listener error:", error);
        handleFirebaseError(error, 'listen to instrument notes', user.uid, roomId);
      }
    );

    return () => {
      console.log('useRoomInstruments: Cleaning up instrument notes listener');
      unsubscribeNotes();
    };
  }, [roomId, user, updateInstrumentPlayTime, playRemoteNote, handleFirebaseError]);

  const broadcastInstrumentNote = async (note: InstrumentNote): Promise<void> => {
    if (!roomId || !user) {
      console.warn('useRoomInstruments: Cannot broadcast note - missing roomId or user');
      return;
    }

    try {
      console.log('useRoomInstruments: Broadcasting note:', note.note);
      
      // Enhanced note data with precise timing and session tracking
      const enhancedNote = {
        ...note,
        timestamp: new Date().toISOString(),
        serverTimestamp: Date.now(),
        velocity: note.velocity || 0.7,
        duration: note.duration || 500,
        sessionId: `${user.uid}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique session identifier
        clientId: user.uid,
        roomId: roomId
      };

      await broadcastNote(roomId, enhancedNote);

      setLastActivityTime(Date.now());
      updateInstrumentPlayTime();

      // Update room activity metadata
      if (room) {
        try {
          await updateRoomSettings(roomId, {
            lastActivity: new Date().toISOString(),
            lastInstrumentPlay: new Date().toISOString(),
            lastNoteTimestamp: Date.now()
          });
        } catch (error) {
          console.warn('useRoomInstruments: Failed to update room settings:', error);
          // Non-critical error, don't show notification
        }
      }

      console.log('useRoomInstruments: Successfully broadcasted note');
    } catch (error) {
      console.error("useRoomInstruments: Error broadcasting note:", error);
      handleFirebaseError(error, 'broadcast instrument note', user.uid, roomId);
      
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
        let cleanedCount = 0;
        
        prev.forEach((value, key) => {
          // Keep notes for max 2 seconds instead of 3
          if (now - value.startTime < 2000) {
            newMap.set(key, value);
          } else {
            cleanedCount++;
          }
        });
        
        if (cleanedCount > 0) {
          console.log(`useRoomInstruments: Cleaned up ${cleanedCount} old active notes`);
        }
        
        return newMap;
      });

      // Clean up echo prevention set periodically
      if (echoPreventionSet.size > 50) { // Prevent memory leak
        console.log('useRoomInstruments: Clearing echo prevention set');
        setEchoPreventionSet(new Set());
      }
    }, 1000); // More frequent cleanup every second

    return () => clearInterval(cleanupInterval);
  }, [echoPreventionSet]);

  return {
    remotePlaying,
    broadcastInstrumentNote,
    activeNotes: Array.from(activeNotes.values())
  };
};