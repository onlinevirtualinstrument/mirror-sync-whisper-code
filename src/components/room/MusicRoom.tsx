
import React, { useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  const navigate = useNavigate();

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
    return <Navigate to="/login" />;
  }

  if (!roomId) {
    toast({
      title: "Invalid Room",
      description: "No room ID provided",
      variant: "destructive",
    });
    return <Navigate to="/music-rooms" />;
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
