import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FN_INFO, chordMidi, type Chord } from "@/lib/harmony";
import { playSequence } from "@/lib/audio";
import { FN_CLASSES } from "./fn-styles";

export function ProgressionBuilder({ chords }: { chords: Chord[] }) {
  // Sequence stores scale degrees, so changing the key converts every chord automatically.
  const [seq, setSeq] = useState<number[]>([3, 4, 0]);
  const [playing, setPlaying] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const play = () => {
    if (!seq.length) return;
    timers.current.forEach(clearTimeout);
    playSequence(seq.map((d) => chordMidi(chords[d]!)));
    timers.current = seq.map((_, i) => setTimeout(() => setPlaying(i), i * 1100));
    timers.current.push(setTimeout(() => setPlaying(null), seq.length * 1100));
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <h2 className="text-2xl font-extrabold">Experimente uma progressão</h2>
      <p className="mt-1 text-base font-medium text-muted-foreground">Toque nos acordes para montar sua sequência.</p>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {chords.map((ch) => (
          <button key={ch.degree} onClick={() => setSeq((s) => [...s, ch.degree])} className={cn("rounded-2xl py-3 text-fn-foreground active:scale-95", FN_CLASSES[ch.fn].bg)}>
            <span className="block font-display text-2xl font-extrabold leading-none">{ch.name}</span>
            <span className="mt-1 block text-xs font-bold">{ch.roman}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 flex min-h-28 flex-wrap items-center gap-2 rounded-2xl bg-muted p-3">
        {seq.length === 0 && <span className="text-base font-semibold text-muted-foreground">Sua sequência aparece aqui…</span>}
        {seq.map((d, i) => {
          const ch = chords[d]!;
          const c = FN_CLASSES[ch.fn];
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-2xl font-bold text-muted-foreground">→</span>}
              <div className={cn("relative rounded-2xl border-2 bg-card px-3 py-2 text-center transition-transform", c.border, playing === i && cn("scale-110", c.glow))}>
                <span className={cn("block font-display text-3xl font-extrabold leading-none", c.text)}>{ch.name}</span>
                <span className="mt-1 block text-[11px] font-semibold text-muted-foreground">{FN_INFO[ch.fn].feel}</span>
                <button onClick={() => setSeq((s) => s.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 rounded-full bg-secondary p-1" aria-label="Remover">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={play} disabled={!seq.length} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-extrabold text-primary-foreground disabled:opacity-40">
          <Play className="h-6 w-6" /> Tocar
        </button>
        <button onClick={() => setSeq([])} className="flex items-center gap-2 rounded-2xl bg-secondary px-5 py-4 text-lg font-bold">
          <RotateCcw className="h-5 w-5" /> Reiniciar
        </button>
      </div>
    </section>
  );
}
