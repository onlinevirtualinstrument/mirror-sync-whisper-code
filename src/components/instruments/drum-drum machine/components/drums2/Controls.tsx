
import { useState } from 'react';
import { 
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ControlsProps {
  onGridChange: (grid: '2x2' | '3x3') => void;
}

const Controls = ({ onGridChange }: ControlsProps) => {
  const [gridLayout, setGridLayout] = useState<'2x2' | '3x3' >('3x3');
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  const handleGridChange = (value: '2x2' | '3x3' ) => {
    setGridLayout(value);
    onGridChange(value);
  };

  const toggleControls = () => {
    setIsControlsOpen(!isControlsOpen);
  };

  return (
    
      
            <div className='flex flex-row '>
              <label className="text-sm font-medium flex items-center mr-2">
                <LayoutGrid className="h-4 w-4 mr-1" />
                {/* Grid */}
              </label>
              <RadioGroup 
                value={gridLayout} 
                onValueChange={(val) => handleGridChange(val as '2x2' | '3x3' )}
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
                {/* <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4x4" id="grid-4x4" />
                  <label htmlFor="grid-4x4" className="cursor-pointer text-sm">4×4</label>
                </div> */}
              </RadioGroup>
            </div>
        
   
  );
};

export default Controls;
