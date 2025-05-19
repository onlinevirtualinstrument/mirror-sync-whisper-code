
import React from 'react';
import { motion } from 'framer-motion';

interface FluteNoteInfoProps {
  isHolding: boolean;
  activeNote: string | null;
  touchIntensity: number;
}

const FluteNoteInfo: React.FC<FluteNoteInfoProps> = ({ isHolding, activeNote, touchIntensity }) => {
  if (!isHolding || !activeNote) {
    return null;
  }

  return (
    <motion.div 
      className="mt-4 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="text-sm">
        <span className="font-medium">Current note:</span> {activeNote}
        {touchIntensity > 0 && (
          <span className="ml-2 opacity-70">
            Intensity: {Math.round(touchIntensity * 100)}%
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default FluteNoteInfo;
