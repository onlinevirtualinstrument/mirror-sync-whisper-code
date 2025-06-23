
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRoomJoin } from '@/hooks/useRoomJoin';
import { toast } from '@/hooks/use-toast';
import { RoomProvider } from './RoomContext';
import RoomHeader from './RoomHeader';
import RoomParticipants from './RoomParticipants';
import RoomChat from './RoomChat';
import RoomInstrument from './RoomInstrument';
import PrivateMessaging from './PrivateMessaging';
import JoinRequests from './JoinRequests';
import JoinPrivateRoom from './JoinPrivateRoom';
import AppLayout from '@/components/layout/AppLayout';

const MusicRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, loading } = useAuth();
  const { isJoining, joinError, roomExists } = useRoomJoin(roomId);

  // Check if user is authenticated
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    toast({
      title: "Authentication Required",
      description: "Please login to access music rooms",
      variant: "destructive",
    });
    return <Navigate to="/music-rooms" />;
  }

  if (!roomId) {
    toast({
      title: "Invalid Room",
      description: "No room ID provided",
      variant: "destructive",
    });
    return <Navigate to="/music-rooms" />;
  }

  // Show loading while joining
  if (isJoining || roomExists === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent mx-auto mb-4"></div>
          <p>Joining room...</p>
        </div>
      </div>
    );
  }

  // Show error if join failed
  if (joinError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{joinError}</p>
          <button 
            onClick={() => window.location.href = '/music-rooms'}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Return to Music Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <RoomProvider>
        <RoomHeader />
        <JoinRequests />
        <RoomInstrument />
        <PrivateMessaging />
        <JoinPrivateRoom />
      </RoomProvider>
    </AppLayout>
  );
};

export default MusicRoom;
