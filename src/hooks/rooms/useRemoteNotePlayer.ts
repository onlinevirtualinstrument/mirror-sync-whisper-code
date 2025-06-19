
import { useState, useCallback, useRef } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
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
  serverTimestamp?: number;
  clientId?: string;
  roomId?: string;
}

export const useRemoteNotePlayer = (roomId?: string, userId?: string) => {
  const [remotePlaying, setRemotePlaying] = useState<InstrumentNote | null>(null);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const { handleAsyncError } = useErrorHandler();
  
  const echoPreventionRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef<boolean>(true);

  const playRemoteNote = useCallback(async (noteData: InstrumentNote) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('useRemoteNotePlayer: Processing remote note:', noteData);
      
      if (!noteData?.note || typeof noteData.note !== 'string' || !noteData.instrument) {
        console.warn('useRemoteNotePlayer: Invalid note data', noteData);
        return;
      }

      const noteParts = noteData.note.split(':');
      if (noteParts.length < 2) {
        console.warn('useRemoteNotePlayer: Invalid note format:', noteData.note);
        return;
      }

      const [note, octave] = noteParts;
      const velocity = Math.min(Math.max(noteData.velocity || 0.7, 0.1), 1.0);
      const duration = Math.min(Math.max(noteData.duration || 500, 100), 3000);
      
      // Enhanced echo prevention
      const noteKey = `${noteData.userId}-${noteData.note}-${noteData.sessionId || 'default'}`;
      const timeKey = `${noteData.userId}-${noteData.note}-${Math.floor(Date.now() / 200)}`;
      
      if (echoPreventionRef.current.has(noteKey) || echoPreventionRef.current.has(timeKey)) {
        console.log('useRemoteNotePlayer: Preventing echo for note:', noteData.note);
        return;
      }
      
      echoPreventionRef.current.add(noteKey);
      echoPreventionRef.current.add(timeKey);
      setTimeout(() => {
        if (mountedRef.current) {
          echoPreventionRef.current.delete(noteKey);
          echoPreventionRef.current.delete(timeKey);
        }
      }, 300);

      const activeKey = `${note}-${octave}`;
      if (activeNotes.has(activeKey)) {
        console.log('useRemoteNotePlayer: Note already active, skipping:', activeKey);
        return;
      }

      await playInstrumentNote(noteData.instrument, note, parseInt(octave, 10), duration, velocity);

      if (mountedRef.current) {
        setActiveNotes(prev => new Set(prev).add(activeKey));
        setTimeout(() => {
          if (mountedRef.current) {
            setActiveNotes(prev => {
              const newSet = new Set(prev);
              newSet.delete(activeKey);
              return newSet;
            });
          }
        }, duration + 100);
      }

      console.log('useRemoteNotePlayer: Successfully played remote note');
    } catch (error) {
      console.error("useRemoteNotePlayer: Error playing remote note:", error);
      if (mountedRef.current) {
        handleAsyncError(error as Error, 'play remote note', userId || '', roomId || '');
      }
    }
  }, [handleAsyncError, activeNotes, roomId, userId]);

  const setRemotePlayingWithCleanup = useCallback((noteData: InstrumentNote | null) => {
    if (!mountedRef.current) return;
    
    setRemotePlaying(noteData);
    if (noteData) {
      setTimeout(() => {
        if (mountedRef.current) {
          setRemotePlaying(null);
        }
      }, 300);
    }
  }, []);

  return {
    remotePlaying,
    activeNotes: Array.from(activeNotes),
    playRemoteNote,
    setRemotePlayingWithCleanup,
    mountedRef,
    echoPreventionRef
  };
};
