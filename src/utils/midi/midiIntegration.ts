import { EventEmitter } from 'events';

export interface MIDINote {
  note: number;
  velocity: number;
  channel: number;
  timestamp: number;
}

export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  type: 'input' | 'output';
  state: 'connected' | 'disconnected';
}

export interface MIDIMessage {
  command: number;
  note: number;
  velocity: number;
  channel: number;
  timestamp: number;
}

class MIDIIntegration extends EventEmitter {
  private midiAccess?: MIDIAccess;
  private inputDevices: Map<string, MIDIInput> = new Map();
  private outputDevices: Map<string, MIDIOutput> = new Map();
  private isInitialized: boolean = false;

  async initialize(): Promise<boolean> {
    try {
      if (!navigator.requestMIDIAccess) {
        console.warn('MIDI not supported in this browser');
        return false;
      }

      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      
      // Setup device listeners
      this.midiAccess.onstatechange = this.handleStateChange.bind(this);
      
      // Initialize existing devices
      this.scanDevices();
      
      this.isInitialized = true;
      this.emit('initialized');
      
      console.log('MIDI Integration initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize MIDI:', error);
      this.emit('error', error);
      return false;
    }
  }

  private scanDevices(): void {
    if (!this.midiAccess) return;

    // Scan input devices
    this.midiAccess.inputs.forEach((input) => {
      this.addInputDevice(input);
    });

    // Scan output devices
    this.midiAccess.outputs.forEach((output) => {
      this.addOutputDevice(output);
    });
  }

  private addInputDevice(input: MIDIInput): void {
    this.inputDevices.set(input.id, input);
    
    input.onmidimessage = (event) => {
      const message = this.parseMIDIMessage(event);
      this.emit('midiMessage', message);
      
      // Emit specific note events
      if (message.command === 144 && message.velocity > 0) { // Note On
        this.emit('noteOn', {
          note: message.note,
          velocity: message.velocity,
          channel: message.channel,
          timestamp: message.timestamp
        });
      } else if (message.command === 128 || (message.command === 144 && message.velocity === 0)) { // Note Off
        this.emit('noteOff', {
          note: message.note,
          velocity: message.velocity,
          channel: message.channel,
          timestamp: message.timestamp
        });
      } else if (message.command === 176) { // Control Change
        this.emit('controlChange', {
          controller: message.note,
          value: message.velocity,
          channel: message.channel,
          timestamp: message.timestamp
        });
      }
    };

    const device: MIDIDevice = {
      id: input.id,
      name: input.name || 'Unknown MIDI Input',
      manufacturer: input.manufacturer || 'Unknown',
      type: 'input',
      state: input.state as 'connected' | 'disconnected'
    };

    this.emit('deviceConnected', device);
    console.log('MIDI Input connected:', device.name);
  }

  private addOutputDevice(output: MIDIOutput): void {
    this.outputDevices.set(output.id, output);

    const device: MIDIDevice = {
      id: output.id,
      name: output.name || 'Unknown MIDI Output',
      manufacturer: output.manufacturer || 'Unknown',
      type: 'output',
      state: output.state as 'connected' | 'disconnected'
    };

    this.emit('deviceConnected', device);
    console.log('MIDI Output connected:', device.name);
  }

  private handleStateChange(event: MIDIConnectionEvent): void {
    const port = event.port;
    
    if (port.state === 'connected') {
      if (port.type === 'input') {
        this.addInputDevice(port as MIDIInput);
      } else if (port.type === 'output') {
        this.addOutputDevice(port as MIDIOutput);
      }
    } else if (port.state === 'disconnected') {
      this.removeDevice(port.id);
    }
  }

