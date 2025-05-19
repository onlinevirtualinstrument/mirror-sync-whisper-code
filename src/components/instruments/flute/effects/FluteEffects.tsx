
import React from 'react';
import { motion } from 'framer-motion';

interface NoteParticlesProps {
  activeNote: string | null;
  particlesVisible: boolean;
  fluteType: string;
}

export const NoteParticles: React.FC<NoteParticlesProps> = ({ activeNote, particlesVisible, fluteType }) => {
  if (!activeNote || !particlesVisible) return null;
  
  const particleColors = {
    western: ['#3b82f6', '#60a5fa', '#93c5fd'],
    bansuri: ['#d97706', '#f59e0b', '#fbbf24'],
    pan: ['#14b8a6', '#2dd4bf', '#5eead4'],
    native: ['#b91c1c', '#ef4444', '#fca5a5']
  };
  
  const colors = particleColors[fluteType as keyof typeof particleColors] || ['#8b5cf6', '#a78bfa', '#c4b5fd'];
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 1, 
            scale: 0.2,
            x: `calc(${Math.random() * 100}% - 5px)`,
            y: `calc(${Math.random() * 100}% - 5px)`
          }}
          animate={{ 
            opacity: 0, 
            scale: 0,
            x: `calc(${Math.random() * 100}% - 5px)`, 
            y: `calc(${Math.random() * 100}% - 50px)`
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: Math.random() * 3 }}
          style={{ 
            position: 'absolute',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)]
          }}
        />
      ))}
    </div>
  );
};

interface FluteDecorationProps {
  fluteType: string;
}

export const FluteDecoration: React.FC<FluteDecorationProps> = ({ fluteType }) => {
  switch(fluteType) {
    case 'western':
      return (
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
      );
    case 'bansuri':
      return (
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-yellow-600/10 rounded-full blur-3xl"></div>
        </div>
      );
    case 'pan':
      return (
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 left-1/3 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>
      );
    case 'native':
      return (
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-1/4 right-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-0 w-60 h-60 bg-rose-600/10 rounded-full blur-3xl"></div>
        </div>
      );
    default:
      return null;
  }
};
