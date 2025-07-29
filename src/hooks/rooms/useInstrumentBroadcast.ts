
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { broadcastNote, updateRoomSettings } from '@/utils/firebase';
import { InstrumentNote } from '@/types/InstrumentNote';

export const useInstrumentBroadcast = (
  room: any,
  setLastActivityTime: (time: number) => void
) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { handleFirebaseError } = useErrorHandler();

  const broadcastInstrumentNote = useCallback(async (note: InstrumentNote): Promise<void> => {
    if (!roomId || !user) {
      console.warn('useInstrumentBroadcast: Cannot broadcast - missing prerequisites');
      return;
    }

    if (!note.note || !note.instrument) {
      console.warn('useInstrumentBroadcast: Cannot broadcast - invalid note data');
      return;
    }

    try {
      console.log('useInstrumentBroadcast: Broadcasting note:', note.note, 'with frequency:', note.frequency);
      
      const enhancedNote: InstrumentNote = {
        ...note,
        timestamp: new Date().toISOString(),
        serverTimestamp: Date.now(),
        sessionId: note.sessionId || `${user.uid}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        clientId: user.uid,
        roomId: roomId,
        velocity: Math.min(Math.max(note.velocity || 0.7, 0.1), 1.0),
        duration: Math.min(Math.max(note.duration || 500, 100), 3000)
      };

      await broadcastNote(roomId, enhancedNote);
      setLastActivityTime(Date.now());

      if (room?.id) {
        try {
          await updateRoomSettings(roomId, {
            lastActivity: new Date().toISOString(),
            lastInstrumentPlay: new Date().toISOString(),
            lastNoteTimestamp: Date.now()
          });
        } catch (updateError) {
          console.warn('useInstrumentBroadcast: Failed to update room settings:', updateError);
        }
      }

      console.log('useInstrumentBroadcast: Note broadcast successful');
    } catch (error) {
      console.error("useInstrumentBroadcast: Broadcast error:", error);
      handleFirebaseError(error, 'broadcast instrument note', user.uid, roomId);
      
      addNotification({
        title: "Connection Error",
        message: "Failed to sync with other participants",
        type: "error"
      });
    }
  }, [roomId, user, room, setLastActivityTime, handleFirebaseError, addNotification]);

  return { broadcastInstrumentNote };
};
