
// Cache for preloaded audio objects
const audioCache: Record<string, HTMLAudioElement> = {};

// Preload a set of audio files
export const preloadAudioFiles = (files: string[]): Promise<void[]> => {
  const promises = files.map(file => {
    return new Promise<void>((resolve, reject) => {
      const audio = new Audio();
      audio.src = file;
      
      audio.addEventListener('canplaythrough', () => {
        audioCache[file] = audio;
        resolve();
      }, { once: true });
      
      audio.addEventListener('error', () => {
        console.error(`Failed to load audio file: ${file}`);
        reject(`Failed to load audio file: ${file}`);
      });
      
      // Start loading
      audio.load();
    });
  });
  
  return Promise.all(promises);
};

// Play a sound from the cache or create a new audio element if not cached
export const playSound = (soundSrc: string, volume = 1): void => {
  let audio: HTMLAudioElement;
  
  if (audioCache[soundSrc]) {
    // Create a new instance using the cached audio as a model
    audio = new Audio();
    audio.src = soundSrc;
  } else {
    audio = new Audio(soundSrc);
  }
  
  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(err => console.error("Error playing audio:", err));
};
