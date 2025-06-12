
import React from 'react';

interface UnreadMessageBadgeProps {
  count: number;
  className?: string;
}

const UnreadMessageBadge: React.FC<UnreadMessageBadgeProps> = ({ count, className = '' }) => {
  if (count === 0) return null;

  return (
    <div className={`
      absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full 
      min-w-[20px] h-5 flex items-center justify-center px-1 font-bold
      animate-pulse z-10 ${className}
    `}>
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default UnreadMessageBadge;