
import { Layers, Music } from 'lucide-react';
import { drumKits } from '@/data/drumKits';

interface DrumKitHeaderProps {
  kitName: string;
  selectedKit: string;
  onKitChange: (kitId: string) => void;
}

const DrumKitHeader = ({ kitName, selectedKit, onKitChange }: DrumKitHeaderProps) => {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary dark:text-primary" />
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">{kitName}</h2>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          <Layers className="h-4 w-4 text-slate-600 dark:text-slate-300 ml-2" />
          <select 
            className="bg-transparent pr-8 py-2 focus:outline-none text-slate-800 dark:text-slate-200"
            value={selectedKit}
            onChange={(e) => onKitChange(e.target.value)}
          >
            {Object.keys(drumKits).map(kitId => (
              <option key={kitId} value={kitId}>
                {drumKits[kitId].name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DrumKitHeader;
