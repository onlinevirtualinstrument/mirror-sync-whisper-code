
import { useState, useCallback } from 'react';
import DrumKitTabs from './DrumKitTabs';
import { useAudioEngine } from '../../hooks/useAudioEngine';

const DrumKit = () => { 
  const [selectedKit, setSelectedKit] = useState('classic');
  const [isAnimating, setIsAnimating] = useState(false);
  const [gridLayout, setGridLayout] = useState<'2x2' | '3x3' >('3x3');

  // Initialize audio engine
  const audioEngine = useAudioEngine();
  
  const handleGridChange = useCallback((newGrid: '2x2' | '3x3' ) => {
    console.log(`Grid layout changed to: ${newGrid}`);
    setGridLayout(newGrid);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  }, []);
  
  const handleKitChange = useCallback((kitId: string) => {
    console.log(`Kit changed to: ${kitId}`);
    setSelectedKit(kitId);
  }, []);
  
  return (
    <div className="w-full max-w-6xl mx-auto transition-opacity duration-300 ease-in-out px-2 sm:px-4">
      <DrumKitTabs 
        selectedKit={selectedKit}
        onKitChange={handleKitChange}
        gridLayout={gridLayout}
        isAnimating={isAnimating}
        effects={audioEngine.effects}
        onPlayPad={audioEngine.playWithEffects}
        onGridChange={handleGridChange}
        onEffectChange={audioEngine.handleEffectChange}
        onEffectToggle={audioEngine.handleEffectToggle}
      />
    </div>
  );
};

export default DrumKit;
