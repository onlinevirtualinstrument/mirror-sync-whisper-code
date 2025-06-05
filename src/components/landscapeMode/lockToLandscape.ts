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

/**
 * Utility: Check if the device is considered mobile
 */
const isMobileDevice = (): boolean => {
  return typeof window !== "undefined" && window.innerWidth < 768;
};

/**
 * Request fullscreen on a given element (default: document.documentElement)
 */
export const enterFullscreen = async (element: HTMLElement = document.documentElement): Promise<void> => {
  if (!document.fullscreenElement && element.requestFullscreen) {
    try {
      await element.requestFullscreen();
    } catch (error) {
      console.error("❌ Fullscreen request failed:", error);
    }
  }
};

/**
 * Exit fullscreen if active
 */
export const exitFullscreen = async (): Promise<void> => {
  if (document.fullscreenElement && document.exitFullscreen) {
    try {
      await document.exitFullscreen();
    } catch (error) {
      console.error("❌ Exit fullscreen failed:", error);
    }
  }
};

/**
 * Lock orientation to landscape (mobile only).
 * Should be called inside a user-initiated event (e.g. onClick).
 */
export const lockToLandscape = async (): Promise<void> => {
  if (!isMobileDevice() || !("orientation" in screen)) return;

  try {
    await enterFullscreen();

    const orientation = screen.orientation as ScreenOrientation & {
      lock: (orientation: OrientationLockType) => Promise<void>;
    };

    if (orientation.lock) {
      await orientation.lock("landscape");
      console.log("✅ Screen locked to landscape");
    } else {
      console.warn("⚠️ Orientation lock not supported by this browser.");
    }
  } catch (err) {
    console.error("❌ Orientation Lock Failed:", err);
  }
};

/**
 * Unlock orientation and exit fullscreen (mobile only).
 * Should be called inside user interaction (e.g. closing modal).
 */
export const unlockOrientation = async (): Promise<void> => {
  if (!isMobileDevice() || !("orientation" in screen)) return;

  try {
    await exitFullscreen();

    const orientation = screen.orientation as ScreenOrientation & {
      unlock?: () => void;
    };

    if (orientation.unlock) {
      orientation.unlock(); // Optional, non-standard
    }

    console.log("🔓 Screen orientation unlocked");
  } catch (err) {
    console.error("❌ Orientation Unlock Failed:", err);
  }
};




export const toggleFullscreen = async (element: HTMLElement | null) => {
  if (!element) return;

  if (!document.fullscreenElement) {
    try {
      await element.requestFullscreen();
    } catch (err) {
      console.error("Failed to enter fullscreen:", err);
    }
  } else {
    try {
      await document.exitFullscreen();
    } catch (err) {
      console.error("Failed to exit fullscreen:", err);
    }
  }
};
