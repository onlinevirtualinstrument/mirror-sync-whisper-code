
import React from 'react';
import { BanjoString } from './BanjoAudio';
import { motion } from 'framer-motion';

interface BanjoBodyProps {
  banjoVariant: string;
  strings: BanjoString[];
  activeString: string | null;
  onStringClick: (stringId: string) => void;
}

export const BanjoBody: React.FC<BanjoBodyProps> = ({
  banjoVariant,
  strings,
  activeString,
  onStringClick
}) => {
  // Determine style based on variant
  const getBodyStyles = () => {
    switch(banjoVariant) {
      case 'tenor':
        return {
          body: 'bg-gradient-to-r from-yellow-600 to-yellow-500',
          head: 'bg-yellow-200',
          headBorder: 'border-yellow-300',
          neck: 'bg-yellow-800',
          bridge: 'bg-yellow-900',
          string: 'bg-amber-800 hover:bg-amber-600',
          stringActive: 'bg-amber-400',
          text: 'text-yellow-900'
        };
      case 'plectrum':
        return {
          body: 'bg-gradient-to-r from-amber-700 to-amber-600',
          head: 'bg-amber-200',
          headBorder: 'border-amber-300',
          neck: 'bg-amber-900',
          bridge: 'bg-amber-950',
          string: 'bg-amber-900 hover:bg-amber-700',
          stringActive: 'bg-amber-400',
          text: 'text-amber-900'
        };
      case 'bluegrass':
        return {
          body: 'bg-gradient-to-r from-orange-600 to-amber-500',
          head: 'bg-amber-100',
          headBorder: 'border-amber-300',
          neck: 'bg-amber-950',
          bridge: 'bg-amber-950',
          string: 'bg-amber-950 hover:bg-amber-800',
          stringActive: 'bg-amber-300',
          text: 'text-amber-950'
        };
      case 'openback':
        return {
          body: 'bg-gradient-to-r from-amber-600 to-amber-500',
          head: 'bg-amber-50',
          headBorder: 'border-amber-100',
          neck: 'bg-amber-700',
          bridge: 'bg-amber-800',
          string: 'bg-amber-700 hover:bg-amber-600',
          stringActive: 'bg-amber-300',
          text: 'text-amber-700'
        };
      default:
        return {
          body: 'bg-gradient-to-r from-amber-500 to-amber-400',
          head: 'bg-amber-200',
          headBorder: 'border-amber-300',
          neck: 'bg-amber-800',
          bridge: 'bg-amber-800',
          string: 'bg-amber-800 hover:bg-amber-600',
          stringActive: 'bg-amber-400',
          text: 'text-amber-800'
        };
    }
  };

  const styles = getBodyStyles();
  
  return (
    <div className="w-full flex flex-col items-center">
      {/* Banjo head/drum */}
      <motion.div 
        className={`w-64 h-64 rounded-full ${styles.body} relative flex items-center justify-center shadow-lg border-8 ${styles.headBorder}`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className={`w-48 h-48 rounded-full ${styles.head} flex items-center justify-center shadow-inner`}
          animate={{ scale: activeString ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Banjo bridge */}
          <motion.div 
            className={`w-24 h-2 ${styles.bridge} rounded`}
            animate={{ scaleY: activeString ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.2 }}
          ></motion.div>
        </motion.div>
        
        {/* Neck */}
        <motion.div 
          className={`absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-12 h-36 ${styles.neck}`}
          animate={{ y: activeString ? [0, -1, 0] : 0 }}
          transition={{ duration: 0.3, type: "spring" }}
        ></motion.div>
      </motion.div>
      
      {/* Strings */}
      <motion.div 
        className={`mt-6 w-72 border-t-2 border-amber-800 pt-4`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex flex-col space-y-4">
          {strings.map((string, index) => (
            <motion.div 
              key={string.id}
              className="w-full flex items-center"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
            >
              <div className={`w-10 text-right pr-2 font-medium ${styles.text}`}>{string.note}</div>
              <motion.div 
                className={`flex-grow h-1 rounded-full cursor-pointer transition-all ${
                  activeString === string.id ? styles.stringActive : styles.string
                }`}
                onClick={() => onStringClick(string.id)}
                whileHover={{ height: '3px' }}
                animate={activeString === string.id ? {
                  height: ['1px', '4px', '1px'],
                  y: [0, 2, -2, 0],
                } : {}}
                transition={{ duration: 0.3 }}
              ></motion.div>
              <div className={`w-8 text-center font-medium ml-2 ${styles.text}`}>{string.key}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
