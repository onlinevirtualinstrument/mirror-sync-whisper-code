
import { Play, Pause } from 'lucide-react';

interface InstrumentImagesProps {
  images: string[];
  name: string;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  soundUrl?: string;
  isPlaying: boolean;
  onPlayClick: () => void;
}

const InstrumentImages = ({ 
  images, 
  name, 
  activeIndex, 
  setActiveIndex,
  soundUrl,
  isPlaying,
  onPlayClick
}: InstrumentImagesProps) => {
  return (
    <div>
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4 relative">
        <img 
          src={images[activeIndex]} 
          alt={name} 
          className="w-full h-[400px] object-contain"
        />
        
        {soundUrl && (
          <button 
            onClick={onPlayClick}
            className={`absolute bottom-4 right-4 flex items-center gap-2 py-2 px-4 rounded-full ${
              isPlaying ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            } hover:opacity-90 transition-colors`}
          >
            {isPlaying ? (
              <>
                <Pause size={18} />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Play</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div 
            key={index}
            className={`cursor-pointer rounded-lg overflow-hidden border-2 ${index === activeIndex ? 'border-black' : 'border-transparent'}`}
            onClick={() => setActiveIndex(index)}
          >
            <img 
              src={image} 
              alt={`${name} view ${index + 1}`}
              className="w-full h-20 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstrumentImages;
