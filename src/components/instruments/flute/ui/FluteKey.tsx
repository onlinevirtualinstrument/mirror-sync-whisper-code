
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FluteNote } from '../utils/fluteData';

interface FluteKeyProps { 
  note: FluteNote;
  isActive: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  index: number;
  fluteType: string;
}

const FluteKey: React.FC<FluteKeyProps> = ({
  note, 
  isActive, 
  onMouseDown, 
  onMouseUp, 
  onTouchStart, 
  onTouchEnd, 
  onTouchMove, 
  index,
  fluteType
}) => {
  const getKeyClassName = () => {
    let className = "flute-key h-20 rounded-xl flex items-center justify-center shadow-subtle transition-all duration-150";
    
    if (isActive) {
      className += " text-white shadow-glow scale-95";
      
      switch(fluteType) {
        case 'western':
          className += " bg-blue-500/70";
          break;
        case 'bansuri':
          className += " bg-amber-600/70";
          break;
        case 'pan':
          className += " bg-teal-500/70";
          break;
        case 'native':
          className += " bg-red-700/70";
          break;
        default:
          className += " bg-primary/70";
      }
      
    } else {
      switch(fluteType) {
        case 'western':
          className += " bg-white/10 backdrop-blur-sm hover:bg-blue-500/30";
          break;
        case 'bansuri':
          className += " bg-amber-800/10 backdrop-blur-sm hover:bg-amber-600/30";
          break;
        case 'pan':
          className += " bg-teal-700/10 backdrop-blur-sm hover:bg-teal-500/30";
          break;
        case 'native':
          className += " bg-red-900/10 backdrop-blur-sm hover:bg-red-700/30";
          break;
        default:
          className += " bg-white/10 backdrop-blur-sm hover:bg-white/20";
      }
    }
    
    return className;
  };

  return (
    <motion.div
      key={index}
      className={getKeyClassName()}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="flex flex-col items-center">
        <span className="text-xl font-medium">{note.note}</span>
        {isActive && (
          <motion.div 
            className="w-4 h-4 mt-2 rounded-full bg-white/80"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ 
              scale: [0.8, 1.2, 0.8], 
              opacity: [0.5, 1, 0.5] 
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default memo(FluteKey);
