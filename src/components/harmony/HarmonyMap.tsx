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
    <div className="relative mx-auto flex max-w-xl flex-col items-center gap-10 py-2">
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
              "relative z-10 flex w-full max-w-[22rem] flex-col items-center rounded-full border-2 bg-card px-5 py-5 transition-all duration-300 aspect-[1.5]",
              c.border,
              isCurrent && cn(c.glow, "scale-105"),
              selected && !isCurrent && !isNext && "opacity-40",
            )}
          >
            <span className={cn("text-base font-extrabold uppercase tracking-[0.18em]", c.text)}>{info.label}</span>
            <span className="mt-0.5 text-sm font-semibold text-muted-foreground">{info.feel}</span>
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
                        "flex min-w-[5.5rem] flex-col items-center rounded-2xl border-2 px-3 py-2.5 transition-all active:scale-95",
                        sel ? cn(c.bg, "border-transparent text-fn-foreground") : cn(c.soft, "border-border hover:border-current", c.text),
                        next && !sel && "ring-2 ring-foreground/80",
                        mainDegree === ch.degree && "ring-4 ring-foreground",
                      )}
                    >
                      <span className="font-display text-3xl font-extrabold leading-none">{ch.name}</span>
                      <span className="mt-1.5 text-xs font-bold opacity-90">{ch.roman}</span>
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
      <path d="M8,240 C-6,150 -6,150 8,55" className="stroke-subdominant" strokeWidth="1.6" fill="none" markerEnd="url(#ah)" vectorEffect="non-scaling-stroke" strokeDasharray="4 3" />
      {/* Dom → Tonic */}
      <path d="M44,92 L44,106" className="stroke-dominant" strokeWidth="3.5" fill="none" markerEnd="url(#ah)" vectorEffect="non-scaling-stroke" />
      {/* Tonic → Dom */}
      <path d="M56,106 L56,92" className="stroke-tonic" strokeWidth="3.5" fill="none" markerEnd="url(#ah)" vectorEffect="non-scaling-stroke" />
      {/* Tonic → Sub */}
      <path d="M50,197 L50,211" className="stroke-tonic" strokeWidth="3.5" fill="none" markerEnd="url(#ah)" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
