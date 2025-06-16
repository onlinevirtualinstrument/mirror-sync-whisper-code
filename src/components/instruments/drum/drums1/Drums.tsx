
import { useRef, useState, useEffect } from 'react';
import SoundControls from '../../../../utils/music/SoundControls';
import DrumKit from './DrumKit';
import { Music4, Mic, Sliders } from 'lucide-react';
import { drumKitThemes } from './DrumKitThemes';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { toggleFullscreen } from "@/components/landscapeMode/lockToLandscape";
import FullscreenWrapper from "@/components/landscapeMode/FullscreenWrapper";


interface DrumsProps {
  drumType?: string;
}

const Drums = ({ drumType = 'standard' }: DrumsProps) => {

  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const availableDrumKits = [
    { id: 'standard', name: 'Standard' },
    { id: 'rock', name: 'Rock' },
    { id: 'jazz', name: 'Jazz' },
    { id: 'electronic', name: 'Electronic' },
    { id: 'indian', name: 'Indian' }
  ];
    
  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto md:px-4">

      {/* 🔁 Responsive Top Control Panel */}
      <div className="w-full mb-4 flex justify-between items-center gap-0">
        {/* Drum Kit Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-secondary/30 border-secondary/30"
            >
              <Music4 className="mr-1" size={16} />
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
                  className={
                    drumKitType === kit.id
                      ? 'bg-primary/20 text-primary-foreground'
                      : ''
                  }
                >
                  {kit.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Toggle Shortcuts */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="bg-secondary/30 border-secondary/30"
        >
          {showShortcuts ? 'Hide Keys' : 'Show Keys'}
        </Button>

        <div className="landscape-warning text-xs text-muted-foreground  dark:bg-white/5 p-2 rounded-md">
          <p>
            <strong onClick={() => toggleFullscreen(containerRef.current)} className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:brightness-110 hover:scale-[1.03]">
              ⛶Zoom
            </strong>
          </p>
        </div>
        <style>{`
                        @media (min-width: 768px) {
                          .landscape-warning {
                            display: none;
                          }
                        }
                      `}</style>

      </div>

      {/* 🥁 DrumKit */}
      <FullscreenWrapper ref={containerRef} instrumentName="banjo">
        <DrumKit
          drumKitType={drumKitType}
          volume={volume}
          isMuted={isMuted}
          reverbLevel={reverbLevel}
          toneQuality={toneQuality}
          showShortcuts={showShortcuts}
        />
      </FullscreenWrapper>

      {/* 🎚️ Sound Controls (desktop only) */}
      <div className=" w-full max-w-sm mx-auto mt-6 mb-8">
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

  );
};

export default Drums;
