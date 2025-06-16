import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TutorialButton } from '../../../Tutorial/TutorialButton';
import AudioContextManager from '../../../../utils/music/AudioContextManager';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";
import SoundControls from '../../../../utils/music/SoundControls';

const Marimba: React.FC = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const oscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());
  const noteSoundsRef = useRef<Map<string, () => void>>(new Map());

  // Customization options
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [stickHardness, setStickHardness] = useState<number>(0.5);
  const [reverbAmount, setReverbAmount] = useState<number>(0.3);

  // Notes configuration
  const notes = [
    { id: 'C', key: 'a', freq: 261.63 },
    { id: 'D', key: 's', freq: 293.66 },
    { id: 'E', key: 'd', freq: 329.63 },
    { id: 'F', key: 'f', freq: 349.23 },
    { id: 'G', key: 'g', freq: 392.00 },
    { id: 'A', key: 'h', freq: 440.00 },
    { id: 'B', key: 'j', freq: 493.88 },
    { id: 'C2', key: 'k', freq: 523.25 },
    { id: 'D2', key: 'l', freq: 587.33 },
    { id: 'E2', key: ';', freq: 659.25 },
    { id: 'F2', key: "'", freq: 698.46 },
    { id: 'G2', key: '\\', freq: 783.99 }
  ];

  const colors = [
    'bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-green-100',
    'bg-teal-100', 'bg-blue-100', 'bg-indigo-100', 'bg-purple-100',
    'bg-pink-100', 'bg-rose-100', 'bg-amber-100', 'bg-emerald-100'
  ];

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      try {
        AudioContextManager.getInstance().getAudioContext();
      } catch (e) {
        console.error("Error initializing AudioContext:", e);
      }
    };

    const handleUserInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    // Set up keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const note = notes.find(n => n.key === e.key.toLowerCase());
      if (note && !activeNotes.includes(note.id)) {
        playNote(note.id, note.freq);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = notes.find(n => n.key === e.key.toLowerCase());
      if (note && noteSoundsRef.current.has(note.id)) {
        noteSoundsRef.current.get(note.id)?.();
        noteSoundsRef.current.delete(note.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      // Clean up any active sounds
      noteSoundsRef.current.forEach(stopFn => stopFn());
    };
  }, [activeNotes, notes]);

  // Periodic cleanup of inactive oscillators
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      AudioContextManager.getInstance().cleanupInactiveOscillators(oscillatorsRef.current);
    }, 10000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Optimized note playing function
  const playNote = useCallback((noteId: string, frequency: number) => {
    try {
      const audioManager = AudioContextManager.getInstance();
      const audioContext = audioManager.getAudioContext();

      // Create oscillator for marimba sound
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      // Create gain node for envelope
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0;

      // Create filter for marimba-like sound - adjusted by stick hardness
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000 + (stickHardness * 2000); // Harder sticks = brighter sound
      filter.Q.value = 1 + stickHardness;

      // Connect nodes
      oscillator.connect(filter);
      filter.connect(gainNode);

      // Apply reverb based on user setting
      audioManager.getReverbNode().then(reverbNode => {
        const dryGain = audioContext.createGain();
        const wetGain = audioContext.createGain();

        dryGain.gain.value = 0.7;
        wetGain.gain.value = reverbAmount;

        gainNode.connect(dryGain);
        gainNode.connect(reverbNode);
        reverbNode.connect(wetGain);

        dryGain.connect(audioContext.destination);
        wetGain.connect(audioContext.destination);

        // Apply envelope
        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.7, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

        // Start oscillator
        oscillator.start(now);

        // Store in refs
        oscillatorsRef.current.set(noteId, oscillator);
        setActiveNotes(prev => [...prev, noteId]);

        // Create stop function
        const stopSound = () => {
          const releaseTime = audioContext.currentTime + 0.1;
          gainNode.gain.cancelScheduledValues(audioContext.currentTime);
          gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, releaseTime);

          setTimeout(() => {
            try {
              oscillator.stop();
              setActiveNotes(prev => prev.filter(id => id !== noteId));
            } catch (e) {
              console.error("Error stopping oscillator:", e);
            }
          }, 100);
        };

        // Store stop function
        noteSoundsRef.current.set(noteId, stopSound);
      });
    } catch (e) {
      console.error("Error playing marimba note:", e);
    }
  }, [stickHardness, reverbAmount]);

  const handleBarClick = useCallback((noteId: string, frequency: number) => {
    playNote(noteId, frequency);

    // Auto-release after a short time for clicks
    setTimeout(() => {
      if (noteSoundsRef.current.has(noteId)) {
        noteSoundsRef.current.get(noteId)?.();
        noteSoundsRef.current.delete(noteId);
      }
    }, 1000);
  }, [playNote]);

  // Tutorial content
  const marimbaInstructions = [
    "Click on the colored bars to play different marimba notes",
    "You can also use keyboard keys A, S, D, F, G, H, J, K, L, ;, ', and \\ to play notes",
    "Adjust the stick hardness to change the tone brightness",
    "Modify the reverb amount to create different acoustic spaces"
  ];

  const keyboardMappings = notes.map(note => ({
    key: note.key.toUpperCase() === '\\' ? '\\' : note.key.toUpperCase(),
    description: `Play ${note.id} note`
  }));

  return (
    <div className="w-full glass-card rounded-xl">
      <div className="flex justify-end">
        <div className="flex justify-between items-center mb-6">
          <TutorialButton
            instrumentName="Marimba"
            instructions={marimbaInstructions}
            keyMappings={keyboardMappings}
          />

          <div className="landscape-warning text-xs text-muted-foreground  dark:bg-white/5 p-2 rounded-md">
            <p>
              <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
                ⛶Zoom
              </strong>
            </p>
          </div>
          <style>{`
                            @media (min-width: 768px) {
                              .landscape-warning {
                                display: none;
                              }
                            }
                          `}</style>
        </div>
      </div>

      <FullscreenWrapper ref={containerRef} instrumentName="marimba">
        <div className="w-full flex justify-center space-x-1">
          {notes.map((note, i) => (
            <div
              key={i}
              className={`${colors[i]} hover:bg-accent/20 ${activeNotes.includes(note.id) ? 'translate-y-1 bg-accent/30' : ''
                } cursor-pointer transition-transform relative rounded-b-lg border border-gray-300`}
              style={{
                height: `${200 - i * 7}px`,
                width: '40px'
              }}
              onClick={() => handleBarClick(note.id, note.freq)}
            >
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                {note.id}
                <div className="text-[10px] opacity-70 mt-1">{note.key.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>

      </FullscreenWrapper>


      <div className="mt-8 space-y-4">
        <SoundControls
  volume={volume}
  setVolume={setVolume}
  isMuted={isMuted}
  setIsMuted={setIsMuted}
  reverbAmount={reverbAmount}
  setReverbAmount={setReverbAmount}
  stickHardness={stickHardness}
  setStickHardness={setStickHardness}
  />
          {/* <div className="text-center text-muted-foreground text-sm">
          Click on the bars to play or use keyboard keys A-L, ;, ', \
        </div> */}
      </div>
    </div>
  );
};

export default Marimba;
