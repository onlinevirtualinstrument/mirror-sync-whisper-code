
import { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ToneAudioEngine from '@/utils/audio/toneAudioEngine';

export const useRoomInstruments = (
  room: any, 
  setLastActivityTime: (time: number) => void, 
  updateInstrumentPlayTime: () => void
) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  
  const audioInitializedRef = useRef<boolean>(false);

  // Initialize Tone.js audio system when component mounts
  useEffect(() => {
    const initAudio = async () => {
      if (!audioInitializedRef.current) {
        try {
          console.log('useRoomInstruments: Initializing Tone.js audio system');
          const audioEngine = ToneAudioEngine.getInstance();
          await audioEngine.initialize();
          audioEngine.setMasterVolume(0.8);
          
          audioInitializedRef.current = true;
          console.log('useRoomInstruments: Tone.js audio system ready for collaboration');
        } catch (error) {
          console.error('useRoomInstruments: Failed to initialize Tone.js audio system:', error);
        }
      }
    };

    initAudio();
  }, []);

  // Simplified function that just updates activity time
  const simpleBroadcastNote = useCallback(async (): Promise<void> => {
    // Just update activity - actual audio sharing happens through system audio
    setLastActivityTime(Date.now());
    updateInstrumentPlayTime();
  }, [setLastActivityTime, updateInstrumentPlayTime]);

  return {
    remotePlaying: null, // Removed complex remote playing logic
    broadcastInstrumentNote: simpleBroadcastNote,
    activeNotes: [],
    audioInitialized: audioInitializedRef.current
  };
};