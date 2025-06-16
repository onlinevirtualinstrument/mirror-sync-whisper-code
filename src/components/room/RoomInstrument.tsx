
import React from 'react';
import { useRoom } from './RoomContext';
import SimpleInstrument from './SimpleInstrument';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const RoomInstrument: React.FC = () => {
  const { room, userInfo, remotePlaying } = useRoom();
  
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

  const showRemotePlaying = remotePlaying && 
                           remotePlaying.userId !== userInfo.id && 
                           remotePlaying.userName;

  return (
    <div className="flex flex-col h-full">
      {showRemotePlaying && (
        <div className="text-xs text-purple-600 animate-pulse mt-1">
          {remotePlaying.userName} is playing {remotePlaying.instrument}
        </div>
      )}

      <SimpleInstrument type={userInfo.instrument} />
    </div>
  );
};

export default RoomInstrument;
