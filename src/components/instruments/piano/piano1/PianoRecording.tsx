
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Play, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import audioPlayer from '@/utils/music/audioPlayer';

interface PianoRecordingProps {
  isRecording: boolean;
  isPlaying: boolean;
  recording: Array<{ note: string; time: number }>;
  startRecording: () => void;
  stopRecording: () => void;
  playRecording: () => void;
}

const PianoRecording: React.FC<PianoRecordingProps> = ({
  isRecording,
  isPlaying,
  recording,
  startRecording,
  stopRecording,
  playRecording
}) => {
  const { toast } = useToast();

  const saveRecording = async () => {
    try {
      await audioPlayer.downloadRecordedNotesAsMP3('piano-melody.mp3');
      
      toast({
        title: "Recording Saved",
        description: "Your melody has been saved as an MP3 file",
      });
    } catch (error) {
      console.error("Error saving recording:", error);
      toast({
        title: "Error Saving",
        description: "Could not save recording. Try again or record a new melody.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex justify-center space-x-2 mb-4">
      {!isRecording && (
        <Button 
          onClick={startRecording}
          variant="outline"
          className="flex items-center space-x-1"
          disabled={isPlaying}
        >
          <Mic size={16} />
          <span>Start Recording</span>
        </Button>
      )}
      
      {isRecording && (
        <Button 
          onClick={stopRecording}
          variant="destructive"
          className="flex items-center space-x-1"
        >
          <span>Stop Recording</span>
        </Button>
      )}
      
      <Button 
        onClick={playRecording}
        variant="outline"
        className="flex items-center space-x-1"
        disabled={recording.length === 0 || isRecording || isPlaying}
      >
        <Play size={16} />
        <span>Play Recording</span>
      </Button>
      
      <Button 
        variant="outline"
        className="flex items-center space-x-1"
        disabled={recording.length === 0}
        onClick={saveRecording}
      >
        <Save size={16} />
        <span>Save</span>
      </Button>
    </div>
  );
};

export default PianoRecording;
