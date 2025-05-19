
import { useState, useEffect } from 'react';
import SoundControls from '../../../../utils/music/SoundControls';
import DrumKit from './DrumKit';
import DrumControl from './DrumControl';
import DrumPad from './DrumPad';
import { Music4, Mic, Sliders } from 'lucide-react';
import { drumKitThemes } from './DrumKitThemes';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DrumsProps {
  drumType?: string;
}

const Drums = ({ drumType = 'standard' }: DrumsProps) => {
  const [activeElements, setActiveElements] = useState<string[]>([]);
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [reverbLevel, setReverbLevel] = useState<number>(0.3);
  const [toneQuality, setToneQuality] = useState<number>(0.5);
  const [drumKitType, setDrumKitType] = useState<string>(drumType);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setDrumKitType(drumType);
  }, [drumType]);
  
  useEffect(() => {
    const handleExitFullscreen = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    
    if (isFullscreen) {
      document.addEventListener('fullscreenchange', handleExitFullscreen);
    }
    
    return () => {
      document.removeEventListener('fullscreenchange', handleExitFullscreen);
    };
  }, [isFullscreen]);
  
  const currentTheme = drumKitThemes[drumKitType as keyof typeof drumKitThemes] || drumKitThemes.standard;
  const drumKit = currentTheme.elements;
  
  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        try {
          await element.requestFullscreen();
          setIsFullscreen(true);
        } catch (err) {
          console.log('Error attempting to enable fullscreen:', err);
        }
      }
    } else {
      if (document.exitFullscreen) {
        try {
          await document.exitFullscreen();
          setIsFullscreen(false);
        } catch (err) {
          console.log('Error attempting to exit fullscreen:', err);
        }
      }
    }
  };

  const playDrumSound = (id: string) => {
    // Dummy function to pass to DrumPad
    // Actual implementation is in DrumKit component
  };

  const availableDrumKits = [
    { id: 'standard', name: 'Standard' },
    { id: 'rock', name: 'Rock' },
    { id: 'jazz', name: 'Jazz' },
    { id: 'electronic', name: 'Electronic' },
    { id: 'indian', name: 'Indian' }
  ];

  return (
    <div className={`flex flex-col items-center w-full max-w-4xl mx-auto ${isFullscreen ? 'landscape-fullscreen px-4 py-2' : ''}`}>
      {isFullscreen ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <DrumKit
              drumKitType={drumKitType}
              volume={volume}
              isMuted={isMuted}
              reverbLevel={reverbLevel}
              toneQuality={toneQuality}
              showShortcuts={showShortcuts}
            />
          </div>
          
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-md border border-gray-200/20 p-3">
              <DrumControl 
                drumKitType={drumKitType}
                setDrumKitType={setDrumKitType}
                showShortcuts={showShortcuts}
                setShowShortcuts={setShowShortcuts}
              />
              
              <div className="mt-4">
                <SoundControls
                  volume={volume}
                  setVolume={setVolume}
                  isMuted={isMuted}
                  setIsMuted={setIsMuted}
                  reverbLevel={reverbLevel}
                  setReverbLevel={setReverbLevel}
                  toneQuality={toneQuality}
                  setToneQuality={setToneQuality}
                />
              </div>
            </div>
            
            <DrumPad 
              elements={drumKit} 
              playDrumSound={playDrumSound} 
              isFullscreen={isFullscreen} 
              toggleFullscreen={toggleFullscreen} 
            />
          </div>
        </div>
      ) : (
        <>
          {!isMobile ? (
            <DrumControl 
              drumKitType={drumKitType}
              setDrumKitType={setDrumKitType}
              showShortcuts={showShortcuts}
              setShowShortcuts={setShowShortcuts}
            />
          ) : (
            <div className="mb-4 w-full flex justify-between items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-secondary/30 border-secondary/30">
                    <Music4 className="mr-2" size={16} />
                    {drumKitType.charAt(0).toUpperCase() + drumKitType.slice(1)} Kit
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border-secondary/30">
                  <DropdownMenuLabel>Select Drum Kit</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {availableDrumKits.map((kit) => (
                      <DropdownMenuItem 
                        key={kit.id}
                        onClick={() => setDrumKitType(kit.id)}
                        className={drumKitType === kit.id ? "bg-primary/20 text-primary-foreground" : ""}
                      >
                        {kit.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowShortcuts(!showShortcuts)}
                  className="bg-secondary/30 border-secondary/30"
                >
                  {showShortcuts ? 'Hide Keys' : 'Show Keys'}
                </Button>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-secondary/30 border-secondary/30">
                      <Sliders className="mr-2" size={14} />
                      Sound
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-background/95 backdrop-blur-sm">
                    <div className="py-4">
                      <SoundControls
                        volume={volume}
                        setVolume={setVolume}
                        isMuted={isMuted}
                        setIsMuted={setIsMuted}
                        reverbLevel={reverbLevel}
                        setReverbLevel={setReverbLevel}
                        toneQuality={toneQuality}
                        setToneQuality={setToneQuality}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          )}
          
          <DrumKit
            drumKitType={drumKitType}
            volume={volume}
            isMuted={isMuted}
            reverbLevel={reverbLevel}
            toneQuality={toneQuality}
            showShortcuts={showShortcuts}
          />
          
          {!isMobile && (
            <div className="w-full max-w-sm mx-auto mb-8">
              <SoundControls
                volume={volume}
                setVolume={setVolume}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                reverbLevel={reverbLevel}
                setReverbLevel={setReverbLevel}
                toneQuality={toneQuality}
                setToneQuality={setToneQuality}
              />
            </div>
          )}
          
          {/* <DrumPad 
            elements={drumKit} 
            playDrumSound={playDrumSound} 
            isFullscreen={isFullscreen} 
            toggleFullscreen={toggleFullscreen} 
          /> */}
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Click on the drum elements or press the corresponding keys to play</p>
            <div className="mt-2 flex justify-center items-center gap-2">
              <Music4 size={16} />
              <span>Choose different drum kits for different sound styles</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Drums;
