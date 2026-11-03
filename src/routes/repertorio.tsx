import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { KEYS, chordsForKey, type Key } from "@/lib/harmony";
import { cn } from "@/lib/utils";
import { FN_CLASSES } from "@/components/harmony/fn-styles";

export const Route = createFileRoute("/repertorio")({
  head: () => ({
    meta: [
      { title: "Repertório do Show — Harmonia Fácil" },
      { name: "description", content: "Monte a ordem das músicas do seu show com tom, andamento, partes e anotações." },
      { property: "og:title", content: "Repertório do Show — Harmonia Fácil" },
      { property: "og:description", content: "Organize o setlist do show: ordem, tom, BPM e partes de cada música." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Repertorio,
});

const PART_TYPES = ["Intro", "Verso", "Pré-Refrão", "Refrão", "Ponte", "Solo", "Final"] as const;

interface Section {
  id: string;
  type: string;
  /** Scale degrees (0-6); chord names derive from the key, so changing key transposes. */
  prog: number[];
}

interface Song {
  id: string;
  title: string;
  key: Key;
  bpm: string;
  notes: string;
  sections?: Section[];
  /** Legacy single sequence (older saves). */
  prog?: number[];
}

const STORAGE = "harmonia-setlist";

function songSections(s: Song): Section[] {
  if (s.sections) return s.sections;
  return s.prog?.length ? [{ id: "legacy", type: "Música", prog: s.prog }] : [];
}

function moveItem<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const n = [...arr];
  [n[i], n[j]] = [n[j]!, n[i]!];
  return n;
}

function Repertorio() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [key, setKey] = useState<Key>("C");
  const [bpm, setBpm] = useState("");
  const [notes, setNotes] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const formChords = chordsForKey(key);

  useEffect(() => {
    try {
      setSongs(JSON.parse(localStorage.getItem(STORAGE) || "[]"));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE, JSON.stringify(songs));
  }, [songs, loaded]);

  const addPart = (type: string) => {
    const id = crypto.randomUUID();
    setSections((s) => [...s, { id, type, prog: [] }]);
    setActive(id);
  };
  const updatePart = (id: string, fn: (s: Section) => Section) => setSections((all) => all.map((x) => (x.id === id ? fn(x) : x)));
  const addChord = (degree: number) => {
    if (!active) return;
    updatePart(active, (s) => ({ ...s, prog: [...s.prog, degree] }));
  };

  const add = () => {
    if (!title.trim()) return;
    setSongs((s) => [...s, { id: crypto.randomUUID(), title: title.trim(), key, bpm, notes, sections }]);
    setSections([]);
    setActive(null);
    setTitle("");
    setBpm("");
    setNotes("");
  };
  const setSongKey = (id: string, k: Key) => setSongs((s) => s.map((x) => (x.id === id ? { ...x, key: k } : x)));

  const input = "w-full rounded-2xl border border-border bg-background px-4 py-3 text-lg font-semibold";
  const activeSection = sections.find((s) => s.id === active);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-base font-bold">
        <ArrowLeft className="h-5 w-5" /> Mapa
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Repertório do Show</h1>
      <p className="text-base font-medium text-muted-foreground">Monte a ordem das músicas. Fica salvo neste aparelho.</p>

      <section className="mt-6 space-y-3 rounded-3xl border border-border bg-card p-5">
        <input className={input} placeholder="Nome da música" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <select className={input} value={key} onChange={(e) => setKey(e.target.value as Key)} aria-label="Tom">
            {KEYS.map((k) => (
              <option key={k} value={k}>Tom: {k}</option>
            ))}
          </select>
          <input className={input} inputMode="numeric" placeholder="BPM" value={bpm} onChange={(e) => setBpm(e.target.value.replace(/\D/g, ""))} />
        </div>
        <input className={input} placeholder="Anotações (capo, quem começa…)" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div>
          <p className="mb-2 text-base font-bold text-muted-foreground">1. Adicione as partes da música (quantas quiser)</p>
          <div className="flex flex-wrap gap-2">
            {PART_TYPES.map((t) => (
              <button key={t} type="button" onClick={() => addPart(t)} className="flex items-center gap-1 rounded-2xl bg-secondary px-3 py-2 text-lg font-bold active:scale-95">
                <Plus className="h-5 w-5" /> {t}
              </button>
            ))}
          </div>
        </div>

        {sections.length > 0 && (
          <div className="space-y-2">
            <p className="text-base font-bold text-muted-foreground">2. Toque numa parte para selecioná-la e depois nos acordes</p>
            {sections.map((sec, i) => (
              <div
                key={sec.id}
                onClick={() => setActive(sec.id)}
                className={cn("cursor-pointer rounded-2xl border-2 bg-muted p-3", active === sec.id ? "border-primary" : "border-transparent")}
              >
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-extrabold">{sec.type}</span>
                  {active === sec.id && <span className="rounded-lg bg-primary px-2 py-0.5 text-xs font-extrabold text-primary-foreground">EDITANDO</span>}
                  <div className="ml-auto flex gap-1">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSections((s) => moveItem(s, i, -1)); }} disabled={i === 0} className="rounded-lg bg-secondary p-1.5 disabled:opacity-30" aria-label="Subir parte"><ArrowUp className="h-5 w-5" /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSections((s) => moveItem(s, i, 1)); }} disabled={i === sections.length - 1} className="rounded-lg bg-secondary p-1.5 disabled:opacity-30" aria-label="Descer parte"><ArrowDown className="h-5 w-5" /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSections((s) => s.filter((x) => x.id !== sec.id)); if (active === sec.id) setActive(null); }} className="rounded-lg bg-secondary p-1.5" aria-label="Remover parte"><X className="h-5 w-5" /></button>
                  </div>
                </div>
                <div className="mt-2 flex min-h-10 flex-wrap items-center gap-2">
                  {sec.prog.length === 0 && <span className="text-base font-semibold text-muted-foreground">Nenhum acorde ainda…</span>}
                  {sec.prog.map((d, j) => (
                    <button key={j} type="button" onClick={(e) => { e.stopPropagation(); updatePart(sec.id, (s) => ({ ...s, prog: s.prog.filter((_, k) => k !== j) })); }} aria-label="Remover acorde" className={cn("rounded-xl border-2 bg-card px-3 py-1 font-display text-2xl font-extrabold", FN_CLASSES[formChords[d]!.fn].border, FN_CLASSES[formChords[d]!.fn].text)}>
                      {formChords[d]!.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {formChords.map((ch) => (
                <button key={ch.degree} type="button" disabled={!activeSection} onClick={() => addChord(ch.degree)} className={cn("rounded-2xl py-3 text-fn-foreground active:scale-95 disabled:opacity-40", FN_CLASSES[ch.fn].bg)}>
                  <span className="block font-display text-2xl font-extrabold leading-none">{ch.name}</span>
                  <span className="mt-1 block text-xs font-bold">{ch.roman}</span>
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {activeSection ? `Adicionando em: ${activeSection.type}. Toque num acorde da parte para removê-lo.` : "Selecione uma parte para adicionar acordes."}
            </p>
          </div>
        )}

        <button onClick={add} disabled={!title.trim()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-extrabold text-primary-foreground disabled:opacity-40">
          <Plus className="h-6 w-6" /> Adicionar música
        </button>
      </section>

      <ol className="mt-6 space-y-3">
        {songs.length === 0 && <li className="rounded-2xl bg-muted p-5 text-lg font-semibold text-muted-foreground">Nenhuma música ainda.</li>}
        {songs.map((s, i) => {
          const chords = chordsForKey(s.key);
          return (
            <li key={s.id} className="flex items-start gap-3 rounded-3xl border border-border bg-card p-4">
              <span className="font-display text-4xl font-extrabold text-muted-foreground">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-2xl font-extrabold">{s.title}</p>
                {s.bpm && <p className="text-lg font-bold text-muted-foreground">{s.bpm} BPM</p>}
                {songSections(s).map((sec) => (
                  <div key={sec.id} className="mt-2">
                    <p className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">{sec.type}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      {sec.prog.map((d, j) => {
                        const ch = chords[d]!;
                        return <span key={j} className={cn("font-display text-3xl font-extrabold", FN_CLASSES[ch.fn].text)}>{ch.name}</span>;
                      })}
                    </div>
                  </div>
                ))}
                {s.notes && <p className="mt-1 text-base font-medium text-muted-foreground">{s.notes}</p>}
              </div>
              <select value={s.key} onChange={(e) => setSongKey(s.id, e.target.value as Key)} aria-label="Mudar tom" className="self-start rounded-xl bg-primary px-2 py-2 font-display text-2xl font-extrabold text-primary-foreground">
                {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <div className="flex flex-col gap-1">
                <button onClick={() => setSongs((x) => moveItem(x, i, -1))} disabled={i === 0} className="rounded-xl bg-secondary p-2 disabled:opacity-30" aria-label="Subir"><ArrowUp className="h-6 w-6" /></button>
                <button onClick={() => setSongs((x) => moveItem(x, i, 1))} disabled={i === songs.length - 1} className="rounded-xl bg-secondary p-2 disabled:opacity-30" aria-label="Descer"><ArrowDown className="h-6 w-6" /></button>
              </div>
              <button onClick={() => setSongs((x) => x.filter((y) => y.id !== s.id))} className="rounded-xl bg-secondary p-2" aria-label="Remover"><Trash2 className="h-6 w-6" /></button>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
