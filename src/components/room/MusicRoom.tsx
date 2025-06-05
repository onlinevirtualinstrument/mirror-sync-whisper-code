
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
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

  // Check if user is authenticated
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
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
    return <Navigate to="/" />;
  }

  return (
    <AppLayout>
      <RoomProvider>
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Header section with controls */}
          <RoomHeader />
          
          {/* Join requests visible only to host when there are pending requests */}
          <JoinRequests />
          
          {/* Main content area: instrument and sidebar */}
          <div className="flex-1 flex overflow-hidden">
            {/* Instrument takes majority of space */}
            <div className="flex-1 overflow-hidden">
              <RoomInstrument />
            </div>
            
            {/* Sidebar with chat and participants */}
            <div className="w-80 border-l flex flex-col">
              <div className="flex-1">
                <RoomChat />
              </div>
              <div className="h-48 border-t">
                <RoomParticipants />
              </div>
            </div>
          </div>
        </div>
        
        {/* Modals and overlays */}
        <PrivateMessaging />
        <JoinPrivateRoom />
      </RoomProvider>
    </AppLayout>
  );
};

export default MusicRoom;
