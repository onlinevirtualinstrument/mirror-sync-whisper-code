
import { useState } from 'react';
import { Settings, Smartphone, Monitor, Globe, Sliders } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

export function UserSettings() {
  const { mode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    enableSounds: true,
    enableAnimations: true,
    enableTutorials: true,
    enableGestures: true,
    textSize: 1, // 0.8 to 1.2
    animationSpeed: 1, // 0.5 to 1.5
    saveHistory: true,
    dataUsage: 'medium', // low, medium, high
  });
  
  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify({
      ...settings,
      [key]: value
    }));
  };
  
  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
        
        <DialogContent className={`sm:max-w-[500px] p-0 overflow-hidden rounded-xl ${mode === 'dark' ? 'dark' : ''} animate-scale-in`}>
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-semibold flex items-center">
              <Settings className="mr-2 h-5 w-5" /> Settings
            </DialogTitle>
            <DialogDescription>
              Customize your HarmonyHub experience
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="px-6">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Instrument Sounds</Label>
                  <p className="text-sm text-muted-foreground">Play audio when viewing instruments</p>
                </div>
                <Switch 
                  checked={settings.enableSounds}
                  onCheckedChange={(checked) => updateSetting('enableSounds', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Animations</Label>
                  <p className="text-sm text-muted-foreground">Show smooth animations throughout the app</p>
                </div>
                <Switch 
                  checked={settings.enableAnimations}
                  onCheckedChange={(checked) => updateSetting('enableAnimations', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Tutorial Hints</Label>
                  <p className="text-sm text-muted-foreground">Show helpful tips while using the app</p>
                </div>
                <Switch 
                  checked={settings.enableTutorials}
                  onCheckedChange={(checked) => updateSetting('enableTutorials', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Gesture Navigation</Label>
                  <p className="text-sm text-muted-foreground">Navigate using swipe gestures</p>
                </div>
                <Switch 
                  checked={settings.enableGestures}
                  onCheckedChange={(checked) => updateSetting('enableGestures', checked)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-base">Text Size</Label>
                <p className="text-sm text-muted-foreground mb-2">Adjust the size of text throughout the app</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm">A</span>
                  <Slider 
                    value={[settings.textSize]}
                    min={0.8}
                    max={1.2}
                    step={0.05}
                    onValueChange={([value]) => updateSetting('textSize', value)}
                    className="flex-1"
                  />
                  <span className="text-base font-semibold">A</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-base">Animation Speed</Label>
                <p className="text-sm text-muted-foreground mb-2">Adjust how quickly animations play</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Slower</span>
                  <Slider 
                    value={[settings.animationSpeed]}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    onValueChange={([value]) => updateSetting('animationSpeed', value)}
                    className="flex-1"
                  />
                  <span className="text-sm">Faster</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Save Browsing History</Label>
                  <p className="text-sm text-muted-foreground">Remember instruments you've viewed</p>
                </div>
                <Switch 
                  checked={settings.saveHistory}
                  onCheckedChange={(checked) => updateSetting('saveHistory', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-base">Data Usage</Label>
                <p className="text-sm text-muted-foreground mb-2">Choose how much data the app uses</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={settings.dataUsage === 'low' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => updateSetting('dataUsage', 'low')}
                  >
                    Low
                  </Button>
                  <Button 
                    variant={settings.dataUsage === 'medium' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => updateSetting('dataUsage', 'medium')}
                  >
                    Medium
                  </Button>
                  <Button 
                    variant={settings.dataUsage === 'high' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => updateSetting('dataUsage', 'high')}
                  >
                    High
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end p-6 pt-4 border-t mt-4">
            <Button onClick={() => setIsOpen(false)}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
