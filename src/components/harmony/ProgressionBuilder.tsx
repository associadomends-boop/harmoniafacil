import { useState } from "react";
import { Play, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FN_INFO, chordMidi, type Chord } from "@/lib/harmony";
import { playSequence } from "@/lib/audio";
import { FN_CLASSES } from "./fn-styles";

export function ProgressionBuilder({ chords }: { chords: Chord[] }) {
  const [seq, setSeq] = useState<number[]>([3, 4, 0]);
  const [playing, setPlaying] = useState<number | null>(null);

  const play = () => {
    if (!seq.length) return;
    playSequence(seq.map((d) => chordMidi(chords[d])));
    seq.forEach((_, i) => setTimeout(() => setPlaying(i), i * 1100));
    setTimeout(() => setPlaying(null), seq.length * 1100);
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold">Experimente uma progressão</h2>
      <p className="text-sm text-muted-foreground">Toque nos acordes para montar sua sequência.</p>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {chords.map((ch) => (
          <button key={ch.degree} onClick={() => setSeq((s) => [...s, ch.degree])} className={cn("rounded-2xl py-3 text-fn-foreground active:scale-95", FN_CLASSES[ch.fn].bg)}>
            <span className="block font-display text-lg font-bold leading-none">{ch.name}</span>
            <span className="text-[10px] font-semibold">{ch.roman}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 flex min-h-24 flex-wrap items-center gap-2 rounded-2xl bg-muted p-3">
        {seq.length === 0 && <span className="text-sm text-muted-foreground">Sua sequência aparece aqui…</span>}
        {seq.map((d, i) => {
          const ch = chords[d];
          const c = FN_CLASSES[ch.fn];
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-muted-foreground">→</span>}
              <div className={cn("relative rounded-2xl border-2 bg-card px-3 py-2 text-center transition-transform", c.border, playing === i && cn("scale-110", c.glow))}>
                <span className={cn("block font-display text-xl font-bold", c.text)}>{ch.name}</span>
                <span className="text-[10px] text-muted-foreground">{FN_INFO[ch.fn].feel}</span>
                <button onClick={() => setSeq((s) => s.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 rounded-full bg-secondary p-0.5" aria-label="Remover">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={play} disabled={!seq.length} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-40">
          <Play className="h-5 w-5" /> Tocar
        </button>
        <button onClick={() => setSeq([])} className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 font-semibold">
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </button>
      </div>
    </section>
  );
}
