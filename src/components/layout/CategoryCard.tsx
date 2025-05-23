
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categoryData } from '@/pages/categories/CategoryPage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  to: string;
  color: string;
  icon2: string;
  imageUrl?: string;
  id?: string;
}

const CategoryCard = ({ title, description, icon, to, color, icon2, imageUrl, id }: CategoryCardProps) => {
  // Get the instruments for this category if id is provided
  const instruments = id && categoryData[id as keyof typeof categoryData]?.instruments;

  // Create a mapping of instrument types to colors and icons
  const instrumentStyles: Record<string, { color: string, icon: string }> = {

    // 🎻 String Instruments (Yellow/Amber)
    Violin: { color: 'bg-amber-50 text-amber-700 hover:bg-amber-100', icon: '🎻' },
    Guitar: { color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100', icon: '🎸' },
    Harp: { color: 'bg-amber-50 text-amber-700 hover:bg-amber-100', icon: '🎼' },
    Sitar: { color: 'bg-orange-50 text-orange-700 hover:bg-orange-100', icon: '🪕' },
    Veena: { color: 'bg-orange-50 text-orange-700 hover:bg-orange-100', icon: '🪕' },
    Banjo: { color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100', icon: '🪕' },

    // 🎷 Wind Instruments (Blue)
    Flute: { color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', icon: '🎶' },
    Saxophone: { color: 'bg-sky-50 text-sky-700 hover:bg-sky-100', icon: '🎷' },
    Trumpet: { color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100', icon: '🎺' },
    Harmonica: { color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100', icon: '🎼' },

    // 🥁 Percussion Instruments (Red/Pink)
    DrumKit: { color: 'bg-red-50 text-red-700 hover:bg-red-100', icon: '🥁' },
    Xylophone: { color: 'bg-rose-50 text-rose-700 hover:bg-rose-100', icon: '🛎️' },

    // 🎹 Keyboard / Electronic Instruments (Purple/Violet)
    GrandPiano: { color: 'bg-purple-50 text-purple-700 hover:bg-purple-100', icon: '🎹' },
    Theremin: { color: 'bg-violet-50 text-violet-700 hover:bg-violet-100', icon: '📡' },
    DrumMachine: { color: 'bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100', icon: '🎛️' },
    ChordProgression: { color: 'bg-lime-50 text-lime-700 hover:bg-lime-100', icon: '🎧' },

};

return (
  <Link to={to} className="block">
    <div className="rounded-2xl overflow-hidden glass-card group hover-lift relative">
      {instruments && instruments.length > 0 && (
        <div className="absolute top-2 right-2 z-30">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-2">
                    {instruments.map(instrument => (
                      <DropdownMenuItem key={instrument.id} asChild className={instrumentStyles[instrument.name]?.color || "bg-gray-50 text-gray-700 hover:bg-gray-100"}>
                        <Link to={`/${instrument.id}`} className="flex items-center gap-2 cursor-pointer  mt-1 mb-1">
                          <span className="text-lg">
                            {instrumentStyles[instrument.name]?.icon || '🎵'}
                          </span>
                          {instrument.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Browse {title} Instruments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <div className="relative h-48 overflow-hidden">

        <div className="relative m-3 w-full h-full rounded-xl overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className={`${color} absolute inset-0 flex items-center justify-center text-6xl z-10`}>
              {icon2}
            </div>
          )}

          <div className="absolute bottom-0 p-6 w-full z-20 bg-gradient-to-t from-black/50 to-transparent">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
              {icon}
            </div>
            <div>
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-gray-700 transition-colors" />
        </div>
      </div>
    </div>
  </Link>
);
};

export default CategoryCard;
