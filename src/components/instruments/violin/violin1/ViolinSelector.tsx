
import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ViolinType } from './ViolinExperience';
import { 
  Music, 
  Zap, 
  Landmark, 
  Music4, 
  Radio, 
  Guitar, 
  Sparkles, 
  BoomBox 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViolinSelectorProps {
  selectedType: ViolinType;
  onTypeChange: (type: ViolinType) => void;
}

interface ViolinOption {
  id: ViolinType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  characteristic: string;
}

const violinOptions: ViolinOption[] = [
  {
    id: 'classical',
    name: 'Classical Violin',
    description: 'Rich, traditional orchestral sound',
    icon: <Music className="mr-2" />,
    color: 'text-amber-600',
    characteristic: 'Warm, expressive, and versatile'
  },
  {
    id: 'electric',
    name: 'Electric Violin',
    description: 'Modern, amplified tones perfect for rock',
    icon: <Zap className="mr-2" />,
    color: 'text-blue-600',
    characteristic: 'Bold, cutting, and contemporary'
  },
  {
    id: 'baroque',
    name: 'Baroque Violin',
    description: 'Authentic period instrument sound',
    icon: <Landmark className="mr-2" />,
    color: 'text-yellow-700',
    characteristic: 'Crisp, articulated, and historically authentic'
  },
  {
    id: 'fiddle',
    name: 'Fiddle',
    description: 'Bright, lively folk and country style',
    icon: <Music4 className="mr-2" />,
    color: 'text-orange-600',
    characteristic: 'Spirited, rhythmic, and dance-like'
  },
  {
    id: 'synth',
    name: 'Synth Violin',
    description: 'Experimental electronic textures',
    icon: <Radio className="mr-2" />,
    color: 'text-cyan-600',
    characteristic: 'Ethereal, otherworldly, and boundary-pushing'
  },
  {
    id: 'five-string',
    name: 'Five-string Violin',
    description: 'Extended range with an additional low C string',
    icon: <Guitar className="mr-2" />,
    color: 'text-green-600',
    characteristic: 'Deep, resonant, with expanded low register'
  },
  {
    id: 'semi-acoustic',
    name: 'Semi-acoustic Violin',
    description: 'Balanced tone between acoustic and electric',
    icon: <BoomBox className="mr-2" />,
    color: 'text-violet-600',
    characteristic: 'Versatile, balanced, with amplified warmth'
  },
  {
    id: 'hardanger',
    name: 'Hardanger Violin',
    description: 'Norwegian folk violin with sympathetic strings',
    icon: <Sparkles className="mr-2" />,
    color: 'text-indigo-600',
    characteristic: 'Resonant, haunting, with unique harmonic richness'
  }
];

const ViolinSelector: React.FC<ViolinSelectorProps> = ({ selectedType, onTypeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = violinOptions.find(option => option.id === selectedType);
  
  return (
    <div className="w-full">
      <Select
        value={selectedType}
        onValueChange={(value) => {
          onTypeChange(value as ViolinType);
          // Add a short delay to allow for animation transition
          setTimeout(() => setIsOpen(false), 300);
        }}
        onOpenChange={setIsOpen}
        open={isOpen}
      >
        <SelectTrigger 
          className={cn(
            "w-full transition-all duration-300 border-2",
            isOpen ? "ring-2 ring-offset-2" : "",
            selectedOption && `border-${selectedOption.color.split('-')[1]}-400`
          )}
        >
          <SelectValue placeholder="Select Violin Type">
            {selectedOption && (
              <div className="flex items-center animate-fade-in">
                <span className={cn("inline-flex items-center font-medium", selectedOption.color)}>
                  {selectedOption.icon}
                  {selectedOption.name}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <SelectGroup>
            <SelectLabel className="text-lg font-semibold pb-2">Violin Types</SelectLabel>
            {violinOptions.map((option) => (
              <SelectItem 
                key={option.id} 
                value={option.id}
                className="flex items-center py-3 my-1 hover:bg-accent transition-all cursor-pointer"
              >
                <div className="flex flex-col">
                  <div className={cn("inline-flex items-center font-medium", option.color)}>
                    {option.icon}
                    {option.name}
                  </div>
                  <div className="ml-6 text-xs text-gray-500 mt-1">{option.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {selectedOption && (
        <div className="mt-2 animate-fade-in">
          <div className="text-sm text-gray-500">{selectedOption.description}</div>
          <div className={cn("text-sm mt-1 font-medium", selectedOption.color)}>{selectedOption.characteristic}</div>
        </div>
      )}
    </div>
  );
};

export default ViolinSelector;
