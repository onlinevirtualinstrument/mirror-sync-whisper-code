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
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { db } from '@/utils/firebase/index';
import { doc, updateDoc } from 'firebase/firestore';
import {
  listenToLiveRooms,
  addUserToRoom
} from "@/utils/firebase/index";

interface RoomType {
  id: string;
  name: string;
  hostId: string;
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
    joinedAt: string;
    lastSeen: string;
  }>;
}

const MusicRooms = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { handleFirebaseError, handleAsyncError } = useErrorHandler();

  console.log('MusicRooms: Component initialized, user:', user?.uid);

  function isFirestoreTimestamp(value: any): value is { toDate: () => Date } {
    return value && typeof value.toDate === 'function';
  }

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    try {
      console.log('MusicRooms: Setting up live rooms listener');
      
      unsubscribe = listenToLiveRooms(
        (liveRooms) => {
          console.log('MusicRooms: Received live rooms data:', liveRooms.length, 'rooms');
          
          const normalizedRooms = liveRooms.map(room => {
            const participants = Array.isArray(room.participants) ? room.participants : [];
            
            const normalizedRoom: RoomType = {
              ...room,
              hostId: room.hostId || room.creatorId || '',
              participants,
              pendingRequests: Array.isArray(room.pendingRequests) ? room.pendingRequests : [],
              participantIds: Array.isArray(room.participantIds) ? room.participantIds : [],
              maxParticipants: typeof room.maxParticipants === 'number' ? room.maxParticipants : 3,
              isPublic: typeof room.isPublic === 'boolean' ? room.isPublic : true,
              hostInstrument: room.hostInstrument || 'piano',
              allowDifferentInstruments: typeof room.allowDifferentInstruments === 'boolean' ? room.allowDifferentInstruments : true,
              createdAt: room.createdAt ? (isFirestoreTimestamp(room.createdAt) ? room.createdAt.toDate().toISOString() : typeof room.createdAt === 'string' ? room.createdAt : new Date().toISOString()) : new Date().toISOString()
            };
            
            console.log(`MusicRooms: Room ${room.id} - participants: ${participants.length}/${normalizedRoom.maxParticipants}, isPublic: ${normalizedRoom.isPublic}, hostId: ${normalizedRoom.hostId}`);
            return normalizedRoom;
          });
          
          setRooms(normalizedRooms);
        },
        (error) => {
          console.error('MusicRooms: Live rooms listener error:', error);
          handleFirebaseError(error, 'fetch live rooms', user?.uid);
          
          toast({
            description: "Unable to fetch live rooms. Please refresh the page.",
            variant: "destructive"
          });
        }
      );
    } catch (error) {
      console.error('MusicRooms: Failed to setup live rooms listener:', error);
      handleAsyncError(error as Error, 'setup live rooms listener', user?.uid);
    }

    return () => {
      if (unsubscribe) {
        console.log('MusicRooms: Cleaning up live rooms listener');
        try {
          unsubscribe();
        } catch (error) {
          console.error('MusicRooms: Error during listener cleanup:', error);
        }
      }
    };
  }, [user?.uid, handleFirebaseError, handleAsyncError]);

  const joinRoom = async (room: any) => {
    if (!user || !room.id) {
      console.warn('MusicRooms: Cannot join room - missing user or room ID');
      return;
    }

    console.log(`MusicRooms: User ${user.uid} attempting to join room ${room.id} (${room.name})`);
    
    const isHost = room.hostId === user.uid;
    const participantIds = Array.isArray(room.participantIds) ? room.participantIds : [];
    const isAlreadyParticipant = participantIds.includes(user.uid);

    console.log(`MusicRooms: Join room analysis - isHost: ${isHost}, isAlreadyParticipant: ${isAlreadyParticipant}, isPublic: ${room.isPublic}, participants: ${participantIds.length}/${room.maxParticipants}`);

    // Check if room is full
    if (participantIds.length >= room.maxParticipants && !isAlreadyParticipant) {
      console.log('MusicRooms: Room is full, cannot join');
      toast({
        title: "Room Full",
        description: "This room has reached its maximum capacity.",
        variant: "destructive"
      });
      return;
    }

    // Check access permissions
    if (!room.isPublic && !isHost && !isAlreadyParticipant) {
      console.log('MusicRooms: Private room access denied');
      toast({
        title: "Access Denied",
        description: "This is a private room and you don't have access.",
        variant: "destructive"
      });
      return;
    }

    try {
      setJoiningRoom(room.id);
      console.log(`MusicRooms: Starting join process for room ${room.id}`);
      
      // Use the robust addUserToRoom function
      const success = await addUserToRoom(room.id, user);
      
      if (success) {
        console.log(`MusicRooms: Successfully joined room ${room.id}, navigating to room`);
        
        toast({
          title: "Joined Room",
          description: `You've joined ${room.name}`,
        });

        // Navigate to room
        navigate(`/room/${room.id}`);
      } else {
        console.error('MusicRooms: Failed to join room - addUserToRoom returned false');
        toast({
          title: "Join Failed",
          description: "Could not join the room. Please try again.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error("MusicRooms: Failed to join room:", error);
      handleFirebaseError(error, `join room ${room.id}`, user.uid, room.id);
      
      toast({
        title: "Join Failed",
        description: "Could not join the room. Please try again.",
        variant: "destructive"
      });
    } finally {
      setJoiningRoom(null);
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
              const participants = Array.isArray(room.participants) ? room.participants : [];
              const hostParticipant = participants.find(p => p?.isHost);
              const hostName = hostParticipant?.name || 'Room Admin';
              const isJoining = joiningRoom === room.id;
              const maxParticipants = typeof room.maxParticipants === 'number' ? room.maxParticipants : 3;
              const participantCount = room.participantIds?.length || participants.length;

              return (
                <div
                  key={room.id}
                  className="border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-card"
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
                          : `${(room.hostInstrument || 'instrument').charAt(0).toUpperCase() + (room.hostInstrument || 'instrument').slice(1)} only`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {participantCount} / {maxParticipants} participants
                      </span>
                    </div>

                    <div className="flex -space-x-2 mb-4">
                      {participants.slice(0, 5).map((participant, index) => (
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
                      {participants.length > 5 && (
                        <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                          +{participants.length - 5}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => joinRoom(room)}
                      className="w-full group hover:scale-[1.02] transition-transform"
                      variant={room.isPublic ? "default" : "outline"}
                      disabled={!user || participantCount >= maxParticipants || isJoining}
                    >
                      {isJoining ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                          Joining...
                        </span>
                      ) : !user ? (
                        'Login to Join'
                      ) : participantCount >= maxParticipants ? (
                        'Room Full'
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
      </div>
    </AppLayout>
  );
};

export default MusicRooms;
