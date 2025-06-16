
import { ReactNode } from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
  action?: ReactNode;
}

const SectionTitle = ({ 
  title, 
  subtitle, 
  alignment = 'left',
  action
}: SectionTitleProps) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  };
  
  return (
    <div className={`mb-10 ${alignmentClasses[alignment]} max-w-2xl`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  );
};

export default SectionTitle;
