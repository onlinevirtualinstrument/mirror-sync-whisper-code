
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Music, X, BookOpen, Download } from 'lucide-react';

interface NoteDisplay {
  string: number;
  fret: number;
  time: number;
}

interface NotesPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: NoteDisplay[];
  onClose: () => void;
}

const NotesPopup: React.FC<NotesPopupProps> = ({ open, onOpenChange, notes, onClose }) => {
  // Convert time (seconds) to a more readable format (mm:ss)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Function to get string name 
  const getStringName = (stringIndex: number): string => {
    const stringNames = ['E', 'A', 'D', 'G', 'B', 'E'];
    // Ensure we don't try to access outside the array bounds
    return stringIndex >= 0 && stringIndex < stringNames.length 
      ? stringNames[stringIndex] 
      : `String ${stringIndex + 1}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg animate-in fade-in zoom-in duration-300">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Music className="h-5 w-5 text-purple-500" /> 
            Generated Notes
          </DialogTitle>
          <DialogDescription>
            {notes.length} notes were generated from your song.
            <span className="block mt-1 text-xs opacity-70">
              These can be played with the "Play with Guitar" button.
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground mb-2 px-2">
            <div>Time</div>
            <div>String</div>
            <div>Fret</div>
          </div>
          
          <div className="space-y-1">
            {notes.map((note, index) => (
              <div 
                key={index}
                className="grid grid-cols-3 p-2 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                style={{ 
                  animation: `fadeInSlide 0.3s ease-out ${index * 0.02}s both` 
                }}
              >
                <div>{formatTime(note.time)}</div>
                <div className="flex items-center gap-1">
                  <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full flex items-center justify-center text-xs">
                    {getStringName(note.string)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs">
                    {note.fret}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <style>
          {`
            @keyframes fadeInSlide {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
        
        <DialogFooter className="flex gap-2 flex-row sm:justify-between">
          <div className="text-xs text-muted-foreground">
            Note: Click "Play with Guitar" in the main interface to hear these notes
          </div>
          <Button 
            onClick={onClose}
            className="w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotesPopup;
