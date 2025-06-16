
import { toast } from 'sonner';

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
      // 800ms duration gives a more natural flowing sound when playing back recorded notes
      playNote(1, note, { 
        duration: 800,
        technique: 'normal',
        dynamic: 85,
        sustainAfterRelease: true
      });
      index++;
      // Use a slightly longer interval between notes (850ms) for proper phrasing
      setTimeout(playNextNote, 850);
    }
  };
  
  playNextNote();
  return true;
};

export const clearPlayedNotes = (): boolean => {
  toast.success('Notes cleared');
  return true;
};
