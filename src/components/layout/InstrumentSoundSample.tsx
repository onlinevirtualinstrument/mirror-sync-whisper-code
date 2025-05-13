
import { Play, Pause, Volume2 } from 'lucide-react';

interface InstrumentSoundSampleProps {
  name: string;
  isPlaying: boolean;
  onPlayClick: () => void;
}

const InstrumentSoundSample = ({ name, isPlaying, onPlayClick }: InstrumentSoundSampleProps) => {
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3">Sound Sample</h3>
      <div 
        className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onPlayClick}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPlaying ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </div>
        <div>
          <div className="font-medium">Listen to this {name}</div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Volume2 size={14} />
            <span>Sound sample</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstrumentSoundSample;
