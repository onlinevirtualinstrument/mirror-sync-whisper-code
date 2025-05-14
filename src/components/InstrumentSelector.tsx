
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface InstrumentTypeOption {
  id: string;
  name: string;
  description?: string;
}

interface InstrumentSelectorProps {
  options: InstrumentTypeOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const InstrumentSelector = ({ 
  options, 
  value, 
  onChange, 
  label = "Select style" 
}: InstrumentSelectorProps) => {
  return (
    <div className="mb-4">
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-muted-foreground">{label}:</label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default InstrumentSelector;
