
import React, { useState } from 'react';
import { useRoom } from './RoomContext';
import SimpleInstrument from './SimpleInstrument';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import RoomSettings from './RoomSettings';

const RoomInstrument: React.FC = () => {
  const { room, userInfo, isHost, switchInstrument } = useRoom();
  
  if (!room || !userInfo) return null;

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
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="instrument">Your Instrument</Label>
              <Select
                value={userInfo.instrument}
                onValueChange={handleInstrumentChange}
                disabled={!room.allowDifferentInstruments && !isHost}
              >
                <SelectTrigger className="w-[180px]">
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
        <SimpleInstrument instrumentType={userInfo.instrument} />
      </div>
    </div>
  );
};

export default RoomInstrument;
