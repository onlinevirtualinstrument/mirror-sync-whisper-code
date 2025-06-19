import { useState, useEffect } from "react";

export type OrientationLockType =
  | "any"
  | "natural"
  | "landscape"
  | "portrait"
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

/** Detect mobile devices */
const isMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Global state to prevent concurrent operations
let isLockingOrientation = false;
let currentLockState = false;

export const enterFullscreen = async (element: HTMLElement = document.documentElement): Promise<void> => {
  if (!document.fullscreenElement && element.requestFullscreen) {
    try {
      await element.requestFullscreen();
    } catch (error) {
      console.error("❌ Fullscreen request failed:", error);
    }
  }
};

export const exitFullscreen = async (): Promise<void> => {
  if (document.fullscreenElement && document.exitFullscreen) {
    try {
      await document.exitFullscreen();
    } catch (error) {
      console.error("❌ Exit fullscreen failed:", error);
    }
  }
};

export const lockToLandscape = async (): Promise<void> => {
  // Prevent concurrent operations
  if (isLockingOrientation) {
    console.log("🔄 Orientation lock already in progress");
    return;
  }

  // Check if already locked
  if (currentLockState) {
    console.log("🔒 Already locked to landscape");
    return;
  }

  if (!isMobileDevice() || !("orientation" in screen)) {
    console.log("📱 Not a mobile device or orientation API not available");
    return;
  }

  isLockingOrientation = true;

  try {
    await enterFullscreen();

    const orientation = screen.orientation as ScreenOrientation & {
      lock: (orientation: OrientationLockType) => Promise<void>;
    };

    if (orientation.lock) {
      await orientation.lock("landscape");
      currentLockState = true;
      console.log("✅ Screen locked to landscape");
    } else {
      console.warn("⚠️ Orientation lock not supported by this browser.");
    }
  } catch (err) {
    console.error("❌ Orientation Lock Failed:", err);
  } finally {
    isLockingOrientation = false;
  }
};

export const unlockOrientation = async (): Promise<void> => {
  // Prevent unnecessary operations
  if (!currentLockState) {
    return;
  }

  if (!isMobileDevice() || !("orientation" in screen)) return;

  try {
    await exitFullscreen();

    const orientation = screen.orientation as ScreenOrientation & {
      unlock?: () => void;
    };

    if (orientation.unlock) {
      orientation.unlock();
    }

    currentLockState = false;
    console.log("🔓 Screen orientation unlocked");
  } catch (err) {
    console.error("❌ Orientation Unlock Failed:", err);
  }
};

/** Unhide focused or interactive elements to prevent aria-hidden focus errors */
const removeAriaHiddenFromFocusedElements = () => {
  const active = document.activeElement;

  if (!active) return;

  let current: HTMLElement | null = active as HTMLElement;

  while (current && current !== document.body) {
    if (current.hasAttribute("aria-hidden")) {
      current.setAttribute("data-original-aria-hidden", "true");
      current.removeAttribute("aria-hidden");
    }
    current = current.parentElement;
  }
};

/** Restore aria-hidden on previously unhidden elements */
const restoreAriaHidden = () => {
  document.querySelectorAll('[data-original-aria-hidden="true"]').forEach((el) => {
    el.setAttribute("aria-hidden", "true");
    el.removeAttribute("data-original-aria-hidden");
  });
};

/** Add Radix and popup-safe styles inside fullscreen */
const STYLE_ID = "fullscreen-dropdown-fix";

const injectFullscreenStyles = () => {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    /* Applies globally when fullscreen-mode class is added to <html> */
    html.fullscreen-mode [data-radix-popper-content-wrapper],
    html.fullscreen-mode [data-radix-dropdown-menu-content],
    html.fullscreen-mode [data-radix-select-content],
    html.fullscreen-mode [data-radix-popover-content],
    html.fullscreen-mode [data-radix-tooltip-content],
    html.fullscreen-mode [role="dialog"],
    [data-fullscreen-fix] {
      z-index: 10000 !important;
      position: fixed !important;
    }

    html.fullscreen-mode [data-radix-select-viewport],
    [data-fullscreen-fix] [data-radix-select-viewport] {
      background: white !important;
      border: 1px solid rgb(9, 10, 10) !important;
      border-radius: 8px !important;
      box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35),
                  0 10px 20px -15px rgba(22, 23, 24, 0.2) !important;
    }

    html.fullscreen-mode.dark [data-radix-select-viewport],
    html.dark.fullscreen-mode [data-radix-select-viewport] {
      background: #1e293b !important;
      border-color: #475569 !important;
    }
  `;
  document.head.appendChild(style);
};

const removeFullscreenStyles = () => {
  document.getElementById(STYLE_ID)?.remove();
};

// Prevent multiple simultaneous fullscreen operations
let fullscreenOperationInProgress = false;

/** Toggle fullscreen and inject styles for UI compatibility */
export const toggleFullscreen = async (element?: HTMLElement): Promise<boolean> => {
  if (fullscreenOperationInProgress) {
    console.log("Fullscreen operation already in progress, skipping...");
    return document.fullscreenElement !== null;
  }

  fullscreenOperationInProgress = true;
  const el = element || document.documentElement;

  try {
    if (!document.fullscreenElement) {
      removeAriaHiddenFromFocusedElements();

      document.documentElement.classList.add("fullscreen-mode");
      injectFullscreenStyles();

      const request =
        el.requestFullscreen ||
        (el as any).webkitRequestFullscreen ||
        (el as any).msRequestFullscreen;

      if (request) {
        try {
          await request.call(el);
        } catch (err) {
          await el.requestFullscreen();
        }
      } else {
        console.warn("Fullscreen API not supported on this browser.");
      }

      return true;
    } else {
      const exit =
        document.exitFullscreen ||
        (document as any).webkitExitFullscreen ||
        (document as any).msExitFullscreen;

      try {
        if (exit) await exit.call(document);
      } catch (err) {
        await document.exitFullscreen();
      }
      document.documentElement.classList.remove("fullscreen-mode");
      removeFullscreenStyles();
      restoreAriaHidden();

      return false;
    }
  } catch (err) {
    console.error("❌ Fullscreen toggle failed:", err);
    return false;
  } finally {
    fullscreenOperationInProgress = false;
  }
};

// Single event listener setup
let fullscreenListenerAdded = false;

if (!fullscreenListenerAdded && typeof document !== 'undefined') {
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      document.documentElement.classList.remove("fullscreen-mode");
      removeFullscreenStyles();
      restoreAriaHidden();
      currentLockState = false; // Reset lock state when fullscreen exits
    }
  });
  fullscreenListenerAdded = true;
}

export function useFullscreenManager(containerRef: React.RefObject<HTMLElement>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const active = document.fullscreenElement === containerRef.current;
      setIsFullscreen(active);
      document.documentElement.classList.toggle("fullscreen-mode", active);
    };

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [containerRef]);

  return { isFullscreen };
}