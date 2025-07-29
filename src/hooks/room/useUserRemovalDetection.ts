import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export const useUserRemovalDetection = (room: any, wasParticipant: boolean) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const wasParticipantRef = useRef(wasParticipant);
  const hasBeenRemovedRef = useRef(false);
  const roomIdRef = useRef<string | null>(room?.id || null);

  // ✅ Keep ref synced with prop
  useEffect(() => {
    wasParticipantRef.current = wasParticipant;
  }, [wasParticipant]);

  // ✅ Reset removal state when room changes
  useEffect(() => {
    if (room?.id && room?.id !== roomIdRef.current) {
      roomIdRef.current = room.id;
      hasBeenRemovedRef.current = false;
    }
  }, [room?.id]);

  // ✅ Main removal detection effect
  useEffect(() => {
    if (!room || !user || hasBeenRemovedRef.current) return;

    const participants = room.participants || [];
    const isCurrentlyParticipant = participants.some((p: any) => p.id === user.uid);
    const isHost = participants.find((p: any) => p.id === user.uid)?.isHost;

    console.log('🕵️ useUserRemovalDetection: checking participant removal...', {
      userId: user.uid,
      wasParticipant: wasParticipantRef.current,
      isCurrentlyParticipant,
      isHost,
      participantCount: participants.length,
    });

    // ✅ Redirect only if user was a participant and is no longer one (and isn't the host)
    if (
      wasParticipantRef.current &&
      !isCurrentlyParticipant &&
      participants.length > 0 &&
      !isHost // prevent false-positive for host
    ) {
      hasBeenRemovedRef.current = true;

      addNotification({
        title: 'Removed from Room',
        message: 'You have been removed from the room by the host.',
        type: 'warning',
      });

      setTimeout(() => {
        navigate('/music-rooms', { replace: true });
      }, 100);
    }
  }, [room, user, navigate, addNotification]);

  // Reset removal flag when room changes

  useEffect(() => {
    if (room?.id && room.id !== roomIdRef.current) {
      hasBeenRemovedRef.current = false;
    }

  }, [room?.id]);
};
