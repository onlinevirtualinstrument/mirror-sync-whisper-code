
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Globe, Lock, Users, Calendar, Music, ArrowRight, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import CreateRoomModal from '@/components/room/CreateRoomModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

interface RoomType {
  id: string;
  name: string;
  hostInstrument: string;
  allowDifferentInstruments: boolean;
  maxParticipants: number;
  isPublic: boolean;
  createdAt: string;
  pendingRequests?: string[];
  participants: Array<{
    id: string;
    name: string;
    instrument: string;
    avatar: string;
    isHost: boolean;
    status: string;
  }>;
}

const MusicRooms = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loginAlertOpen, setLoginAlertOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Load rooms from localStorage
    const loadRooms = () => {
      const storedRooms = JSON.parse(localStorage.getItem('musicRooms') || '[]');
      setRooms(storedRooms);
    };

    loadRooms();

    // Refresh rooms every few seconds to catch new ones
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const joinRoom = (room: RoomType) => {
    if (!user) {
      // toast.error("Please log in to join a room.");
      // Show login alert instead of toast
      setLoginAlertOpen(true);
      return;
    }

    if (room.participants.length >= room.maxParticipants) {
      toast.error("This room is full. Please try another room.");
      return;
    }

    // For public rooms or if user is the host, join directly
    const isHost = localStorage.getItem(`room_host_${room.id}`) === 'true';
    
    if (room.isPublic || isHost) {
      navigate(`/room/${room.id}`);
    } else {
      // For private rooms, check if already approved or show request dialog
      const userId = user.uid;
      
      // Check if request already pending
      const isPending = room.pendingRequests?.includes(userId);
      
      // Check if already approved (if user data exists in room participants)
      const isApproved = room.participants.some(p => p.id === userId && p.id !== 'host');
      
      if (isApproved) {
        navigate(`/room/${room.id}`);
      } else if (isPending) {
        toast.info("Your request to join this room is pending approval from the host.");
      } else {
        setSelectedRoom(room);
        setRequestDialogOpen(true);
      }
    }
  };

  const requestToJoinRoom = () => {
    if (!selectedRoom || !user) return;
    
    setLoadingRequest(true);
    const userId = user.uid;
    
    // Update room with pending request
    const updatedRooms = rooms.map(room => {
      if (room.id === selectedRoom.id) {
        return {
          ...room,
          pendingRequests: [...(room.pendingRequests || []), userId]
        };
      }
      return room;
    });
    
    // Save updated rooms
    localStorage.setItem('musicRooms', JSON.stringify(updatedRooms));
    setRooms(updatedRooms);
    
    // Clean up and notify
    setTimeout(() => {
      setLoadingRequest(false);
      setRequestDialogOpen(false);
      setSelectedRoom(null);
      toast.success("Request to join room sent to the host.");
    }, 1000);
  };

  const filteredRooms = activeTab === 'all' 
    ? rooms 
    : activeTab === 'public' 
      ? rooms.filter(room => room.isPublic) 
      : rooms.filter(room => !room.isPublic);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Live Music Rooms</h1>
            <p className="text-muted-foreground">
              Join a live music session or create your own to collaborate with other musicians.
            </p>
          </div>
          <div className="flex items-center">
            <CreateRoomModal />
          </div>
        </div>

        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Rooms</TabsTrigger>
              <TabsTrigger value="public">Public Rooms</TabsTrigger>
              <TabsTrigger value="private">Private Rooms</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed animate-fade-in">
            <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No music rooms available</h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === 'private' 
                ? "You don't have access to any private rooms at the moment."
                : "Be the first to create a music room and invite others to join!"}
            </p>
            <div className="flex justify-center">
              <CreateRoomModal />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              // Find the host participant
              const hostParticipant = room.participants.find(p => p.isHost);
              const hostName = hostParticipant?.name || 'Room Admin';
              
              return (
                <div 
                  key={room.id} 
                  className="border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-card animate-scale-in"
                >
                  <div className="p-6">
                    <div className="flex justify-between mb-2">
                      <div className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${room.isPublic ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {room.isPublic ? (
                          <>
                            <Globe className="h-3 w-3" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" />
                            <span>Private</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(room.createdAt), 'MMM d, h:mm a')}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-2 line-clamp-1">{room.name}</h3>

                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <span className="font-medium text-primary">Host:</span>
                      <span>{hostName}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <Music className="h-4 w-4" />
                      <span>
                        {room.allowDifferentInstruments 
                          ? "Multiple instruments" 
                          : `${room.hostInstrument.charAt(0).toUpperCase() + room.hostInstrument.slice(1)} only`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {room.participants.length} / {room.maxParticipants} participants
                      </span>
                    </div>

                    <div className="flex -space-x-2 mb-4">
                      {room.participants.map((participant, index) => (
                        <div 
                          key={`${participant.id}-${index}`} 
                          className="h-8 w-8 rounded-full border-2 border-background overflow-hidden"
                          title={participant.name}
                        >
                          <img 
                            src={participant.avatar} 
                            alt={participant.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={() => joinRoom(room)} 
                      className="w-full group"
                      variant={room.isPublic ? "default" : "outline"}
                      disabled={!user || room.participants.length >= room.maxParticipants}
                    >
                      {!user ? (
                        'Login to Join'
                      ) : room.participants.length >= room.maxParticipants ? (
                        'Room Full'
                      ) : !room.isPublic ? (
                        <>
                          Request to Join
                          <UserPlus className="ml-1 h-4 w-4 group-hover:scale-110 transition-transform" />
                        </>
                      ) : (
                        <>
                          Join Session
                          <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Join Request Dialog */}
        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request to Join Private Room</DialogTitle>
              <DialogDescription>
                This is a private music room. Send a request to the host to join this session.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm mb-2">Room: <span className="font-medium">{selectedRoom?.name}</span></p>
              <p className="text-sm">
                The host will need to approve your request before you can join this room.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="secondary" 
                onClick={() => setRequestDialogOpen(false)}
                disabled={loadingRequest}
              >
                Cancel
              </Button>
              <Button 
                onClick={requestToJoinRoom}
                disabled={loadingRequest || !user}
              >
                {loadingRequest ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-opacity-50 border-t-transparent rounded-full"></span>
                    Sending...
                  </span>
                ) : (
                  'Send Request'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Login Alert Dialog */}
        <Dialog open={loginAlertOpen} onOpenChange={setLoginAlertOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Login Required</DialogTitle>
              <DialogDescription>
                You need to be logged in to join a music room. Please log in or create an account.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setLoginAlertOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setLoginAlertOpen(false);
                  navigate('/auth/login');
                }}
                className="w-full sm:w-auto"
              >
                Log In
              </Button>
              <Button 
                onClick={() => {
                  setLoginAlertOpen(false);
                  navigate('/auth/register');
                }}
                variant="default"
                className="w-full sm:w-auto"
              >
                Sign Up
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default MusicRooms;