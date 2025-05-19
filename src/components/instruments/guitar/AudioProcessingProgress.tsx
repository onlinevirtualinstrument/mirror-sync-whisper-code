
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface AudioProcessingProgressProps {
  isProcessing: boolean;
  progress: number;
  status: string;
}

const AudioProcessingProgress: React.FC<AudioProcessingProgressProps> = ({
  isProcessing,
  progress,
  status
}) => {
  if (!isProcessing) return null;
  
  return (
    <div className="w-full p-4 bg-black/5 dark:bg-white/5 rounded-lg my-2 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{status}</span>
        <span className="text-sm font-medium">{Math.round(progress * 100)}%</span>
      </div>
      <Progress value={progress * 100} className="h-2" />
    </div>
  );
};

export default AudioProcessingProgress;
