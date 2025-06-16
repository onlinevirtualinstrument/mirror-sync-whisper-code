
import React from 'react';

interface InstrumentCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  delay?: number;
  featured?: boolean;
}

const InstrumentCard: React.FC<InstrumentCardProps> = ({
  name,
  description,
  icon,
  color,
  textColor,
  delay = 0,
  featured = false
}) => {
  return (
    <div 
      className={`group relative h-full rounded-xl overflow-hidden bg-gradient-to-b ${color} border p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in`} 
      style={{ animationDelay: `${delay}ms` }}
    >
      {featured && (
        <div className="absolute -right-12 top-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-12 py-1 rotate-45 text-xs font-semibold">
          NEW
        </div>
      )}
      <div className="flex flex-col h-full">
        <div className="p-2 bg-white bg-opacity-50 rounded-full w-fit mb-4">
          {icon}
        </div>
        <h3 className={`text-xl font-bold mb-2 ${textColor}`}>{name}</h3>
        <p className="text-muted-foreground text-sm flex-grow">
          {description}
        </p>
        <div className="mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
          <span className={`inline-flex items-center text-sm font-medium ${textColor}`}>
            Play now
            <svg 
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

export default InstrumentCard;
