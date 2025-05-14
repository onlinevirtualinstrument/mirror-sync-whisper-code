
import React, { useState } from 'react';
import VirtualGuitarComponent from './VirtualGuitarComponent';
import { GuitarType } from './GuitarSoundProfiles';
import RecordingPanel from '../RecordingPanel';
import audioPlayer from '@/utils/audioPlayer';

interface VirtualGuitarProps {
  initialGuitarType?: GuitarType;
  className?: string;
}

const VirtualGuitar: React.FC<VirtualGuitarProps> = ({ 
  initialGuitarType = 'acoustic',
  className 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handleStartRecording = () => {
    audioPlayer.startPianoRecording(); // Using piano recording for now, could be adapted
    setIsRecording(true);
  };
  
  const handleStopRecording = () => {
    audioPlayer.stopPianoRecording();
    setIsRecording(false);
  };
  
  const handlePlayRecording = () => {
    setIsPlaying(true);
    audioPlayer.playRecordedNotes(() => {
      setIsPlaying(false);
    });
    return true;
  };
  
  return (
    <div className="virtual-guitar-wrapper">
      <RecordingPanel 
        isRecording={isRecording}
        isPlaying={isPlaying}
        startRecording={handleStartRecording}
        stopRecording={handleStopRecording}
        playRecording={handlePlayRecording}
        instrumentType="guitar"
      />
      <VirtualGuitarComponent 
        className={className}
      />
    </div>
  );
};

export default VirtualGuitar;
