
import React, { useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAudioSettings } from '../contexts/AudioSettingsContext';
import { toast } from 'sonner';

interface KeyAssistControllerProps {
  className?: string;
}

const KeyAssistController: React.FC<KeyAssistControllerProps> = ({ className }) => {
  const { 
    settings,
    toggleKeyLabels,
    toggleNoteLabels,
    toggleHighlightKeys,
    toggleHighlightNotes 
  } = useAudioSettings();

  // Apply highlight settings to DOM elements
  useEffect(() => {
    const keyboardKeys = document.querySelectorAll('.violin-key');
    const noteLabels = document.querySelectorAll('.note-label');
    
    // Apply highlight keys setting
    keyboardKeys.forEach(key => {
      if (settings.highlightKeys) {
        key.classList.add('highlight-enabled');
      } else {
        key.classList.remove('highlight-enabled');
      }
    });
    
    // Apply highlight notes setting
    noteLabels.forEach(label => {
      if (settings.highlightNotes) {
        label.classList.add('highlight-enabled');
      } else {
        label.classList.remove('highlight-enabled');
      }
    });
  }, [settings.highlightKeys, settings.highlightNotes]);

  // Apply label settings to DOM elements
  useEffect(() => {
    const keyLabels = document.querySelectorAll('.key-label');
    const noteLabels = document.querySelectorAll('.note-label');
    
    // Apply key labels setting
    keyLabels.forEach(label => {
      if (settings.showKeyLabels) {
        label.classList.add('visible');
        label.classList.remove('hidden');
      } else {
        label.classList.add('hidden');
        label.classList.remove('visible');
      }
    });
    
    // Apply note labels setting
    noteLabels.forEach(label => {
      if (settings.showNoteLabels) {
        label.classList.add('visible');
        label.classList.remove('hidden');
      } else {
        label.classList.add('hidden');
        label.classList.remove('visible');
      }
    });
  }, [settings.showKeyLabels, settings.showNoteLabels]);

  const handleKeyLabelsChange = () => {
    toggleKeyLabels();
    toast.success(`Key labels ${!settings.showKeyLabels ? 'enabled' : 'disabled'}`);
  };

  const handleNoteLabelsChange = () => {
    toggleNoteLabels();
    toast.success(`Note labels ${!settings.showNoteLabels ? 'enabled' : 'disabled'}`);
  };

  const handleHighlightKeysChange = () => {
    toggleHighlightKeys();
    toast.success(`Key highlighting ${!settings.highlightKeys ? 'enabled' : 'disabled'}`);
  };

  const handleHighlightNotesChange = () => {
    toggleHighlightNotes();
    toast.success(`Note highlighting ${!settings.highlightNotes ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-sm font-medium mb-3">Keyboard Assistance</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="key-labels" className="text-sm">Show Key Labels</Label>
          <Switch 
            id="key-labels"
            checked={settings.showKeyLabels}
            onCheckedChange={handleKeyLabelsChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="note-labels" className="text-sm">Show Note Labels</Label>
          <Switch 
            id="note-labels"
            checked={settings.showNoteLabels}
            onCheckedChange={handleNoteLabelsChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="highlight-keys" className="text-sm">Highlight Keys</Label>
          <Switch 
            id="highlight-keys"
            checked={settings.highlightKeys}
            onCheckedChange={handleHighlightKeysChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="highlight-notes" className="text-sm">Highlight Notes</Label>
          <Switch 
            id="highlight-notes"
            checked={settings.highlightNotes}
            onCheckedChange={handleHighlightNotesChange}
          />
        </div>
      </div>
    </div>
  );
};

export default KeyAssistController;
