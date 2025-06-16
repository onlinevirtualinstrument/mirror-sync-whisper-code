
interface StringProps {
  name: string;
  key: string;
  frequency: number;
  color: string;
  thickness?: string;
}

interface GuitarStringProps {
  string: StringProps;
  isActive: boolean;
  onClick: () => void;
}

export const GuitarString = ({ string, isActive, onClick }: GuitarStringProps) => {
  return (
    <div
      key={string.name}
      className="flex items-center"
    >
      <div className="w-12 md:w-24 text-right pr-4">
        <span className="text-white font-medium">{string.name}</span>
        <span className="text-white/70 text-xs block">{string.key.toUpperCase()}</span>
      </div>
      <div
        className={`guitar-string relative w-full h-${string.thickness || '1'} ${isActive ? 'animate-guitar-strum ' + string.color : string.color}`}
        onClick={onClick}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-200 opacity-0 group-hover:opacity-100"></div>
      </div>
      <div className="w-12 md:w-24 text-left pl-4">
        <span className="text-white/70 text-xs">{Math.round(string.frequency)} Hz</span>
      </div>
    </div>
  );
};
