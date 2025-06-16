
import { FluteType, fluteTypes } from '../utils/fluteData';

export const getFluteRegionalStyle = (fluteType: FluteType, selectedFluteType: string) => {
  switch (fluteType.id) {
    case 'western':
      return {
        background: 'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
        border: selectedFluteType === fluteType.id ? 'border-blue-400/50' : 'border-white/20',
        accent: 'bg-blue-500',
        hoverGlow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]',
        headerImage: "bg-[url('/lovable-uploads/de01227d-7a6f-49d6-aa18-71d943558930.png')] bg-no-repeat bg-contain bg-center"
      };
    case 'bansuri':
      return {
        background: 'bg-gradient-to-r from-green-500/10 to-yellow-500/10',
        border: selectedFluteType === fluteType.id ? 'border-green-400/50' : 'border-white/20',
        accent: 'bg-green-500',
        hoverGlow: 'hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]',
        headerImage: "bg-[url('/lovable-uploads/5d41ff7e-2a25-4063-aed6-b6f8a2f146b8.png')] bg-no-repeat bg-contain bg-center"
      };
    case 'pan':
      return {
        background: 'bg-gradient-to-r from-teal-500/10 to-teal-500/10',
        border: selectedFluteType === fluteType.id ? 'border-teal-400/50' : 'border-white/20',
        accent: 'bg-teal-500',
        hoverGlow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        headerImage: "bg-[url('/lovable-uploads/09eafb8b-353a-4fc1-829b-71ad231eeb98.png')] bg-no-repeat bg-contain bg-center"
      };
    case 'native':
      return {
        background: 'bg-gradient-to-r from-red-500/10 to-red-500/10',
        border: selectedFluteType === fluteType.id ? 'border-red-400/50' : 'border-white/20',
        accent: 'bg-red-500',
        hoverGlow: 'hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
        headerImage: "bg-[url('/lovable-uploads/83c0a189-9442-46d4-a987-74ba055632b8.png')] bg-no-repeat bg-contain bg-center"
      };
    default:
      return {
        background: 'bg-white/5',
        border: selectedFluteType === fluteType.id ? 'border-primary/30' : 'border-white/20',
        accent: 'bg-primary',
        hoverGlow: 'hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]',
        headerImage: ""
      };
  }
};

export const getFluteContainerClassName = (fluteType: string): string => {
  const selectedFlute = fluteTypes.find(flute => flute.id === fluteType);
  let className = "p-6 backdrop-blur-xl rounded-2xl border shadow-medium transition-all duration-300";
  
  switch(fluteType) {
    case 'western':
      className += " border-blue-500/20 " + (selectedFlute?.backgroundImage || "bg-gradient-to-r from-blue-900/10 to-blue-600/10");
      break;
    case 'bansuri':
      className += " border-amber-500/30 " + (selectedFlute?.backgroundImage || "bg-gradient-to-r from-amber-900/20 to-amber-600/10");
      break;
    case 'pan':
      className += " border-teal-500/20 " + (selectedFlute?.backgroundImage || "bg-gradient-to-r from-teal-900/10 to-teal-600/10");
      break;
    case 'native':
      className += " border-red-500/20 " + (selectedFlute?.backgroundImage || "bg-gradient-to-r from-red-900/10 to-red-700/10");
      break;
    default:
      className += " border-white/20 bg-white/5";
  }
  
  return className;
};

export const getFluteImage = (fluteType: string): string => {
  const selectedFlute = fluteTypes.find(flute => flute.id === fluteType);
  return selectedFlute?.image || "";
};
