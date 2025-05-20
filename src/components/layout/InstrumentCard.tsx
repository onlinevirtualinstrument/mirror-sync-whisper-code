
import { Heart, Play, Pause } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import audioPlayer from '@/utils/music/audioPlayer';

interface InstrumentCardProps {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  isFeatured?: boolean;
  soundUrl?: string;
}

const InstrumentCard = ({ id, name, category, imageUrl, isFeatured, soundUrl }: InstrumentCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // const handleLikeClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setIsLiked(!isLiked);
  // };
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isPlaying) {
      audioPlayer.stop();
      setIsPlaying(false);
    } else if (soundUrl) {
      audioPlayer.play(soundUrl);
      setIsPlaying(true);
      
      // Reset playing state when audio ends
      const checkIfPlaying = setInterval(() => {
        if (!audioPlayer.isCurrentlyPlaying()) {
          setIsPlaying(false);
          clearInterval(checkIfPlaying);
        }
      }, 500);
    }
  };
  
  return (
    <Link to={`/${id}`}>
      <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          {soundUrl && (
            <div 
              className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
              onClick={handlePlayClick}
            >
              {isPlaying ? (
                <Pause size={16} className="text-blue-500" />
              ) : (
                <Play size={16} className="text-gray-600" />
              )}
            </div>
          )}
          
          {/* <div 
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
            onClick={handleLikeClick}
          >
            <Heart 
              size={16} 
              className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'} transition-colors`} 
            />
          </div> */}
        </div>
        
        <div className={`w-full ${isFeatured ? 'h-64' : 'h-48'} overflow-hidden`}>
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
          />
        </div>
        
        <div className="p-4">
          <span className="text-xs text-gray-500 uppercase tracking-wider">{category}</span>
          <h3 className="font-medium text-gray-900 mt-1">{name}</h3>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-sm text-gray-600">View details</span>
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default InstrumentCard;
