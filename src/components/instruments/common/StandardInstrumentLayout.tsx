
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Maximize, Minimize, Volume2, Music, Settings } from 'lucide-react';
import { toggleFullscreen } from '@/utils/fullscreen/fullscreenUtils';

interface StandardInstrumentLayoutProps {
  title: string;
  children: React.ReactNode;
  volume: number;
  reverb: number;
  isFullscreen: boolean;
  onVolumeChange: (volume: number) => void;
  onReverbChange: (reverb: number) => void;
  onFullscreenToggle: (isFullscreen: boolean) => void;
  instrumentVariants?: { id: string; name: string }[];
  selectedVariant?: string;
  onVariantChange?: (variant: string) => void;
  additionalControls?: React.ReactNode;
}

const StandardInstrumentLayout: React.FC<StandardInstrumentLayoutProps> = ({
  title,
  children,
  volume,
  reverb,
  isFullscreen,
  onVolumeChange,
  onReverbChange,
  onFullscreenToggle,
  instrumentVariants,
  selectedVariant,
  onVariantChange,
  additionalControls
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleFullscreenToggle = async () => {
    const newFullscreenState = await toggleFullscreen();
    onFullscreenToggle(newFullscreenState);
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isFullscreen 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900'
    }`}>
      {/* Header Controls */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Title and Instrument Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                <Music className="h-6 w-6 text-primary animate-pulse" />
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {title}
                </h1>
              </div>
              
              {instrumentVariants && onVariantChange && (
                <Select value={selectedVariant} onValueChange={onVariantChange}>
                  <SelectTrigger className="w-48 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {instrumentVariants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Volume Control */}
              <div className="flex items-center gap-2 min-w-32">
                <Volume2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-12">
                  {Math.round(volume * 100)}%
                </span>
                <Slider
                  value={[volume * 100]}
                  onValueChange={(value) => onVolumeChange(value[0] / 100)}
                  max={100}
                  step={1}
                  className="w-20"
                />
              </div>

              {/* Settings Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-300 dark:border-slate-600"
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleFullscreenToggle}
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-300 dark:border-slate-600"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Expandable Settings Panel */}
          {showSettings && (
            <Card className="mt-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 animate-fade-in">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Reverb Control */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Reverb: {Math.round(reverb * 100)}%
                    </label>
                    <Slider
                      value={[reverb * 100]}
                      onValueChange={(value) => onReverbChange(value[0] / 100)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Additional Controls */}
                  {additionalControls}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StandardInstrumentLayout;
