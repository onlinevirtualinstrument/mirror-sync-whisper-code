/**
 * WebRTC Manager for Real-time Audio Communication
 * Handles peer-to-peer connections, audio streaming, and latency optimization
 */

import SimplePeer from 'simple-peer';
import { toast } from 'sonner';

export interface WebRTCConfig {
  enableAudio: boolean;
  enableVideo: boolean;
  enableDataChannel: boolean;
  iceServers: RTCIceServer[];
  maxBitrate?: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface PeerConnection {
  id: string;
  peer: SimplePeer.Instance;
  audioLevel: number;
  latency: number;
  isConnected: boolean;
  lastPingTime: number;
}

export interface AudioMessage {
  type: 'note' | 'audio_chunk' | 'sync' | 'ping' | 'pong';
  data: any;
  timestamp: number;
  userId: string;
}

class WebRTCManager {
  private static instance: WebRTCManager;
  private peers: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private audioAnalyzer: AnalyserNode | null = null;
  private config: WebRTCConfig;
  private onPeerConnected?: (peerId: string) => void;
  private onPeerDisconnected?: (peerId: string) => void;
  private onAudioData?: (peerId: string, data: any) => void;
  private onLatencyUpdate?: (peerId: string, latency: number) => void;
  private onSignal?: (peerId: string, signal: any) => void;

  private constructor() {
    this.config = {
      enableAudio: true,
      enableVideo: false,
      enableDataChannel: true,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  public static getInstance(): WebRTCManager {
    if (!WebRTCManager.instance) {
      WebRTCManager.instance = new WebRTCManager();
    }
    return WebRTCManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Get user media if audio is enabled
      if (this.config.enableAudio) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: this.config.echoCancellation,
            noiseSuppression: this.config.noiseSuppression,
            autoGainControl: this.config.autoGainControl,
            channelCount: 2,
            sampleRate: 44100
          },
          video: this.config.enableVideo
        });

        // Setup audio analysis
        if (this.audioContext && this.localStream) {
          const source = this.audioContext.createMediaStreamSource(this.localStream);
          this.audioAnalyzer = this.audioContext.createAnalyser();
          this.audioAnalyzer.fftSize = 256;
          source.connect(this.audioAnalyzer);
        }
      }

