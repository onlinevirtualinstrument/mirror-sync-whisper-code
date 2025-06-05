
import React, { ReactNode } from 'react';
import { Volume2, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toggleFullscreen } from '@/utils/fullscreen/fullscreenUtils';

interface StandardInstrumentLayoutProps {
  title: string;
  instrumentType?: string;
  availableTypes?: string[];
  volume: number;
  reverb?: number;
  tone?: number;
  isFullscreen?: boolean;
  onVolumeChange: (value: number) => void;
  onReverbChange?: (value: number) => void;
  onToneChange?: (value: number) => void;
  onTypeChange?: (type: string) => void;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  children: ReactNode;
  customControls?: ReactNode;
}

const StandardInstrumentLayout: React.FC<StandardInstrumentLayoutProps> = ({
  title,
  instrumentType,
  availableTypes = [],
  volume,
  reverb,
  tone,
  isFullscreen = false,
  onVolumeChange,
  onReverbChange,
  onToneChange,
  onTypeChange,
  onFullscreenToggle,
  children,
  customControls
}) => {
  const handleFullscreen = async () => {
    const newFullscreenState = await toggleFullscreen();
    onFullscreenToggle?.(newFullscreenState);
  };

  return (
    <Card className={`w-full mx-auto transition-all duration-300 ${isFullscreen ? 'h-screen rounded-none' : 'max-w-6xl rounded-xl'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {title}
          </h2>
          
          {availableTypes.length > 0 && onTypeChange && (
            <Select value={instrumentType} onValueChange={onTypeChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Volume Control */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Volume2 className="h-4 w-4" />
                <span className="hidden sm:inline">Volume</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-background/95 backdrop-blur-sm border border-border/50">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Volume</span>
                    <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
                  </div>
                  <Slider
                    value={[volume * 100]}
                    onValueChange={([value]) => onVolumeChange(value / 100)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {onReverbChange && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Reverb</span>
                      <span className="text-sm text-muted-foreground">{Math.round((reverb || 0) * 100)}%</span>
                    </div>
                    <Slider
                      value={[(reverb || 0) * 100]}
                      onValueChange={([value]) => onReverbChange(value / 100)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                {onToneChange && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Tone</span>
                      <span className="text-sm text-muted-foreground">{Math.round((tone || 0) * 100)}%</span>
                    </div>
                    <Slider
                      value={[(tone || 0) * 100]}
                      onValueChange={([value]) => onToneChange(value / 100)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Custom Controls */}
          {customControls}

          {/* Fullscreen Toggle */}
          <Button variant="outline" size="sm" onClick={handleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className={`${isFullscreen ? 'h-[calc(100vh-100px)] overflow-auto' : ''}`}>
        {children}
      </CardContent>
    </Card>
  );
};

export default StandardInstrumentLayout;
