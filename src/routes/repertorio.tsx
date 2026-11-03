import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2 } from "lucide-react";
import { KEYS, type Key } from "@/lib/harmony";

export const Route = createFileRoute("/repertorio")({
  head: () => ({
    meta: [
      { title: "Repertório do Show — Harmonia Fácil" },
      { name: "description", content: "Monte a ordem das músicas do seu show com tom, andamento e anotações." },
      { property: "og:title", content: "Repertório do Show — Harmonia Fácil" },
      { property: "og:description", content: "Organize o setlist do show: ordem, tom e BPM de cada música." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Repertorio,
});

interface Song {
  id: string;
  title: string;
  key: Key;
  bpm: string;
  notes: string;
}

const STORAGE = "harmonia-setlist";

function Repertorio() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [key, setKey] = useState<Key>("C");
  const [bpm, setBpm] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      setSongs(JSON.parse(localStorage.getItem(STORAGE) || "[]"));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE, JSON.stringify(songs));
  }, [songs, loaded]);

  const add = () => {
    if (!title.trim()) return;
    setSongs((s) => [...s, { id: crypto.randomUUID(), title: title.trim(), key, bpm, notes }]);
    setTitle("");
    setBpm("");
    setNotes("");
  };
  const move = (i: number, d: number) =>
    setSongs((s) => {
      const j = i + d;
      if (j < 0 || j >= s.length) return s;
      const n = [...s];
      [n[i], n[j]] = [n[j]!, n[i]!];
      return n;
    });

  const input = "w-full rounded-2xl border border-border bg-background px-4 py-3 text-lg font-semibold";

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-base font-bold">
        <ArrowLeft className="h-5 w-5" /> Mapa
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Repertório do Show</h1>
      <p className="text-base font-medium text-muted-foreground">Monte a ordem das músicas. Fica salvo neste aparelho.</p>

      <section className="mt-6 space-y-3 rounded-3xl border border-border bg-card p-5">
        <input className={input} placeholder="Nome da música" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <div className="grid grid-cols-2 gap-3">
          <select className={input} value={key} onChange={(e) => setKey(e.target.value as Key)} aria-label="Tom">
            {KEYS.map((k) => (
              <option key={k} value={k}>Tom: {k}</option>
            ))}
          </select>
          <input className={input} inputMode="numeric" placeholder="BPM" value={bpm} onChange={(e) => setBpm(e.target.value.replace(/\D/g, ""))} />
        </div>
        <input className={input} placeholder="Anotações (capo, intro, quem começa…)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button onClick={add} disabled={!title.trim()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-extrabold text-primary-foreground disabled:opacity-40">
          <Plus className="h-6 w-6" /> Adicionar música
        </button>
      </section>

      <ol className="mt-6 space-y-3">
        {songs.length === 0 && <li className="rounded-2xl bg-muted p-5 text-lg font-semibold text-muted-foreground">Nenhuma música ainda.</li>}
        {songs.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4">
            <span className="font-display text-4xl font-extrabold text-muted-foreground">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-2xl font-extrabold">{s.title}</p>
              <p className="text-lg font-bold">
                <span className="text-tonic">Tom {s.key}</span>
                {s.bpm && <span className="text-muted-foreground"> · {s.bpm} BPM</span>}
              </p>
              {s.notes && <p className="text-base font-medium text-muted-foreground">{s.notes}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded-xl bg-secondary p-2 disabled:opacity-30" aria-label="Subir"><ArrowUp className="h-6 w-6" /></button>
              <button onClick={() => move(i, 1)} disabled={i === songs.length - 1} className="rounded-xl bg-secondary p-2 disabled:opacity-30" aria-label="Descer"><ArrowDown className="h-6 w-6" /></button>
            </div>
            <button onClick={() => setSongs((x) => x.filter((y) => y.id !== s.id))} className="rounded-xl bg-secondary p-2" aria-label="Remover"><Trash2 className="h-6 w-6" /></button>
          </li>
        ))}
      </ol>
    </main>
  );
}
