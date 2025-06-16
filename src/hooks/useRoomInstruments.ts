
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
}

export const useRoomInstruments = (room: any, setLastActivityTime: (time: number) => void) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [remotePlaying, setRemotePlaying] = useState<InstrumentNote | null>(null);

  useEffect(() => {
    if (!roomId || !user) return;

    const unsubscribeNotes = listenToInstrumentNotes(
      roomId,
      (noteData: InstrumentNote) => {
        if (noteData && noteData.userId !== user.uid) {
          setRemotePlaying(noteData);

          try {
            const [note, octave] = noteData.note.split(':');
            if (note && octave) {
              playInstrumentNote(
                noteData.instrument,
                note,
                parseInt(octave),
                500
              );
            }
          } catch (error) {
            console.error("Error playing remote note:", error);
          }
        }
      },
      (error) => {
        console.error("Instrument notes error:", error);
      }
    );

    return () => {
      unsubscribeNotes();
    };
  }, [roomId, user]);

  const broadcastInstrumentNote = async (note: InstrumentNote): Promise<void> => {
    if (!roomId || !user) return;

    try {
      await broadcastNote(roomId, {
        ...note,
        timestamp: new Date().toISOString()
      });

      setLastActivityTime(Date.now());

      if (room) {
        updateRoomSettings(roomId, {
          lastActivity: new Date().toISOString()
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

  return {
    remotePlaying,
    broadcastInstrumentNote
  };
};
