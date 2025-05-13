
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';
import { Globe, Lock } from 'lucide-react';

const CreateRoomModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('piano');
  const [isCreating, setIsCreating] = useState(false);
  const [allowDifferentInstruments, setAllowDifferentInstruments] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(allowDifferentInstruments ? 7 : 3);
  const [isPublic, setIsPublic] = useState(true);
  
  const navigate = useNavigate();

  // When the instrument mode changes, update max participants accordingly
  const handleInstrumentModeChange = (newValue: boolean) => {
    setAllowDifferentInstruments(newValue);
    
    // If switching to single instrument mode and max participants > 3, adjust it down
    if (!newValue && maxParticipants > 3) {
      setMaxParticipants(3);
    }
  };

  const createRoom = () => {
    if (!roomName.trim()) {
      toast({
        title: "Room name required",
        description: "Please enter a name for your music room",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    // Generate a unique room ID
    const roomId = Date.now().toString();

    // Generate a user ID for the host if none exists
    const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }
    
    // Create room data
    const roomData = {
      id: roomId,
      name: roomName,
      hostInstrument: selectedInstrument,
      allowDifferentInstruments: allowDifferentInstruments,
      maxParticipants: maxParticipants,
      isPublic: isPublic,
      createdAt: new Date().toISOString(),
      pendingRequests: [],
      participants: [
        {
          id: userId,
          name: 'Room Admin',
          instrument: selectedInstrument,
          avatar: `https://i.pravatar.cc/150?img=1`,
          isHost: true,
          status: 'online'
        }
      ]
    };
    
    // Save to localStorage
    const existingRooms = JSON.parse(localStorage.getItem('musicRooms') || '[]');
    localStorage.setItem('musicRooms', JSON.stringify([...existingRooms, roomData]));
    
    // Mark the current user as the host for this room
    localStorage.setItem(`room_host_${roomId}`, 'true');
    
    // Simulate delay for better UX
    setTimeout(() => {
      setIsCreating(false);
      setIsOpen(false);
      
      toast({
        title: "Room created!",
        description: `Your music room "${roomName}" is ready`,
      });
      
      // Navigate to the room
      navigate(`/room/${roomId}`);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="group p-0" variant="link">
          <span className="relative hover-scale">
            Create New Room
            {/* <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span> */}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] animate-scale-in">
        <DialogHeader>
          <DialogTitle>Create a Music Room</DialogTitle>
          <DialogDescription>
            Start a collaborative music session with friends or other musicians.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Room Name
            </Label>
            <Input
              id="name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="My Music Session"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="instrument" className="text-right">
              Instrument
            </Label>
            <Select
              value={selectedInstrument}
              onValueChange={setSelectedInstrument}
            >
              <SelectTrigger id="instrument" className="col-span-3">
                <SelectValue placeholder="Select instrument" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="piano">Piano</SelectItem>
                <SelectItem value="guitar">Guitar</SelectItem>
                <SelectItem value="violin">Violin</SelectItem>
                <SelectItem value="drums">Drums</SelectItem>
                <SelectItem value="flute">Flute</SelectItem>
                <SelectItem value="saxophone">Saxophone</SelectItem>
                <SelectItem value="trumpet">Trumpet</SelectItem>
                <SelectItem value="harp">Harp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="privacy" className="text-right">
              Room Privacy
            </Label>
            <div className="col-span-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center text-sm gap-1.5">
                  {isPublic ? (
                    <>
                      <Globe size={16} className="text-green-500" />
                      <span>Public Room</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="text-amber-500" />
                      <span>Private Room</span>
                    </>
                  )}
                </span>
                <Switch 
                  id="privacy" 
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isPublic 
                  ? "Anyone can find and join your room" 
                  : "Only people with approved requests can join"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="instrument-mode" className="text-right">
              Instrument Mode
            </Label>
            <div className="col-span-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {allowDifferentInstruments ? "Different instruments" : "Same instrument"}
                </span>
                <Switch 
                  id="instrument-mode" 
                  checked={allowDifferentInstruments}
                  onCheckedChange={handleInstrumentModeChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {allowDifferentInstruments 
                  ? "Participants can play different instruments" 
                  : "All participants play the same instrument"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="max-participants" className="text-right">
              Max Participants
            </Label>
            <div className="col-span-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">{maxParticipants}</span>
                <span className="text-xs text-muted-foreground">
                  {allowDifferentInstruments ? "Max 7" : "Max 3"}
                </span>
              </div>
              <Slider 
                id="max-participants"
                min={1} 
                max={allowDifferentInstruments ? 7 : 3} 
                step={1}
                value={[maxParticipants]}
                onValueChange={(value) => setMaxParticipants(value[0])}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={createRoom}
            disabled={isCreating || !roomName.trim()}
          >
            {isCreating ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-opacity-50 border-t-transparent rounded-full"></span>
                Creating...
              </span>
            ) : (
              'Create Room'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomModal;