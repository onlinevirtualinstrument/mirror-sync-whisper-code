
import { useState, useEffect, useRef } from 'react';

interface KalimbaProps {
  variant?: 'standard' | 'electric' | 'bass' | 'chromatic' | 'african';
}

const Kalimba = ({ variant = 'standard' }: KalimbaProps) => {
  const [activeTine, setActiveTine] = useState<string | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  
  // Define notes based on the variant
  const getNotes = () => {
    switch (variant) {
      case 'electric':
        return [
          { note: 'C', freq: 261.63 * 1.1, key: '1', color: 'bg-blue-400' },
          { note: 'D', freq: 293.66 * 1.1, key: '2', color: 'bg-blue-500' },
          { note: 'E', freq: 329.63 * 1.1, key: '3', color: 'bg-blue-600' },
          { note: 'F', freq: 349.23 * 1.1, key: '4', color: 'bg-blue-700' },
          { note: 'G', freq: 392.00 * 1.1, key: '5', color: 'bg-blue-800' },
          { note: 'A', freq: 440.00 * 1.1, key: '6', color: 'bg-blue-900' },
          { note: 'B', freq: 493.88 * 1.1, key: '7', color: 'bg-indigo-800' },
          { note: 'C2', freq: 523.25 * 1.1, key: '8', color: 'bg-indigo-900' },
        ];
      case 'bass':
        return [
          { note: 'C', freq: 130.81, key: '1', color: 'bg-brown-400' },
          { note: 'D', freq: 146.83, key: '2', color: 'bg-brown-500' },
          { note: 'E', freq: 164.81, key: '3', color: 'bg-brown-600' },
          { note: 'F', freq: 174.61, key: '4', color: 'bg-brown-700' },
          { note: 'G', freq: 196.00, key: '5', color: 'bg-brown-800' },
          { note: 'A', freq: 220.00, key: '6', color: 'bg-brown-900' },
          { note: 'B', freq: 246.94, key: '7', color: 'bg-yellow-800' },
          { note: 'C2', freq: 261.63, key: '8', color: 'bg-yellow-900' },
        ];
      case 'chromatic':
        return [
          { note: 'C', freq: 261.63, key: '1', color: 'bg-purple-400' },
          { note: 'C#', freq: 277.18, key: '2', color: 'bg-purple-500' },
          { note: 'D', freq: 293.66, key: '3', color: 'bg-purple-600' },
          { note: 'D#', freq: 311.13, key: '4', color: 'bg-purple-700' },
          { note: 'E', freq: 329.63, key: '5', color: 'bg-purple-800' },
          { note: 'F', freq: 349.23, key: '6', color: 'bg-purple-900' },
          { note: 'F#', freq: 369.99, key: '7', color: 'bg-pink-800' },
          { note: 'G', freq: 392.00, key: '8', color: 'bg-pink-900' },
        ];
      case 'african':
        return [
          { note: 'G', freq: 392.00, key: '1', color: 'bg-orange-400' },
          { note: 'A', freq: 440.00, key: '2', color: 'bg-orange-500' },
          { note: 'B', freq: 493.88, key: '3', color: 'bg-orange-600' },
          { note: 'C', freq: 523.25, key: '4', color: 'bg-orange-700' },
          { note: 'D', freq: 587.33, key: '5', color: 'bg-orange-800' },
          { note: 'E', freq: 659.26, key: '6', color: 'bg-orange-900' },
          { note: 'F', freq: 698.46, key: '7', color: 'bg-red-800' },
          { note: 'G2', freq: 784.00, key: '8', color: 'bg-red-900' },
        ];
      default: // standard
        return [
          { note: 'C', freq: 261.63, key: '1', color: '' },
          { note: 'D', freq: 293.66, key: '2', color: '' },
          { note: 'E', freq: 329.63, key: '3', color: '' },
          { note: 'F', freq: 349.23, key: '4', color: '' },
          { note: 'G', freq: 392.00, key: '5', color: '' },
          { note: 'A', freq: 440.00, key: '6', color: '' },
          { note: 'B', freq: 493.88, key: '7', color: '' },
          { note: 'C2', freq: 523.25, key: '8', color: '' },
        ];
    }
  };
  
  const notes = getNotes();

  useEffect(() => {
    // Initialize Audio Context
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    // Initialize on first click
    document.addEventListener('click', initAudio, { once: true });

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const tine = notes.find(t => t.key === key);
      
      if (tine && !activeTine) {
        playTine(tine.note, tine.freq);
      }
    };

    const handleKeyUp = () => {
      setActiveTine(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTine, notes]);

  const playTine = (note: string, frequency: number) => {
    if (!audioContext.current) return;
    
    setActiveTine(note);
    
    // Create oscillator for primary tone
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    // Different timbre based on variant
    switch (variant) {
      case 'electric':
        oscillator.type = 'sawtooth';
        break;
      case 'bass':
        oscillator.type = 'triangle';
        break;
      case 'chromatic':
        oscillator.type = 'square';
        break;
      case 'african':
        oscillator.type = 'sine';
        break;
      default: // standard
        oscillator.type = 'sine';
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    
    // Create a second oscillator for overtones
    const overtoneOsc = audioContext.current.createOscillator();
    overtoneOsc.type = 'sine';
    overtoneOsc.frequency.setValueAtTime(frequency * 2.756, audioContext.current.currentTime); // Mild dissonant overtone
    
    const overtoneGain = audioContext.current.createGain();
    overtoneGain.gain.value = variant === 'electric' ? 0.2 : (variant === 'bass' ? 0.05 : 0.1); // Adjust overtone level based on variant
    
    // Envelope for kalimba-like sound (bright attack, long decay)
    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.7, audioContext.current.currentTime + 0.01);
    
    const decayTime = variant === 'bass' ? 4 : (variant === 'electric' ? 2 : 3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + decayTime);
    
    // Bandpass filter to shape the tone
    const filter = audioContext.current.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = frequency * (variant === 'electric' ? 2 : (variant === 'bass' ? 1.2 : 1.5));
    filter.Q.value = variant === 'chromatic' ? 3 : 2;
    
    // Connect everything
    oscillator.connect(filter);
    filter.connect(gainNode);
    
    overtoneOsc.connect(overtoneGain);
    overtoneGain.connect(gainNode);
    
    gainNode.connect(audioContext.current.destination);
    
    // Start oscillators
    oscillator.start();
    overtoneOsc.start();
    
    setTimeout(() => {
      oscillator.stop();
      overtoneOsc.stop();
      setActiveTine(null);
    }, decayTime * 1000);
  };

  const handleTineClick = (note: string, freq: number) => {
    playTine(note, freq);
  };

  // Get appropriate colors based on variant
  const getBaseColor = () => {
    switch (variant) {
      case 'electric': return 'bg-blue-50 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800';
      case 'bass': return 'bg-amber-200 border-amber-300 dark:bg-amber-950/40 dark:border-amber-900';
      case 'chromatic': return 'bg-purple-50 border-purple-200 dark:bg-purple-900/40 dark:border-purple-800';
      case 'african': return 'bg-orange-100 border-orange-200 dark:bg-orange-900/40 dark:border-orange-800';
      default: return 'bg-amber-100 border-amber-200 dark:bg-amber-900/40 dark:border-amber-800';
    }
  };

  return (
    <div className="w-full glass-card rounded-xl">
      <div className="flex justify-center items-end mb-8">
        <div className={`w-56 h-32 rounded-t-3xl rounded-b-lg relative flex justify-center items-end ${getBaseColor()}`}>
          {notes.map((note, i) => (
            <div 
              key={i}
              className={`absolute cursor-pointer transition-all ${
                activeTine === note.note 
                  ? `${note.color || 'bg-amber-300'} translate-y-0.5` 
                  : `hover:bg-accent/20 ${note.color || 'bg-[#E8D0AA]'}`
              }`}
              style={{
                height: `${80 - i * 5}%`,
                width: '20px',
                bottom: '10%',
                left: `${38 + i * 25}px`,
                borderRadius: '2px',
                border: '1px solid #D0B894'
              }}
              onClick={() => handleTineClick(note.note, note.freq)}
            >
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-amber-800">
                {note.note}
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 text-xs text-amber-800">
                {note.key}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Kalimba;
