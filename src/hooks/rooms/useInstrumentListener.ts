
import { useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { listenToInstrumentNotes } from '@/utils/firebase';

interface InstrumentNote {
  note: string;
  instrument: string;
  userId: string;
  userName: string;
  timestamp?: string;
  velocity?: number;
  duration?: number;
  sessionId?: string;
  serverTimestamp?: number;
  clientId?: string;
  roomId?: string;
}

export const useInstrumentListener = (
  playRemoteNote: (noteData: InstrumentNote) => void,
  setRemotePlayingWithCleanup: (noteData: InstrumentNote | null) => void,
  updateInstrumentPlayTime: () => void,
  mountedRef: React.MutableRefObject<boolean>
) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { handleFirebaseError } = useErrorHandler();
  
  const listenerRef = useRef<(() => void) | null>(null);
  const setupInProgressRef = useRef<boolean>(false);
  const lastSetupTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (listenerRef.current) {
      console.log('useInstrumentListener: Cleaning up listener');
      listenerRef.current();
      listenerRef.current = null;
    }
    setupInProgressRef.current = false;
  }, []);

  const setupListener = useCallback(() => {
    if (!roomId || !user?.uid || !mountedRef.current) {
      console.log('useInstrumentListener: Missing prerequisites for listener setup');
      return;
    }

    if (setupInProgressRef.current) {
      console.log('useInstrumentListener: Setup already in progress');
      return;
    }

    const now = Date.now();
    if (now - lastSetupTimeRef.current < 2000) {
      console.log('useInstrumentListener: Debouncing listener setup');
      return;
    }

    if (listenerRef.current) {
      console.log('useInstrumentListener: Cleaning up previous listener');
      listenerRef.current();
      listenerRef.current = null;
    }

    console.log(`useInstrumentListener: Setting up listener for room ${roomId}, user ${user.uid}`);
    
    setupInProgressRef.current = true;
    lastSetupTimeRef.current = now;

    try {
      const unsubscribe = listenToInstrumentNotes(
        roomId,
        (noteData: InstrumentNote) => {
          if (!mountedRef.current || !noteData || noteData.userId === user.uid) {
            return;
          }

          console.log('useInstrumentListener: Received remote note from:', noteData.userId);
          
          const serverTime = noteData.serverTimestamp || (noteData.timestamp ? new Date(noteData.timestamp).getTime() : Date.now());
          const timeDiff = Math.abs(Date.now() - serverTime);
          
          if (timeDiff > 10000) {
            console.log(`useInstrumentListener: Ignoring stale note, age: ${timeDiff}ms`);
            return;
          }

          if (mountedRef.current) {
            setRemotePlayingWithCleanup(noteData);
            playRemoteNote(noteData);
            updateInstrumentPlayTime();
          }
        },
        (error) => {
          console.error("useInstrumentListener: Listener error:", error);
          if (mountedRef.current) {
            handleFirebaseError(error, 'listen to instrument notes', user.uid, roomId);
            setupInProgressRef.current = false;
            listenerRef.current = null;
          }
        }
      );

      if (mountedRef.current) {
        listenerRef.current = unsubscribe;
        console.log('useInstrumentListener: Listener setup complete');
      } else {
        unsubscribe();
      }
    } catch (error) {
      console.error('useInstrumentListener: Error setting up listener:', error);
      if (mountedRef.current) {
        handleFirebaseError(error, 'setup instrument listener', user.uid, roomId);
      }
    } finally {
      setupInProgressRef.current = false;
    }
  }, [roomId, user?.uid, playRemoteNote, setRemotePlayingWithCleanup, updateInstrumentPlayTime, handleFirebaseError, mountedRef]);

  useEffect(() => {
    mountedRef.current = true;
    setupListener();

    return () => {
      console.log('useInstrumentListener: Component cleanup');
      mountedRef.current = false;
      cleanup();
    };
  }, [setupListener, cleanup, mountedRef]);

  return { cleanup };
};
