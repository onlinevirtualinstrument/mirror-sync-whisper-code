
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SitarBodyProps {
  sitarVariant: string;
  activeString: string | null;
  onPlayString: (stringId: string) => void;
}

export const SitarBody: React.FC<SitarBodyProps> = ({
  sitarVariant,
  activeString,
  onPlayString
}) => {
  // Get visual styles based on variant - memoized to prevent recalculation on every render
  const styles = useMemo(() => {
    switch(sitarVariant) {
      case 'punjabi':
        return {
          body: 'bg-gradient-to-r from-yellow-700 to-amber-600',
          string: 'bg-yellow-300 hover:bg-yellow-200',
          activeString: 'bg-yellow-100',
          text: 'text-yellow-100',
          decoration: 'bg-yellow-800/50'
        };
      case 'bengali':
        return {
          body: 'bg-gradient-to-r from-red-700 to-red-600',
          string: 'bg-red-300 hover:bg-red-200',
          activeString: 'bg-red-100',
          text: 'text-red-100',
          decoration: 'bg-red-800/50'
        };
      case 'electric':
        return {
          body: 'bg-gradient-to-r from-blue-700 to-indigo-600',
          string: 'bg-blue-300 hover:bg-blue-200',
          activeString: 'bg-blue-100',
          text: 'text-blue-100',
          decoration: 'bg-blue-800/50'
        };
      default:
        return {
          body: 'bg-gradient-to-r from-amber-800 to-amber-600',
          string: 'bg-amber-300 hover:bg-amber-200',
          activeString: 'bg-amber-100',
          text: 'text-amber-100',
          decoration: 'bg-amber-900/50'
        };
    }
  }, [sitarVariant]);

  const strings = useMemo(() => {
    const stringIds = Array.from({ length: 7 }, (_, i) => `string${i + 1}`);
    const notes = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];
    
    return stringIds.map((id, index) => ({
      id,
      note: notes[index],
      key: `${index + 1}`,
      delay: index * 0.05
    }));
  }, []);

  return (
    <motion.div 
      className={`sitar-body w-full h-64 relative ${styles.body} rounded-lg overflow-hidden shadow-lg`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      layout
    >
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/30 to-transparent"></div>
      
      {/* Decorative elements */}
      <motion.div 
        className={`absolute left-1/2 top-1/2 w-24 h-24 rounded-full ${styles.decoration} -translate-x-1/2 -translate-y-1/2 opacity-30`}
        animate={{ 
          scale: activeString ? [1, 1.1, 1] : 1,
          opacity: activeString ? [0.3, 0.5, 0.3] : 0.3
        }}
        transition={{ duration: 0.5 }}
      ></motion.div>
      <div className={`absolute inset-x-0 bottom-0 h-8 ${styles.decoration} opacity-40`}></div>
      
      <div className="absolute inset-0 flex flex-col justify-center items-center">
        {strings.map((string) => (
          <motion.div 
            key={string.id}
            className="w-full flex items-center justify-center py-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: string.delay, duration: 0.5 }}
          >
            <div className={`w-16 text-right pr-4 ${styles.text} text-sm`}>{string.note}</div>
            <motion.div 
              className={`sitar-string h-0.5 flex-grow mx-2 cursor-pointer transition-all ${
                activeString === string.id ? styles.activeString : styles.string
              }`}
              onClick={() => onPlayString(string.id)}
              whileHover={{ height: '2px', backgroundColor: '#fff' }}
              animate={activeString === string.id ? {
                height: ['0.5px', '3px', '0.5px'],
                backgroundColor: ['', '#fff', ''],
                boxShadow: ['0 0 0px rgba(255,255,255,0)', '0 0 10px rgba(255,255,255,0.8)', '0 0 0px rgba(255,255,255,0)']
              } : {}}
              transition={{ duration: 0.5 }}
            ></motion.div>
            <div className={`w-6 text-left pl-2 ${styles.text} text-sm`}>{string.key}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
