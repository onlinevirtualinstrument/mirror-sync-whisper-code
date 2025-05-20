
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Globe, Clock, Settings, X, Users } from 'lucide-react';
import { useRoom } from './RoomContext';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const RoomHeader: React.FC = () => {
  const { room, isHost, leaveRoom, closeRoom } = useRoom();

  if (!room) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-4 bg-background border-b">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{room.name}</h1>
            <Badge variant={room.isPublic ? "default" : "outline"}>
              {room.isPublic ? (
                <span className="flex items-center gap-1"><Globe size={14} />Public</span>
              ) : (
                <span className="flex items-center gap-1"><Lock size={14} />Private</span>
              )}
            </Badge>
            {room.autoCloseAfterInactivity && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Auto-close: {room.inactivityTimeout || 5}m
                </span>
              </Badge>
            )}
            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
              <span className="flex items-center gap-1">
                <Users size={14} />
                {room.participants?.length || 0}/{room.maxParticipants || 3}
              </span>
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Created: {formatDate(room.createdAt)} 
            {room.lastActivity && (
              <span> • Last activity: {formatDate(room.lastActivity)}</span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {isHost && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={closeRoom}
                  >
                    <X size={16} className="mr-1" /> Close Room
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close the room for all users</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={leaveRoom}
          >
            Leave Room
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomHeader;
