
import React from 'react';
import { Disc3, Disc2, Music4, Drum, Drumstick } from 'lucide-react';
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


interface DrumControlProps {
  drumKitType: string;
  setDrumKitType: (type: string) => void;
  showShortcuts: boolean;
  setShowShortcuts: (show: boolean) => void;
}

const availableDrumKits = [
  { id: 'standard', name: 'Standard' },
  { id: 'rock', name: 'Rock' },
  { id: 'jazz', name: 'Jazz' },
  { id: 'electronic', name: 'Electronic' },
  { id: 'indian', name: 'Indian' }
];

const DrumControl = ({
  drumKitType,
  setDrumKitType,
  showShortcuts,
  setShowShortcuts
}: DrumControlProps) => {
  const getDrumKitIcon = () => {
    switch(drumKitType) {
      case 'rock':
        return <Drumstick className="mr-2" size={18} />;
      case 'electronic':
        return <Disc3 className="mr-2" size={18} />;
      case 'jazz':
        return <Disc2 className="mr-2" size={18} />;
      case 'indian':
        return <Music4 className="mr-2" size={18} />;
      default:
        return <Drum className="mr-2" size={18} />;
    }
  };

  return (
    <div className="mb-6 flex gap-4 flex-wrap justify-center">
    

      <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-secondary/30 border-secondary/30">
                  {getDrumKitIcon()}
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
      
      <button 
        className="h-10 px-4 py-2 rounded-md bg-secondary/50 text-sm font-medium hover:bg-secondary/70 transition-colors"
        onClick={() => setShowShortcuts(!showShortcuts)}
      >
        {showShortcuts ? 'Hide shortcuts' : 'Show shortcuts'}
      </button>
    </div>
  );
};

export default DrumControl;
