
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { Globe, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { saveRoomToFirestore } from '@/utils/firebase';
import { v4 as uuidv4 } from 'uuid';

const CreateRoomModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('piano');
  const [isCreating, setIsCreating] = useState(false);
  const [allowDifferentInstruments, setAllowDifferentInstruments] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(allowDifferentInstruments ? 7 : 3);
  const [isPublic, setIsPublic] = useState(true);
  const [autoCloseAfterInactivity, setAutoCloseAfterInactivity] = useState(false);
  const [inactivityTimeout, setInactivityTimeout] = useState(5);

  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // When the instrument mode changes, update max participants accordingly
  const handleInstrumentModeChange = (newValue: boolean) => {
    setAllowDifferentInstruments(newValue);

    // If switching to single instrument mode and max participants > 3, adjust it down
    if (!newValue && maxParticipants > 3) {
      setMaxParticipants(3);
    }
  };

  const createRoom = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a music room",
        variant: "destructive",
      });
      setIsOpen(false);
      return;
    }

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
    const roomId = uuidv4();

    // Use the actual user info from Firebase auth
    const userId = user.uid;
    const displayName = user.displayName || 'Room Admin';

    try {
      // Create room data
      const roomData: any = {
        id: roomId,
        name: roomName,
        hostInstrument: selectedInstrument,
        hostId: userId,
        allowDifferentInstruments: allowDifferentInstruments,
        maxParticipants: maxParticipants,
        isPublic: isPublic,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        pendingRequests: [],
        autoCloseAfterInactivity: autoCloseAfterInactivity,
        inactivityTimeout: inactivityTimeout,
        isChatDisabled: false,
        participants: [
          {
            id: userId,
            name: displayName,
            instrument: selectedInstrument,
            avatar: user.photoURL || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
            isHost: true,
            status: 'online',
            muted: false
          }
        ],
        participantIds: [userId]
      };

      // If private room, create a join code
      if (!isPublic) {
        roomData.joinCode = Math.floor(100000 + Math.random() * 900000).toString();
      }

      await saveRoomToFirestore(roomData);

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
    } catch (error) {
      console.error("Room creation error:", error);
      setIsCreating(false);
      
      toast({
        title: "Error creating room",
        description: "There was a problem creating your music room. Please try again.",
        variant: "destructive",
      });
    }
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="group p-0" variant="link" onClick={handleCreateRoomClick}>
          <span className="relative hover-scale">
            Create New Room
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] animate-scale-in">
        <DialogHeader>
          <DialogTitle>Create a Music Room</DialogTitle>
          <DialogDescription>
            Set up a virtual room to play music with friends or others in real-time.
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
                <SelectItem value="drummachine">Drum Machine</SelectItem>
                <SelectItem value="chordprogression">ChordProgression</SelectItem>
                <SelectItem value="drums">Drums</SelectItem>
                <SelectItem value="flute">Flute</SelectItem>
                <SelectItem value="saxophone">Saxophone</SelectItem>
                <SelectItem value="trumpet">Trumpet</SelectItem>
                <SelectItem value="veena">Veena</SelectItem>
                <SelectItem value="violin">Violin</SelectItem>
                <SelectItem value="xylophone">Xylophone</SelectItem>
                <SelectItem value="kalimba">Kalimba</SelectItem>
                <SelectItem value="marimba">Marimba</SelectItem>
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
                  : "Only people with approved requests or join code can join"}
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="auto-close" className="text-right">
              Auto-Close
            </Label>
            <div className="col-span-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {autoCloseAfterInactivity ? `After ${inactivityTimeout} min inactivity` : "Disabled"}
                </span>
                <Switch
                  id="auto-close"
                  checked={autoCloseAfterInactivity}
                  onCheckedChange={setAutoCloseAfterInactivity}
                />
              </div>
              {autoCloseAfterInactivity && (
                <div className="pt-2">
                  <Slider
                    min={1}
                    max={60}
                    step={1}
                    value={[inactivityTimeout]}
                    onValueChange={(value) => setInactivityTimeout(value[0])}
                  />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>1 min</span>
                    <span>60 min</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {autoCloseAfterInactivity
                  ? "Room will automatically close when inactive"
                  : "Room will remain open until you close it"}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={createRoom}
            disabled={isCreating || !roomName.trim() || !user}
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