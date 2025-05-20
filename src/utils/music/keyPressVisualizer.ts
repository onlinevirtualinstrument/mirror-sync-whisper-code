
/**
 * Utility to show a player's first letter on instrument keys
 */

interface PlayerKeyPress {
  playerId: string;
  playerName: string;
  keyElement: HTMLElement;
  timestamp: number;
}

// Track current key presses 
const activeKeyPresses: Map<string, PlayerKeyPress> = new Map();

// Remove player indicators after a timeout
const INDICATOR_TIMEOUT = 800; // ms

/**
 * Apply a player's first letter to a key element
 */
export const showPlayerOnKey = (
  keyElement: HTMLElement, 
  playerName: string = "Player",
  playerId: string = "local"
): void => {
  if (!keyElement) return;
  
  // Get first letter of player name
  const firstLetter = playerName.charAt(0).toUpperCase();
  
  // Create unique key identifier
  const keyId = `${keyElement.id || Math.random().toString(36)}-${playerId}`;
  
  // Check if we already have an active press for this player on this key
  const existingPress = activeKeyPresses.get(keyId);
  if (existingPress) {
    // Reset the timeout for this key press
    clearTimeout(existingPress.timestamp as any);
  }
  
  // Create or update indicator
  let indicator = keyElement.querySelector('.player-indicator') as HTMLElement;
  
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'player-indicator';
    indicator.style.position = 'absolute';
    indicator.style.top = '50%';
    indicator.style.left = '50%';
    indicator.style.transform = 'translate(-50%, -50%)';
    indicator.style.fontSize = '14px';
    indicator.style.fontWeight = 'bold';
    indicator.style.color = 'rgba(255, 255, 255, 0.8)';
    indicator.style.pointerEvents = 'none';
    indicator.style.zIndex = '10';
    indicator.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.5)';
    keyElement.style.position = 'relative';
    keyElement.appendChild(indicator);
  }
  
  // Set the indicator text
  indicator.textContent = firstLetter;
  
  // Store the key press with a timeout to remove it
  const timeoutId = setTimeout(() => {
    removePlayerFromKey(keyElement, playerId);
  }, INDICATOR_TIMEOUT);
  
  activeKeyPresses.set(keyId, {
    playerId,
    playerName,
    keyElement,
    timestamp: timeoutId as any
  });
};

/**
 * Remove player indicator from a key
 */
export const removePlayerFromKey = (keyElement: HTMLElement, playerId: string): void => {
  if (!keyElement) return;
  
  const keyId = `${keyElement.id || Math.random().toString(36)}-${playerId}`;
  const existingPress = activeKeyPresses.get(keyId);
  
  if (existingPress) {
    // Clear timeout
    clearTimeout(existingPress.timestamp as any);
    
    // Remove indicator element
    const indicator = keyElement.querySelector('.player-indicator');
    if (indicator) {
      keyElement.removeChild(indicator);
    }
    
    // Remove from active presses
    activeKeyPresses.delete(keyId);
  }
};

/**
 * Clear all player indicators
 */
export const clearAllPlayerIndicators = (): void => {
  activeKeyPresses.forEach((press) => {
    clearTimeout(press.timestamp as any);
    const indicator = press.keyElement.querySelector('.player-indicator');
    if (indicator) {
      press.keyElement.removeChild(indicator);
    }
  });
  
  activeKeyPresses.clear();
};
