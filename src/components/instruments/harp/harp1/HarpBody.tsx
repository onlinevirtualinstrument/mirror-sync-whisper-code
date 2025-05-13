
import React from 'react';
import { HarpString } from './HarpAudio';

interface HarpBodyProps {
  harpVariant: string;
  strings: HarpString[];
  activeString: string | null;
  onStringClick: (stringId: string) => void;
}

export const HarpBody: React.FC<HarpBodyProps> = ({
  harpVariant,
  strings,
  activeString,
  onStringClick
}) => {
  // Get style classes based on variant
  const getStyleClasses = () => {
    switch(harpVariant) {
      case 'celtic':
        return {
          card: 'from-green-50/30 to-green-100/40 border-green-200/50',
          frameLeft: 'from-green-700 to-green-900',
          frameBottom: 'from-green-700 to-green-800',
          button: 'bg-green-100 hover:bg-green-200'
        };
      case 'concert':
        return {
          card: 'from-yellow-50/30 to-yellow-100/40 border-yellow-200/50',
          frameLeft: 'from-yellow-700 to-yellow-900',
          frameBottom: 'from-yellow-700 to-yellow-800',
          button: 'bg-yellow-100 hover:bg-yellow-200'
        };
      case 'classical':
        return {
          card: 'from-amber-50/30 to-amber-100/40 border-amber-200/50',
          frameLeft: 'from-amber-800 to-amber-950',
          frameBottom: 'from-amber-800 to-amber-900',
          button: 'bg-amber-100 hover:bg-amber-200'
        };
      default:
        return {
          card: 'from-blue-50/30 to-blue-100/40 border-blue-200/50',
          frameLeft: 'from-blue-700 to-blue-900',
          frameBottom: 'from-blue-700 to-blue-800',
          button: 'bg-blue-100 hover:bg-blue-200'
        };
    }
  };
  
  const styles = getStyleClasses();

  return (
    <div className={`glass-card p-8 rounded-xl backdrop-blur-sm bg-gradient-to-br ${styles.card} border shadow-xl`}>
      <div className="relative w-full h-80 flex justify-center">
        <div className="relative w-56 h-full">
          <div className={`absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-b ${styles.frameLeft} rounded-t-lg shadow-md`}></div>
          <div className={`absolute left-0 bottom-0 w-40 h-12 bg-gradient-to-r ${styles.frameBottom} rounded-r-lg shadow-md`}></div>
          
          {strings.map((string, i) => (
            <div 
              key={i}
              className={`absolute cursor-pointer transition-all ${
                activeString === string.id 
                  ? 'animate-[pulse_0.5s_ease-in-out] bg-accent shadow-accent/50'
                  : 'bg-amber-200 hover:bg-accent/70'
              } shadow-sm`}
              style={{ 
                left: `${20 + i * 12}px`,
                height: `${string.length + 130}px`,
                width: activeString === string.id ? '2px' : '1px',
                bottom: '48px',
                transform: `rotate(${5 + i}deg)`,
                transformOrigin: 'bottom center'
              }}
              onClick={() => onStringClick(string.id)}
            >
              <span className="absolute -bottom-10 -left-2 text-xs font-medium">{string.note}</span>
              <span className="absolute -top-10 -left-2 text-xs text-muted-foreground">{string.key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
