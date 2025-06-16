
export const veenaVariants = [
  { id: 'standard', name: 'Standard' },
  { id: 'saraswati', name: 'Saraswati' },
  { id: 'rudra', name: 'Rudra' },
  { id: 'modern', name: 'Modern' }
];

export const getVeenaBorderColor = (variant: string): string => {
  switch(variant) {
    case 'saraswati':
      return 'border-orange-600';
    case 'rudra':
      return 'border-red-700';
    case 'modern':
      return 'border-amber-600';
    default:
      return 'border-amber-700';
  }
};

export const getVeenaBodyGradient = (variant: string): string => {
  switch(variant) {
    case 'saraswati':
      return 'bg-gradient-to-r from-orange-800 to-orange-600';
    case 'rudra':
      return 'bg-gradient-to-r from-red-900 to-red-700';
    case 'modern':
      return 'bg-gradient-to-r from-amber-700 to-amber-500';
    default:
      return 'bg-gradient-to-r from-amber-800 to-amber-600';
  }
};

export const getVeenaResonatorColor = (variant: string): string => {
  switch(variant) {
    case 'saraswati':
      return 'bg-orange-900';
    case 'rudra':
      return 'bg-red-950';
    case 'modern':
      return 'bg-amber-800';
    default:
      return 'bg-amber-900';
  }
};
