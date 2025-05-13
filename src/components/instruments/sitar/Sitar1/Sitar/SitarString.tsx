
interface StringProps {
  number: number;
  name: string;
  frequency: number;
}

interface SitarStringProps {
  string: StringProps;
  isActive: boolean;
  onClick: () => void;
  stringColor: string;
}

export const SitarString = ({ string, isActive, onClick, stringColor }: SitarStringProps) => {
  return (
    <div 
      className="flex items-center cursor-pointer group"
      onClick={onClick}
    >
      <div className="w-12 text-right pr-2">
        <span className="text-amber-100 font-medium">{string.name}</span>
        <span className="text-amber-200/70 text-xs block">{string.number}</span>
      </div>
      <div
        className={`relative w-full h-0.5 ${
          isActive 
            ? 'animate-sitar-pluck ' + stringColor 
            : stringColor
        }`}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-200/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="w-12 text-left pl-2">
        <span className="text-amber-200/70 text-xs">{Math.round(string.frequency)} Hz</span>
      </div>
    </div>
  );
};
