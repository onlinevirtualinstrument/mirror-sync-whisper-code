// Browser-compatible EventEmitter implementation
class SimpleEventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }

  removeAllListeners(): void {
    this.events = {};
  }
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  enableAudio: boolean;
  enableVideo: boolean;
  enableDataChannel: boolean;
}

export interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  stream?: MediaStream;
  isInitiator: boolean;
}

export interface WebRTCMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'data';
  from: string;
  to: string;
  data: any;
}

class WebRTCManager extends SimpleEventEmitter {
  private peers: Map<string, PeerConnection> = new Map();
  private localStream?: MediaStream;
  private config: WebRTCConfig;
  private userId: string;
  private roomId: string;

  constructor(userId: string, roomId: string, config: Partial<WebRTCConfig> = {}) {
    super();
    this.userId = userId;
    this.roomId = roomId;
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      enableAudio: true,
      enableVideo: false,
      enableDataChannel: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    try {
      if (this.config.enableAudio || this.config.enableVideo) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: this.config.enableAudio,
          video: this.config.enableVideo
        });
        
        this.emit('localStream', this.localStream);
      }
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      throw error;
    }
  }

  async createPeerConnection(peerId: string, isInitiator: boolean = false): Promise<PeerConnection> {
    const connection = new RTCPeerConnection({
      iceServers: this.config.iceServers
    });

    const peer: PeerConnection = {
      id: peerId,
      connection,
      isInitiator
    };

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        connection.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    connection.ontrack = (event) => {
      peer.stream = event.streams[0];
      this.emit('remoteStream', { peerId, stream: event.streams[0] });
    };

    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('message', {
          type: 'ice-candidate',
          from: this.userId,
          to: peerId,
          data: event.candidate
        });
      }
    };

    // Handle connection state changes
    connection.onconnectionstatechange = () => {
      console.log(`Peer ${peerId} connection state:`, connection.connectionState);
      this.emit('connectionStateChange', { peerId, state: connection.connectionState });
      
      if (connection.connectionState === 'failed' || connection.connectionState === 'disconnected') {
        this.removePeer(peerId);
      }
    };

    // Create data channel if enabled
    if (this.config.enableDataChannel) {
      if (isInitiator) {
        peer.dataChannel = connection.createDataChannel('instruments', {
          ordered: true
        });
        this.setupDataChannel(peer.dataChannel, peerId);
      } else {
        connection.ondatachannel = (event) => {
          peer.dataChannel = event.channel;
          this.setupDataChannel(peer.dataChannel!, peerId);
        };
      }
    }

    this.peers.set(peerId, peer);
    return peer;
  }

  private setupDataChannel(dataChannel: RTCDataChannel, peerId: string): void {
    dataChannel.onopen = () => {
      console.log(`Data channel opened with peer ${peerId}`);
      this.emit('dataChannelOpen', peerId);
    };

    dataChannel.onclose = () => {
      console.log(`Data channel closed with peer ${peerId}`);
      this.emit('dataChannelClose', peerId);
    };

    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.emit('dataChannelMessage', { peerId, message });
      } catch (error) {
        console.error('Failed to parse data channel message:', error);
      }
    };

    dataChannel.onerror = (error) => {
      console.error(`Data channel error with peer ${peerId}:`, error);
    };
  }

  async createOffer(peerId: string): Promise<void> {
    const peer = await this.createPeerConnection(peerId, true);
    const offer = await peer.connection.createOffer();
    await peer.connection.setLocalDescription(offer);

    this.emit('message', {
      type: 'offer',
      from: this.userId,
      to: peerId,
      data: offer
    });
  }

  async handleOffer(peerId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const peer = await this.createPeerConnection(peerId, false);
    await peer.connection.setRemoteDescription(offer);
    
    const answer = await peer.connection.createAnswer();
    await peer.connection.setLocalDescription(answer);

    this.emit('message', {
      type: 'answer',
      from: this.userId,
      to: peerId,
      data: answer
    });
  }

  async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.peers.get(peerId);
    if (peer) {
      await peer.connection.setRemoteDescription(answer);
    }
  }

  async handleIceCandidate(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peer = this.peers.get(peerId);
    if (peer) {
      await peer.connection.addIceCandidate(candidate);
    }
  }

  sendDataChannelMessage(peerId: string, message: any): void {
    const peer = this.peers.get(peerId);
    if (peer && peer.dataChannel && peer.dataChannel.readyState === 'open') {
      peer.dataChannel.send(JSON.stringify(message));
    }
  }

  broadcastDataChannelMessage(message: any): void {
    this.peers.forEach((peer, peerId) => {
      this.sendDataChannelMessage(peerId, message);
    });
  }

  removePeer(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.connection.close();
      if (peer.dataChannel) {
        peer.dataChannel.close();
      }
      this.peers.delete(peerId);
      this.emit('peerRemoved', peerId);
    }
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  async toggleVideo(enabled: boolean): Promise<void> {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  getLocalStream(): MediaStream | undefined {
    return this.localStream;
  }

  getPeerStream(peerId: string): MediaStream | undefined {
    return this.peers.get(peerId)?.stream;
  }

  getAllPeers(): Map<string, PeerConnection> {
    return this.peers;
  }

  destroy(): void {
    // Close all peer connections
    this.peers.forEach((peer) => {
      peer.connection.close();
      if (peer.dataChannel) {
        peer.dataChannel.close();
      }
    });
    this.peers.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    this.removeAllListeners();
  }
}

export default WebRTCManager;