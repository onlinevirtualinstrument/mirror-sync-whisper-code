
import React from 'react';
import { User, X, Volume, VolumeX, Settings, MessageSquare } from 'lucide-react';
import { useRoom } from './RoomContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const RoomParticipants: React.FC = () => {
  const { 
    room, 
    isHost, 
    userInfo, 
    muteUser, 
    removeUser, 
    setPrivateMessagingUser,
    unreadCounts 
  } = useRoom();

  if (!room || !room.participants) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="p-4 border-l bg-background/80">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <User size={18} className="mr-2" /> Participants ({room.participants.length})
      </h2>
      
      <div className="space-y-4">
        {room.participants.map((participant: any) => {
          const isCurrentUser = userInfo?.id === participant.id;
          const unreadCount = unreadCounts[participant.id] || 0;
          
          return (
            <div 
              key={participant.id} 
              className={`flex items-center justify-between p-2 rounded ${
                isCurrentUser ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center">
                    <div className="font-medium">{participant.name}</div>
                    {participant.isHost && (
                      <Badge className="ml-2" variant="outline">Host</Badge>
                    )}
                    {participant.muted && (
                      <Badge className="ml-2 bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100" variant="outline">
                        <VolumeX size={12} className="mr-1" /> Muted
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {participant.instrument}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-1">
                {!isCurrentUser && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setPrivateMessagingUser(participant.id)}
                        >
                          <MessageSquare size={16} />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Private message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {isHost && !isCurrentUser && (
                  <DropdownMenu>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Settings size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Manage participant</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => muteUser(participant.id, !participant.muted)}
                      >
                        {participant.muted ? (
                          <><Volume size={16} className="mr-2" /> Unmute user</>
                        ) : (
                          <><VolumeX size={16} className="mr-2" /> Mute user</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => removeUser(participant.id)}
                      >
                        <X size={16} className="mr-2" /> Remove from room
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomParticipants;
