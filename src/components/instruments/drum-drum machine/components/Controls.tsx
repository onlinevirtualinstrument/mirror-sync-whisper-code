
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Grid3X3, Grid2X2, Square } from 'lucide-react';

interface ControlsProps {
  gridLayout: '2x2' | '3x3' | '4x4';
  onGridChange: (layout: '2x2' | '3x3' | '4x4') => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  tempo?: number;
  onTempoChange?: (tempo: number) => void;
}

const Controls = ({ 
  gridLayout, 
  onGridChange, 
  volume = 70, 
  onVolumeChange,
  tempo = 120,
  onTempoChange 
}: ControlsProps) => {
  const gridOptions = [
    { value: '2x2' as const, icon: Grid2X2, label: '2×2' },
    { value: '3x3' as const, icon: Grid3X3, label: '3×3' },
    { value: '4x4' as const, icon: Square, label: '4×4' }
  ];

  return (
    <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-800 dark:text-slate-200">Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grid Layout Controls */}
        <div>
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
            Grid Layout
          </Label>
          <div className="flex gap-2">
            {gridOptions.map(({ value, icon: Icon, label }) => (
              <Button
                key={value}
                variant={gridLayout === value ? "default" : "outline"}
                size="sm"
                onClick={() => onGridChange(value)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        {onVolumeChange && (
          <div>
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Volume: {volume}%
            </Label>
            <Slider
              value={[volume]}
              onValueChange={(value) => onVolumeChange(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {/* Tempo Control */}
        {onTempoChange && (
          <div>
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Tempo: {tempo} BPM
            </Label>
            <Slider
              value={[tempo]}
              onValueChange={(value) => onTempoChange(value[0])}
              min={60}
              max={180}
              step={1}
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Controls;
