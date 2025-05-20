
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Palette, Layers, Sparkles } from 'lucide-react';

const ThemeCustomizer: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [colorScheme, setColorScheme] = useState('violin');
  const [uiStyle, setUiStyle] = useState('default');
  const [animation, setAnimation] = useState('default');

  const handleColorSchemeChange = (value: string) => {
    setColorScheme(value);
    // Apply the color scheme
    document.documentElement.style.setProperty('--violin-primary', getColorForScheme(value));
    document.documentElement.style.setProperty('--violin-accent', getAccentForScheme(value));
    toast.success(`Color scheme changed to ${value}`);
  };

  const handleUIStyleChange = (value: string) => {
    setUiStyle(value);
    // Apply the UI style
    if (value === 'rounded') {
      document.documentElement.style.setProperty('--border-radius', '1rem');
    } else if (value === 'squared') {
      document.documentElement.style.setProperty('--border-radius', '0.25rem');
    } else {
      document.documentElement.style.setProperty('--border-radius', '0.5rem');
    }
    toast.success(`UI style changed to ${value}`);
  };

  const handleAnimationChange = (value: string) => {
    setAnimation(value);
    // Apply animation setting
    const root = document.documentElement;
    if (value === 'reduced') {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    toast.success(`Animation set to ${value}`);
  };

  const getColorForScheme = (scheme: string) => {
    switch (scheme) {
      case 'violin': return '#8B4513';
      case 'electric': return '#1E90FF';
      case 'royal': return '#9370DB';
      case 'rose': return '#FF69B4';
      case 'forest': return '#2E8B57';
      default: return '#8B4513';
    }
  };

  const getAccentForScheme = (scheme: string) => {
    switch (scheme) {
      case 'violin': return '#D2691E';
      case 'electric': return '#00BFFF';
      case 'royal': return '#9932CC';
      case 'rose': return '#FF1493';
      case 'forest': return '#3CB371';
      default: return '#D2691E';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Color Theme</h3>
        <div className="flex flex-col gap-2">
          <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-2">
            <div>
              <RadioGroupItem value="light" id="light" className="peer sr-only" />
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Sun className="h-5 w-5 text-muted-foreground" />
                <span className="mt-2 text-xs font-medium">Light</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Moon className="h-5 w-5 text-muted-foreground" />
                <span className="mt-2 text-xs font-medium">Dark</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="system" id="system" className="peer sr-only" />
              <Label
                htmlFor="system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <span className="mt-2 text-xs font-medium">System</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <Palette className="mr-2 h-5 w-5" />
          Color Scheme
        </h3>
        <RadioGroup value={colorScheme} onValueChange={handleColorSchemeChange} className="grid grid-cols-2 gap-2">
          {['violin', 'electric', 'royal', 'rose', 'forest'].map((scheme) => (
            <div key={scheme}>
              <RadioGroupItem value={scheme} id={`color-${scheme}`} className="peer sr-only" />
              <Label
                htmlFor={`color-${scheme}`}
                className="flex items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="h-4 w-4 rounded-full" 
                    style={{ backgroundColor: getColorForScheme(scheme) }}
                  />
                  <span className="text-sm font-medium capitalize">{scheme}</span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <Layers className="mr-2 h-5 w-5" />
          UI Style
        </h3>
        <RadioGroup value={uiStyle} onValueChange={handleUIStyleChange} className="grid grid-cols-3 gap-2">
          {['default', 'rounded', 'squared'].map((style) => (
            <div key={style}>
              <RadioGroupItem value={style} id={`ui-${style}`} className="peer sr-only" />
              <Label
                htmlFor={`ui-${style}`}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <div className={`h-6 w-12 ${
                  style === 'rounded' ? 'rounded-full' : 
                  style === 'squared' ? 'rounded-sm' : 'rounded-md'
                } bg-primary`}></div>
                <span className="mt-2 text-xs font-medium capitalize">{style}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <Sparkles className="mr-2 h-5 w-5" />
          Animation
        </h3>
        <RadioGroup value={animation} onValueChange={handleAnimationChange} className="grid grid-cols-2 gap-2">
          {['default', 'reduced', 'none'].map((anim) => (
            <div key={anim}>
              <RadioGroupItem value={anim} id={`anim-${anim}`} className="peer sr-only" />
              <Label
                htmlFor={`anim-${anim}`}
                className="flex items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-sm font-medium capitalize">{anim}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
