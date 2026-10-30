import type { HarmonicFunction } from "@/lib/harmony";

export const FN_CLASSES: Record<HarmonicFunction, { bg: string; text: string; border: string; glow: string; soft: string }> = {
  tonic: { bg: "bg-tonic", text: "text-tonic", border: "border-tonic", glow: "glow-tonic", soft: "bg-tonic/25" },
  subdominant: { bg: "bg-subdominant", text: "text-subdominant", border: "border-subdominant", glow: "glow-subdominant", soft: "bg-subdominant/25" },
  dominant: { bg: "bg-dominant", text: "text-dominant", border: "border-dominant", glow: "glow-dominant", soft: "bg-dominant/25" },
};
