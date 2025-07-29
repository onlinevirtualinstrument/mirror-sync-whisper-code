
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { InstrumentNote } from '@/types/InstrumentNote';

export const broadcastNote = async (roomId: string, noteData: InstrumentNote): Promise<void> => {
  try {
    const notesRef = collection(db, 'rooms', roomId, 'notes');
    
    const noteWithTimestamp = {
      ...noteData,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    await addDoc(notesRef, noteWithTimestamp);
    console.log('Note broadcasted successfully:', noteData.note);
  } catch (error) {
    console.error('Error broadcasting note:', error);
    throw error;
  }
};

export const listenToInstrumentNotes = (
  roomId: string,
  onNote: (note: InstrumentNote) => void,
  onError: (error: Error) => void
): () => void => {
  try {
    const notesRef = collection(db, 'rooms', roomId, 'notes');
    const notesQuery = query(
      notesRef,
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const note: InstrumentNote = {
              note: data.note,
              instrument: data.instrument,
              userId: data.userId,
              userName: data.userName,
              frequency: data.frequency,
              velocity: data.velocity,
              duration: data.duration,
              timestamp: data.createdAt || new Date().toISOString(),
              serverTimestamp: data.timestamp?.toMillis?.() || Date.now(),
              sessionId: data.sessionId,
              clientId: data.clientId,
              roomId: data.roomId
            };
            
            // Only process recent notes (within last 5 seconds)
            const noteAge = Date.now() - (note.serverTimestamp || 0);
            if (noteAge < 5000) {
              onNote(note);
            }
          }
        });
      },
      (error) => {
        console.error('Error listening to notes:', error);
        onError(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up note listener:', error);
    onError(error as Error);
    return () => {};
  }
};
