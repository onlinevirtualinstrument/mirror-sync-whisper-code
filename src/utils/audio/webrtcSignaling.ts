import { db } from '@/utils/firebase/config';
import { collection, doc, addDoc, onSnapshot, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  from: string;
  to: string;
  roomId: string;
  timestamp: number;
  signalId?: string;
}

class WebRTCSignaling {
  private roomId: string;
  private userId: string;
  private unsubscribes: (() => void)[] = [];
  private processedSignals: Set<string> = new Set();

  constructor(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
  }

  private serializeIceCandidate(candidate: RTCIceCandidate): any {
    return {
      candidate: candidate.candidate,
      sdpMLineIndex: candidate.sdpMLineIndex,
      sdpMid: candidate.sdpMid,
      usernameFragment: candidate.usernameFragment
    };
  }

  private deserializeIceCandidate(data: any): RTCIceCandidate {
    return new RTCIceCandidate({
      candidate: data.candidate,
      sdpMLineIndex: data.sdpMLineIndex,
      sdpMid: data.sdpMid,
      usernameFragment: data.usernameFragment
    });
  }

  private generateSignalId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendSignal(type: 'offer' | 'answer' | 'ice-candidate', data: any, targetUserId: string) {
    try {
      const signalRef = collection(db, 'webrtc-signals');
      
      // Serialize RTCIceCandidate objects for Firebase
      let serializedData = data;
      if (type === 'ice-candidate' && data instanceof RTCIceCandidate) {
        serializedData = this.serializeIceCandidate(data);
        console.log('WebRTC: Serialized ICE candidate:', serializedData);
      }
      
      // Generate unique signal ID for deduplication
      const signalId = this.generateSignalId();
      
      await addDoc(signalRef, {
        type,
        data: serializedData,
        from: this.userId,
        to: targetUserId,
        roomId: this.roomId,
        timestamp: Date.now(),
        signalId
      });
      console.log(`WebRTC: Sent ${type} to ${targetUserId} with ID ${signalId}`);
    } catch (error) {
      console.error('WebRTC: Error sending signal:', error);
      throw error;
    }
  }

  listenForSignals(onSignal: (signal: SignalingMessage) => void) {
    const signalRef = collection(db, 'webrtc-signals');
    const q = query(
      signalRef,
      where('to', '==', this.userId),
      where('roomId', '==', this.roomId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const signal = change.doc.data() as SignalingMessage;
          
          // Skip if signal already processed (deduplication)
          const signalKey = signal.signalId || `${signal.from}-${signal.type}-${signal.timestamp}`;
          if (this.processedSignals.has(signalKey)) {
            console.log('WebRTC: Skipping duplicate signal:', signalKey);
            return;
          }
          
          // Mark signal as processed
          this.processedSignals.add(signalKey);
          
          // Clean up old processed signals (keep only last 100)
          if (this.processedSignals.size > 100) {
            const signalsArray = Array.from(this.processedSignals);
            const toDelete = signalsArray.slice(0, signalsArray.length - 50);
            toDelete.forEach(id => this.processedSignals.delete(id));
          }
          
          // Deserialize ICE candidates
          if (signal.type === 'ice-candidate') {
            signal.data = this.deserializeIceCandidate(signal.data);
            console.log('WebRTC: Deserialized ICE candidate:', signal.data);
          }
          
          console.log('WebRTC: Processing signal:', signal.type, 'from', signal.from, 'ID:', signalKey);
          onSignal(signal);
          
          // Clean up the signal after processing
          try {
            await deleteDoc(change.doc.ref);
            console.log('WebRTC: Deleted processed signal:', signalKey);
          } catch (error) {
            console.error('WebRTC: Error deleting signal:', error);
          }
        }
      });
    });

    this.unsubscribes.push(unsubscribe);
    return unsubscribe;
  }

  cleanup() {
    console.log('WebRTC: Cleaning up signaling');
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
    this.unsubscribes = [];
    this.processedSignals.clear();
  }
}

export default WebRTCSignaling;
