import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { GraduationCap, ListMusic, Piano } from "lucide-react";
import { cn } from "@/lib/utils";
import { NEXT, chordMidi, chordsForScale, keyIndex, type Chord, type Key } from "@/lib/harmony";
import { SEVEN_NOTE_SCALES, scaleById, spell } from "@/lib/scales";
import { loadPrefs, savePrefs } from "@/lib/prefs";
import { KeyPicker, ScalePicker } from "@/components/pickers";
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
  const [scaleId, setScaleId] = useState("jonio");
  useEffect(() => {
    const p = loadPrefs();
    setKey(p.key);
    if (SEVEN_NOTE_SCALES.some((s) => s.id === p.scale)) setScaleId(p.scale);
  }, []);
  const changeKey = (k: Key) => { setKey(k); savePrefs({ key: k }); };
  const changeScale = (id: string) => { setScaleId(id); savePrefs({ scale: id }); };
  const scale = scaleById(scaleId)!;
  const chords = useMemo(() => chordsForScale(keyIndex(key), scaleId), [key, scaleId]);
  const rootName = spell(keyIndex(key), scale).root;
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
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to="/repertorio" className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-sm font-semibold">
            <ListMusic className="h-4 w-4" /> Repertório
          </Link>
          <Link to="/escalas" className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-sm font-semibold">
            <Piano className="h-4 w-4" /> Escalas
          </Link>
          <Link to="/aprender" className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-sm font-semibold">
            <GraduationCap className="h-4 w-4" /> Aprender
          </Link>
        </div>
      </header>

      <div className="mt-6">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">Tonalidade</p>
        <KeyPicker value={key} onChange={changeKey} />
        <p className="mb-2 mt-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">Escala</p>
        <ScalePicker value={scaleId} onChange={changeScale} scales={SEVEN_NOTE_SCALES} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Mapa das funções · {rootName} {scale.name}</h2>
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
