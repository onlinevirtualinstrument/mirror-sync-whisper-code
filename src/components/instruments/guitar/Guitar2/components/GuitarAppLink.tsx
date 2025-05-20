
import React from 'react';
import { Link } from 'react-router-dom';
import { Guitar } from 'lucide-react';

interface GuitarAppLinkProps {
  className?: string;
  variant?: 'default' | 'button' | 'text';
}

/**
 * A pre-styled link component you can add to your existing navigation
 * to link to the Virtual Guitar app
 */
const GuitarAppLink: React.FC<GuitarAppLinkProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  
  const styles = {
    default: "flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors",
    button: "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors",
    text: "text-primary hover:underline hover:text-primary/80 transition-colors"
  };
  
  return (
    <Link to="/virtual-guitar" className={`${styles[variant]} ${className}`}>
      {variant !== 'text' && <Guitar className="h-4 w-4" />}
      Virtual Guitar
    </Link>
  );
};

export default GuitarAppLink;
