import { collection, addDoc, onSnapshot, query, orderBy, limit, where, serverTimestamp, deleteDoc, getDocs, doc } from "firebase/firestore";
import { db } from './config';

interface InstrumentNote {
  note: string;
  instrument: string;
  userId: string;
  userName: string;
  timestamp?: any;
  volume?: number;
  effects?: any;
}

// Broadcast instrument note to all participants
export const broadcastNote = async (roomId: string, noteData: InstrumentNote): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, "musicRooms", roomId, "instrumentNotes"), {
      ...noteData,
      timestamp: serverTimestamp(),
      playedAt: Date.now() // For cleanup
    });
    
    // Clean up old notes (keep last 50)
    cleanupOldNotes(roomId);
    
    return docRef.id;
  } catch (error) {
    console.error("Error broadcasting note:", error);
    return null;
  }
};

// Listen to instrument notes in real-time
export const listenToInstrumentNotes = (
  roomId: string,
  onNote: (noteData: InstrumentNote) => void,
  onError?: (error: any) => void
) => {
  const notesQuery = query(
    collection(db, "musicRooms", roomId, "instrumentNotes"),
    orderBy("timestamp", "desc"),
    limit(20)
  );
  
  return onSnapshot(
    notesQuery,
    (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const noteData = {
            id: change.doc.id,
            ...change.doc.data()
          } as InstrumentNote;
          onNote(noteData);
        }
      });
    },
    (error) => {
      console.error("Error listening for instrument notes:", error);
      if (onError) onError(error);
    }
  );
};

// Clean up old instrument notes
const cleanupOldNotes = async (roomId: string): Promise<void> => {
  try {
    const notesRef = collection(db, "musicRooms", roomId, "instrumentNotes");
    const snapshot = await getDocs(notesRef);
    
    if (snapshot.size > 50) {
      const notesByTime = snapshot.docs
        .map(doc => ({ id: doc.id, data: doc.data() }))
        .sort((a, b) => (b.data.playedAt || 0) - (a.data.playedAt || 0));
      
      const toDelete = notesByTime.slice(50);
      
      for (const note of toDelete) {
        await deleteDoc(doc(db, "musicRooms", roomId, "instrumentNotes", note.id));
      }
    }
  } catch (error) {
    console.error("Error cleaning up old notes:", error);
  }
};
