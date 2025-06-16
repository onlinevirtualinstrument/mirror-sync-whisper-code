
import { useState } from 'react';
import { Music4 } from 'lucide-react';
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

export interface VariantOption {
  id: string;
  name: string;
}

interface InstrumentVariantSelectorProps {
  currentVariant: string;
  setVariant: (variant: string) => void;
  variants: VariantOption[];
  label?: string;
}

const InstrumentVariantSelector = ({
  currentVariant,
  setVariant,
  variants,
  label = 'Select Variant'
}: InstrumentVariantSelectorProps) => {
  // Find the current variant name for display
  const currentVariantName = variants.find(v => v.id === currentVariant)?.name || 'Standard';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-secondary/30 border-secondary/30">
          <Music4 className="mr-2" size={16} />
          {currentVariantName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border-secondary/30">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {variants.map((variant) => (
            <DropdownMenuItem 
              key={variant.id}
              onClick={() => setVariant(variant.id)}
              className={currentVariant === variant.id ? "bg-primary/20 text-primary-foreground" : ""}
            >
              {variant.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InstrumentVariantSelector;
