
import { ReactNode, ChangeEvent } from 'react';
import { ViolinType } from './ViolinExperience';

export interface ViolinSettings {
  bowPressure: number;
  bowSpeed: number;
  vibrato: number;
  reverb: number;
  stringTension: number;
}

export interface MelodyGeneratorProps {
  isGenerating: boolean;
  violinType: ViolinType;
  onStop: () => void;
  playNote: (stringNum: number, note: string, options?: any) => void;
  stopNote: () => void;
  clearPlayedNotes: () => void;
  setActiveString: (stringNum: number | null) => void;
  isReady: boolean;
}

export interface ViolinNoteDisplayProps {
  isEditingNotes: boolean;
  displayNotes: string;
  onNotesChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface ViolinInterfaceProps {
  violinType: ViolinType;
  activeString: number | null;
  onStringPlay: (stringNumber: number, noteName: string) => void;
  bowPressure: number;
  bowSpeed: number;
  playedNotes: string[];
  onPlaySequence: () => boolean;
  onClearNotes: () => void;
  isGeneratingMelody?: boolean;
  onGenerateMelody?: () => void;
  onStopMelody?: () => void;
}
