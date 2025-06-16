
import React from 'react';
import { ViolinNoteDisplayProps } from '../types';

const ViolinNoteDisplay: React.FC<ViolinNoteDisplayProps> = ({
  isEditingNotes,
  displayNotes,
  onNotesChange
}) => {
  return (
    <div className="text-green-300 text-xs overflow-hidden w-[60%] flex-1 relative">
      {isEditingNotes ? (
        <input 
          type="text" 
          value={displayNotes} 
          onChange={onNotesChange}
          className="w-full bg-black/30 rounded text-green-300 text-xs border-none outline-none px-2 py-1"
        />
      ) : (
        <div className="whitespace-nowrap overflow-x-auto scrollbar-none px-2 py-1">
          {displayNotes || "Play some notes to see them here"}
        </div>
      )}
    </div>
  );
};

export default ViolinNoteDisplay;
