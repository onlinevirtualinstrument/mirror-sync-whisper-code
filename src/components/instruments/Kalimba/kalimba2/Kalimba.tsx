
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { kalimbaVariants, KalimbaVariant } from './KalimbaVariants';
import InstrumentVariantSelector from '@/pages/instruments/InstrumentVariantSelector';
import AudioContextManager from '@/utils/music/AudioContextManager';
import { toast } from 'sonner';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";

interface KalimbaProps {
  initialVariantId?: string;
}

const Kalimba: React.FC<KalimbaProps> = ({ initialVariantId = 'traditional' }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(initialVariantId);
  const audioContextManager = useRef<AudioContextManager>(AudioContextManager.getInstance());
  const activeOscillators = useRef<Map<string, { oscillator: OscillatorNode, gainNode: GainNode }>>(new Map());

  // Get the selected variant
  const selectedVariant = useMemo(() => {
    return kalimbaVariants.find(variant => variant.id === selectedVariantId) || kalimbaVariants[0];
  }, [selectedVariantId]);

  // Calculate tine frequencies based on the variant
  const tines = useMemo(() => {
    // Base frequencies vary slightly by kalimba type
    const baseFrequency = selectedVariant.id === 'crystal' ? 262 :
      selectedVariant.id === 'coconut' ? 250 :
        selectedVariant.id === 'bamboo' ? 270 : 261.63; // Middle C for traditional

    // Create tines based on the variant's tine count
    const tineCount = selectedVariant.tineCount;
    const centerIndex = Math.floor(tineCount / 2);

    return Array.from({ length: tineCount }).map((_, index) => {
      // Calculate note position relative to center (pentatonic-based intervals)
      const position = index - centerIndex;
      const octaveOffset = Math.floor(Math.abs(position) / 5);
      const scalePosition = position < 0 ?
        [0, 2, 4, 7, 9][Math.abs(position) % 5] :
        [0, 2, 4, 7, 9][position % 5];

      // Calculate frequency (adjust octave based on position)
      const octaveMultiplier = position < 0 ? 1 / (Math.pow(2, octaveOffset)) : Math.pow(2, octaveOffset);
      const frequency = baseFrequency * Math.pow(2, scalePosition / 12) * octaveMultiplier;

      // Map keys to notes
      const noteIndex = (position < 0 ? Math.abs(position) : position) % 7;
      const notes = ['C', 'D', 'E', 'G', 'A', 'C', 'D', 'E', 'G', 'A', 'C'];
      const octaves = position < 0 ? [4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3] : [4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5];

      // Calculate height for visual design
      const heightBase = 100;
      const heightVariation = 40;
      const height = heightBase + (position * heightVariation / tineCount);

      return {
        id: `tine-${index}`,
        note: `${notes[index % notes.length]}${octaves[index % octaves.length]}`,
        frequency,
        height,
        key: (index + 1).toString()
      };
    });
  }, [selectedVariant.id, selectedVariant.tineCount]);

  // Play kalimba tone with given frequency
  const playTone = useCallback((id: string, note: string, frequency: number) => {
    try {
      const audioContext = audioContextManager.current.getAudioContext();
      const now = audioContext.currentTime;

      // Create oscillator and gain for envelope
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Apply sound modifiers from the selected variant
      const { attack, decay, sustain, release, toneQuality } = selectedVariant.soundModifier;

      // Create kalimba-like timbre using multiple oscillators
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      // Create richer kalimba tone with multiple oscillators
      const sineGain = audioContext.createGain();
      sineGain.gain.value = 0.6;

      const triangleOsc = audioContext.createOscillator();
      triangleOsc.type = 'triangle';
      triangleOsc.frequency.value = frequency;
      const triangleGain = audioContext.createGain();
      triangleGain.gain.value = 0.3 * toneQuality;

      // Add slight detune for more natural sound
      oscillator.detune.value = -5;
      triangleOsc.detune.value = 5;

      // Create click effect for attack characteristic of kalimba
      const clickOsc = audioContext.createOscillator();
      clickOsc.type = 'triangle';
      clickOsc.frequency.value = frequency * 2;
      const clickGain = audioContext.createGain();
      clickGain.gain.value = 0.1;
      clickGain.gain.setValueAtTime(0.1, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      // Connect all oscillators
      oscillator.connect(sineGain);
      triangleOsc.connect(triangleGain);
      clickOsc.connect(clickGain);

      sineGain.connect(gainNode);
      triangleGain.connect(gainNode);
      clickGain.connect(gainNode);

      gainNode.connect(audioContext.destination);

      // Apply envelope for kalimba-like attack and decay
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.8, now + attack);
      gainNode.gain.exponentialRampToValueAtTime(sustain, now + attack + decay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + attack + decay + release);

      // Store oscillators for cleanup
      activeOscillators.current.set(id, { oscillator, gainNode });

      // Start and stop oscillators
      oscillator.start(now);
      triangleOsc.start(now);
      clickOsc.start(now);

      oscillator.stop(now + attack + decay + release + 0.1);
      triangleOsc.stop(now + attack + decay + release + 0.1);
      clickOsc.stop(now + 0.1); // Short click

      // Visual feedback
      setActiveKey(id);

      setTimeout(() => {
        setActiveKey(null);
      }, 300);

      // Cleanup after sound ends
      setTimeout(() => {
        activeOscillators.current.delete(id);
      }, (attack + decay + release + 0.1) * 1000);
    } catch (error) {
      console.error('Error playing tone:', error);
      toast.error('There was an error playing the sound');
    }
  }, [selectedVariant]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Convert key pressed to index
      const keyIndex = parseInt(e.key) - 1;
      if (!isNaN(keyIndex) && keyIndex >= 0 && keyIndex < tines.length) {
        const tine = tines[keyIndex];
        playTone(tine.id, tine.note, tine.frequency);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tines, playTone]);

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
    toast.success(`Changed to ${kalimbaVariants.find(v => v.id === variantId)?.name || 'new kalimba'}`);
  };

  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex flex-col items-center">

        <div className="flex justify-between items-center mb-6">
          {/* Variant Selector */}
          <div className="">
            <InstrumentVariantSelector
              currentVariant={selectedVariantId}
              setVariant={handleVariantChange}
              variants={kalimbaVariants.map(v => ({ id: v.id, name: v.name }))}
              label="Select Kalimba Type"
            />
          </div>

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


        <FullscreenWrapper ref={containerRef} instrumentName="kalimba">
          {/* Kalimba Visualization */}
          <div className="relative mb-4">
            {/* Kalimba Body */}
            <div
              className={`${selectedVariant.bodyColor} rounded-t-full w-84 h-48 mx-auto relative shadow-lg`}
              style={{
                backgroundImage: "url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.04%22 numOctaves=%224%22/%3E%3CfeComponentTransfer%3E%3CfeFuncR type=%22linear%22 slope=%220.1%22/%3E%3CfeFuncG type=%22linear%22 slope=%220.1%22/%3E%3CfeFuncB type=%22linear%22 slope=%220.1%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url%28%23noise%29%22/%3E%3C/svg%3E')",
                backgroundBlendMode: "overlay",
              }}
            >
              {/* Sound Hole */}
              <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-8 rounded-full bg-black/60 ${selectedVariant.id === 'crystal' ? 'bg-black/40' : ''}`}></div>

              {/* Decorative Elements based on variant */}
              {selectedVariant.id === 'traditional' && (
                <>
                  <div className="absolute top-10 left-10 w-8 h-8 rounded-full bg-amber-900/50"></div>
                  <div className="absolute top-10 right-10 w-8 h-8 rounded-full bg-amber-900/50"></div>
                </>
              )}

              {selectedVariant.id === 'crystal' && (
                <>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-white/20"></div>
                  <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-white/20"></div>
                  <div className="absolute top-10 right-10 w-4 h-4 rounded-full bg-white/20"></div>
                </>
              )}

              {selectedVariant.id === 'coconut' && (
                <>
                  <div className="absolute top-1/3 left-1/3 w-1/3 h-1/4 rounded-full bg-amber-950/50 transform rotate-45"></div>
                </>
              )}

              {selectedVariant.id === 'bamboo' && (
                <>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-green-900/50"></div>
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-green-900/50"></div>
                  <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-green-900/50"></div>
                </>
              )}

              {/* Kalimba Tines */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
                {tines.map((tine, index) => {
                  const width = 6;
                  const offsetFromCenter = index - Math.floor(tines.length / 2);
                  const leftPosition = `calc(50% + ${offsetFromCenter * (width + 15)}px)`;

                  return (
                    <div
                      key={tine.id}
                      className="absolute bottom-0"
                      style={{ left: leftPosition }}
                    >
                      <div
                        id={tine.id}
                        className={`${selectedVariant.tineColor} cursor-pointer transition-all duration-150 rounded-t-md ${activeKey === tine.id ? 'transform translate-y-1' : ''}`}
                        style={{
                          width: `${width}px`,
                          height: `${tine.height}px`,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }}
                        onClick={() => playTone(tine.id, tine.note, tine.frequency)}
                      ></div>
                      <div className="text-center mt-2 text-xs">{index + 1}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom of Kalimba */}
            <div className={`${selectedVariant.bodyColor} w-64 h-6 mx-auto rounded-b-lg mt-14`}></div>
          </div>
        </FullscreenWrapper>

        {/* <p className="text-sm text-gray-600 dark:text-gray-400 mt-0">
          Click on tines or press number keys (1-{tines.length}) to play notes
        </p> */}

        {/* Instrument Info */}
        <div className="w-full max-w-md mt-6 mb-6 p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-lg mb-2">{selectedVariant.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{selectedVariant.description}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Origin:</span> {selectedVariant.origin}
            </div>
            <div>
              <span className="font-medium">Tines:</span> {selectedVariant.tineCount}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Kalimba;
