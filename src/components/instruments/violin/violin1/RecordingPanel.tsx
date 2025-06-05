import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ViolinSettings } from './types';
import { ViolinType } from './ViolinExperience';
import KeyboardAssist from './controls/KeyboardAssist';
import SoundSettings from './controls/SoundSettings';
import ViolinControlPanel from './ViolinControlPanel';

interface RecordingPanelProps {
  isRecording: boolean;
  isPaused: boolean;
  onRecordToggle: () => void;
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
  onSettingChange,
}) => {
  return (
    <div className="mt-6 flex flex-col">
      <div className="flex flex-wrap gap-4 justify-start md:justify-center lg:justify-start mb-4">

        {/* Violin Controls */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-xs font-medium">
              Controls
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Violin Controls</DialogTitle>
              <DialogDescription>
                Adjust these parameters to customize your violin's sound.
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

        {/* Keyboard Assist */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-xs font-medium">
              Key Assist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard Settings</DialogTitle>
              <DialogDescription>
                Customize keyboard display and input options.
              </DialogDescription>
            </DialogHeader>
            <KeyboardAssist isOpen={true} onClose={() => {}} />
          </DialogContent>
        </Dialog>

        {/* Sound Settings */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-xs font-medium">
              Sound
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sound Settings</DialogTitle>
              <DialogDescription>
                Adjust volume and audio parameters.
              </DialogDescription>
            </DialogHeader>
            <SoundSettings onClose={() => {}} />
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default RecordingPanel;
