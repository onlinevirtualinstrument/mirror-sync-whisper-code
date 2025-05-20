
import React from 'react';
import { motion } from 'framer-motion';

// Import flute images
export const getFluteImage = (fluteType: string): string => {
  switch (fluteType) {
    case 'western':
      return '/lovable-uploads/flute-western.png';
    case 'bansuri':
      return '/lovable-uploads/flute-bansuri.png';
    case 'pan':
      return '/lovable-uploads/flute-pan.png';
    case 'native':
      return '/lovable-uploads/flute-native.png';
    case 'shakuhachi':
      return '/lovable-uploads/flute-shakuhachi.png';
    default:
      return '/lovable-uploads/flute-western.png';
  }
};

interface FluteImageComponentProps {
  selectedFluteType: string;
}

const FluteImageComponent: React.FC<FluteImageComponentProps> = ({ selectedFluteType }) => {
  return (
    <motion.div 
      className="mb-8 flex justify-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        rotate: [0, -1, 1, -1, 0], 
        transition: { duration: 0.5 } 
      }}
    >
      <img 
        src={getFluteImage(selectedFluteType)} 
        alt={`${selectedFluteType} flute`}
        className="h-32 object-contain"
        loading="lazy"
      />
    </motion.div>
  );
};

export default FluteImageComponent;
