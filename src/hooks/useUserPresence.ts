// hooks/useUserPresence.ts
import { useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { getDatabase, ref, onDisconnect, set, onValue, serverTimestamp } from 'firebase/database';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/utils/firebase/config';

export const useUserPresence = (roomId: string | undefined, isParticipant: boolean) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!roomId || !user || !isParticipant) return;

    const rtdb = getDatabase();
    const userStatusRef = ref(rtdb, `status/${roomId}/${user.uid}`);
    const firestoreRef = doc(db, 'musicRooms', roomId);
    const connectedRef = ref(rtdb, '.info/connected');

    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) return;

      onDisconnect(userStatusRef)
        .set({ state: 'disconnected', lastChanged: serverTimestamp() })
        .then(() => {
          set(userStatusRef, { state: 'connected', lastChanged: serverTimestamp() });

          updateDoc(firestoreRef, {
            [`participants.${user.uid}.isInRoom`]: true,
            [`participants.${user.uid}.status`]: 'active',
            [`participants.${user.uid}.lastSeen`]: new Date().toISOString()
          }).catch(console.error);
        });
    });

    return () => {
      updateDoc(firestoreRef, {
        [`participants.${user.uid}.isInRoom`]: false,
        [`participants.${user.uid}.status`]: 'disconnected',
        [`participants.${user.uid}.leftAt`]: new Date().toISOString()
      }).catch(console.error);
    };
  }, [roomId, user, isParticipant]);
};
