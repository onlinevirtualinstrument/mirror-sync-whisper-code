
import { Layers, Music } from 'lucide-react';
import { drumKits } from '../../data/drumKits';

interface DrumKitHeaderProps {
  kitName: string;
  selectedKit: string;
  onKitChange: (kitId: string) => void;
}

const DrumKitHeader = ({ kitName, selectedKit, onKitChange }: DrumKitHeaderProps) => {
  return (
    <div className="">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1">
        {/* <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary dark:text-primary" />
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">{kitName}</h2>
        </div> */}

        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg py-2 shadow-sm">
          <Layers className="h-5 w-5 text-slate-500 dark:text-slate-300" />
          <select
            className="bg-transparent text-sm font-medium text-slate-700 dark:text-white focus:outline-none"
            value={selectedKit}
            onChange={(e) => onKitChange(e.target.value)}
          >
            {Object.keys(drumKits).map((kitId, index) => {
              const colors = [
                "text-rose-400",
                "text-indigo-400",
                "text-amber-400",
                "text-brown-400",
                "text-brown-800",
                "text-cyan-400",
                "text-teal-400",
                "text-emerald-400",
                "text-lime-400",
                "text-yellow-400",
                "text-orange-400",
              ];
              const colorClass = colors[index % colors.length];
              return (
                <option
                  key={kitId}
                  value={kitId}
                  className={`bg-white dark:bg-slate-700 ${colorClass}`}
                >
                  {drumKits[kitId].name}
                </option>
              );
            })}
          </select>
        </div>

      </div>
    </div>
  );
};

export default DrumKitHeader;
