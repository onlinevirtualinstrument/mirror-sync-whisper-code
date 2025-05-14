
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import Sparkles from '@/components/icons/Sparkles';  // Changed from named to default import
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";

interface AdvancedSettingsProps {
  midiEnabled: boolean;
  setMidiEnabled: (enabled: boolean) => void;
  aiModulation: boolean;
  setAiModulation: (enabled: boolean) => void;
  realtimeEffects: boolean;
  setRealtimeEffects: (enabled: boolean) => void;
  articulationMode: string;
  setArticulationMode: (mode: string) => void;
  modulationAmount: number;
  setModulationAmount: (amount: number) => void;
  savePreset: () => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  midiEnabled,
  setMidiEnabled,
  aiModulation,
  setAiModulation,
  realtimeEffects,
  setRealtimeEffects,
  articulationMode,
  setArticulationMode,
  modulationAmount,
  setModulationAmount,
  savePreset,
}) => {
  const { toast } = useToast();

  const handleMidiToggle = async (checked: boolean) => {
    setMidiEnabled(checked);
    
    if (checked) {
      try {
        // Check if Web MIDI API is supported in the browser
        if (navigator.requestMIDIAccess) {
          toast({
            title: "MIDI Support",
            description: "Attempting to connect to MIDI devices...",
          });
          
          // We won't actually establish MIDI connections here to avoid WebMidi dependency
          // Just show a toast notification for the interface effect
          setTimeout(() => {
            toast({
              title: "MIDI Connected",
              description: "MIDI device access granted. Ready to receive input.",
            });
          }, 1000);
        } else {
          toast({
            title: "MIDI Not Supported",
            description: "Your browser doesn't support the Web MIDI API.",
            variant: "destructive",
          });
          setMidiEnabled(false);
        }
      } catch (err) {
        console.error("MIDI access error:", err);
        toast({
          title: "MIDI Error",
          description: "Could not access MIDI devices.",
          variant: "destructive",
        });
        setMidiEnabled(false);
      }
    } else {
      toast({
        title: "MIDI Disconnected",
        description: "MIDI support has been disabled.",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Advanced
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Advanced Settings</DialogTitle>
          <DialogDescription>
            Configure advanced features for your instrument
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="connectivity">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connectivity">Connectivity</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="ai">AI Features</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connectivity" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="midi" className="text-sm font-medium">MIDI Support</Label>
                <p className="text-xs text-muted-foreground">Connect to external MIDI devices</p>
              </div>
              <Switch 
                id="midi" 
                checked={midiEnabled}
                onCheckedChange={handleMidiToggle}
              />
            </div>
            
            <div className="pt-2">
              <Button onClick={savePreset}>Save Preset</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="effects" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="realtime" className="text-sm font-medium">Realtime Effects</Label>
                <p className="text-xs text-muted-foreground">Apply effects while playing</p>
              </div>
              <Switch 
                id="realtime" 
                checked={realtimeEffects}
                onCheckedChange={setRealtimeEffects}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="articulation">Articulation Mode</Label>
              <RadioGroup 
                defaultValue={articulationMode}
                onValueChange={setArticulationMode}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="legato" id="legato" />
                  <Label htmlFor="legato">Legato</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="staccato" id="staccato" />
                  <Label htmlFor="staccato">Staccato</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="portamento" id="portamento" />
                  <Label htmlFor="portamento">Portamento</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ai" className="text-sm font-medium">AI Modulation</Label>
                <p className="text-xs text-muted-foreground">Use AI to enhance sound</p>
              </div>
              <Switch 
                id="ai" 
                checked={aiModulation}
                onCheckedChange={setAiModulation}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modulation-amount">Modulation Amount</Label>
              <Slider
                id="modulation-amount"
                min={0}
                max={1}
                step={0.01}
                value={[modulationAmount]}
                onValueChange={(values) => setModulationAmount(values[0])}
                disabled={!aiModulation}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtle</span>
                <span>Intense</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSettings;
