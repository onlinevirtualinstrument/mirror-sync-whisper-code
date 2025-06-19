
import { useCallback, useEffect, useRef } from 'react';
import { useInstrumentBroadcast } from './rooms/useInstrumentBroadcast';
import { useRemoteNotePlayer } from './rooms/useRemoteNotePlayer';
import { useInstrumentListener } from './rooms/useInstrumentListener';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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

export const useRoomInstruments = (
  room: any, 
  setLastActivityTime: (time: number) => void, 
  updateInstrumentPlayTime: () => void
) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  
  const {
    remotePlaying,
    activeNotes,
    playRemoteNote,
    setRemotePlayingWithCleanup,
    mountedRef,
    echoPreventionRef
  } = useRemoteNotePlayer(roomId, user?.uid);

  const { broadcastInstrumentNote } = useInstrumentBroadcast(room, setLastActivityTime);

  useInstrumentListener(
    playRemoteNote,
    setRemotePlayingWithCleanup,
    updateInstrumentPlayTime,
    mountedRef
  );

  // Periodic cleanup of echo prevention cache
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (mountedRef.current && echoPreventionRef.current.size > 100) {
        console.log('useRoomInstruments: Cleaning echo prevention cache');
        echoPreventionRef.current.clear();
      }
    }, 30000);

    return () => clearInterval(cleanupInterval);
  }, [mountedRef, echoPreventionRef]);

  return {
    remotePlaying,
    broadcastInstrumentNote,
    activeNotes
  };
};