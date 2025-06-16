
import React from 'react';
import { Settings } from 'lucide-react';

interface GuitarSettingsProps {
  effects: {
    distortion: number;
    reverb: number;
    delay: number;
  };
  onEffectsChange: (effect: 'distortion' | 'reverb' | 'delay', value: number) => void;
  showEffects: boolean;
  onToggleEffects: () => void;
  tuning: string;
  onTuningChange: (tuning: string) => void;
  customTuning: string[];
  onCustomTuningChange: (tuning: string[]) => void;
  showNoteNames: boolean;
  onToggleNoteNames: () => void;
  showFretNumbers: boolean;
  onToggleFretNumbers: () => void;
  chordAssistMode: boolean;
  onToggleChordAssistMode: () => void;
  activeChord: string | null;
  onActiveChordChange: (chord: string) => void;
}

const GuitarSettings: React.FC<GuitarSettingsProps> = ({ 
  effects, 
  onEffectsChange,
  showEffects,
  onToggleEffects,
  tuning,
  onTuningChange,
  customTuning,
  onCustomTuningChange,
  showNoteNames,
  onToggleNoteNames,
  showFretNumbers,
  onToggleFretNumbers,
  chordAssistMode,
  onToggleChordAssistMode,
  activeChord,
  onActiveChordChange
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onToggleEffects}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Toggle effects panel"
      >
        <Settings className="w-4 h-4" />
      </button>
      
      {showEffects && (
        <div className="flex space-x-2">
          <div>
            <label htmlFor="distortion" className="text-xs">Distortion</label>
            <input
              type="range"
              id="distortion"
              min="0"
              max="100"
              value={effects.distortion}
              onChange={(e) => onEffectsChange('distortion', parseInt(e.target.value))}
              className="w-24"
            />
          </div>
          <div>
            <label htmlFor="reverb" className="text-xs">Reverb</label>
            <input
              type="range"
              id="reverb"
              min="0"
              max="100"
              value={effects.reverb}
              onChange={(e) => onEffectsChange('reverb', parseInt(e.target.value))}
              className="w-24"
            />
          </div>
          <div>
            <label htmlFor="delay" className="text-xs">Delay</label>
            <input
              type="range"
              id="delay"
              min="0"
              max="100"
              value={effects.delay}
              onChange={(e) => onEffectsChange('delay', parseInt(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
      )}
      
      <div className="flex space-x-2">
        <button
          className={`px-3 py-1 text-xs rounded ${showNoteNames ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={onToggleNoteNames}
        >
          Note Names
        </button>
        <button
          className={`px-3 py-1 text-xs rounded ${showFretNumbers ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={onToggleFretNumbers}
        >
          Fret Numbers
        </button>
        <button
          className={`px-3 py-1 text-xs rounded ${chordAssistMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={onToggleChordAssistMode}
        >
          Chord Assist
        </button>
      </div>
      
      {chordAssistMode && (
        <select 
          value={activeChord || ''}
          onChange={(e) => onActiveChordChange(e.target.value)}
          className="border px-2 py-1 text-xs rounded"
        >
          <option value="">Select Chord</option>
          <option value="C">C Major</option>
          <option value="G">G Major</option>
          <option value="D">D Major</option>
          <option value="A">A Major</option>
          <option value="E">E Major</option>
          <option value="Am">A Minor</option>
          <option value="Em">E Minor</option>
          <option value="Dm">D Minor</option>
        </select>
      )}
      
      <select
        value={tuning}
        onChange={(e) => onTuningChange(e.target.value)}
        className="border px-2 py-1 text-xs rounded"
      >
        <option value="standard">Standard</option>
        <option value="drop-d">Drop D</option>
        <option value="open-g">Open G</option>
        <option value="custom">Custom</option>
      </select>
    </div>
  );
};

export default GuitarSettings;
