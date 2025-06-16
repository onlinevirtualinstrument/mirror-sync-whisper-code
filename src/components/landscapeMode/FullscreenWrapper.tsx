import React, { useRef, forwardRef } from "react";
import { useFullscreenManager } from "./lockToLandscape";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FullscreenWrapperProps {
  children: React.ReactNode;
  instrumentName?: string; // optional to add data attribute or class
}

const FullscreenWrapper = forwardRef<HTMLDivElement, FullscreenWrapperProps>(
  ({ children, instrumentName }, ref) => {
    const containerRef = (ref as React.MutableRefObject<HTMLDivElement>) || useRef<HTMLDivElement>(null);
    const { isFullscreen } = useFullscreenManager(containerRef);

    return (
      <div
        ref={containerRef}
        data-fullscreen-instrument={instrumentName || ""}
        className={`relative w-full flex items-center justify-center bg-white animate-scale-in transition-all ${
          isFullscreen ? "px-5 fullscreen-active" : ""
        }`}
      >
        {isFullscreen && (
         
          <Button variant="outline"
                            onClick={() => document.exitFullscreen()}
                            className=" px-4 py-2 rounded-lg text-white bg-gradient-to-r from-violet-600 to-purple-700 overflow-hidden hover:brightness-125 transition-all animate-pulse duration-5000 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] fixed top-5 right-5"
                            aria-label="Close"
                        >
                            <X size={18} /> Close
                        </Button>
        )}

        {children}
      </div>
    );
  }
);

export default FullscreenWrapper;
