
import { useState, useEffect } from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ThemeSwitcher() {
  const { mode, setMode, customColors, setCustomColors } = useTheme();
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [tempColors, setTempColors] = useState(customColors);

  // Update tempColors when customColors changes (e.g. from localStorage)
  useEffect(() => {
    setTempColors(customColors);
  }, [customColors]);

  const handleColorChange = (key: keyof typeof tempColors) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempColors(prev => ({
      ...prev,
      [key]: e.target.value
    }));
  };

  const saveCustomColors = () => {
    setCustomColors(tempColors);
    setMode('custom');
    setIsCustomDialogOpen(false);
  };

  const resetToDefaults = () => {
    const defaultCustomColors = {
      primary: '#646cff',
      secondary: '#535bf2',
      accent: '#747bff',
      background: '#242424',
    };
    setTempColors(defaultCustomColors);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
                {mode === 'light' && <Sun className="h-4 w-4" />}
                {mode === 'dark' && <Moon className="h-4 w-4 dark:text-white" />}
                {mode === 'custom' && <Palette className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-scale-in">
              <DropdownMenuItem onClick={() => setMode('light')} className="cursor-pointer">
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode('dark')} className="cursor-pointer">
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  setIsCustomDialogOpen(true);
                }} 
                className="cursor-pointer"
              >
                <Palette className="mr-2 h-4 w-4" />
                <span>Custom</span>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Change theme</p>
        </TooltipContent>
      </Tooltip>

      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="sm:max-w-[425px] animate-scale-in">
          <DialogHeader>
            <DialogTitle>Customize Theme</DialogTitle>
            <DialogDescription>
              Create your own custom color theme.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="primary" className="text-right">
                Primary
              </Label>
              <Input
                id="primary"
                type="color"
                value={tempColors.primary}
                onChange={handleColorChange('primary')}
                className="col-span-3 h-10"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secondary" className="text-right">
                Secondary
              </Label>
              <Input
                id="secondary"
                type="color"
                value={tempColors.secondary}
                onChange={handleColorChange('secondary')}
                className="col-span-3 h-10"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accent" className="text-right">
                Accent
              </Label>
              <Input
                id="accent"
                type="color"
                value={tempColors.accent}
                onChange={handleColorChange('accent')}
                className="col-span-3 h-10"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="background" className="text-right">
                Background
              </Label>
              <Input
                id="background"
                type="color"
                value={tempColors.background}
                onChange={handleColorChange('background')}
                className="col-span-3 h-10"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={resetToDefaults} type="button">
              Reset
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsCustomDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveCustomColors} className="animate-fade-in">
                Apply Theme
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
