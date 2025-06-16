
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PianoTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const PianoTutorial: React.FC<PianoTutorialProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Piano Tutorial</DialogTitle>
          <DialogDescription>
            Learn how to play the virtual piano
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="font-medium text-lg">Getting Started</h3>
            <p className="text-sm text-gray-500 mt-1">
              Welcome to the virtual piano! This tutorial will help you learn how to use all the features.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">Keyboard Controls</h3>
            <p className="text-sm text-gray-500 mt-1">
              You can play notes using your computer keyboard. The middle row of your keyboard (A-S-D-F...) corresponds to the white keys, while the top row (W-E-T-Y-U...) corresponds to the black keys.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">Recording Your Music</h3>
            <p className="text-sm text-gray-500 mt-1">
              Use the recording controls to record your performance. Click "Start Recording", play your melody, then click "Stop Recording". You can then play back your recording or save it.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">Changing Octaves</h3>
            <p className="text-sm text-gray-500 mt-1">
              Use the "Octave Up" and "Octave Down" buttons to shift the range of notes you can play.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">Piano Settings</h3>
            <p className="text-sm text-gray-500 mt-1">
              In the Settings tab, you can adjust the volume, enable the metronome, change the sound type, and modify visual settings.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">Advanced Features</h3>
            <p className="text-sm text-gray-500 mt-1">
              The Advanced tab contains additional settings like MIDI input options and sound quality settings.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PianoTutorial;
