import { useState, useEffect, useRef } from 'react';
import SoundControls from '../utils/SoundControls';

// Piano key definitions
const pianoKeys = [
  { note: 'C', key: 'a', isBlack: false, keyboardPosition: 0 },
  { note: 'C#', key: 'w', isBlack: true, keyboardPosition: 0.7 },
  { note: 'D', key: 's', isBlack: false, keyboardPosition: 1 },
  { note: 'D#', key: 'e', isBlack: true, keyboardPosition: 1.7 },
  { note: 'E', key: 'd', isBlack: false, keyboardPosition: 2 },
  { note: 'F', key: 'f', isBlack: false, keyboardPosition: 3 },
  { note: 'F#', key: 't', isBlack: true, keyboardPosition: 3.7 },
  { note: 'G', key: 'g', isBlack: false, keyboardPosition: 4 },
  { note: 'G#', key: 'y', isBlack: true, keyboardPosition: 4.7 },
  { note: 'A', key: 'h', isBlack: false, keyboardPosition: 5 },
  { note: 'A#', key: 'u', isBlack: true, keyboardPosition: 5.7 },
  { note: 'B', key: 'j', isBlack: false, keyboardPosition: 6 },
  { note: 'C2', key: 'k', isBlack: false, keyboardPosition: 7 },
  { note: 'C#2', key: 'o', isBlack: true, keyboardPosition: 7.7 },
  { note: 'D2', key: 'l', isBlack: false, keyboardPosition: 8 },
  { note: 'D#2', key: 'p', isBlack: true, keyboardPosition: 8.7 },
  { note: 'E2', key: ';', isBlack: false, keyboardPosition: 9 },
];

