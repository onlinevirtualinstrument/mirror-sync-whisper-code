
import React from 'react';
import { ExternalLink } from 'lucide-react';

interface GuitarAppLinkProps {
  href: string;
  children: React.ReactNode;
}

const GuitarAppLink: React.FC<GuitarAppLinkProps> = ({ href, children }) => {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-primary hover:underline"
    >
      {children}
      <ExternalLink className="h-4 w-4" />
    </a>
  );
};

export default GuitarAppLink;