      console.log('WebRTC Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WebRTC Manager:', error);
      toast.error('Failed to access microphone. Audio features may be limited.');
      throw error;
    }
  }

  public async createPeerConnection(peerId: string, isInitiator: boolean = false): Promise<SimplePeer.Instance> {
    const peer = new SimplePeer({
      initiator: isInitiator,
      stream: this.localStream || undefined,
      config: {
        iceServers: this.config.iceServers
      },
      channelConfig: {
        ordered: false, // Allow out-of-order delivery for lower latency
        maxRetransmits: 0 // Don't retransmit for real-time audio
      }
    });

    const peerConnection: PeerConnection = {
      id: peerId,
      peer,
      audioLevel: 0,
      latency: 0,
      isConnected: false,
      lastPingTime: 0
    };

    // Setup peer event handlers
    peer.on('signal', (signal) => {
      console.log('WebRTC: Sending signal to', peerId);
      // This should be handled by the calling code to send signal via Firebase
      this.onSignal?.(peerId, signal);
    });

    peer.on('connect', () => {
      console.log('WebRTC: Connected to peer', peerId);
      peerConnection.isConnected = true;
      this.onPeerConnected?.(peerId);
      
      // Start latency monitoring
      this.startLatencyMonitoring(peerId);
    });

    peer.on('data', (data) => {
      try {
        const message: AudioMessage = JSON.parse(data.toString());
        this.handlePeerMessage(peerId, message);
      } catch (error) {
        console.error('Failed to parse peer message:', error);
      }
    });

    peer.on('stream', (stream) => {
      console.log('WebRTC: Received stream from peer', peerId);
      this.handleRemoteStream(peerId, stream);
    });

    peer.on('error', (error) => {
      console.error('WebRTC: Peer connection error:', error);
      this.removePeer(peerId);
    });

    peer.on('close', () => {
      console.log('WebRTC: Peer connection closed:', peerId);
      this.removePeer(peerId);
    });

    this.peers.set(peerId, peerConnection);
    return peer;
  }

  public async handleSignal(peerId: string, signal: any): Promise<void> {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection && !peerConnection.peer.destroyed) {
      peerConnection.peer.signal(signal);
    } else {
      console.warn('Received signal for unknown peer:', peerId);
    }
  }

  public sendAudioData(data: any, type: AudioMessage['type'] = 'note'): void {
    const message: AudioMessage = {
      type,
      data,
      timestamp: performance.now(),
      userId: 'current-user' // This should be set from auth context
    };

    const messageStr = JSON.stringify(message);
    
    this.peers.forEach((peerConnection) => {
      if (peerConnection.isConnected && !peerConnection.peer.destroyed) {
        try {
          peerConnection.peer.send(messageStr);
        } catch (error) {
          console.error('Failed to send data to peer:', error);
        }
      }
    });
  }

  public getAudioLevel(): number {
    if (!this.audioAnalyzer) return 0;

    const dataArray = new Uint8Array(this.audioAnalyzer.frequencyBinCount);
    this.audioAnalyzer.getByteFrequencyData(dataArray);
    
    // Calculate RMS audio level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    
    return Math.sqrt(sum / dataArray.length) / 255;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.audioAnalyzer) return new Uint8Array(0);

    const dataArray = new Uint8Array(this.audioAnalyzer.frequencyBinCount);
    this.audioAnalyzer.getByteFrequencyData(dataArray);
    return dataArray;
  }

  private startLatencyMonitoring(peerId: string): void {
    const peerConnection = this.peers.get(peerId);
    if (!peerConnection) return;

    const pingInterval = setInterval(() => {
      if (!peerConnection.isConnected || peerConnection.peer.destroyed) {
        clearInterval(pingInterval);
        return;
      }

      peerConnection.lastPingTime = performance.now();
      this.sendPing(peerId);
    }, 5000); // Ping every 5 seconds
  }

  private sendPing(peerId: string): void {
    const peerConnection = this.peers.get(peerId);
    if (!peerConnection || !peerConnection.isConnected) return;

    const message: AudioMessage = {
      type: 'ping',
      data: null,
      timestamp: performance.now(),
      userId: 'current-user'
    };

    try {
      peerConnection.peer.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send ping:', error);
    }
  }

  private handlePeerMessage(peerId: string, message: AudioMessage): void {
    const peerConnection = this.peers.get(peerId);
    if (!peerConnection) return;

    switch (message.type) {
      case 'ping':
        // Respond with pong
        const pongMessage: AudioMessage = {
          type: 'pong',
          data: message.timestamp,
          timestamp: performance.now(),
          userId: 'current-user'
        };
        try {
          peerConnection.peer.send(JSON.stringify(pongMessage));
        } catch (error) {
          console.error('Failed to send pong:', error);
        }
        break;

      case 'pong':
        // Calculate latency
        const latency = performance.now() - message.data;
        peerConnection.latency = latency;
        this.onLatencyUpdate?.(peerId, latency);
        break;

      case 'note':
      case 'audio_chunk':
        this.onAudioData?.(peerId, message.data);
        break;
    }
  }

  private handleRemoteStream(peerId: string, stream: MediaStream): void {
    // Create audio element for remote stream
    const audio = new Audio();
    audio.srcObject = stream;
    audio.volume = 0.8;
    audio.play().catch(console.error);

    // Monitor audio level from remote stream
    if (this.audioContext) {
      const source = this.audioContext.createMediaStreamSource(stream);
      const analyzer = this.audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);

      const updateAudioLevel = () => {
        const peerConnection = this.peers.get(peerId);
        if (!peerConnection || peerConnection.peer.destroyed) return;

        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        
        peerConnection.audioLevel = Math.sqrt(sum / dataArray.length) / 255;
        
        if (peerConnection.isConnected) {
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    }
  }

  public removePeer(peerId: string): void {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      if (!peerConnection.peer.destroyed) {
        peerConnection.peer.destroy();
      }
      this.peers.delete(peerId);
      this.onPeerDisconnected?.(peerId);
    }
  }

  public setEventHandlers(handlers: {
    onPeerConnected?: (peerId: string) => void;
    onPeerDisconnected?: (peerId: string) => void;
    onAudioData?: (peerId: string, data: any) => void;
    onLatencyUpdate?: (peerId: string, latency: number) => void;
    onSignal?: (peerId: string, signal: any) => void;
  }): void {
    this.onPeerConnected = handlers.onPeerConnected;
    this.onPeerDisconnected = handlers.onPeerDisconnected;
    this.onAudioData = handlers.onAudioData;
    this.onLatencyUpdate = handlers.onLatencyUpdate;
    this.onSignal = handlers.onSignal;
  }

  public getPeerLatency(peerId: string): number {
    return this.peers.get(peerId)?.latency || 0;
  }

  public getPeerAudioLevel(peerId: string): number {
    return this.peers.get(peerId)?.audioLevel || 0;
  }

  public getConnectedPeers(): string[] {
    return Array.from(this.peers.entries())
      .filter(([_, connection]) => connection.isConnected)
      .map(([peerId]) => peerId);
  }

  public dispose(): void {
    this.peers.forEach((_, peerId) => this.removePeer(peerId));
    this.peers.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export default WebRTCManager;