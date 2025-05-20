
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Globe, Lock, Users, Music, ArrowRight, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import CreateRoomModal from '@/components/room/CreateRoomModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { auth, db } from '@/utils/auth/firebase';
import { doc, updateDoc, deleteDoc, collection, onSnapshot, QueryDocumentSnapshot, getDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import {
  listenToLiveRooms,
  saveRoomToFirestore,
  addUserToRoom,
  isUserRoomParticipant
} from "@/utils/auth/firebase";

interface RoomType {
  id: string;
  name: string;
  hostInstrument: string;
  allowDifferentInstruments: boolean;
  maxParticipants: number;
  isPublic: boolean;
  createdAt: string;
  pendingRequests?: string[];
  participantIds?: string[];
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
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  function isFirestoreTimestamp(value: any): value is { toDate: () => Date } {
    return value && typeof value.toDate === 'function';
  }

  useEffect(() => {
    const unsubscribe = listenToLiveRooms(
      (liveRooms) => setRooms(liveRooms),
      () =>
        toast({
          description: "Unable to fetch live rooms.",
          variant: "destructive"
        })
    );
    return () => unsubscribe();
  }, []);


  const joinRoom = async (room: any) => {
    if (!user || !room.id) return;

    const isHost = room.hostId === user.uid;
    const isParticipant = (room.participantIds || []).includes(user.uid);

    if (room.isPublic || isHost || isParticipant) {
      try {
        const roomRef = doc(db, "musicRooms", room.id);
        const updatedParticipants = room.participants || [];

        const alreadyIn = updatedParticipants.some(p => p.id === user.uid);

        if (!alreadyIn) {
          updatedParticipants.push({
            id: user.uid,
            name: user.displayName || "Guest",
            instrument: room.hostInstrument || "piano",
            avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            isHost: false,
            status: 'online'
          });
        }

        const updatedIds = [...new Set([...(room.participantIds || []), user.uid])];

        await updateDoc(roomRef, {
          participants: updatedParticipants,
          participantIds: updatedIds
        });

        toast({
          title: "Joined Room",
          description: `You've joined ${room.name}`,
        });

        console.log(`User ${user.uid} joined room ${room.id}`);

        navigate(`/room/${room.id}`);

      } catch (error) {
        console.error("Failed to join room:", error);
        toast({
          title: "Join Failed",
          description: "Could not join the room. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Access Denied",
        description: "This is a private room and you don't have access.",
        variant: "destructive"
      });
    }
  };


  const requestToJoinRoom = async () => {
    if (!selectedRoom || !user) return;

    setLoadingRequest(true);
    const userId = user.uid;

    try {
      const updatedRoom = {
        ...selectedRoom,
        pendingRequests: [...(selectedRoom.pendingRequests || []), userId],
      };

      try {
        await saveRoomToFirestore(updatedRoom);
      } catch (error) {
        toast({ title: 'Error', description: error.message });
      }

      toast({
        description: "Request to join room sent to the host.",
        variant: "default"
      })
      setRequestDialogOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error("🔥 Failed to send join request:", error);
      toast({
        description: "Failed to send request. Please try again.",
        variant: "default"
      })
    } finally {
      setLoadingRequest(false);
    }
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
            <Button
              variant="link"
              onClick={() => navigate("/music-room-templates")}
              className="flex items-center mr-2"
            >
              <span>Room templates</span>
            </Button>
            <CreateRoomModal />
          </div>
        </div>

        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="hover:bg-primary/10 transition-colors">All Rooms</TabsTrigger>
              <TabsTrigger value="public" className="hover:bg-primary/10 transition-colors">Public Rooms</TabsTrigger>
              <TabsTrigger value="private" className="hover:bg-primary/10 transition-colors">Private Rooms</TabsTrigger>
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
              const hostParticipant = (room.participants || []).find(p => p.isHost);
              const hostName = hostParticipant?.name || 'Room Admin';
              const isJoining = joiningRoom === room.id;

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
                        {isFirestoreTimestamp(room.createdAt)
                          ? format(room.createdAt.toDate(), 'MMM d, h:mm a')
                          : typeof room.createdAt === 'string'
                            ? format(new Date(room.createdAt), 'MMM d, h:mm a')
                            : 'Date unknown'}
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
                          : `${(room.hostInstrument || 'instrument').charAt(0).toUpperCase() + (room.hostInstrument || 'instrument').slice(1)} only`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {(room.participants?.length || 0)} / {room.maxParticipants || 0} participants
                      </span>
                    </div>

                    <div className="flex -space-x-2 mb-4">
                      {(room.participants || []).map((participant, index) => (
                        <div
                          key={`${participant.id}-${index}`}
                          className="h-8 w-8 rounded-full border-2 border-background overflow-hidden hover:scale-110 transition-transform"
                          title={participant.name}
                        >
                          <img
                            src={participant.avatar || '/default-avatar.png'}
                            alt={participant.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => joinRoom(room)}
                      className="w-full group hover:scale-[1.02] transition-transform"
                      variant={room.isPublic ? "default" : "outline"}
                      disabled={!user || (room.participants?.length || 0) >= (room.maxParticipants || 0) || isJoining}
                    >
                      {isJoining ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                          Joining...
                        </span>
                      ) : !user ? (
                        'Login to Join'
                      ) : (room.participants?.length || 0) >= (room.maxParticipants || 0) ? (
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
          <DialogContent className="sm:max-w-md animate-fade-in">
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
                className="hover:bg-muted/80 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={requestToJoinRoom}
                disabled={loadingRequest || !user}
                className="hover:bg-primary/90 transition-colors"
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
          <DialogContent className="sm:max-w-md animate-scale-in">
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
                className="w-full sm:w-auto hover:bg-muted/80 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setLoginAlertOpen(false);
                  navigate('/auth/login');
                }}
                className="w-full sm:w-auto hover:bg-primary/90 transition-colors"
              >
                Log In
              </Button>
              <Button
                onClick={() => {
                  setLoginAlertOpen(false);
                  navigate('/auth/register');
                }}
                variant="default"
                className="w-full sm:w-auto hover:bg-primary/90 transition-colors"
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