const Piano = () => {
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [octave, setOctave] = useState(4);
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [reverbLevel, setReverbLevel] = useState<number>(0.3);
  const [toneQuality, setToneQuality] = useState<number>(0.5);
  const audioContext = useRef<AudioContext | null>(null);
  const oscillators = useRef<Map<string, OscillatorNode>>(new Map());
  const reverbNode = useRef<ConvolverNode | null>(null);

  // Initialize audio context and create reverb
  useEffect(() => {
    const initializeAudioContext = async () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        await createReverb(audioContext.current);
      }
      document.removeEventListener('click', initializeAudioContext);
    };
    
    document.addEventListener('click', initializeAudioContext);
    
    return () => {
      document.removeEventListener('click', initializeAudioContext);
      if (audioContext.current) {
        oscillators.current.forEach(osc => {
          try {
            osc.stop();
          } catch (e) {
            // Ignore errors when stopping already stopped oscillators
          }
        });
      }
    };
  }, []);

  // Create reverb impulse response
  const createReverb = async (audioCtx: AudioContext) => {
    if (reverbNode.current) return;
    
    const convolver = audioCtx.createConvolver();
    
    // Create impulse response for reverb
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * 3; // 3 seconds reverb
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);
    
    // Generate piano hall reverb impulse response
    for (let i = 0; i < length; i++) {
      const n = i / length;
      // Exponential decay for piano hall sound
      const decay = Math.exp(-n * 3);
      
      // Add some early reflections for concert hall effect
      const reflectionL = (i % 5000 === 0 && i < length / 3) ? 0.5 : 0;
      const reflectionR = (i % 4800 === 0 && i < length / 3) ? 0.5 : 0;
      
      impulseL[i] = ((Math.random() * 2 - 1) * decay) + reflectionL;
      impulseR[i] = ((Math.random() * 2 - 1) * decay) + reflectionR;
    }
    
    convolver.buffer = impulse;
    reverbNode.current = convolver;
  };

  // Setup keyboard listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pianoKey = pianoKeys.find(k => k.key === event.key.toLowerCase());
      if (pianoKey && !pressedKeys.includes(pianoKey.note)) {
        playNote(pianoKey.note);
        setPressedKeys(prev => [...prev, pianoKey.note]);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const pianoKey = pianoKeys.find(k => k.key === event.key.toLowerCase());
      if (pianoKey) {
        stopNote(pianoKey.note);
        setPressedKeys(prev => prev.filter(note => note !== pianoKey.note));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKeys, octave, volume, isMuted, reverbLevel, toneQuality]);

  // Play a note with enhanced piano sound
  const playNote = (note: string) => {
    if (!audioContext.current || isMuted) return;
    
    // Get the frequency for the note
    const baseFrequency = getFrequency(note, octave);
    
    // Create oscillators for rich piano tone
    const oscillator1 = audioContext.current.createOscillator(); // Fundamental
    const oscillator2 = audioContext.current.createOscillator(); // Upper harmonic
    const oscillator3 = audioContext.current.createOscillator(); // String resonance
    
    const masterGain = audioContext.current.createGain();
    const toneFilter = audioContext.current.createBiquadFilter();
    
    // Set oscillator types and frequencies for piano-like timbre
    oscillator1.type = 'triangle';
    oscillator1.frequency.setValueAtTime(baseFrequency, audioContext.current.currentTime);
    
    oscillator2.type = toneQuality > 0.5 ? 'sine' : 'triangle';
    oscillator2.frequency.setValueAtTime(baseFrequency * 2, audioContext.current.currentTime); // First harmonic
    
    oscillator3.type = 'sine';
    oscillator3.frequency.setValueAtTime(baseFrequency * 4.1, audioContext.current.currentTime); // Slight detune for richness
    
    // Set gains for oscillators mix
    const gain1 = audioContext.current.createGain();
    const gain2 = audioContext.current.createGain();
    const gain3 = audioContext.current.createGain();
    
    gain1.gain.value = 0.6;
    gain2.gain.value = 0.3 * toneQuality; // More harmonics for brighter tone
    gain3.gain.value = 0.05 * toneQuality; // String resonance
    
    // Compressor for dynamic control
    const compressor = audioContext.current.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    
    // Set tone filter based on tone quality (brightness control)
    toneFilter.type = 'lowpass';
    toneFilter.frequency.value = 700 + (toneQuality * 7000); // Brighter at higher values
    toneFilter.Q.value = 0.5 + toneQuality * 1; // Slight resonance
    
    // Connect oscillators through respective gain nodes
    oscillator1.connect(gain1);
    oscillator2.connect(gain2);
    oscillator3.connect(gain3);
    
    // Mix oscillators
    gain1.connect(toneFilter);
    gain2.connect(toneFilter);
    gain3.connect(toneFilter);
    
    // Connect tone filter to compressor
    toneFilter.connect(compressor);
    
    // Connect to output with or without reverb
    if (reverbLevel > 0 && reverbNode.current) {
      const dryGain = audioContext.current.createGain();
      const wetGain = audioContext.current.createGain();
      
      dryGain.gain.value = 1 - reverbLevel;
      wetGain.gain.value = reverbLevel;
      
      compressor.connect(dryGain);
      compressor.connect(reverbNode.current);
      reverbNode.current.connect(wetGain);
      
      dryGain.connect(masterGain);
      wetGain.connect(masterGain);
    } else {
      compressor.connect(masterGain);
    }
    
    // Connect master gain to output
    masterGain.connect(audioContext.current.destination);
    
    // Piano envelope with quick attack and gradual decay
    masterGain.gain.setValueAtTime(0, audioContext.current.currentTime);
    masterGain.gain.linearRampToValueAtTime(volume, audioContext.current.currentTime + 0.005);
    masterGain.gain.setValueAtTime(volume, audioContext.current.currentTime + 0.01);
    masterGain.gain.exponentialRampToValueAtTime(volume * 0.8, audioContext.current.currentTime + 0.1);
    masterGain.gain.exponentialRampToValueAtTime(volume * 0.3, audioContext.current.currentTime + 0.8);
    masterGain.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 3);
    
    // Start oscillators
    oscillator1.start();
    oscillator2.start();
    oscillator3.start();
    
    // Keep track of main oscillator to stop it later
    oscillators.current.set(note, oscillator1);
    
    // Scheduled stop
    setTimeout(() => {
      oscillator1.stop();
      oscillator2.stop();
      oscillator3.stop();
    }, 3000);
  };

  // Stop a note
  const stopNote = (note: string) => {
    if (!audioContext.current) return;
    
    const oscillator = oscillators.current.get(note);
    if (oscillator) {
      const gainNode = audioContext.current.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      
      gainNode.gain.setValueAtTime(volume * 0.3, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 0.1);
      
      setTimeout(() => {
        try {
          oscillator.stop();
        } catch (e) {
          // Ignore already stopped oscillators
        }
        oscillators.current.delete(note);
      }, 100);
    }
  };

  const handleMouseDown = (note: string) => {
    if (!pressedKeys.includes(note)) {
      playNote(note);
      setPressedKeys(prev => [...prev, note]);
    }
  };

  const handleMouseUp = (note: string) => {
    stopNote(note);
    setPressedKeys(prev => prev.filter(k => k !== note));
  };

  // Get frequency from note and octave
  const getFrequency = (note: string, octave: number) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    let noteIndex;
    let adjustedOctave = octave;
    
    if (note.endsWith('2')) {
      noteIndex = notes.indexOf(note.substring(0, note.length - 1));
      adjustedOctave = octave + 1;
    } else {
      noteIndex = notes.indexOf(note);
    }
    
    if (noteIndex === -1) return 440; // Default to A4 if note not found
    
    // A4 is 440Hz (A in octave 4)
    const A4 = 440;
    // Number of semitones from A4
    const semitones = (adjustedOctave - 4) * 12 + noteIndex - 9;
    
    // Calculate frequency: f = A4 * 2^(semitones/12)
    return A4 * Math.pow(2, semitones / 12);
  };

  // Render piano component
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mt-6 mb-8 flex justify-center space-x-4">
        <button 
          onClick={() => setOctave(prev => Math.max(1, prev - 1))}
          className="px-4 py-2 rounded-md border border-border bg-secondary/80 text-foreground hover:bg-secondary transition-colors"
        >
          Octave Down
        </button>
        <div className="px-4 py-2 rounded-md bg-background border border-border">
          Octave: {octave}
        </div>
        <button 
          onClick={() => setOctave(prev => Math.min(7, prev + 1))}
          className="px-4 py-2 rounded-md border border-border bg-secondary/80 text-foreground hover:bg-secondary transition-colors"
        >
          Octave Up
        </button>
      </div>
      
      <div className="relative flex justify-center">
        {/* Render white keys */}
        <div className="flex">
          {pianoKeys.filter(key => !key.isBlack).map((key, index) => (
            <div
              key={key.note}
              className={`piano-white-key ${pressedKeys.includes(key.note) ? 'bg-gray-100 translate-y-1' : ''}`}
              onMouseDown={() => handleMouseDown(key.note)}
              onMouseUp={() => handleMouseUp(key.note)}
              onMouseLeave={() => {
                if (pressedKeys.includes(key.note)) {
                  handleMouseUp(key.note);
                }
              }}
            >
              <span className="text-muted-foreground text-xs absolute bottom-2">
                {key.key.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
        
        {/* Render black keys */}
        {pianoKeys.filter(key => key.isBlack).map(key => (
          <div
            key={key.note}
            className={`piano-black-key ${pressedKeys.includes(key.note) ? 'bg-gray-700 translate-y-1' : ''}`}
            style={{ 
              left: `calc(${key.keyboardPosition * 56}px + 1.75rem)` 
            }}
            onMouseDown={() => handleMouseDown(key.note)}
            onMouseUp={() => handleMouseUp(key.note)}
            onMouseLeave={() => {
              if (pressedKeys.includes(key.note)) {
                handleMouseUp(key.note);
              }
            }}
          >
            <span className="text-white/70 text-xs absolute bottom-2">
              {key.key.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-8 space-y-6">
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
        
        <div className="text-center text-muted-foreground">
          <p>Use your computer keyboard or click on the keys to play</p>
        </div>
      </div>
    </div>
  );
};

export default Piano;
