
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ViolinSettings } from './types';
import { ViolinType } from './ViolinExperience';
import KeyboardAssist from './controls/KeyboardAssist';
import SoundSettings from './controls/SoundSettings';
import ViolinControlPanel from './ViolinControlPanel';

interface RecordingPanelProps {
  isRecording: boolean;
  isPaused: boolean;
  onRecordToggle: () => void;
  // onTutorialToggle: () => void;
  onPlayToggle: () => void;
  isPlaying: boolean;
  settings: ViolinSettings;
  onSettingChange: (setting: keyof ViolinSettings, value: number) => void;
  selectedViolinType: ViolinType;
  onTypeChange: (type: ViolinType) => void;
  recordingComplete: boolean;
  recordingDuration: number;
  onDownloadRecording: () => boolean;
  onPlayRecording: () => boolean;
  playedNotes: string[];
  stopNote: () => void;
}

const RecordingPanel: React.FC<RecordingPanelProps> = ({
  settings,
  onSettingChange
}) => {
  const [showKeyAssist, setShowKeyAssist] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-4">
       <div>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="m-5"
            >
              <span className="text-xs font-medium">Controls</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Violin Controls</DialogTitle>
              <DialogDescription>
                Adjust these parameters to customize your violin's sound
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ViolinControlPanel 
                settings={settings} 
                onSettingChange={onSettingChange}
              />
            </div>
          </DialogContent>
        </Dialog>
          
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="m-5"
            >
              <span className="text-xs font-medium">Key Assist</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard Settings</DialogTitle>
              <DialogDescription>
                Customize keyboard display and input options
              </DialogDescription>
            </DialogHeader>
            <KeyboardAssist isOpen={true} onClose={() => setShowKeyAssist(false)} />
          </DialogContent>
        </Dialog>
          
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="m-5"
            >
              <span className="text-xs font-medium">Sound</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sound Settings</DialogTitle>
              <DialogDescription>
                Adjust volume and audio parameters
              </DialogDescription>
            </DialogHeader>
            <SoundSettings onClose={() => setShowSoundSettings(false)} />
          </DialogContent>
        </Dialog>
        </div>
        <div>



        </div>
      </div>
    </div>
  );
};

export default RecordingPanel;
