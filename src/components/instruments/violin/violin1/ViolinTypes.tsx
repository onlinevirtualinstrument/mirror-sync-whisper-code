
import React from 'react';
import { ViolinType } from './ViolinExperience';
import { cn } from '@/lib/utils';
import { Music, Zap, Landmark, Music4, Radio, Guitar, Sparkles, BoomBox } from 'lucide-react';
import { toast } from 'sonner';

interface ViolinTypesProps {
  selectedType: ViolinType;
  onTypeChange: (type: ViolinType) => void;
}

interface ViolinTypeOption {
  id: ViolinType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const violinTypes: ViolinTypeOption[] = [
  {
    id: 'classical',
    name: 'Classical Violin',
    description: 'Rich, traditional orchestral sound',
    icon: <Music className="text-violin-accent" />
  },
  {
    id: 'electric',
    name: 'Electric Violin',
    description: 'Modern, amplified tones perfect for rock',
    icon: <Zap className="text-violin-accent" />
  },
  {
    id: 'baroque',
    name: 'Baroque Violin',
    description: 'Authentic period instrument sound',
    icon: <Landmark className="text-violin-accent" />
  },
  {
    id: 'fiddle',
    name: 'Fiddle',
    description: 'Bright, lively folk and country style',
    icon: <Music4 className="text-violin-accent" />
  },
  {
    id: 'synth',
    name: 'Synth Violin',
    description: 'Experimental electronic textures',
    icon: <Radio className="text-violin-accent" />
  },
  {
    id: 'five-string',
    name: 'Five-string Violin',
    description: 'Extended range with an additional low C string',
    icon: <Guitar className="text-violin-accent" />
  },
  {
    id: 'semi-acoustic',
    name: 'Semi-acoustic Violin',
    description: 'Balanced tone between acoustic and electric',
    icon: <BoomBox className="text-violin-accent" />
  },
  {
    id: 'hardanger',
    name: 'Hardanger Violin',
    description: 'Norwegian folk violin with sympathetic strings',
    icon: <Sparkles className="text-violin-accent" />
  }
];

const ViolinTypes: React.FC<ViolinTypesProps> = ({ selectedType, onTypeChange }) => {
  const handleTypeChange = (type: ViolinType) => {
    console.log(`Selected violin type: ${type}`);
    onTypeChange(type);
    toast.success(`Selected violin type: ${type}`);
  };

  return (
    <div className="transition-all">
      <div className="space-y-3">
        {violinTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeChange(type.id)}
            className={cn(
              "relative w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center",
              "border text-sm",
              selectedType === type.id 
                ? "border-violin-accent bg-violin-accent/10 text-violin-accent" 
                : "border-gray-200 dark:border-gray-800 hover:border-violin-accent/50"
            )}
          >
            <div className="mr-3">
              {type.icon}
            </div>
            
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{type.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{type.description}</span>
            </div>
            
            {selectedType === type.id && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-violin-accent rounded-full"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ViolinTypes;
