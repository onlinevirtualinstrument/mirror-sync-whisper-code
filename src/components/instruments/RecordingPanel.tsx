
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Play, Download, Pause } from 'lucide-react';
import { toast } from 'sonner';
import audioPlayer from '@/utils/audioPlayer';

interface RecordingPanelProps {
  isRecording?: boolean;
  isPlaying?: boolean;
  recording?: Array<{ note: string; time: number }>;
  startRecording?: () => void;
  stopRecording?: () => void;
  playRecording?: () => void;
  instrumentType: 'piano' | 'guitar' | 'violin' | 'flute' | 'drum' | 'banjo' | 'trumpet' | 'saxophone' | 'sitar' | 'veena' | 'harmonica' | 'harp' | 'xylophone';
  className?: string;
}

const RecordingPanel: React.FC<RecordingPanelProps> = ({
  isRecording = false,
  isPlaying = false,
  recording = [],
  startRecording: propsStartRecording,
  stopRecording: propsStopRecording,
  playRecording: propsPlayRecording,
  instrumentType,
  className = ''
}) => {
  const [localIsRecording, setLocalIsRecording] = useState(isRecording);
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying);
  const [recordingList, setRecordingList] = useState(recording);
  
  // Use props functions if provided, otherwise use local implementations
  const startRecording = () => {
    if (propsStartRecording) {
      propsStartRecording();
    } else {
      audioPlayer.startPianoRecording(); // This could be adapted per instrument
      setLocalIsRecording(true);
      toast.success('Recording started');
    }
  };
  
  const stopRecording = () => {
    if (propsStopRecording) {
      propsStopRecording();
    } else {
      const recordedNotes = audioPlayer.stopPianoRecording();
      // Convert the recorded notes structure to match our expected format
      const formattedNotes = recordedNotes.map(note => ({
        note: note.note,
        time: note.startTime || 0
      }));
      
      setLocalIsRecording(false);
      setRecordingList(formattedNotes);
      toast.success(`Recording stopped - ${formattedNotes.length} notes recorded`);
    }
  };
  
  const playRecording = () => {
    if (propsPlayRecording) {
      propsPlayRecording();
    } else {
      const notesToPlay = recordingList.length > 0 
        ? recordingList 
        : audioPlayer.getRecordedNotes().map(note => ({
            note: note.note,
            time: note.startTime || 0
          }));
      
      if (notesToPlay.length === 0) {
        toast.error('No recording to play');
        return;
      }
      
      setLocalIsPlaying(true);
      audioPlayer.playRecordedNotes(() => {
        setLocalIsPlaying(false);
      });
      toast.success('Playing recording');
    }
  };
  
  const saveRecording = async () => {
    try {
      const filename = `${instrumentType}-melody.mp3`;
      await audioPlayer.downloadRecordedNotesAsMP3(filename);
      
      toast.success(`Recording saved as ${filename}`);
    } catch (error) {
      console.error("Error saving recording:", error);
      toast.error("Could not save recording. Please try again.");
    }
  };

  const hasRecordingToPlay = () => {
    if (recordingList.length > 0) return true;
    const existingRecording = audioPlayer.getRecordedNotes();
    return existingRecording.length > 0;
  };

  return (
    <div className={`flex justify-center space-x-2 mb-4 ${className}`}>
      {!localIsRecording ? (
        <Button 
          onClick={startRecording}
          variant="outline"
          className="flex items-center space-x-1"
          disabled={localIsPlaying}
        >
          <Mic size={16} />
          <span>Start Recording</span>
        </Button>
      ) : (
        <Button 
          onClick={stopRecording}
          variant="destructive"
          className="flex items-center space-x-1"
        >
          <Pause size={16} />
          <span>Stop Recording</span>
        </Button>
      )}
      
      <Button 
        onClick={playRecording}
        variant="outline"
        className="flex items-center space-x-1"
        disabled={!hasRecordingToPlay() || localIsRecording || localIsPlaying}
      >
        <Play size={16} />
        <span>Play Recording</span>
      </Button>
      
      <Button 
        variant="outline"
        className="flex items-center space-x-1"
        disabled={!hasRecordingToPlay()}
        onClick={saveRecording}
      >
        <Download size={16} />
        <span>Save</span>
      </Button>
    </div>
  );
};

export default RecordingPanel;
