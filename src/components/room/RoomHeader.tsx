
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Globe, 
  Clock, 
  Settings, 
  X, 
  Users, 
  Share,
  Volume,
  VolumeX,
  MessageSquare
} from 'lucide-react';
import { useRoom } from './RoomContext';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';

const RoomHeader: React.FC = () => {
  const { room, isHost, leaveRoom, closeRoom, toggleChat } = useRoom();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  if (!room) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleShare = () => {
    if (!room.isPublic && !isHost) {
      toast({
        description: "Only the host can share private rooms",
        variant: "destructive"
      });
      return;
    }
    setShareDialogOpen(true);
  };

  const copyRoomLink = () => {
    const url = `${window.location.origin}/room/${room.id}`;
    navigator.clipboard.writeText(url);
    toast({
      description: "Room link copied to clipboard"
    });
  };

  return (
    <div className="p-4 bg-background border-b sticky top-0 z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold truncate">{room.name}</h1>
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
        
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShare}
                >
                  <Share size={16} className="mr-1" /> Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share room link with others</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {isHost && (
            <>
              {room.isChatDisabled ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleChat(false)}
                      >
                        <MessageSquare size={16} className="mr-1" /> Enable Chat
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enable chat for all users</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleChat(true)}
                      >
                        <MessageSquare size={16} className="mr-1 text-red-500" /> Disable Chat
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Disable chat for all users</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => closeRoom()}
                    >
                      <X size={16} className="mr-1" /> Close Room
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Close the room for all users</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          
          <Button 
            variant={isHost ? "destructive" : "outline"}
            size="sm"
            onClick={leaveRoom}
          >
            Leave Room
          </Button>
        </div>
      </div>
      
      {/* Share Dialog */}
      <AlertDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share Room Link</AlertDialogTitle>
            <AlertDialogDescription>
              Share this link with others to invite them to join this room
              {!room.isPublic && room.joinCode && isHost && (
                <div className="mt-2">
                  <p className="font-medium">Private Room Join Code:</p>
                  <p className="font-mono text-lg text-center bg-muted p-2 rounded mt-1">{room.joinCode}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 mt-2">
            <Input 
              value={`${window.location.origin}/room/${room.id}`} 
              readOnly
              className="font-mono"
            />
            <Button onClick={copyRoomLink} type="button">Copy</Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoomHeader;
