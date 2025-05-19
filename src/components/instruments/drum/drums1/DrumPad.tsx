
import React from 'react';
import { DrumElement } from './DrumElements';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DrumPadProps {
  elements: (DrumElement & { color: string })[];
  playDrumSound: (id: string) => void;
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
}

const DrumPad = ({ elements, playDrumSound, isFullscreen, toggleFullscreen }: DrumPadProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="relative">
      {isMobile && toggleFullscreen && (
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFullscreen}
            className="text-xs flex items-center gap-1 bg-secondary/30 border-secondary/30"
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={14} />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 size={14} />
                Enter Fullscreen
              </>
            )}
          </Button>
        </div>
      )}
      
      <div className={`grid grid-cols-3 ${isFullscreen ? 'md:grid-cols-5' : 'md:grid-cols-5'} gap-2 text-center text-sm mb-4`}>
        {elements.map((drum) => (
          <div 
            key={drum.id}
            className={`p-2 bg-secondary/30 rounded border border-secondary/30 hover:bg-secondary/40 cursor-pointer transition-colors ${
              isFullscreen ? 'p-3 md:p-4' : 'p-2'
            }`}
            onClick={() => playDrumSound(drum.id)}
          >
            <div className="font-medium">{drum.label}</div>
            <div className="text-xs text-muted-foreground">{drum.key}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrumPad;
