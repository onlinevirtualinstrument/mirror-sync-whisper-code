
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
<<<<<<< HEAD
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';
import { Globe, Lock } from 'lucide-react';
=======
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Music } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
>>>>>>> 16fe0921b7f4fa4b469f25cb7bb087c1a18c33f0
import { useAuth } from '@/hooks/useAuth';

// Define random avatars
const AVATAR_URLS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Pepper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Smokey',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Patches',
];

export default function CreateRoomModal() {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [instrument, setInstrument] = useState('piano');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [isPublic, setIsPublic] = useState(true);
  const [allowDifferentInstruments, setAllowDifferentInstruments] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
<<<<<<< HEAD
  const { user, loading } = useAuth();

  // When the instrument mode changes, update max participants accordingly
  const handleInstrumentModeChange = (newValue: boolean) => {
    setAllowDifferentInstruments(newValue);
    
    // If switching to single instrument mode and max participants > 3, adjust it down
    if (!newValue && maxParticipants > 3) {
      setMaxParticipants(3);
    }
  };

  const createRoom = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a music room",
        variant: "destructive",
      });
      setIsOpen(false);
      return;
    }

=======
  const { user } = useAuth();

  const createRoom = () => {
    if (!user) {
      toast.error("Please log in to create a room");
      return;
    }
    
>>>>>>> 16fe0921b7f4fa4b469f25cb7bb087c1a18c33f0
    if (!roomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }
    
    setIsCreating(true);
    
<<<<<<< HEAD
    // Generate a unique room ID
    const roomId = Date.now().toString();

    // Use the actual user info from Firebase auth
    const userId = user.uid;
    const displayName = user.displayName || 'Room Admin';
=======
    // Generate room ID
    const roomId = uuidv4();
>>>>>>> 16fe0921b7f4fa4b469f25cb7bb087c1a18c33f0
    
    // Get existing rooms or initialize empty array
    const existingRooms = JSON.parse(localStorage.getItem('musicRooms') || '[]');
    
    // Get random avatar for host
    const hostAvatar = user?.photoURL || AVATAR_URLS[Math.floor(Math.random() * AVATAR_URLS.length)];
    
    // Create new room object
    const newRoom = {
      id: roomId,
      name: roomName,
      hostInstrument: instrument,
      allowDifferentInstruments,
      maxParticipants,
      isPublic,
      createdAt: new Date().toISOString(),
      participants: [
        {
<<<<<<< HEAD
          id: userId,
          name: displayName,
          instrument: selectedInstrument,
          avatar: user.photoURL || `https://i.pravatar.cc/150?img=1`,
=======
          id: 'host',
          name: user?.displayName || 'Room Host',
          instrument,
          avatar: hostAvatar,
>>>>>>> 16fe0921b7f4fa4b469f25cb7bb087c1a18c33f0
          isHost: true,
          status: 'active'
        }
      ]
    };
    
    // Add new room to existing rooms
    const updatedRooms = [...existingRooms, newRoom];
    
    // Save updated rooms to localStorage
    localStorage.setItem('musicRooms', JSON.stringify(updatedRooms));
    
    // Set host flag in localStorage
    localStorage.setItem(`room_host_${roomId}`, 'true');
    
    setTimeout(() => {
      setIsCreating(false);
      setOpen(false);
      toast.success("Room created successfully!");
      
      // Navigate to room without scrolling
      const scrollPosition = window.scrollY;
      navigate(`/room/${roomId}`);
      // Restore scroll position if needed
      setTimeout(() => window.scrollTo(0, scrollPosition), 100);
    }, 1000);
  };

  // If user is not logged in, show login prompt on button click
  const handleCreateRoomClick = () => {
    if (!user && !loading) {
      toast({
        title: "Authentication required",
        description: "Please login to create a music room",
        variant: "destructive",
      });
      return;
    }
    
    setIsOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
<<<<<<< HEAD
        <Button className="group p-0" variant="link" onClick={handleCreateRoomClick}>
          <span className="relative hover-scale">
            Create New Room
          </span>
=======
        <Button variant="outline" size="sm" className="ml-4 h-8 rounded-md px-3 py-1 mt-1">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Room
>>>>>>> 16fe0921b7f4fa4b469f25cb7bb087c1a18c33f0
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a Music Room</DialogTitle>
          <DialogDescription>
<<<<<<< HEAD
            Set up a virtual room to play music with  friends or others in real-time.
=======
            Set up a virtual room to play music with others in real-time.
>>>>>>> 16fe0921b7f4fa4b469f25cb7bb087c1a18c33f0
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="Enter a name for your room"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="instrument">Your Instrument</Label>
            <Select value={instrument} onValueChange={setInstrument}>
              <SelectTrigger id="instrument">
                <SelectValue placeholder="Select instrument" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="piano">Piano</SelectItem>
                <SelectItem value="guitar">Guitar</SelectItem>
                <SelectItem value="drums">Drums</SelectItem>
                <SelectItem value="violin">Violin</SelectItem>
                <SelectItem value="flute">Flute</SelectItem>
                <SelectItem value="saxophone">Saxophone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="max-participants">Maximum Participants</Label>
            <Select 
              value={maxParticipants.toString()} 
              onValueChange={(value) => setMaxParticipants(parseInt(value))}
            >
              <SelectTrigger id="max-participants">
                <SelectValue placeholder="Select max participants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 musicians</SelectItem>
                <SelectItem value="4">4 musicians</SelectItem>
                <SelectItem value="6">6 musicians</SelectItem>
                <SelectItem value="8">8 musicians</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="allow-different-instruments" 
              checked={allowDifferentInstruments}
              onCheckedChange={(checked) => setAllowDifferentInstruments(!!checked)}
            />
            <Label htmlFor="allow-different-instruments">
              Allow different instruments in the room
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="is-public" 
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(!!checked)}
            />
            <Label htmlFor="is-public">Make this room public</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
<<<<<<< HEAD
            type="submit" 
            
            onClick={createRoom}
            disabled={isCreating || !roomName.trim() || !user}
=======
            onClick={createRoom}
            disabled={isCreating || !user}
            className="gap-2"
>>>>>>> 16fe0921b7f4fa4b469f25cb7bb087c1a18c33f0
          >
            {isCreating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Music className="h-4 w-4" />
                <span>Create Room</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
