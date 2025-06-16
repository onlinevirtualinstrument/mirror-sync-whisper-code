
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
    <div className="h-full overflow-y-auto">
      <div className="p-2 bg-background border-b">
        <h2 className="text-sm font-semibold flex items-center">
          <User size={16} className="mr-2" /> Participants ({room.participants.length})
        </h2>
      </div>
      
      <div className="p-1 space-y-1">
        {room.participants.map((participant: any) => {
          const isCurrentUser = userInfo?.id === participant.id;
          const unreadCount = unreadCounts[participant.id] || 0;
          
          return (
            <div 
              key={participant.id} 
              className={`flex items-center justify-between p-2 rounded text-sm ${
                isCurrentUser ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex items-center space-x-2 overflow-hidden">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                </Avatar>
                
                <div className="overflow-hidden">
                  <div className="flex items-center">
                    <div className="font-medium truncate max-w-[80px]">{participant.name}</div>
                    {participant.isHost && (
                      <Badge className="ml-1" variant="outline">Host</Badge>
                    )}
                    {participant.muted && (
                      
                      <Badge className="ml-2 bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100" variant="outline">

                        <VolumeX size={14} className="ml-1 text-red-500" /> Muted

                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {participant.instrument}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-1 ml-1">
                {/* {!isCurrentUser && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => setPrivateMessagingUser(participant.id)}
                        >
                          <MessageSquare size={14} />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Private message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )} */}
                
                {isHost && !isCurrentUser && (
                  <DropdownMenu>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6">
                              <Settings size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>Manage participant</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem 
                        onClick={() => muteUser(participant.id, !participant.muted)}
                        className="cursor-pointer"
                      >
                        {participant.muted ? (
                          <><Volume size={14} className="mr-2" /> Unmute user</>
                        ) : (
                          <><VolumeX size={14} className="mr-2" /> Mute user</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive cursor-pointer"
                        onClick={() => removeUser(participant.id)}
                      >
                        <X size={14} className="mr-2" /> Remove user
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