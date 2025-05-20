// utils/lockToLandscape.ts

export type OrientationLockType =
  | "any"
  | "natural"
  | "landscape"
  | "portrait"
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

// Lock orientation on mobile (only works in fullscreen)
export const lockToLandscape = async (): Promise<void> => {
  const isMobile = window.innerWidth < 768;
  if (!isMobile || !("orientation" in screen)) return;

  try {
    const docElm = document.documentElement;

    if (docElm.requestFullscreen) {
      await docElm.requestFullscreen();
    }

    const orientation = screen.orientation as ScreenOrientation & {
      lock: (orientation: OrientationLockType) => Promise<void>;
    };

    if (orientation.lock) {
      await orientation.lock("landscape");
      console.log("✅ Screen locked to landscape");
    }
  } catch (err) {
    console.error("❌ Orientation Lock Failed:", err);
  }
};

export const unlockOrientation = async (): Promise<void> => {
  const isMobile = window.innerWidth < 768;
  if (!isMobile || !("orientation" in screen)) return;

  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }

    const orientation = screen.orientation as ScreenOrientation & {
      unlock?: () => void;
    };

    if (orientation.unlock) {
      orientation.unlock(); // Not required in most browsers
    }

    console.log("🔓 Screen orientation unlocked");
  } catch (err) {
    console.error("❌ Orientation Unlock Failed:", err);
  }
};

