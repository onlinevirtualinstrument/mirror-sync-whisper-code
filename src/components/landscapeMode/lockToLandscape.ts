
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
// const isMobileDevice = (): boolean =>
//   typeof window !== "undefined" && window.innerWidth < 768;

const isMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};


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


// // Inside your component or util
// useEffect(() => {
//   const handleOrientationChange = () => {
//     if (screen.orientation.type.startsWith("portrait")) {
//       lockToLandscape(); // Re-lock if user accidentally rotated
//     }
//   };

//   window.screen.orientation.addEventListener("change", handleOrientationChange);
//   return () => {
//     window.screen.orientation.removeEventListener("change", handleOrientationChange);
//   };
// }, []);


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

      // Optional: Re-lock on change
      // screen.orientation.addEventListener("change", () => {
      //   if (screen.orientation.type.startsWith("portrait")) {
      //     orientation.lock("landscape").catch(console.warn);
      //   }
      // });
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
      border: 1px solidrgb(9, 10, 10) !important;
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

/** Toggle fullscreen and inject styles for UI compatibility */
export const toggleFullscreen = async (element?: HTMLElement): Promise<boolean> => {
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
        }
        catch (err) {
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
      document.body.classList.remove("fullscreen-mode");
      removeFullscreenStyles();
      restoreAriaHidden();

      return false;
    }
  } catch (err) {
    console.error("❌ Fullscreen toggle failed:", err);
    return false;
  }
};


/** 📦 Global cleanup if user exits fullscreen manually */
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    document.body.classList.remove("fullscreen-mode");
    removeFullscreenStyles();
    restoreAriaHidden();
  }
});



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


