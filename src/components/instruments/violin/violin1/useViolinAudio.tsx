
import { useState, useEffect, useCallback, useRef } from 'react';
import { ViolinType } from './ViolinExperience';
import { toast } from 'sonner';
import { ViolinSettings } from './types';
import { setupAudioEventListeners } from './hooks';
import { 
  setupAudioContext, 
  loadSavedAudioSettings,
  stopCurrentNote,
  playNewNote,
  NotePlayOptions
} from './hooks/noteManager';
import {
  playNoteSequence as playSequence,
  clearPlayedNotes as clearNotes
} from './hooks/playbackHelper';

export const useViolinAudio = (violinType: ViolinType) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [masterGainNode, setMasterGainNode] = useState<GainNode | null>(null);
  const [bassFilter, setBassFilter] = useState<BiquadFilterNode | null>(null);
  const [midFilter, setMidFilter] = useState<BiquadFilterNode | null>(null);
  const [trebleFilter, setTrebleFilter] = useState<BiquadFilterNode | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeOscillator, setActiveOscillator] = useState<OscillatorNode | null>(null);
  const [activeGainNode, setActiveGainNode] = useState<GainNode | null>(null);
  const [playedNotes, setPlayedNotes] = useState<string[]>([]);
  const [currentSettings, setCurrentSettings] = useState<ViolinSettings>({
    bowPressure: 50,
    bowSpeed: 50,
    vibrato: 30,
    reverb: 20,
    stringTension: 60
  });
  
  const noteTimeoutRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const currentNoteRef = useRef<string | null>(null);
  const activeOscillatorRef = useRef<OscillatorNode | null>(null);
  const activeGainNodeRef = useRef<GainNode | null>(null);
  const activeReverbNodesRef = useRef<AudioNode[]>([]);
  const stopReverbEffectRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    const initAudio = () => {
      const audioState = setupAudioContext();
      
      if (audioState.audioContext && audioState.masterGainNode && 
          audioState.bassFilter && audioState.midFilter && audioState.trebleFilter) {
        
        setAudioContext(audioState.audioContext);
        setMasterGainNode(audioState.masterGainNode);
        setBassFilter(audioState.bassFilter);
        setMidFilter(audioState.midFilter);
        setTrebleFilter(audioState.trebleFilter);
        setIsReady(true);
        
        console.log('Audio context initialized');
        
        loadSavedAudioSettings(
          audioState.masterGainNode,
          audioState.bassFilter,
          audioState.midFilter,
          audioState.trebleFilter
        );
      }
    };
    
    const handleUserInteraction = () => {
      if (!audioContext) {
        initAudio();
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      }
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [audioContext]);
  
  useEffect(() => {
    if (audioContext && masterGainNode) {
      return setupAudioEventListeners(audioContext, masterGainNode);
    }
  }, [audioContext, masterGainNode]);

  const updateControlSettings = useCallback((settings: ViolinSettings) => {
    setCurrentSettings(settings);
    
    if (document) {
      document.dispatchEvent(new CustomEvent('violin-volume-changed', {
        detail: { volume: settings.reverb / 100 }
      }));
      
      document.dispatchEvent(new CustomEvent('violin-eq-changed', {
        detail: { param: 'bass', value: settings.bowPressure / 100 }
      }));
      
      document.dispatchEvent(new CustomEvent('violin-eq-changed', {
        detail: { param: 'mid', value: settings.bowSpeed / 100 }
      }));
      
      document.dispatchEvent(new CustomEvent('violin-eq-changed', {
        detail: { param: 'treble', value: settings.stringTension / 100 }
      }));
    }
  }, []);

  const clearNoteTimeout = useCallback(() => {
    if (noteTimeoutRef.current) {
      window.clearTimeout(noteTimeoutRef.current);
      noteTimeoutRef.current = null;
    }
  }, []);

  const stopNote = useCallback(() => {
    if (!audioContext) return;
    
    isPlayingRef.current = false;
    
    const gainNodeToStop = activeGainNode || activeGainNodeRef.current;
    const oscillatorToStop = activeOscillator || activeOscillatorRef.current;
    
    stopCurrentNote(
      audioContext,
      gainNodeToStop,
      oscillatorToStop,
      stopReverbEffectRef.current,
      activeReverbNodesRef.current,
      clearNoteTimeout
    );
    
    setTimeout(() => {
      setActiveOscillator(null);
      setActiveGainNode(null);
      activeOscillatorRef.current = null;
      activeGainNodeRef.current = null;
      currentNoteRef.current = null;
      
      activeReverbNodesRef.current.forEach(node => {
        try {
          node.disconnect();
        } catch (e) {
          console.error("Error disconnecting node during cleanup:", e);
        }
      });
      activeReverbNodesRef.current = [];
    }, 30);
  }, [audioContext, activeGainNode, activeOscillator, clearNoteTimeout]);

  const setNoteTimeout = useCallback((timeoutId: number) => {
    clearNoteTimeout();
    noteTimeoutRef.current = timeoutId;
  }, [clearNoteTimeout]);

  const playNote = useCallback((
    stringNumber: number, 
    noteName: string, 
    options?: NotePlayOptions
  ) => {
    if (!audioContext || !masterGainNode) return;
    
    if (isPlayingRef.current) {
      stopNote();
    }
    
    isPlayingRef.current = true;
    currentNoteRef.current = noteName;
    
    const vibrato = currentSettings.vibrato / 100;
    
    playNewNote(
      audioContext,
      masterGainNode,
      violinType,
      vibrato,
      noteName,
      options || {},
      currentSettings.reverb / 100,
      (osc) => {
        setActiveOscillator(osc);
        activeOscillatorRef.current = osc;
      },
      (gain) => {
        setActiveGainNode(gain);
        activeGainNodeRef.current = gain;
      },
      (nodes) => {
        activeReverbNodesRef.current = nodes;
      },
      (stopFn) => {
        stopReverbEffectRef.current = stopFn;
      },
      setNoteTimeout,
      stopNote
    );
    
    setPlayedNotes(prevNotes => [...prevNotes, noteName]);
  }, [
    audioContext, 
    masterGainNode, 
    violinType, 
    currentSettings, 
    stopNote, 
    setNoteTimeout
  ]);

  useEffect(() => {
    return () => {
      clearNoteTimeout();
      
      if (audioContext) {
        try {
          if (activeGainNodeRef.current) {
            activeGainNodeRef.current.gain.cancelScheduledValues(audioContext.currentTime);
            activeGainNodeRef.current.gain.setValueAtTime(activeGainNodeRef.current.gain.value, audioContext.currentTime);
            activeGainNodeRef.current.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.01);
          }
          
          if (activeOscillatorRef.current) {
            try {
              activeOscillatorRef.current.stop();
            } catch (e) {
              console.error("Error stopping oscillator:", e);
            }
          }
          
          if (stopReverbEffectRef.current) {
            stopReverbEffectRef.current();
          }
          
          activeReverbNodesRef.current.forEach(node => {
            try {
              node.disconnect();
            } catch (e) {
              console.error("Error disconnecting node during cleanup:", e);
            }
          });
        } catch (e) {
          console.error("Error cleaning up audio:", e);
        }
      }
    };
  }, [audioContext, clearNoteTimeout]);

  const playNoteSequence = useCallback(() => {
    return playSequence(playedNotes, playNote);
  }, [playedNotes, playNote]);

  const clearPlayedNotes = useCallback(() => {
    setPlayedNotes([]);
    return clearNotes();
  }, []);

  return {
    playNote,
    stopNote,
    playNoteSequence,
    clearPlayedNotes,
    isReady,
    playedNotes,
    audioContext,
    masterGainNode,
    updateControlSettings
  };
};

export default useViolinAudio;
