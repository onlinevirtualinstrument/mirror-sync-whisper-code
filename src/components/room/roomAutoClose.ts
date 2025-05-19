
/**
 * Utility to automatically close rooms when admin logs out
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
 
// Room auto-close timeout in milliseconds (2 minutes)
const ROOM_AUTO_CLOSE_TIMEOUT = 2 * 60 * 1000;

export const setupRoomAutoClose = (roomId: string, isAdmin: boolean, participantCount: number): (() => void) => {
  // Store the current time the admin was last seen
  if (isAdmin) {
    localStorage.setItem(`room_admin_last_seen_${roomId}`, Date.now().toString());
  }
  
  // Set up the interval to check if admin is still active
  const interval = setInterval(() => {
    const adminLastSeen = parseInt(localStorage.getItem(`room_admin_last_seen_${roomId}`) || '0');
    const currentTime = Date.now();
    
    // If admin hasn't been seen for the timeout period and there's only 1 participant (or less)
    if (
      adminLastSeen > 0 && 
      currentTime - adminLastSeen > ROOM_AUTO_CLOSE_TIMEOUT && 
      participantCount <= 1
    ) {
      // Close the room
      const existingRooms = JSON.parse(localStorage.getItem('musicRooms') || '[]');
      const updatedRooms = existingRooms.filter((room: any) => room.id !== roomId);
      localStorage.setItem('musicRooms', JSON.stringify(updatedRooms));
      
      // Clean up admin flags
      localStorage.removeItem(`room_host_${roomId}`);
      localStorage.removeItem(`room_admin_last_seen_${roomId}`);
      
      // Show toast notification
      toast.info("Room has been automatically closed due to admin inactivity.");
      
      // Redirect to music rooms
      window.location.href = '/music-rooms';
    }
  }, 30000); // Check every 30 seconds
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
  };
};

// Hook for component usage
export const useRoomAutoClose = (
  roomId: string, 
  isAdmin: boolean,
  participantCount: number
) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Update admin last seen timestamp regularly if admin
    let adminHeartbeat: number | undefined;
    if (isAdmin) {
      adminHeartbeat = window.setInterval(() => {
        localStorage.setItem(`room_admin_last_seen_${roomId}`, Date.now().toString());
      }, 10000);
    }
    
    // Setup room auto-close
    const cleanup = setupRoomAutoClose(roomId, isAdmin, participantCount);
    
    // Cleanup on unmount
    return () => {
      if (adminHeartbeat) clearInterval(adminHeartbeat);
      cleanup();
    };
  }, [roomId, isAdmin, participantCount]);
  
  // Return nothing, just setup effects
  return null;
};
