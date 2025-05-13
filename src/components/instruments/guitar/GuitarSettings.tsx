
import React, { useState } from 'react';
import { Settings, Sliders, Music, HelpCircle, BookOpen, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarLabel } from '@/components/ui/menubar';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import TutorialContent from './TutorialContent';

type TuningType = 'standard' | 'drop-d' | 'open-g' | 'custom';

interface GuitarSettingsProps {
  effects: {
    distortion: number;
    reverb: number;
    delay: number;
  };
  onEffectsChange: (effect: keyof GuitarSettingsProps['effects'], value: number) => void;
  showEffects: boolean;
  onToggleEffects: () => void;
  tuning: string;
  onTuningChange: (tuning: string) => void;
  customTuning: string[];
  onCustomTuningChange: (strings: string[]) => void;
  showNoteNames: boolean;
  onToggleNoteNames: () => void;
  showFretNumbers: boolean;
  onToggleFretNumbers: () => void;
  chordAssistMode: boolean;
  onToggleChordAssistMode: () => void;
  activeChord?: string | null;
  onActiveChordChange?: (chord: string) => void;
  availableChords?: Record<string, { string: number; fret: number }[]>;
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
  onActiveChordChange,
  availableChords = {}
}) => {
  const { toast } = useToast();
  const [showTuningDialog, setShowTuningDialog] = useState(false);
  const [tempCustomTuning, setTempCustomTuning] = useState<string[]>([...customTuning]);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const handleEffectChange = (effect: keyof typeof effects, value: number[]) => {
    onEffectsChange(effect, value[0]);
  };
  
  const handleCustomTuningChange = (index: number, note: string) => {
    const newTuning = [...tempCustomTuning];
    newTuning[index] = note;
    setTempCustomTuning(newTuning);
  };
  
  // Reset tempCustomTuning when the dialog opens
  const openTuningDialog = () => {
    setTempCustomTuning([...customTuning]);
    setShowTuningDialog(true);
  };
  
  const saveCustomTuning = () => {
    onCustomTuningChange(tempCustomTuning);
    setShowTuningDialog(false);
    onTuningChange('custom');
    toast({
      title: "Custom Tuning Saved",
      description: "Your custom tuning has been applied to the guitar.",
    });
  };
  
  const openTutorial = () => {
    setShowTutorial(true);
    toast({
      title: "Tutorial Opened",
      description: "Learn how to play the virtual guitar!",
    });
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };
  
  // All available notes for custom tuning
  const availableNotes = [
    'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1',
    'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
    'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
    'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  ];
  
  return (
    <div className="flex items-center gap-2">
      {/* Settings Menubar */}
      <Menubar className="border-none bg-transparent">
        <MenubarMenu>
          <MenubarTrigger className="bg-white/80 hover:bg-black/5 p-2 rounded-full">
            <Settings className="h-4 w-4" />
          </MenubarTrigger>
          
          <MenubarContent className="w-80">
            <MenubarLabel>Guitar Settings</MenubarLabel>
            
            <MenubarSeparator />
            
            <div className="p-3">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Distortion</span>
                  <span className="text-xs text-muted-foreground">{effects.distortion}%</span>
                </div>
                <Slider
                  value={[effects.distortion]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleEffectChange('distortion', value)}
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Reverb</span>
                  <span className="text-xs text-muted-foreground">{effects.reverb}%</span>
                </div>
                <Slider
                  value={[effects.reverb]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleEffectChange('reverb', value)}
                />
              </div>
              
              <div className="mb-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Delay</span>
                  <span className="text-xs text-muted-foreground">{effects.delay}%</span>
                </div>
                <Slider
                  value={[effects.delay]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleEffectChange('delay', value)}
                />
              </div>
            </div>
            
            <MenubarSeparator />
            
            <MenubarLabel>Tuning</MenubarLabel>
            <MenubarRadioGroup value={tuning}>
              <MenubarRadioItem value="standard" onClick={() => onTuningChange('standard')}>
                Standard (E A D G B E)
              </MenubarRadioItem>
              <MenubarRadioItem value="drop-d" onClick={() => onTuningChange('drop-d')}>
                Drop D (D A D G B E)
              </MenubarRadioItem>
              <MenubarRadioItem value="open-g" onClick={() => onTuningChange('open-g')}>
                Open G (D G D G B D)
              </MenubarRadioItem>
              <MenubarRadioItem value="custom" onClick={openTuningDialog}>
                Custom Tuning...
              </MenubarRadioItem>
            </MenubarRadioGroup>
            
            <MenubarSeparator />
            
            <MenubarCheckboxItem 
              checked={showNoteNames}
              onCheckedChange={onToggleNoteNames}
            >
              Show Note Names
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={showFretNumbers}
              onCheckedChange={onToggleFretNumbers}
            >
              Show Fret Numbers
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={chordAssistMode}
              onCheckedChange={onToggleChordAssistMode}
            >
              Chord Assist Mode
            </MenubarCheckboxItem>
            
            {chordAssistMode && onActiveChordChange && Object.keys(availableChords).length > 0 && (
              <>
                <MenubarSeparator />
                <MenubarLabel>Available Chords</MenubarLabel>
                <div className="p-2 max-h-40 overflow-y-auto">
                  {Object.keys(availableChords).map((chord) => (
                    <Button
                      key={chord}
                      size="sm"
                      variant={activeChord === chord ? "default" : "ghost"}
                      className="m-1 text-xs"
                      onClick={() => onActiveChordChange(chord)}
                    >
                      {chord}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      
      {/* Tutorial Button */}
      <Button 
        variant="outline"
        size="icon"
        className="bg-white/80 hover:bg-black/5 p-2 rounded-full transform transition-all hover:scale-110"
        onClick={openTutorial}
      >
        <BookOpen className="h-4 w-4" />
      </Button>
      
      {/* Custom Tuning Dialog */}
      <Dialog open={showTuningDialog} onOpenChange={setShowTuningDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Custom Tuning</DialogTitle>
            <DialogDescription>
              Select the notes for each string from high (1) to low (6)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {tempCustomTuning.map((note, index) => (
              <div key={index} className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <span className="text-sm font-medium">String {tempCustomTuning.length - index}:</span>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                  value={note}
                  onChange={(e) => handleCustomTuningChange(index, e.target.value)}
                >
                  {availableNotes.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowTuningDialog(false)}>Cancel</Button>
            <Button onClick={saveCustomTuning} className="animate-pulse">Save Tuning</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Tutorial Dialog */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center">
              <span className="flex-1">Learn to Play: Virtual Guitar Tutorial</span>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
            <DialogDescription>
              Master the virtual guitar with these simple step-by-step instructions
            </DialogDescription>
          </DialogHeader>
          
          <TutorialContent onClose={closeTutorial} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuitarSettings;
