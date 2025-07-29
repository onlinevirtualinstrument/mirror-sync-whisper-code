
import { useState, useCallback, useRef, useEffect } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import ToneAudioEngine from '@/utils/audio/toneAudioEngine';
import { InstrumentNote } from '@/types/InstrumentNote';

export const useRemoteNotePlayer = (roomId?: string, userId?: string) => {
  const [remotePlaying, setRemotePlaying] = useState<InstrumentNote | null>(null);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const { handleAsyncError } = useErrorHandler();
  
  const echoPreventionRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef<boolean>(true);
  const audioEngineRef = useRef<ToneAudioEngine | null>(null);

  // Initialize Tone.js audio engine
  useEffect(() => {
    const initAudio = async () => {
      if (!audioEngineRef.current) {
        try {
          audioEngineRef.current = ToneAudioEngine.getInstance();
          await audioEngineRef.current.initialize();
          audioEngineRef.current.setMasterVolume(0.8); // Good volume for hearing others
          console.log('useRemoteNotePlayer: Tone.js audio engine initialized');
        } catch (error) {
          console.error('useRemoteNotePlayer: Failed to initialize Tone.js:', error);
        }
      }
    };
    
    initAudio();

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose();
        audioEngineRef.current = null;
      }
    };
  }, []);

  const playRemoteNote = useCallback(async (noteData: InstrumentNote) => {
    if (!mountedRef.current || !audioEngineRef.current) {
      console.log('useRemoteNotePlayer: Audio engine not ready or component unmounted');
      return;
    }
    
    try {
      console.log('useRemoteNotePlayer: Processing remote note:', noteData);
      
      if (!noteData?.note || !noteData.instrument) {
        console.warn('useRemoteNotePlayer: Invalid note data', noteData);
        return;
      }

      // Skip if this is our own note
      if (noteData.userId === userId) {
        console.log('useRemoteNotePlayer: Skipping own note');
        return;
      }

      // Enhanced echo prevention using sessionId and timestamp
      const noteKey = `${noteData.userId}-${noteData.sessionId || noteData.note}-${noteData.timestamp}`;
      const timeKey = `${noteData.userId}-${noteData.note}-${Math.floor(Date.now() / 300)}`;
      
      if (echoPreventionRef.current.has(noteKey) || echoPreventionRef.current.has(timeKey)) {
        console.log('useRemoteNotePlayer: Preventing echo for note:', noteData.note);
        return;
      }
      
      echoPreventionRef.current.add(noteKey);
      echoPreventionRef.current.add(timeKey);
      
      // Clean up echo prevention cache
      setTimeout(() => {
        if (mountedRef.current) {
          echoPreventionRef.current.delete(noteKey);
          echoPreventionRef.current.delete(timeKey);
        }
      }, 500);

      // Check if note is already playing
      const activeKey = `${noteData.note}-${noteData.userId}`;
      if (activeNotes.has(activeKey)) {
        console.log('useRemoteNotePlayer: Note already active, skipping:', activeKey);
        return;
      }

      // Use frequency from noteData if available, otherwise calculate it
      let frequency = noteData.frequency;
      if (!frequency) {
        const [noteName, octaveStr] = noteData.note.includes(':') ? noteData.note.split(':') : [noteData.note, '4'];
        const octave = parseInt(octaveStr) || 4;
        const noteMap: { [key: string]: number } = {
          'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
          'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
          'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };
        const noteIndex = noteMap[noteName] || 9;
        const A4 = 440;
        const A4_KEY = 69;
        const midiKey = (octave + 1) * 12 + noteIndex;
        frequency = A4 * Math.pow(2, (midiKey - A4_KEY) / 12);
      }

      const velocity = Math.min(Math.max(noteData.velocity || 0.7, 0.1), 1.0);
      const duration = Math.min(Math.max(noteData.duration || 500, 100), 3000);

      console.log(`useRemoteNotePlayer: Playing remote note from ${noteData.userName} - ${noteData.instrument} at ${frequency}Hz`);
      
      // Play note using Tone.js
      await audioEngineRef.current.playNote(
        noteData.instrument,
        frequency,
        velocity,
        duration,
        noteData.userId
      );

      // Update active notes tracking
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

      console.log('useRemoteNotePlayer: Successfully played remote note with Tone.js');
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
