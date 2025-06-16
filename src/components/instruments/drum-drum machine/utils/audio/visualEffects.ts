
export const createVisualFeedback = (pad: any) => {
  const padElement = document.getElementById(`drum-${pad.id}`);
  if (padElement) {
    padElement.style.transform = 'scale(0.95)';
    padElement.style.boxShadow = `0 0 30px 8px ${pad.glowColor || 'rgba(255, 255, 255, 0.7)'}`;
    setTimeout(() => {
      padElement.style.transform = '';
      padElement.style.boxShadow = '';
    }, 200);
  }
};
