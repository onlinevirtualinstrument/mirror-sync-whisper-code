import React from 'react';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Save, 
  Download, 
  Share2,
  Guitar,
  Music,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GuitarType } from './GuitarSoundProfiles';

interface GuitarControlsProps {
  volume: number;
  onVolumeChange: (value: number) => void;
  isPlaying?: boolean;
  onPlayToggle?: () => void;
  guitarType: GuitarType;
  onGuitarTypeChange: (type: GuitarType) => void;
}

const GuitarControls: React.FC<GuitarControlsProps> = ({
  volume,
  onVolumeChange,
  isPlaying,
  onPlayToggle,
  guitarType,
  onGuitarTypeChange
}) => {
  const { toast } = useToast();
  
  const handleVolumeChange = (value: number[]) => {
    onVolumeChange(value[0]);
  };
  
  const showComingSoon = () => {
    toast({
      title: "Coming Soon",
      description: "This feature will be available in a future update",
    });
  };

  const guitarTypes: GuitarType[] = ['acoustic', 'electric', 'bass', 'classical', 'flamenco', 'steel', 'twelveString'];
  
  return (
    <div className="glass-morphism rounded-xl p-4 md:p-6 interactive-shadow transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Volume Controls */}
        <div className="flex items-center gap-3 w-full md:w-1/3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <button 
            onClick={() => onVolumeChange(0)}
            className="p-2 rounded-full hover:bg-black/10 hover-lift transition-all duration-300"
            aria-label={volume === 0 ? "Unmute" : "Mute"}
          >
            {volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          
          <Slider
            value={[volume]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-full"
          />
          
          <span className="text-sm font-medium w-8">{volume}%</span>
        </div>
        
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2 md:gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {onPlayToggle && (
            <button
              onClick={onPlayToggle}
              className={cn(
                "p-3 rounded-full transition-all duration-300",
                "bg-black text-white hover:bg-black/90 shadow-md hover:shadow-lg hover-lift"
              )}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 animate-pulse" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={showComingSoon}
              className="p-2.5 rounded-full bg-white/80 hover:bg-black/5 transition-colors hover-lift"
              aria-label="Save"
            >
              <Save className="h-4 w-4" />
            </button>
            
            <button
              onClick={showComingSoon}
              className="p-2.5 rounded-full bg-white/80 hover:bg-black/5 transition-colors hover-lift"
              aria-label="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={showComingSoon}
              className="p-2.5 rounded-full bg-white/80 hover:bg-black/5 transition-colors hover-lift"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            
            {/* Tutorial Button */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="p-2.5 rounded-full bg-white/90 hover:bg-purple-100 text-purple-700 transition-colors hover-lift"
                  aria-label="Tutorial"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl animate-scale-in">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Guitar className="h-5 w-5" /> Virtual Guitar Tutorial
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 my-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Music className="h-4 w-4" /> Basic Controls
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Click on the strings and frets to play individual notes</li>
                      <li>Use the volume slider to adjust the sound level</li>
                      <li>Choose different guitar types from the dropdown menu</li>
                      <li>Toggle the play/pause button to control playback</li>
                    </ul>
                  </div>
                  
                  <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-lg font-semibold mb-2">Guitar Types</h3>
                    <ul className="grid grid-cols-2 gap-3 text-sm">
                      <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                        <span className="font-medium">Acoustic:</span> Warm, balanced sound with strong mid-range
                      </li>
                      <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                        <span className="font-medium">Electric:</span> Bright tone with sustain, great with effects
                      </li>
                      <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                        <span className="font-medium">Bass:</span> Deep, low-end frequencies with 4 strings
                      </li>
                      <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                        <span className="font-medium">Classical:</span> Nylon strings with rich, mellow tone
                      </li>
                      <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                        <span className="font-medium">Flamenco:</span> Spanish guitar with unique sound
                      </li>
                      <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                        <span className="font-medium">Steel:</span> Steel-string guitar with bright tone
                      </li>
                      <li className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                        <span className="font-medium">TwelveString:</span> Guitar with 12 strings
                      </li>
                    </ul>
                  </div>
                  
                  <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <h3 className="text-lg font-semibold mb-2">Advanced Features</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Use the Effects & Settings panel to apply distortion, reverb, and delay</li>
                      <li>Adjust tuning or use custom tunings for unique sounds</li>
                      <li>Enable chord assist mode to see common chord fingerings</li>
                      <li>Toggle note names or fret numbers for learning</li>
                      <li>Record your playing and save it for later</li>
                    </ul>
                  </div>
                  
                  <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-lg font-semibold mb-2">Recording Features</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Click the recording button to start capturing your playing</li>
                      <li>Stop recording when finished</li>
                      <li>Play back your recordings</li>
                      <li>Save recordings for future sessions</li>
                      <li>Download recordings to your device</li>
                    </ul>
                  </div>
                  
                  <div className="animate-fade-in bg-gray-50 p-4 rounded-lg mt-4" style={{ animationDelay: '0.5s' }}>
                    <h3 className="text-lg font-semibold mb-2">Tips & Tricks</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Try different themes to customize the look of your guitar</li>
                      <li>Experiment with effects to create unique sounds</li>
                      <li>Learn basic chord shapes using the chord assist mode</li>
                      <li>Practice scales by enabling note names</li>
                      <li>Create recordings of chord progressions to practice with</li>
                    </ul>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="hover-lift" variant="default">Got It</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Guitar Type Controls */}
        <div className="flex md:justify-end items-center gap-2 w-full md:w-1/3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 bg-white/90 rounded-md hover:bg-black/5 transition-colors border border-gray-200 hover-lift">
                <Guitar className="h-4 w-4" />
                <span className="capitalize text-sm font-medium">{guitarType}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0 animate-fade-in">
              <div className="grid grid-cols-1 gap-1 p-1">
                {guitarTypes.map((type) => (
                  <button 
                    key={type}
                    onClick={() => onGuitarTypeChange(type)}
                    className={cn(
                      "capitalize flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors hover-lift",
                      guitarType === type 
                        ? "bg-black/5 font-medium" 
                        : "hover:bg-black/5"
                    )}
                  >
                    <Guitar className={cn(
                      "h-4 w-4",
                      guitarType === type && "text-blue-500"
                    )} />
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <div className="hidden md:block text-sm font-medium animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <span className="text-muted-foreground">Current Guitar: </span>
            <span className="capitalize">{guitarType}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuitarControls;
