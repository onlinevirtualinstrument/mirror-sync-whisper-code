
import React, { createContext, useState, useContext, useEffect } from 'react';

interface AudioSettings {
  volume: number;
  equalizer: {
    bass: number;
    mid: number;
    treble: number;
  };
  showKeyLabels: boolean;
  showNoteLabels: boolean;
  highlightKeys: boolean;
  highlightNotes: boolean;
}

interface AudioSettingsContextType {
  settings: AudioSettings;
  updateVolume: (value: number) => void;
  updateEqualizer: (param: 'bass' | 'mid' | 'treble', value: number) => void;
  toggleKeyLabels: () => void;
  toggleNoteLabels: () => void;
  toggleHighlightKeys: () => void;
  toggleHighlightNotes: () => void;
}

const defaultSettings: AudioSettings = {
  volume: 80,
  equalizer: {
    bass: 50,
    mid: 50,
    treble: 50
  },
  showKeyLabels: true,
  showNoteLabels: false,
  highlightKeys: true,
  highlightNotes: false
};

const AudioSettingsContext = createContext<AudioSettingsContextType | undefined>(undefined);

export const AudioSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    // Load settings from localStorage if available
    try {
      const savedVolume = localStorage.getItem('violin-volume');
      const savedBass = localStorage.getItem('violin-eq-bass');
      const savedMid = localStorage.getItem('violin-eq-mid');
      const savedTreble = localStorage.getItem('violin-eq-treble');
      const savedKeyLabels = localStorage.getItem('violin-show-key-labels');
      const savedNoteLabels = localStorage.getItem('violin-show-note-labels');
      const savedHighlightKeys = localStorage.getItem('violin-highlight-keys');
      const savedHighlightNotes = localStorage.getItem('violin-highlight-notes');
      
      return {
        volume: savedVolume ? parseInt(savedVolume) : defaultSettings.volume,
        equalizer: {
          bass: savedBass ? parseInt(savedBass) : defaultSettings.equalizer.bass,
          mid: savedMid ? parseInt(savedMid) : defaultSettings.equalizer.mid,
          treble: savedTreble ? parseInt(savedTreble) : defaultSettings.equalizer.treble,
        },
        showKeyLabels: savedKeyLabels ? savedKeyLabels === 'true' : defaultSettings.showKeyLabels,
        showNoteLabels: savedNoteLabels ? savedNoteLabels === 'true' : defaultSettings.showNoteLabels,
        highlightKeys: savedHighlightKeys ? savedHighlightKeys === 'true' : defaultSettings.highlightKeys,
        highlightNotes: savedHighlightNotes ? savedHighlightNotes === 'true' : defaultSettings.highlightNotes,
      };
    } catch (error) {
      console.error('Error loading audio settings:', error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    // Save settings to localStorage whenever they change
    localStorage.setItem('violin-volume', settings.volume.toString());
    localStorage.setItem('violin-eq-bass', settings.equalizer.bass.toString());
    localStorage.setItem('violin-eq-mid', settings.equalizer.mid.toString());
    localStorage.setItem('violin-eq-treble', settings.equalizer.treble.toString());
    localStorage.setItem('violin-show-key-labels', settings.showKeyLabels.toString());
    localStorage.setItem('violin-show-note-labels', settings.showNoteLabels.toString());
    localStorage.setItem('violin-highlight-keys', settings.highlightKeys.toString());
    localStorage.setItem('violin-highlight-notes', settings.highlightNotes.toString());
    
    // Dispatch events for audio processing
    const volumeEvent = new CustomEvent('violin-volume-changed', { 
      detail: { volume: settings.volume / 100 }
    });
    document.dispatchEvent(volumeEvent);
    
    // Dispatch events for UI updates
    const keyLabelsEvent = new CustomEvent('violin-key-labels-changed', {
      detail: { enabled: settings.showKeyLabels }
    });
    document.dispatchEvent(keyLabelsEvent);
    
    const noteLabelsEvent = new CustomEvent('violin-note-labels-changed', {
      detail: { enabled: settings.showNoteLabels }
    });
    document.dispatchEvent(noteLabelsEvent);
    
    const highlightKeysEvent = new CustomEvent('violin-highlight-keys-changed', {
      detail: { enabled: settings.highlightKeys }
    });
    document.dispatchEvent(highlightKeysEvent);
    
    const highlightNotesEvent = new CustomEvent('violin-highlight-notes-changed', {
      detail: { enabled: settings.highlightNotes }
    });
    document.dispatchEvent(highlightNotesEvent);
    
  }, [settings]);

  const updateVolume = (value: number) => {
    setSettings(prev => ({
      ...prev,
      volume: value
    }));
  };

  const updateEqualizer = (param: 'bass' | 'mid' | 'treble', value: number) => {
    setSettings(prev => ({
      ...prev,
      equalizer: {
        ...prev.equalizer,
        [param]: value
      }
    }));
    
    // Dispatch EQ change event
    const eqEvent = new CustomEvent('violin-eq-changed', { 
      detail: { 
        param, 
        value: value / 50 // normalize around 1.0 for EQ adjustments
      } 
    });
    document.dispatchEvent(eqEvent);
  };

  const toggleKeyLabels = () => {
    setSettings(prev => ({
      ...prev,
      showKeyLabels: !prev.showKeyLabels
    }));
  };

  const toggleNoteLabels = () => {
    setSettings(prev => ({
      ...prev,
      showNoteLabels: !prev.showNoteLabels
    }));
  };

  const toggleHighlightKeys = () => {
    setSettings(prev => ({
      ...prev,
      highlightKeys: !prev.highlightKeys
    }));
  };

  const toggleHighlightNotes = () => {
    setSettings(prev => ({
      ...prev,
      highlightNotes: !prev.highlightNotes
    }));
  };

  return (
    <AudioSettingsContext.Provider value={{
      settings,
      updateVolume,
      updateEqualizer,
      toggleKeyLabels,
      toggleNoteLabels,
      toggleHighlightKeys,
      toggleHighlightNotes
    }}>
      {children}
    </AudioSettingsContext.Provider>
  );
};

export const useAudioSettings = () => {
  const context = useContext(AudioSettingsContext);
  if (context === undefined) {
    throw new Error('useAudioSettings must be used within an AudioSettingsProvider');
  }
  return context;
};
