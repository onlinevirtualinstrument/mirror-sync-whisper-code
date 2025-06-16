
import { useState, useEffect, useRef } from 'react';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";

const Tabla = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Define the tabla sounds with different pitches
  const drums = [
    { name: 'Dayan (Right)', pitch: 'High', freq: 400, key: 'A', color: 'bg-amber-200' },
    { name: 'Dayan Edge', pitch: 'Mid-High', freq: 350, key: 'S', color: 'bg-amber-300' },
    { name: 'Dayan Center', pitch: 'Mid', freq: 300, key: 'D', color: 'bg-amber-400' },
    { name: 'Bayan (Left)', pitch: 'Low', freq: 150, key: 'F', color: 'bg-amber-500' },
    { name: 'Bayan Edge', pitch: 'Mid-Low', freq: 200, key: 'G', color: 'bg-amber-600' },
    { name: 'Bayan Center', pitch: 'Very Low', freq: 100, key: 'H', color: 'bg-amber-700' },
  ];

  useEffect(() => {
    // Initialize Audio Context
    const initAudio = () => {
      const AudioContext = window.AudioContext;
      setAudioContext(new AudioContext());
    };

    if (!audioContext) {
      initAudio();
    }

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const drumObj = drums.find(d => d.key.toUpperCase() === key);
      if (drumObj) {
        playTabla(drumObj.freq);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [audioContext]);

  const playTabla = (frequency: number) => {
    if (!audioContext) return;

    // Create oscillator for the base tone
    const oscillator = audioContext.createOscillator();
    // Create gain node for the envelope
    const gainNode = audioContext.createGain();

    // Tabla-like timbre using sine wave
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Envelope for tabla-like attack and release
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.9, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);

    // Add visual feedback
    const drumElement = document.querySelector(`[data-freq="${frequency}"]`);
    if (drumElement) {
      drumElement.classList.add('active');
      setTimeout(() => {
        drumElement.classList.remove('active');
      }, 300);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-end items-center mb-6">
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

      <FullscreenWrapper ref={containerRef} instrumentName="marimba">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
          {/* Dayan (Right Tabla) */}
          <div className="relative">
            <div className="w-48 h-48 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-lg overflow-hidden flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-amber-200 shadow-inner flex flex-col gap-4">
                {drums.slice(0, 3).map((drum) => (
                  <div
                    key={drum.name}
                    data-freq={drum.freq}
                    className={`w-full h-5 ${drum.color} hover:opacity-80 active:scale-95 cursor-pointer transition-all rounded-full flex justify-center items-center text-xs`}
                    onClick={() => playTabla(drum.freq)}
                  >
                    <span className="hidden">{drum.key}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 left-0 right-0 text-center text-sm">Dayan</div>
          </div>

          {/* Bayan (Left Tabla) */}
          <div className="relative">
            <div className="w-56 h-40 rounded-full bg-gradient-to-b from-amber-600 to-amber-800 shadow-lg overflow-hidden flex items-center justify-center">
              <div className="w-40 h-28 rounded-full bg-amber-500 shadow-inner flex flex-col gap-4">
                {drums.slice(3).map((drum) => (
                  <div
                    key={drum.name}
                    data-freq={drum.freq}
                    className={`w-full h-5 ${drum.color} hover:opacity-80 active:scale-95 cursor-pointer transition-all rounded-full flex justify-center items-center text-xs`}
                    onClick={() => playTabla(drum.freq)}
                  >
                    <span className="hidden">{drum.key}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 left-0 right-0 text-center text-sm">Bayan</div>
          </div>
        </div>
      </FullscreenWrapper>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 mb-8">
        {drums.map((drum) => (
          <div key={drum.name} className="text-center text-sm">
            <div className="font-medium">{drum.name}</div>
            <div className="text-muted-foreground text-xs">Press '{drum.key}'</div>
          </div>
        ))}
      </div>

      {/* <div className="text-center text-sm text-muted-foreground mt-4">
        <p>Click on the tabla surfaces or use keyboard keys (A, S, D, F, G, H)</p>
      </div> */}
    </div>
  );
};

export default Tabla;
