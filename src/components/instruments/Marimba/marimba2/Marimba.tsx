
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { marimbaVariants, MarimbaVariant } from './MarimbaVariants';
import InstrumentVariantSelector from '@/pages/instruments/InstrumentVariantSelector';
import AudioContextManager from '@/utils/music/AudioContextManager';
import { toast } from 'sonner';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";

interface MarimbaProps {
  initialVariantId?: string;
}

const Marimba: React.FC<MarimbaProps> = ({ initialVariantId = 'traditional' }) => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(initialVariantId);
  const [isMalletVisible, setIsMalletVisible] = useState<boolean>(false);
  const [malletPosition, setMalletPosition] = useState({ x: 0, y: 0 });
  const audioContextManager = useRef<AudioContextManager>(AudioContextManager.getInstance());
  const activeOscillators = useRef<Map<string, { oscillator: OscillatorNode, gainNode: GainNode }>>(new Map());

  // Get the selected variant
  const selectedVariant = useMemo(() => {
    return marimbaVariants.find(variant => variant.id === selectedVariantId) || marimbaVariants[0];
  }, [selectedVariantId]);

  // Calculate key frequencies based on the variant
  const keys = useMemo(() => {
    const baseFrequencies = {
      traditional: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
      synthetic: [277.18, 311.13, 349.23, 369.99, 415.30, 466.16, 523.25, 554.37],
      bass: [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63],
      soprano: [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]
    };

    const frequencies = baseFrequencies[selectedVariant.id as keyof typeof baseFrequencies] || baseFrequencies.traditional;

    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
    const octaves = selectedVariant.id === 'bass' ? [3, 3, 3, 3, 3, 3, 3, 4] :
      selectedVariant.id === 'soprano' ? [5, 5, 5, 5, 5, 5, 5, 6] :
        [4, 4, 4, 4, 4, 4, 4, 5];

    return frequencies.map((frequency, index) => ({
      note: `${notes[index]}${octaves[index]}`,
      frequency,
      color: selectedVariant.color
    }));
  }, [selectedVariant]);

  // Play marimba tone with given frequency
  const playTone = useCallback((note: string, frequency: number) => {
    try {
      const audioContext = audioContextManager.current.getAudioContext();
      const now = audioContext.currentTime;

      // Create oscillator and gain for envelope
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Apply sound modifiers from the selected variant
      const { attack, decay, sustain, release, toneQuality } = selectedVariant.soundModifier;

      // Set up marimba-like sound with overtones for realism
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      // Add overtones for more realistic timbre
      const overtoneGain1 = audioContext.createGain();
      const overtoneGain2 = audioContext.createGain();
      const overtoneGain3 = audioContext.createGain();

      const overtone1 = audioContext.createOscillator();
      overtone1.type = 'sine';
      overtone1.frequency.value = frequency * 2.0; // First overtone
      overtone1.connect(overtoneGain1);
      overtoneGain1.gain.value = 0.2 * toneQuality;

      const overtone2 = audioContext.createOscillator();
      overtone2.type = 'sine';
      overtone2.frequency.value = frequency * 3.0; // Second overtone
      overtone2.connect(overtoneGain2);
      overtoneGain2.gain.value = 0.1 * toneQuality;

      const overtone3 = audioContext.createOscillator();
      overtone3.type = 'sine';
      overtone3.frequency.value = frequency * 4.0; // Third overtone
      overtone3.connect(overtoneGain3);
      overtoneGain3.gain.value = 0.05 * toneQuality;

      // Connect nodes
      oscillator.connect(gainNode);
      overtoneGain1.connect(gainNode);
      overtoneGain2.connect(gainNode);
      overtoneGain3.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Apply envelope for marimba-like attack and decay
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(1, now + attack);
      gainNode.gain.exponentialRampToValueAtTime(sustain, now + attack + decay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + attack + decay + release);

      // Store oscillators for cleanup
      activeOscillators.current.set(note, { oscillator, gainNode });

      // Start and stop
      oscillator.start(now);
      overtone1.start(now);
      overtone2.start(now);
      overtone3.start(now);

      oscillator.stop(now + attack + decay + release + 0.1);
      overtone1.stop(now + attack + decay + release + 0.1);
      overtone2.stop(now + attack + decay + release + 0.1);
      overtone3.stop(now + attack + decay + release + 0.1);

      // Visual feedback
      setActiveKey(note);

      // Animated mallet
      setIsMalletVisible(true);

      setTimeout(() => {
        setActiveKey(null);
        setIsMalletVisible(false);
      }, 300);

      // Cleanup after sound ends
      setTimeout(() => {
        activeOscillators.current.delete(note);
      }, (attack + decay + release + 0.1) * 1000);
    } catch (error) {
      console.error('Error playing tone:', error);
      toast.error('There was an error playing the sound');
    }
  }, [selectedVariant]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Map keyboard keys 1-8 to marimba notes
      const keyIndex = '12345678'.indexOf(e.key);
      if (keyIndex !== -1 && keyIndex < keys.length) {
        const key = keys[keyIndex];
        playTone(key.note, key.frequency);

        // Set mallet position for the corresponding key
        const barElement = document.getElementById(`marimba-bar-${keyIndex}`);
        if (barElement) {
          const rect = barElement.getBoundingClientRect();
          setMalletPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 20
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keys, playTone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeOscillators.current.forEach(({ oscillator }) => {
        try {
          oscillator.stop();
        } catch (e) {
          // Oscillator might already be stopped
        }
      });
      activeOscillators.current.clear();
    };
  }, []);

  // Handle variant change
  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    toast.success(`Changed to ${marimbaVariants.find(v => v.id === variantId)?.name || 'new marimba'}`);
  };

  // Mallet components
  const Mallet = ({ position }: { position: { x: number, y: number } }) => (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-100"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="h-24 w-1 bg-amber-700 rounded-full relative">
        <div className="absolute -top-3 -left-3 w-7 h-7 bg-amber-200 rounded-full border-2 border-amber-800"></div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col items-center">
        {/* Variant Selector */}
        <div className="flex justify-between items-center mb-6">
          <InstrumentVariantSelector
            currentVariant={selectedVariantId}
            setVariant={handleVariantChange}
            variants={marimbaVariants.map(v => ({ id: v.id, name: v.name }))}
            label="Select Marimba Type"
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

        <FullscreenWrapper ref={containerRef} instrumentName="banjo">
          {/* Marimba Bars - Adjusted for better fit */}
          <div className="w-full mb-12 pb-4">
            <div className="flex justify-center relative">
              <div className="flex space-x-1 md:space-x-2 relative">
                {keys.map((key, index) => {
                  // Calculate dimensions based on index for a more organic look
                  const height = 60 + (selectedVariant.id === 'bass' ? 8 : 0) - (index * 2);
                  const width = 40 + (selectedVariant.id === 'bass' ? 4 : 0) + (index % 2 === 0 ? 2 : 0);

                  return (
                    <div
                      id={`marimba-bar-${index}`}
                      key={key.note}
                      className={`relative cursor-pointer transition-all duration-300 ${activeKey === key.note ? 'transform translate-y-1' : ''
                        }`}
                      onClick={(e) => {
                        playTone(key.note, key.frequency);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMalletPosition({
                          x: rect.left + rect.width / 2,
                          y: rect.top - 20
                        });
                      }}
                    >
                      {/* Wooden Bar */}
                      <div
                        className={`${selectedVariant.color} shadow-lg flex items-end justify-center pb-2 rounded-b-lg`}
                        style={{
                          width: `${width}px`,
                          height: `${height}px`,
                          backgroundImage: "url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.04%22 numOctaves=%224%22/%3E%3CfeComponentTransfer%3E%3CfeFuncR type=%22linear%22 slope=%220.1%22/%3E%3CfeFuncG type=%22linear%22 slope=%220.1%22/%3E%3CfeFuncB type=%22linear%22 slope=%220.1%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url%28%23noise%29%22/%3E%3C/svg%3E')",
                          backgroundBlendMode: "overlay",
                        }}
                      >
                        <span className="text-white text-xs font-bold">
                          {key.note.slice(0, -1)}
                          <div className="text-[10px] mt-1">{index + 1}</div>
                        </span>
                      </div>

                      {/* Resonator Tube */}
                      <div className={`absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-6 ${selectedVariant.resonatorColor} h-16 rounded-b-full z-10`}></div>

                      {/* Bottom Bar */}
                      <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gray-800 rounded-b-lg"></div>
                    </div>
                  );
                })}
              </div>

              {/* Stand/Frame */}
              <div className="absolute -bottom-18 left-0 right-0 h-2 bg-amber-900 dark:bg-amber-800"></div>

              {/* Support Legs */}
              <div className="absolute -bottom-32 left-12 w-3 h-32 bg-amber-900 dark:bg-amber-800 rounded-b-lg"></div>
              <div className="absolute -bottom-32 right-12 w-3 h-32 bg-amber-900 dark:bg-amber-800 rounded-b-lg"></div>
            </div>
          </div>

          {/* Show mallet when active */}
          {isMalletVisible && (
            <Mallet position={malletPosition} />
          )}

        </FullscreenWrapper>

        {/* <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          Click on bars or press number keys (1-8) to play notes
        </p> */}

        {/* Instrument Info */}
        <div className="w-full max-w-md mt-20 mb-6 p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <h3 className="font-semibold text-lg mb-2">{selectedVariant.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{selectedVariant.description}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Wood:</span> {selectedVariant.woodType}
            </div>
            <div>
              <span className="font-medium">Tuning:</span> {selectedVariant.tuning}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marimba;
