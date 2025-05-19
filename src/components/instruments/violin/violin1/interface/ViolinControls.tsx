
import React from 'react';
import { Button } from '@/components/ui/button';
import { PauseCircle, Play, StopCircle, Pencil, Square, Music } from 'lucide-react';

interface ViolinControlsProps {
  isPlayingSequence: boolean;
  setIsPlayingSequence: React.Dispatch<React.SetStateAction<boolean>>;
  handleToggleEdit: () => void;
  handleClearNotes: () => void;
  handlePlaySequence: () => void;
  hasNotes: boolean;
}

const ViolinControls: React.FC<ViolinControlsProps> = ({
  isPlayingSequence,
  setIsPlayingSequence,
  handleToggleEdit,
  handleClearNotes,
  handlePlaySequence,
  hasNotes
}) => {
  // Handle the stop action directly to ensure it works correctly
  const handleStopSequence = () => {
    setIsPlayingSequence(false);
  };

  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-yellow-100 hover:bg-yellow-100/10"
        onClick={handleToggleEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-yellow-100 hover:bg-yellow-100/10"
        onClick={handleClearNotes}
        disabled={!hasNotes}
      >
        <Square className="h-4 w-4" />
      </Button>
      
      {isPlayingSequence ? (
        <Button
          variant="ghost" 
          size="icon"
          className="h-6 w-6 text-yellow-100 hover:bg-yellow-100/10"
          onClick={handleStopSequence}
        >
          <StopCircle className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-yellow-100 hover:bg-yellow-100/10"
          onClick={handlePlaySequence}
          disabled={!hasNotes}
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ViolinControls;
