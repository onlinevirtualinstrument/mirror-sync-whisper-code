import { useState, useEffect, useRef } from 'react';
import SoundControls from '../../../../utils/music/SoundControls';
import { Music, Wand2 } from 'lucide-react';
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";

interface XylophoneProps {
  xylophoneType?: string;
}

const Xylophone = ({ xylophoneType = 'standard' }: XylophoneProps) => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [reverbLevel, setReverbLevel] = useState<number>(0.3);
  const [toneQuality, setToneQuality] = useState<number>(0.5);
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [currentXylophoneType, setCurrentXylophoneType] = useState<string>(xylophoneType);
  const audioContext = useRef<AudioContext | null>(null);
  const reverbNode = useRef<ConvolverNode | null>(null);

  useEffect(() => {
    setCurrentXylophoneType(xylophoneType);
  }, [xylophoneType]);

  const notes = [
    { note: 'C', octave: 4, freq: 261.63, key: 'Z', color: 'bg-[#8B4513]' }, // Wooden color for ends
    { note: 'D', octave: 4, freq: 293.66, key: 'X', color: 'bg-red-500' },
    { note: 'E', octave: 4, freq: 329.63, key: 'C', color: 'bg-orange-500' },
    { note: 'F', octave: 4, freq: 349.23, key: 'V', color: 'bg-yellow-500' },
    { note: 'G', octave: 4, freq: 392.00, key: 'B', color: 'bg-green-500' },
    { note: 'A', octave: 4, freq: 440.00, key: 'N', color: 'bg-teal-500' },
    { note: 'B', octave: 4, freq: 493.88, key: 'M', color: 'bg-blue-700' },
    { note: 'C', octave: 5, freq: 523.25, key: ',', color: 'bg-purple-500' },
    { note: 'D', octave: 5, freq: 587.33, key: '.', color: 'bg-red-500' },
    { note: 'E', octave: 5, freq: 659.25, key: '/', color: 'bg-orange-500' },
    { note: 'F', octave: 5, freq: 698.46, key: 'Q', color: 'bg-yellow-500' },
    { note: 'G', octave: 5, freq: 783.99, key: 'W', color: 'bg-green-500' },
    { note: 'A', octave: 5, freq: 880.00, key: 'E', color: 'bg-teal-500' },
    { note: 'B', octave: 5, freq: 987.77, key: 'R', color: 'bg-blue-700' },
    { note: 'C', octave: 6, freq: 1046.50, key: 'T', color: 'bg-purple-500' },
    { note: 'D', octave: 6, freq: 1174.66, key: 'Y', color: 'bg-red-500' },
    { note: 'C', octave: 3, freq: 130.81, key: '1', color: 'bg-[#8B4513]' }, // Wooden color for ends
  ];

  const createReverb = async (audioCtx: AudioContext) => {
    if (reverbNode.current) return reverbNode.current;

    const convolver = audioCtx.createConvolver();

    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * 3; // 3 seconds reverb
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const decay = Math.exp(-n * 5);
      impulseL[i] = (Math.random() * 2 - 1) * decay;
      impulseR[i] = (Math.random() * 2 - 1) * decay;
    }

    convolver.buffer = impulse;
    reverbNode.current = convolver;
    return convolver;
  };

  useEffect(() => {
    const initAudio = async () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContext.current = new AudioContext();
      await createReverb(audioContext.current);
    };

    if (!audioContext.current) {
      initAudio();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const noteIndex = notes.findIndex(n => n.key.toUpperCase() === key);
      if (noteIndex !== -1) {
        playNote(noteIndex, notes[noteIndex].freq);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [audioContext, volume, isMuted, reverbLevel, toneQuality]);

  const playNote = (index: number, frequency: number) => {
    if (!audioContext.current || isMuted) return;

    setActiveNote(index);

    if (containerRef.current) {
      const bar = document.querySelector(`[data-note-index="${index}"]`);
      if (bar) {
        const rect = bar.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const ripple = document.createElement('div');
        ripple.className = 'absolute rounded-full animate-note-ripple bg-white/30 pointer-events-none';
        ripple.style.width = '60px';
        ripple.style.height = '60px';
        ripple.style.left = `${rect.left - containerRect.left + rect.width / 2 - 30}px`;
        ripple.style.top = `${rect.top - containerRect.top + rect.height / 2 - 30}px`;

        containerRef.current.appendChild(ripple);

        setTimeout(() => {
          containerRef.current?.removeChild(ripple);
        }, 800);
      }
    }

    const oscillator1 = audioContext.current.createOscillator();
    const oscillator2 = audioContext.current.createOscillator();
    const oscillator3 = audioContext.current.createOscillator();
    const masterGain = audioContext.current.createGain();
    const toneFilter = audioContext.current.createBiquadFilter();

    let toneAdjustment = toneQuality;
    let attackTime = 0.005;
    let releaseTime = 1.5;
    let harmonic2Level = 0.05 * toneQuality;
    let harmonic3Level = 0.2 * toneQuality;

    switch (currentXylophoneType) {
      case 'marimba':
        oscillator1.type = 'sine';
        oscillator2.type = 'triangle';
        oscillator3.type = 'sine';
        harmonic2Level = 0.1 * toneQuality;
        harmonic3Level = 0.3 * toneQuality;
        attackTime = 0.01;
        releaseTime = 2.0;
        break;
      case 'glockenspiel':
        oscillator1.type = 'sine';
        oscillator2.type = 'square';
        oscillator3.type = 'triangle';
        harmonic2Level = 0.15 * toneQuality;
        harmonic3Level = 0.1 * toneQuality;
        attackTime = 0.001;
        releaseTime = 3.0;
        toneAdjustment = toneQuality * 1.5;
        break;
      case 'vibraphone':
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        oscillator3.type = 'sine';
        harmonic2Level = 0.08 * toneQuality;
        harmonic3Level = 0.25 * toneQuality;
        attackTime = 0.01;
        releaseTime = 4.0;

        const vibratoOsc = audioContext.current.createOscillator();
        const vibratoGain = audioContext.current.createGain();
        vibratoOsc.frequency.value = 5;
        vibratoGain.gain.value = 3;
        vibratoOsc.connect(vibratoGain);
        vibratoGain.connect(oscillator1.frequency);
        vibratoGain.connect(oscillator2.frequency);
        vibratoGain.connect(oscillator3.frequency);
        vibratoOsc.start();
        vibratoOsc.stop(audioContext.current.currentTime + releaseTime);
        break;
      case 'wooden':
        oscillator1.type = 'sine';
        oscillator2.type = 'triangle';
        oscillator3.type = 'square';
        harmonic2Level = 0.02 * toneQuality;
        harmonic3Level = 0.05 * toneQuality;
        attackTime = 0.001;
        releaseTime = 0.8;
        toneAdjustment = toneQuality * 0.7;
        break;
      default:
        oscillator1.type = 'sine';
        oscillator2.type = 'square';
        oscillator3.type = toneQuality > 0.5 ? 'triangle' : 'sine';
        break;
    }

    oscillator1.frequency.value = frequency;
    oscillator2.frequency.value = frequency * 3;
    oscillator3.frequency.value = frequency * 2;

    toneFilter.type = 'lowpass';
    toneFilter.frequency.value = 2000 + (toneAdjustment * 10000);
    toneFilter.Q.value = 1 + toneAdjustment * 5;

    const gain1 = audioContext.current.createGain();
    const gain2 = audioContext.current.createGain();
    const gain3 = audioContext.current.createGain();

    gain1.gain.value = 0.7;
    gain2.gain.value = harmonic2Level;
    gain3.gain.value = harmonic3Level;

    masterGain.gain.setValueAtTime(0, audioContext.current.currentTime);
    masterGain.gain.linearRampToValueAtTime(volume, audioContext.current.currentTime + attackTime);
    masterGain.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + releaseTime);

    oscillator1.connect(gain1);
    oscillator2.connect(gain2);
    oscillator3.connect(gain3);

    gain1.connect(toneFilter);
    gain2.connect(toneFilter);
    gain3.connect(toneFilter);

    if (reverbLevel > 0 && reverbNode.current) {
      const dryGain = audioContext.current.createGain();
      const wetGain = audioContext.current.createGain();

      dryGain.gain.value = 1 - reverbLevel;
      wetGain.gain.value = reverbLevel;

      toneFilter.connect(dryGain);
      toneFilter.connect(reverbNode.current);
      reverbNode.current.connect(wetGain);

      dryGain.connect(masterGain);
      wetGain.connect(masterGain);
    } else {
      toneFilter.connect(masterGain);
    }

    masterGain.connect(audioContext.current.destination);

    oscillator1.start();
    oscillator2.start();
    oscillator3.start();

    oscillator1.stop(audioContext.current.currentTime + releaseTime);
    oscillator2.stop(audioContext.current.currentTime + releaseTime);
    oscillator3.stop(audioContext.current.currentTime + releaseTime);

    setTimeout(() => {
      setActiveNote(null);
    }, 300);
  };

  const toggleNotes = () => {
    setShowNotes(!showNotes);
  };

  return (
    <div className="w-full flex flex-col items-center glass-card p-8 rounded-xl backdrop-blur-sm bg-gradient-to-b from-gray-50/30 to-gray-100/40 border border-gray-200/50 shadow-xl">
      <div className="mb-6 flex items-center gap-4">
        <button
          className="px-4 py-2 text-sm font-medium bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors"
          onClick={toggleNotes}
        >
          {showNotes ? 'Hide notes' : 'Show notes'}
        </button>

        <div className="landscape-warning text-xs text-muted-foreground  dark:bg-white/5 p-2 rounded-md">
          <p>
            <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
              ⛶Zoom
            </strong>
          </p>
        </div>
        {/* <style>{`
                            @media (min-width: 768px) {
                              .landscape-warning {
                                display: none;
                              }
                            }
                          `}</style> */}
      </div>

<FullscreenWrapper ref={containerRef} instrumentName="xylophone">
      <div
        ref={containerRef}
        className="relative w-full mb-10 flex justify-center overflow-visible"
        style={{ minHeight: '250px' }}
      >
        <div className="flex w-full items-end justify-center gap-[3px] md:gap-1 relative">
          {notes.map((note, index) => {
            if (index === 0 || index === notes.length - 1) return null;

            const heightPercent = 100 - (index * 2);
            const widthClass = "w-3 sm:w-5 md:w-7";

            let barColor = note.color;
            if (currentXylophoneType === 'marimba') {
              barColor = `bg-gradient-to-b from-amber-800 to-amber-700`;
            } else if (currentXylophoneType === 'glockenspiel') {
              barColor = `bg-gradient-to-b from-gray-300 to-amber-200`;
            } else if (currentXylophoneType === 'vibraphone') {
              barColor = `bg-gradient-to-b from-gray-700 to-gray-600`;
            } else if (currentXylophoneType === 'wooden') {
              barColor = `bg-gradient-to-b from-amber-600 to-amber-500`;
            }

            return (
              <div
                key={`${note.note}${note.octave}`}
                data-note-index={index}
                className={`${barColor} ${widthClass}  rounded-b-md hover:brightness-110 cursor-pointer shadow-md relative transition-all ${activeNote === index
                    ? 'transform-gpu -translate-y-2 brightness-125 scale-y-[0.98]'
                    : ''
                  }`}
                style={{
                  height: `${heightPercent}%`,
                  transition: 'all 0.15s ease-out',
                  zIndex: 10 - index,
                }}
                onClick={() => playNote(index, note.freq)}
              >
                <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[6px] h-[6px] md:w-[8px] md:h-[8px] bg-white rounded-full"></div>
                <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-[6px] h-[6px] md:w-[8px] md:h-[8px] bg-white rounded-full"></div>

                {showNotes && (
                  <div className="absolute bottom-0 left-0 right-0 text-center text-white font-medium text-[10px] md:text-xs p-[2px]">
                    {note.note}
                  </div>
                )}

                {showNotes && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 w-5 h-5 flex items-center justify-center rounded-sm shadow-sm">
                    {note.key}
                  </div>
                )}
              </div>
            );
          })}

          <div className="absolute bottom-0 w-[102%] h-4 bg-[#8B4513] rounded-md z-0"></div>

          <div className="absolute bottom-0 left-0 w-[6px] h-[90%] bg-[#8B4513] rounded-t-md"></div>
          <div className="absolute bottom-0 right-0 w-[6px] h-[90%] bg-[#8B4513] rounded-t-md"></div>
        </div>
      </div>
</FullscreenWrapper>

      <div className="mt-8 space-y-6 w-full max-w-sm mx-auto">
        <SoundControls
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          reverbLevel={reverbLevel}
          setReverbLevel={setReverbLevel}
          toneQuality={toneQuality}
          setToneQuality={setToneQuality}
        />

        {/* <div className="text-center text-sm text-muted-foreground">
          <div className="flex justify-center items-center gap-2">
            <Music size={16} />
            <span>Adjust sound controls for different timbres and effects</span>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Xylophone;
