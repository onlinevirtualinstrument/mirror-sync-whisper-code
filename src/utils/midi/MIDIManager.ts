/**
 * MIDI Manager for Hardware Device Support
 * Handles MIDI input/output, device detection, and note mapping
 */

export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  type: 'input' | 'output';
  connection: 'open' | 'closed' | 'pending';
  state: 'connected' | 'disconnected';
}

export interface MIDINoteEvent {
  type: 'noteon' | 'noteoff' | 'controlchange' | 'pitchbend';
  channel: number;
  note?: number;
  velocity?: number;
  value?: number;
  timestamp: number;
}

interface MIDIAccess {
  inputs: Map<string, MIDIInput>;
  outputs: Map<string, MIDIOutput>;
  onstatechange?: (event: MIDIConnectionEvent) => void;
}

interface MIDIInput {
  id?: string;
  name?: string;
  manufacturer?: string;
  connection?: string;
  state?: string;
  type: string;
  onmidimessage?: (event: MIDIMessageEvent) => void;
}

interface MIDIOutput {
  id?: string;
  name?: string;
  manufacturer?: string;
  connection?: string;
  state?: string;
  type: string;
  send: (data: number[]) => void;
}

interface MIDIConnectionEvent {
  port: MIDIInput | MIDIOutput;
}

interface MIDIMessageEvent {
  data: Uint8Array;
  timeStamp: number;
}

class MIDIManager {
  private static instance: MIDIManager;
  private midiAccess: MIDIAccess | null = null;
  private inputDevices: Map<string, MIDIDevice> = new Map();
  private outputDevices: Map<string, MIDIDevice> = new Map();
  private midiEnabled = false;
  private onMIDIMessage?: (event: MIDINoteEvent) => void;
  private onDeviceConnected?: (device: MIDIDevice) => void;
  private onDeviceDisconnected?: (device: MIDIDevice) => void;

  private constructor() {}

  public static getInstance(): MIDIManager {
    if (!MIDIManager.instance) {
      MIDIManager.instance = new MIDIManager();
    }
    return MIDIManager.instance;
  }

  public async initialize(): Promise<boolean> {
    if (!(navigator as any).requestMIDIAccess) {
      console.warn('MIDI: Web MIDI API not supported');
      return false;
    }

    try {
      this.midiAccess = await (navigator as any).requestMIDIAccess({ sysex: false });
      this.midiEnabled = true;

      // Setup device change listeners
      this.midiAccess.onstatechange = (event) => {
        this.handleDeviceStateChange(event);
      };

      // Scan for existing devices
      this.scanDevices();

      console.log('MIDI: Manager initialized successfully');
      return true;
    } catch (error) {
      console.error('MIDI: Failed to initialize:', error);
      return false;
    }
  }

  private scanDevices(): void {
    if (!this.midiAccess) return;

    // Scan input devices
    this.midiAccess.inputs.forEach((input) => {
      const device: MIDIDevice = {
        id: input.id!,
        name: input.name || 'Unknown MIDI Input',
        manufacturer: input.manufacturer || 'Unknown',
        type: 'input',
        connection: (input.connection as any) || 'closed',
        state: (input.state as any) || 'disconnected'
      };

      this.inputDevices.set(device.id, device);
      
      if (device.state === 'connected') {
        this.connectInputDevice(input);
        this.onDeviceConnected?.(device);
      }
    });

    // Scan output devices
    this.midiAccess.outputs.forEach((output) => {
      const device: MIDIDevice = {
        id: output.id!,
        name: output.name || 'Unknown MIDI Output',
        manufacturer: output.manufacturer || 'Unknown',
        type: 'output',
        connection: (output.connection as any) || 'closed',
        state: (output.state as any) || 'disconnected'
      };

      this.outputDevices.set(device.id, device);
      
      if (device.state === 'connected') {
        this.onDeviceConnected?.(device);
      }
    });

    console.log(`MIDI: Found ${this.inputDevices.size} input devices and ${this.outputDevices.size} output devices`);
  }

  private handleDeviceStateChange(event: MIDIConnectionEvent): void {
    const port = event.port;
    const isInput = port.type === 'input';
    const deviceMap = isInput ? this.inputDevices : this.outputDevices;

    const device: MIDIDevice = {
      id: port.id!,
      name: port.name || `Unknown MIDI ${port.type}`,
      manufacturer: port.manufacturer || 'Unknown',
      type: port.type as 'input' | 'output',
      connection: (port.connection as any) || 'closed',
      state: (port.state as any) || 'disconnected'
    };

    if (port.state === 'connected') {
      deviceMap.set(device.id, device);
      
      if (isInput) {
        this.connectInputDevice(port as MIDIInput);
      }
      
      this.onDeviceConnected?.(device);
      console.log(`MIDI: Device connected - ${device.name}`);
    } else {
      deviceMap.delete(device.id);
      this.onDeviceDisconnected?.(device);
      console.log(`MIDI: Device disconnected - ${device.name}`);
    }
  }

