
import { useState, useCallback, memo } from 'react';

interface DrumPadProps {
  id: string;
  name: string;
  keyTrigger: string;
  soundSrc: string;
  color: string;
  glowColor?: string;
  volume?: number;
  speed?: number;
  size?: number;
  effects?: {
    eq: { low: number; mid: number; high: number };
  };
  onPlay?: (pad: any) => void;
}

const DrumPad = memo(({ 
  id, 
  name, 
  keyTrigger, 
  soundSrc, 
  color,
  glowColor = "rgba(255, 255, 255, 0.7)",
  volume = 1,
  speed = 1,
  size = 1,
  effects,
  onPlay
}: DrumPadProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const playSound = useCallback(async () => {
    console.log(`Playing ${name}`);
    
    // Use external play handler
    if (onPlay) {
      onPlay({ id, name, soundSrc, keyTrigger, glowColor });
      setIsActive(true);
      setTimeout(() => setIsActive(false), 150);
      return;
    }
    
    // Visual feedback
    setIsActive(true);
    setTimeout(() => setIsActive(false), 150);
  }, [name, onPlay, id, soundSrc, keyTrigger, glowColor]);
  
  const padStyle = {
    backgroundColor: color || '#4f46e5',
    boxShadow: isActive ? `0 0 25px 5px ${glowColor}` : isHovered ? `0 4px 12px rgba(0,0,0,0.2)` : '',
    transform: isActive ? `scale(${size * 0.95})` : isHovered ? `scale(${size * 1.02})` : `scale(${size})`,
    minHeight: '80px',
    aspectRatio: '1 / 1',
    transition: 'all 150ms ease-out',
  };
  
  return (
    <div 
      id={`drum-${id}`}
      className="drum-pad relative flex flex-col items-center justify-center cursor-pointer shadow-lg 
                hover:shadow-xl dark:shadow-slate-800 rounded-lg touch-manipulation select-none
                sm:min-h-[100px] md:min-h-[120px]"
      style={padStyle}
      onClick={playSound}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className={`text-xl sm:text-2xl font-bold text-white transition-opacity ${isActive ? 'opacity-80' : 'opacity-100'}`}>
        {keyTrigger.toUpperCase()}
      </div>
      <div className="text-xs sm:text-sm text-white mt-1 opacity-90 text-center px-1">{name}</div>
      
      {isActive && (
        <div className="absolute inset-0 rounded-lg animate-ping opacity-60 bg-white" 
             style={{ animationDuration: '0.5s' }} />
      )}
    </div>
  );
});

DrumPad.displayName = 'DrumPad';

export default DrumPad;
