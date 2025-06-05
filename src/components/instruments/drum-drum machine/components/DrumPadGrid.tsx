
import { useMemo } from 'react';
import DrumPad from './DrumPad';
import { AudioEffects } from '@/hooks/useAudioEffects';
import { DrumPad as DrumPadType } from '@/data/drumKits';

interface DrumPadGridProps {
  pads: DrumPadType[];
  gridLayout: '2x2' | '3x3' | '4x4';
  effects: AudioEffects;
  onPlay?: (pad: any) => void;
}

const DrumPadGrid = ({ 
  pads, 
  gridLayout, 
  effects,
  onPlay
}: DrumPadGridProps) => {
  const gridColsClass = useMemo(() => {
    switch (gridLayout) {
      case '2x2': return 'grid-cols-2';
      case '3x3': return 'grid-cols-2 sm:grid-cols-3';
      case '4x4': return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
      default: return 'grid-cols-2 sm:grid-cols-3';
    }
  }, [gridLayout]);

  return (
    <div className={`grid ${gridColsClass} gap-2 sm:gap-4 md:gap-6 p-2 sm:p-4`}>
      {pads.length > 0 ? (
        pads.map((pad) => (
          <DrumPad
            key={pad.id}
            id={pad.id}
            name={pad.name}
            keyTrigger={pad.keyTrigger}
            soundSrc={pad.soundSrc}
            color={pad.color}
            glowColor={pad.glowColor || "rgba(255, 255, 255, 0.5)"}
            volume={1}
            effects={effects}
            onPlay={onPlay}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-red-500">No drum pads available for this kit</p>
        </div>
      )}
    </div>
  );
};

export default DrumPadGrid;
