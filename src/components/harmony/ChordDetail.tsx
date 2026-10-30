import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTEXT_NOTES, FN_INFO, MEANING, NEXT, chordMidi, type Chord } from "@/lib/harmony";
import { playChord } from "@/lib/audio";
import { FN_CLASSES } from "./fn-styles";

export function ChordDetail({ chord, chords, onSelect }: { chord: Chord | null; chords: Chord[]; onSelect: (c: Chord) => void }) {
  if (!chord)
    return (
      <div className="rounded-3xl border border-dashed border-border p-6 text-center text-muted-foreground">
        Toque em um acorde no mapa para descobrir sua função e os próximos caminhos.
      </div>
    );
  const c = FN_CLASSES[chord.fn];
  const ctx = CONTEXT_NOTES[chord.degree];
  return (
    <div className={cn("rounded-3xl border-2 bg-card p-5", c.border)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Acorde atual</p>
          <p className={cn("font-display text-5xl font-bold", c.text)}>{chord.name}</p>
          <p className="mt-1 text-sm">
            <span className={cn("font-bold", c.text)}>{FN_INFO[chord.fn].label}</span> · Grau {chord.roman} · {FN_INFO[chord.fn].feel}
          </p>
        </div>
        <button onClick={() => playChord(chordMidi(chord))} className={cn("rounded-full p-4 text-fn-foreground active:scale-95", c.bg)} aria-label="Ouvir acorde">
          <Volume2 className="h-6 w-6" />
        </button>
      </div>
      <p className="mt-4 text-sm">{MEANING[chord.fn]}</p>
      {ctx && <p className="mt-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">💡 {ctx}</p>}
      <p className="mt-5 text-xs uppercase tracking-widest text-muted-foreground">Próximos caminhos</p>
      <ul className="mt-2 space-y-2">
        {NEXT[chord.degree]!.map((p) => {
          const n = chords[p.degree]!;
          const nc = FN_CLASSES[n.fn];
          return (
            <li key={p.degree}>
              <button
                onClick={() => onSelect(n)}
                className={cn("flex w-full items-center gap-3 rounded-2xl border p-3 text-left active:scale-[0.98]", p.main ? cn(nc.border, nc.soft) : "border-border")}
              >
                <span className={cn("w-14 font-display text-2xl font-bold", nc.text)}>{n.name}</span>
                <span className="flex-1 text-sm">
                  <span className={cn("font-semibold", nc.text)}>{FN_INFO[n.fn].label} · {n.roman}</span>
                  {p.main && <span className="ml-2 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">MAIS COMUM</span>}
                  <span className="block text-muted-foreground">{p.note}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
