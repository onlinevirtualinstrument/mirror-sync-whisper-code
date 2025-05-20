
import React from 'react';
import { useRoom } from './RoomContext';
import SimpleInstrument from './SimpleInstrument';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import RoomSettings from './RoomSettings';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RoomInstrument: React.FC = () => {
  const { room, userInfo, isHost, switchInstrument } = useRoom();
  
  if (!room || !userInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Loading instrument or connecting to room...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const instruments = [
    'piano',
    'guitar',
    'drummachine',
    'chordprogression',
    'drums',
    'flute',
    'saxophone',
    'trumpet',
    'veena',
    'violin',
    'xylophone',
    'kalimba',
    'marimba'
  ];

  const handleInstrumentChange = (value: string) => {
    switchInstrument(value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b flex items-center justify-between bg-muted/30">
        <div className="flex-1">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="instrument" className="text-xs">Instrument</Label>
              <Select
                value={userInfo.instrument}
                onValueChange={handleInstrumentChange}
                disabled={!room.allowDifferentInstruments && !isHost}
              >
                <SelectTrigger className="w-[180px] h-8 text-sm">
                  <SelectValue placeholder="Select instrument" />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((instrument) => (
                    <SelectItem 
                      key={instrument} 
                      value={instrument}
                      disabled={!room.allowDifferentInstruments && room.hostInstrument !== instrument && !isHost}
                    >
                      {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isHost && <RoomSettings />}
          </div>
          
          {!room.allowDifferentInstruments && !isHost && (
            <p className="text-xs text-muted-foreground mt-1">
              The host has restricted instrument selection
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <SimpleInstrument instrument={userInfo.instrument} />
      </div>
    </div>
  );
};

export default RoomInstrument;
