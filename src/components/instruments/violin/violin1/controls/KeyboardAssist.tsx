
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface KeyAssistProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardAssist: React.FC<KeyAssistProps> = ({ isOpen, onClose }) => {
  const [showKeyLabels, setShowKeyLabels] = useState(true);
  const [showNoteLabels, setShowNoteLabels] = useState(true);
  const [highlightKeys, setHighlightKeys] = useState(true);
  const [highlightNotes, setHighlightNotes] = useState(true);
  
  // Load settings from localStorage when component opens
  useEffect(() => {
    if (isOpen) {
      const loadSettings = () => {
        const keyLabels = localStorage.getItem('violin-key-labels');
        const noteLabels = localStorage.getItem('violin-note-labels');
        const keyHighlights = localStorage.getItem('violin-highlight-keys');
        const noteHighlights = localStorage.getItem('violin-highlight-notes');
        
        setShowKeyLabels(keyLabels === null ? true : keyLabels === 'true');
        setShowNoteLabels(noteLabels === null ? true : noteLabels === 'true');
        setHighlightKeys(keyHighlights === null ? true : keyHighlights === 'true');
        setHighlightNotes(noteHighlights === null ? true : noteHighlights === 'true');
      };
      
      loadSettings();
    }
  }, [isOpen]);
  
  // Initialize localStorage with default values if they don't exist
  useEffect(() => {
    if (localStorage.getItem('violin-key-labels') === null) {
      localStorage.setItem('violin-key-labels', 'true');
    }
    if (localStorage.getItem('violin-note-labels') === null) {
      localStorage.setItem('violin-note-labels', 'true');
    }
    if (localStorage.getItem('violin-highlight-keys') === null) {
      localStorage.setItem('violin-highlight-keys', 'true');
    }
    if (localStorage.getItem('violin-highlight-notes') === null) {
      localStorage.setItem('violin-highlight-notes', 'true');
    }
  }, []);
  
  const handleToggleOption = (option: string, value: boolean) => {
    switch(option) {
      case 'keyLabels':
        setShowKeyLabels(value);
        localStorage.setItem('violin-key-labels', String(value));
        break;
      case 'noteLabels':
        setShowNoteLabels(value);
        localStorage.setItem('violin-note-labels', String(value));
        break;
      case 'highlightKeys':
        setHighlightKeys(value);
        localStorage.setItem('violin-highlight-keys', String(value));
        break;
      case 'highlightNotes':
        setHighlightNotes(value);
        localStorage.setItem('violin-highlight-notes', String(value));
        break;
    }
    
    toast.success(`${option.charAt(0).toUpperCase() + option.slice(1)} ${value ? 'enabled' : 'disabled'}`);
    
    // Dispatch custom event to notify other components about settings change
    const event = new CustomEvent('violin-settings-changed', { 
      detail: { option, value } 
    });
    document.dispatchEvent(event);
  };
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Keyboard Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="key-labels">Show Key Labels</Label>
          <Switch 
            id="key-labels" 
            checked={showKeyLabels} 
            onCheckedChange={(value) => handleToggleOption('keyLabels', value)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="note-labels">Show Note Labels</Label>
          <Switch 
            id="note-labels" 
            checked={showNoteLabels} 
            onCheckedChange={(value) => handleToggleOption('noteLabels', value)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="highlight-keys">Highlight Keys</Label>
          <Switch 
            id="highlight-keys" 
            checked={highlightKeys} 
            onCheckedChange={(value) => handleToggleOption('highlightKeys', value)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="highlight-notes">Highlight Notes</Label>
          <Switch 
            id="highlight-notes" 
            checked={highlightNotes} 
            onCheckedChange={(value) => handleToggleOption('highlightNotes', value)}
          />
        </div>
      </div>
      
      <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">1-9</span>: Lower octave
          </div>
          <div>
            <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">Q-P</span>: Middle octave
          </div>
          <div>
            <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">A-L</span>: Higher octave
          </div>
          <div>
            <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">Shift+Key</span>: Sharp notes
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardAssist;
