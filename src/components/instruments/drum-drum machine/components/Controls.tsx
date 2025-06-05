
import { useState } from 'react';
import { 
  LayoutGrid
} from 'lucide-react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface ControlsProps {
  onGridChange: (grid: '2x2' | '3x3' | '4x4') => void;
}

const Controls = ({ onGridChange }: ControlsProps) => {
  const [gridLayout, setGridLayout] = useState<'2x2' | '3x3' | '4x4'>('3x3');
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  const handleGridChange = (value: '2x2' | '3x3' | '4x4') => {
    setGridLayout(value);
    onGridChange(value);
  };

  const toggleControls = () => {
    setIsControlsOpen(!isControlsOpen);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Button 
        variant="outline" 
        size="sm"
        onClick={toggleControls}
        className="mb-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm"
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        {isControlsOpen ? 'Hide Controls' : 'Show Controls'}
      </Button>
      
      {isControlsOpen && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg mb-6 border border-slate-200 dark:border-slate-700 animate-fade-in">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium flex items-center mb-3">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Layout Grid
              </label>
              <RadioGroup 
                value={gridLayout} 
                onValueChange={(val) => handleGridChange(val as '2x2' | '3x3' | '4x4')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2x2" id="grid-2x2" />
                  <label htmlFor="grid-2x2" className="cursor-pointer text-sm">2×2</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3x3" id="grid-3x3" />
                  <label htmlFor="grid-3x3" className="cursor-pointer text-sm">3×3</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4x4" id="grid-4x4" />
                  <label htmlFor="grid-4x4" className="cursor-pointer text-sm">4×4</label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;
