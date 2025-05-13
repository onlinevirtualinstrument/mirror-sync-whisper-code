
import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';

export type ThemeType = 'classic' | 'neon' | 'dark' | 'light' | 'custom';

interface PianoThemeProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  allowCustom?: boolean;
}

const themes = [
  { id: 'classic', label: 'Classic Piano' },
  { id: 'dark', label: 'Dark Mode' },
  { id: 'light', label: 'Light Mode' },
  { id: 'neon', label: 'Neon Glow' },
  { id: 'custom', label: 'Custom...' },
];

const PianoTheme: React.FC<PianoThemeProps> = ({ 
  currentTheme, 
  onThemeChange,
  allowCustom = true
}) => {
  const themeOptions = allowCustom 
    ? themes 
    : themes.filter(theme => theme.id !== 'custom');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Palette className="h-4 w-4" />
          <span className="hidden md:inline">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeOptions.map((theme) => (
          <DropdownMenuItem 
            key={theme.id}
            onClick={() => onThemeChange(theme.id as ThemeType)}
            className="flex items-center justify-between cursor-pointer"
          >
            {theme.label}
            {currentTheme === theme.id && (
              <Check className="h-4 w-4 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PianoTheme;
