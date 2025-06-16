
import React from 'react';
import { Button } from '@/components/ui/button';
import { StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MelodyStopButtonProps {
  isGeneratingMelody: boolean;
  onStopMelody: () => void;
}

const MelodyStopButton: React.FC<MelodyStopButtonProps> = ({
  isGeneratingMelody,
  onStopMelody,
}) => {
  if (!isGeneratingMelody) return null;
  
  return (
    <Button
      onClick={onStopMelody}
      variant="destructive"
      size="sm"
      className={cn(
        "flex items-center gap-1 px-4 py-2 rounded-full animate-pulse bg-red-600 hover:bg-red-700 text-white",
        "border-none shadow-lg transition-all shadow-red-600/20"
      )}
    >
      <StopCircle size={16} />
      <span>Stop Melody</span>
    </Button>
  );
};

export default MelodyStopButton;
