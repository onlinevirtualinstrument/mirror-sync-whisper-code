
import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { LucideIcon } from 'lucide-react';

interface EffectToggleProps {
  label: string;
  Icon: LucideIcon;
  pressed: boolean;
  onPressedChange: () => void;
}

const EffectToggle = ({ 
  label, 
  Icon, 
  pressed, 
  onPressedChange 
}: EffectToggleProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <h4 className="text-sm font-medium">{label}</h4>
      </div>
      <Toggle 
        pressed={pressed}
        onPressedChange={onPressedChange}
        size="sm"
        aria-label={`Toggle ${label.toLowerCase()}`}
      />
    </div>
  );
};

export default EffectToggle;