  private connectInputDevice(input: MIDIInput): void {
    input.onmidimessage = (event) => {
      this.handleMIDIMessage(event);
    };
  }

  private handleMIDIMessage(event: MIDIMessageEvent): void {
    const [command, note, velocity] = event.data;
    const channel = command & 0x0f;
    const messageType = command & 0xf0;

    let midiEvent: MIDINoteEvent | null = null;

    switch (messageType) {
      case 0x90: // Note on
        if (velocity > 0) {
          midiEvent = {
            type: 'noteon',
            channel,
            note,
            velocity: velocity / 127,
            timestamp: event.timeStamp
          };
        } else {
          // Note on with velocity 0 is same as note off
          midiEvent = {
            type: 'noteoff',
            channel,
            note,
            velocity: 0,
            timestamp: event.timeStamp
          };
        }
        break;

      case 0x80: // Note off
        midiEvent = {
          type: 'noteoff',
          channel,
          note,
          velocity: velocity / 127,
          timestamp: event.timeStamp
        };
        break;

      case 0xb0: // Control change
        midiEvent = {
          type: 'controlchange',
          channel,
          note, // Control number
          value: velocity / 127,
          timestamp: event.timeStamp
        };
        break;

      case 0xe0: // Pitch bend
        const pitchValue = (velocity << 7) | note;
        midiEvent = {
          type: 'pitchbend',
          channel,
          value: (pitchValue - 8192) / 8192, // Normalize to -1 to 1
          timestamp: event.timeStamp
        };
        break;
    }

    if (midiEvent) {
      this.onMIDIMessage?.(midiEvent);
    }
  }

  public sendMIDIMessage(deviceId: string, command: number, note: number, velocity: number): boolean {
    if (!this.midiAccess) return false;

    const output = this.midiAccess.outputs.get(deviceId);
    if (!output) {
      console.warn(`MIDI: Output device ${deviceId} not found`);
      return false;
    }

    try {
      output.send([command, note, velocity]);
      return true;
    } catch (error) {
      console.error('MIDI: Failed to send message:', error);
      return false;
    }
  }

  public playNote(deviceId: string, note: number, velocity: number = 127, channel: number = 0): boolean {
    const command = 0x90 | (channel & 0x0f); // Note on
    return this.sendMIDIMessage(deviceId, command, note, velocity);
  }

  public stopNote(deviceId: string, note: number, channel: number = 0): boolean {
    const command = 0x80 | (channel & 0x0f); // Note off
    return this.sendMIDIMessage(deviceId, command, note, 0);
  }

  public getAllNotes(deviceId: string, channel: number = 0): boolean {
    // Send all notes off
    const command = 0xb0 | (channel & 0x0f); // Control change
    return this.sendMIDIMessage(deviceId, command, 123, 0); // All notes off
  }

  public static noteNumberToFrequency(noteNumber: number): number {
    // Convert MIDI note number to frequency
    return 440 * Math.pow(2, (noteNumber - 69) / 12);
  }

  public static frequencyToNoteNumber(frequency: number): number {
    // Convert frequency to MIDI note number
    return Math.round(69 + 12 * Math.log2(frequency / 440));
  }

  public static noteNumberToName(noteNumber: number): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(noteNumber / 12) - 1;
    const note = noteNames[noteNumber % 12];
    return `${note}${octave}`;
  }

  public getInputDevices(): MIDIDevice[] {
    return Array.from(this.inputDevices.values());
  }

  public getOutputDevices(): MIDIDevice[] {
    return Array.from(this.outputDevices.values());
  }

  public isDeviceConnected(deviceId: string): boolean {
    return this.inputDevices.has(deviceId) || this.outputDevices.has(deviceId);
  }

  public setEventHandlers(handlers: {
    onMIDIMessage?: (event: MIDINoteEvent) => void;
    onDeviceConnected?: (device: MIDIDevice) => void;
    onDeviceDisconnected?: (device: MIDIDevice) => void;
  }): void {
    this.onMIDIMessage = handlers.onMIDIMessage;
    this.onDeviceConnected = handlers.onDeviceConnected;
    this.onDeviceDisconnected = handlers.onDeviceDisconnected;
  }

  public isSupported(): boolean {
    return !!navigator.requestMIDIAccess;
  }

  public isEnabled(): boolean {
    return this.midiEnabled;
  }

  public dispose(): void {
    if (this.midiAccess) {
      this.midiAccess.inputs.forEach((input) => {
        input.onmidimessage = null;
      });
    }
    
    this.inputDevices.clear();
    this.outputDevices.clear();
    this.midiAccess = null;
    this.midiEnabled = false;
  }
}

export default MIDIManager;