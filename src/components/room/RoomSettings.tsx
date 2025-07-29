
import React, { useState } from 'react';
import { 
  SheetContent, 
  Sheet, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Settings, MessageSquare, Clock, Lock, Globe } from 'lucide-react';
import { useRoom } from './RoomContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';

const RoomSettings: React.FC = () => {
  const { room, isHost, toggleChat, toggleAutoClose, updateSettings } = useRoom();
  const [open, setOpen] = useState(false);

  if (!room || !isHost) return null;

  const handleAutoCloseToggle = (enabled: boolean) => {
    const timeout = enabled ? (room.inactivityTimeout || 2) : 10;
    toggleAutoClose(enabled, timeout);
  };

  const handleTimeoutChange = (values: number[]) => {
    const newTimeout = values[0];
    toggleAutoClose(room.autoCloseAfterInactivity, newTimeout);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Settings size={18} />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Room Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Room Settings</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          {/* Chat Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center">
              <MessageSquare size={18} className="mr-2" /> Chat Controls
            </h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="chat-enabled">Disable Chat</Label>
                <p className="text-xs text-muted-foreground">
                  Only you will be able to send messages
                </p>
              </div>
              <Switch
                id="chat-enabled"
                checked={room.isChatDisabled}
                onCheckedChange={(value) => {
                  toggleChat(value);
                  if (window.innerWidth < 768) setOpen(false);
                }}
              />
            </div>
          </div>
          
          {/* Auto-Close Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center">
              <Clock size={18} className="mr-2" /> Auto-Close Controls
            </h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-close">Auto-Close After Inactivity</Label>
                <p className="text-xs text-muted-foreground">
                  Room will close after period of inactivity (Default: 2 min if enabled, 10 min if disabled)
                </p>
              </div>
              <Switch
                id="auto-close"
                checked={room.autoCloseAfterInactivity}
                onCheckedChange={handleAutoCloseToggle}
              />
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <Label htmlFor="timeout">
                  Inactivity Timeout 
                  {room.autoCloseAfterInactivity ? ' (Enabled)' : ' (Disabled - 10 min fixed)'}
                </Label>
                <span className="text-sm">
                  {room.autoCloseAfterInactivity ? (room.inactivityTimeout || 2) : 10} min
                </span>
              </div>
              {room.autoCloseAfterInactivity && (
                <Slider
                  id="timeout"
                  min={1}
                  max={60}
                  step={1}
                  value={[room.inactivityTimeout || 2]}
                  onValueChange={handleTimeoutChange}
                />
              )}
              <p className="text-xs text-muted-foreground">
                {room.autoCloseAfterInactivity 
                  ? `Room will close after ${room.inactivityTimeout || 2} minutes of no activity`
                  : "Auto-close is disabled. Room will only close after 10 minutes of complete inactivity"
                }
              </p>
            </div>
          </div>
          
          {/* Room Privacy */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center">
              {room.isPublic ? (
                <Globe size={18} className="mr-2" />
              ) : (
                <Lock size={18} className="mr-2" />
              )}
              Room Privacy
            </h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="room-public">Public Room</Label>
                <p className="text-xs text-muted-foreground">
                  {room.isPublic 
                    ? "Anyone can find and join the room" 
                    : "Users must be approved or have join code"
                  }
                </p>
              </div>
              <Switch
                id="room-public"
                checked={room.isPublic}
                onCheckedChange={(value) => {
                  updateSettings({ 
                    isPublic: value,
                    ...(value ? {} : {
                      joinCode: room.joinCode || Math.floor(100000 + Math.random() * 900000).toString()
                    })
                  });
                }}
              />
            </div>
            
            {!room.isPublic && (
              <div className="pt-2 space-y-2">
                <Label htmlFor="join-code">Join Code</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="join-code"
                    value={room.joinCode || ''}
                    readOnly
                    className="font-mono text-center"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                      updateSettings({ joinCode: newCode });
                    }}
                  >
                    Regenerate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this code with users you want to invite
                </p>
              </div>
            )}
          </div>
          
          {/* Pending Requests */}
          {!room.isPublic && room.pendingRequests && room.pendingRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Pending Join Requests</h3>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {room.pendingRequests.length} user(s) waiting for approval
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  View Requests
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RoomSettings;
