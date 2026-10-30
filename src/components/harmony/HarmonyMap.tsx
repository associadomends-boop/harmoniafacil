import { cn } from "@/lib/utils";
import { FN_INFO, type Chord, type HarmonicFunction } from "@/lib/harmony";
import { FN_CLASSES } from "./fn-styles";

interface Props {
  chords: Chord[];
  selected: Chord | null;
  nextDegrees: number[];
  mainDegree?: number | undefined;
  onSelect: (c: Chord) => void;
}

const ORDER: HarmonicFunction[] = ["dominant", "tonic", "subdominant"];

export function HarmonyMap({ chords, selected, nextDegrees, mainDegree, onSelect }: Props) {
  const activeFns = new Set(nextDegrees.map((d) => chords[d]!.fn));
  return (
    <div className="relative mx-auto flex max-w-md flex-col items-center gap-10 py-2">
      <Arrows />
      {ORDER.map((fn) => {
        const c = FN_CLASSES[fn];
        const info = FN_INFO[fn];
        const isCurrent = selected?.fn === fn;
        const isNext = activeFns.has(fn);
        return (
          <div
            key={fn}
            className={cn(
              "relative z-10 flex w-full max-w-[19rem] flex-col items-center rounded-full border-2 bg-card px-6 py-6 transition-all duration-300 aspect-[1.6]",
              c.border,
              isCurrent && cn(c.glow, "scale-105"),
              selected && !isCurrent && !isNext && "opacity-40",
            )}
          >
            <span className={cn("text-xs font-bold uppercase tracking-[0.25em]", c.text)}>{info.label}</span>
            <span className="text-sm text-muted-foreground">{info.feel}</span>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {chords
                .filter((ch) => ch.fn === fn)
                .map((ch) => {
                  const sel = selected?.degree === ch.degree;
                  const next = nextDegrees.includes(ch.degree);
                  return (
                    <button
                      key={ch.degree}
                      onClick={() => onSelect(ch)}
                      className={cn(
                        "flex min-w-14 flex-col items-center rounded-2xl border px-3 py-2 transition-all active:scale-95",
                        sel ? cn(c.bg, "text-fn-foreground border-transparent") : cn(c.soft, "border-border hover:border-current", c.text),
                        next && !sel && "ring-2 ring-foreground/70",
                        mainDegree === ch.degree && "ring-4",
                      )}
                    >
                      <span className="font-display text-lg font-bold leading-none">{ch.name}</span>
                      <span className="mt-1 text-[10px] font-semibold opacity-80">{ch.roman}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Arrows() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 300" preserveAspectRatio="none" aria-hidden>
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground" />
        </marker>
      </defs>
      {/* Sub → Dom (left curve, upward) */}
      <path d="M8,250 C-6,150 -6,150 8,50" className="stroke-subdominant" strokeWidth="0.8" fill="none" markerEnd="url(#ah)" vectorEffect="non-scaling-stroke" strokeDasharray="4 3" />
      {/* Dom → Tonic */}
      <path d="M44,95 L44,108" className="stroke-dominant" strokeWidth="2" fill="none" markerEnd="url(#ah)" vectorEffect="non-scaling-stroke" />
      {/* Tonic → Dom */}
      <path d="M56,108 L56,95" className="stroke-tonic" strokeWidth="2" fill="none" markerEnd="url(#ah)" vectorEffect="non-scaling-stroke" />
      {/* Tonic → Sub */}
      <path d="M50,192 L50,205" className="stroke-tonic" strokeWidth="2" fill="none" markerEnd="url(#ah)" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
