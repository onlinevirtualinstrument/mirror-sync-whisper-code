
export interface InstrumentNote {
  note: string;
  instrument: string;
  userId: string;
  userName: string;
  timestamp?: string;
  frequency?: number;
  velocity?: number;
  duration?: number;
  sessionId?: string;
  serverTimestamp?: number;
  clientId?: string;
  roomId?: string;
}
