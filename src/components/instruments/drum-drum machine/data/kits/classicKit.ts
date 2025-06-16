
import { DrumKit } from '../drumKits';

export const classicKit: DrumKit = {
  id: "classic",
  name: "Classic Rock",
  pads: [
    {
      id: "kick",
      name: "Kick",
      keyTrigger: "Q",
      soundSrc: "synthesized",
      color: "#8B5CF6",
      glowColor: "rgba(139, 92, 246, 0.8)"
    },
    {
      id: "snare",
      name: "Snare",
      keyTrigger: "W",
      soundSrc: "synthesized",
      color: "#EF4444",
      glowColor: "rgba(239, 68, 68, 0.8)"
    },
    {
      id: "hihat-closed",
      name: "Hi-Hat",
      keyTrigger: "E",
      soundSrc: "synthesized",
      color: "#10B981",
      glowColor: "rgba(16, 185, 129, 0.8)"
    },
    {
      id: "hihat-open",
      name: "Open Hat",
      keyTrigger: "R",
      soundSrc: "synthesized",
      color: "#059669",
      glowColor: "rgba(5, 150, 105, 0.8)"
    },
    {
      id: "tom-high",
      name: "High Tom",
      keyTrigger: "A",
      soundSrc: "synthesized",
      color: "#F59E0B",
      glowColor: "rgba(245, 158, 11, 0.8)"
    },
    {
      id: "tom-low",
      name: "Low Tom",
      keyTrigger: "S",
      soundSrc: "synthesized",
      color: "#B45309",
      glowColor: "rgba(180, 83, 9, 0.8)"
    },
    {
      id: "crash",
      name: "Crash",
      keyTrigger: "D",
      soundSrc: "synthesized",
      color: "#6366F1",
      glowColor: "rgba(99, 102, 241, 0.8)"
    },
    {
      id: "ride",
      name: "Ride",
      keyTrigger: "F",
      soundSrc: "synthesized",
      color: "#8B5CF6",
      glowColor: "rgba(139, 92, 246, 0.8)"
    },
    {
      id: "clap",
      name: "Clap",
      keyTrigger: "G",
      soundSrc: "synthesized",
      color: "#EC4899",
      glowColor: "rgba(236, 72, 153, 0.8)"
    }
  ]
};