  private removeDevice(deviceId: string): void {
    const inputDevice = this.inputDevices.get(deviceId);
    const outputDevice = this.outputDevices.get(deviceId);
    
    if (inputDevice) {
      this.inputDevices.delete(deviceId);
      inputDevice.onmidimessage = null;
    } else if (outputDevice) {
      this.outputDevices.delete(deviceId);
    }

    this.emit('deviceDisconnected', deviceId);
    console.log('MIDI Device disconnected:', deviceId);
  }

  private parseMIDIMessage(event: MIDIMessageEvent): MIDIMessage {
    const [status, note, velocity] = event.data;
    const command = status & 0xF0;
    const channel = status & 0x0F;

    return {
      command,
      note: note || 0,
      velocity: velocity || 0,
      channel,
      timestamp: event.timeStamp
    };
  }

  // Send MIDI note on message
  sendNoteOn(note: number, velocity: number = 127, channel: number = 0, deviceId?: string): void {
    const message = [0x90 | channel, note, velocity];
    this.sendMIDIMessage(message, deviceId);
  }

  // Send MIDI note off message
  sendNoteOff(note: number, velocity: number = 0, channel: number = 0, deviceId?: string): void {
    const message = [0x80 | channel, note, velocity];
    this.sendMIDIMessage(message, deviceId);
  }

  // Send control change message
  sendControlChange(controller: number, value: number, channel: number = 0, deviceId?: string): void {
    const message = [0xB0 | channel, controller, value];
    this.sendMIDIMessage(message, deviceId);
  }

  // Send raw MIDI message
  sendMIDIMessage(message: number[], deviceId?: string): void {
    if (!this.isInitialized) {
      console.warn('MIDI not initialized');
      return;
    }

    const outputs = deviceId 
      ? [this.outputDevices.get(deviceId)].filter(Boolean)
      : Array.from(this.outputDevices.values());

    outputs.forEach(output => {
      if (output && output.state === 'connected') {
        output.send(message);
      }
    });
  }

  // Get all connected devices
  getDevices(): MIDIDevice[] {
    const devices: MIDIDevice[] = [];
    
    this.inputDevices.forEach(input => {
      devices.push({
        id: input.id,
        name: input.name || 'Unknown MIDI Input',
        manufacturer: input.manufacturer || 'Unknown',
        type: 'input',
        state: input.state as 'connected' | 'disconnected'
      });
    });

    this.outputDevices.forEach(output => {
      devices.push({
        id: output.id,
        name: output.name || 'Unknown MIDI Output',
        manufacturer: output.manufacturer || 'Unknown',
        type: 'output',
        state: output.state as 'connected' | 'disconnected'
      });
    });

    return devices;
  }

  // Get input devices only
  getInputDevices(): MIDIDevice[] {
    return this.getDevices().filter(device => device.type === 'input');
  }

  // Get output devices only
  getOutputDevices(): MIDIDevice[] {
    return this.getDevices().filter(device => device.type === 'output');
  }

  // Convert MIDI note number to note name
  static midiNoteToNoteName(noteNumber: number): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(noteNumber / 12) - 1;
    const note = noteNames[noteNumber % 12];
    return `${note}${octave}`;
  }

  // Convert note name to MIDI note number
  static noteNameToMidiNote(noteName: string): number {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3, 'E': 4,
      'F': 5, 'F#': 6, 'GB': 6, 'G': 7, 'G#': 8, 'AB': 8, 'A': 9,
      'A#': 10, 'BB': 10, 'B': 11
    };

    const match = noteName.match(/^([A-G]#?)(\d+)$/);
    if (!match) return 60; // Default to middle C

    const note = match[1].toUpperCase();
    const octave = parseInt(match[2]);

    return (octave + 1) * 12 + (noteMap[note] || 0);
  }

  destroy(): void {
    // Close all MIDI connections
    this.inputDevices.forEach(input => {
      input.onmidimessage = null;
    });
    
    this.inputDevices.clear();
    this.outputDevices.clear();
    
    this.isInitialized = false;
    this.removeAllListeners();
  }
}

export default MIDIIntegration;