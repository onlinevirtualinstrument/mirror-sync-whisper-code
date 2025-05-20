
import React, { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  amplitude?: number; // 0-1
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  isActive,
  amplitude = 0.5
}) => {
  const [bars, setBars] = useState<number[]>(
    Array(10).fill(0).map(() => Math.random() * 0.2)
  );
  
  useEffect(() => {
    if (!isActive) {
      const timeout = setTimeout(() => {
        setBars(Array(10).fill(0).map(() => Math.random() * 0.2));
      }, 300);
      return () => clearTimeout(timeout);
    }
    
    const interval = setInterval(() => {
      if (isActive) {
        setBars(prev => 
          prev.map(() => (Math.random() * 0.5 + 0.5) * amplitude)
        );
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isActive, amplitude]);

  return (
    <div className="w-full h-16 flex items-center justify-center">
      <div className={`flex items-center gap-1 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
        {bars.map((height, index) => (
          <div 
            key={index}
            className="bg-primary/80 rounded-full w-1.5"
            style={{ 
              height: `${Math.max(4, height * 50)}px`,
              transition: 'height 0.1s ease-out'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AudioVisualizer;
