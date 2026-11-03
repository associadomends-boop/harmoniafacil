import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { KEYS, NEXT, chordMidi, chordsForKey, type Chord, type Key } from "@/lib/harmony";
import { playChord } from "@/lib/audio";
import { HarmonyMap } from "@/components/harmony/HarmonyMap";
import { ChordDetail } from "@/components/harmony/ChordDetail";
import { ProgressionBuilder } from "@/components/harmony/ProgressionBuilder";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Harmonia Fácil — Mapa das funções harmônicas" },
      { name: "description", content: "Aprenda a ouvir, identificar e antecipar os acordes. Tire músicas de ouvido com mais facilidade." },
      { property: "og:title", content: "Harmonia Fácil" },
      { property: "og:description", content: "O GPS da harmonia: descubra a função de cada acorde e os próximos caminhos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [key, setKey] = useState<Key>("C");
  const [deg, setDeg] = useState<number | null>(null);
  const chords = useMemo(() => chordsForKey(key), [key]);
  const selected = deg === null ? null : chords[deg]!;
  const next = deg === null ? [] : NEXT[deg]!;

  const select = (c: Chord) => {
    setDeg(c.degree);
    playChord(chordMidi(c));
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
            HARMONIA <span className="text-tonic">FÁCIL</span>
          </h1>
          <p className="text-sm text-muted-foreground">Tire músicas de ouvido com mais facilidade.</p>
        </div>
        <Link to="/aprender" className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-sm font-semibold">
          <GraduationCap className="h-4 w-4" /> Aprender
        </Link>
      </header>

      <div className="mt-6">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">Tonalidade</p>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
          {KEYS.map((k) => (
            <button
              key={k}
              onClick={() => setKey(k)}
              className={cn("rounded-xl py-3 font-display text-xl font-extrabold transition-colors sm:text-2xl", k === key ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent")}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Mapa das funções · {key} maior</h2>
          <HarmonyMap chords={chords} selected={selected} nextDegrees={next.map((n) => n.degree)} mainDegree={next.find((n) => n.main)?.degree} onSelect={select} />
        </section>
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <ChordDetail chord={selected} chords={chords} onSelect={select} />
          <ProgressionBuilder chords={chords} />
        </div>
      </div>
    </main>
  );
}
