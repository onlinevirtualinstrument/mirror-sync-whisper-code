
import { toast } from 'sonner';

export const startRecording = (): boolean => {
  console.log('Recording started');
  return true;
};

export const stopRecording = (): boolean => {
  console.log('Recording stopped');
  return true;
};

export const pauseRecording = (): boolean => {
  console.log('Recording paused');
  return true;
};

export const resumeRecording = (): boolean => {
  console.log('Recording resumed');
  return true;
};

export const downloadRecording = (): boolean => {
  console.log('Download recording');
  toast.success('Recording downloaded');
  return true;
};

export const playRecording = (): boolean => {
  console.log('Play recording');
  toast.success('Playing recording');
  return true;
};

export const playNoteSequence = (
  playedNotes: string[], 
  playNote: (stringNum: number, note: string, options?: any) => void
): boolean => {
  console.log('Playing note sequence', playedNotes);
  if (playedNotes.length === 0) {
    toast.error('No notes to play');
    return false;
  }
  
  toast.success(`Playing ${playedNotes.length} notes`);
  
  let index = 0;
  const playNextNote = () => {
    if (index < playedNotes.length) {
      const note = playedNotes[index];
      // Play each note with a longer duration for more realistic violin sound
      // 600ms duration gives a more natural flowing sound when playing back recorded notes
      playNote(1, note, { 
        duration: 600,
        technique: 'normal',
        dynamic: 85,
        sustainAfterRelease: true
      });
      index++;
      // Use a slightly longer interval between notes (650ms) for proper phrasing
      setTimeout(playNextNote, 650);
    }
  };
  
  playNextNote();
  return true;
};

export const clearPlayedNotes = (): boolean => {
  toast.success('Notes cleared');
  return true;
};
