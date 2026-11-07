import { useState } from "react";
import { Ear, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { FN_INFO, KEYS, chordMidi, chordsForKey, type HarmonicFunction, type Key } from "@/lib/harmony";
import { playChord } from "@/lib/audio";
import { FN_CLASSES } from "./fn-styles";

const OPTIONS: HarmonicFunction[] = ["tonic", "subdominant", "dominant"];
// Clear-cut degrees only (iii is ambiguous): I, vi = repouso · ii, IV = preparação · V, vii° = tensão.
const DEGREES = [0, 5, 1, 3, 4, 6];

interface Round { key: Key; degree: number }

export function EarTrainer() {
  const [round, setRound] = useState<Round | null>(null);
  const [answer, setAnswer] = useState<HarmonicFunction | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });

  const play = (r: Round) => {
    const ch = chordsForKey(r.key);
    playChord(chordMidi(ch[0]!), 0, 1); // contexto: a casa
    playChord(chordMidi(ch[r.degree]!), 1.3, 1.6);
  };
  const next = () => {
    const r = { key: KEYS[Math.floor(Math.random() * 12)]!, degree: DEGREES[Math.floor(Math.random() * DEGREES.length)]! };
    setRound(r);
    setAnswer(null);
    play(r);
  };
  const chord = round ? chordsForKey(round.key)[round.degree]! : null;
  const choose = (fn: HarmonicFunction) => {
    if (!chord || answer) return;
    setAnswer(fn);
    setScore((s) => ({ ok: s.ok + (fn === chord.fn ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Ear className="h-7 w-7 text-primary" />
        <h2 className="text-2xl font-extrabold">Treino de ouvido</h2>
        <span className="ml-auto rounded-xl bg-secondary px-3 py-1 font-display text-xl font-extrabold">{score.ok}/{score.total}</span>
      </div>
      <p className="mt-1 text-base font-medium text-muted-foreground">Primeiro toca a "casa" (tônica), depois o acorde misterioso. Que sensação ele passa?</p>

      {!round ? (
        <button onClick={next} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-5 text-xl font-extrabold text-primary-foreground">
          <Play className="h-7 w-7" /> Começar
        </button>
      ) : (
        <>
          <button onClick={() => play(round)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-4 text-lg font-bold">
            <RotateCcw className="h-5 w-5" /> Ouvir de novo
          </button>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {OPTIONS.map((fn) => {
              const right = answer && fn === chord!.fn;
              const wrong = answer === fn && fn !== chord!.fn;
              return (
                <button key={fn} onClick={() => choose(fn)} disabled={!!answer}
                  className={cn("rounded-2xl py-5 font-display text-xl font-extrabold text-fn-foreground transition-opacity sm:text-2xl", FN_CLASSES[fn].bg, answer && !right && !wrong && "opacity-30", right && "ring-4 ring-foreground", wrong && "line-through opacity-60")}>
                  {FN_INFO[fn].feel}
                </button>
              );
            })}
          </div>
          {answer && chord && (
            <div className="mt-4 rounded-2xl bg-muted p-4" role="status">
              <p className="text-xl font-extrabold">{answer === chord.fn ? "Acertou! 🎉" : "Quase!"}</p>
              <p className="mt-1 text-base font-medium">
                Tom de {round.key}: o acorde era <span className={cn("font-extrabold", FN_CLASSES[chord.fn].text)}>{chord.name} ({chord.roman})</span> — {FN_INFO[chord.fn].feel} ({FN_INFO[chord.fn].label}).
              </p>
              <button onClick={next} className="mt-3 w-full rounded-2xl bg-primary py-4 text-lg font-extrabold text-primary-foreground">Próximo acorde</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
