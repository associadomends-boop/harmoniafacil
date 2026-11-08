import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { type Key } from "@/lib/harmony";
import { scaleById } from "@/lib/scales";
import { loadSongs, saveSongs, backupCorruptedSongs, type Song } from "@/lib/setlist";
import { SectionChords } from "@/components/SectionChords";
import { KeyPicker } from "@/components/pickers";

export const Route = createFileRoute("/palco")({
  head: () => ({
    meta: [
      { title: "Modo palco — Harmonia Fácil" },
      { name: "description", content: "Uma música por vez, com acordes enormes para ler de longe durante o show." },
      { property: "og:title", content: "Modo palco — Harmonia Fácil" },
      { property: "og:description", content: "Leia os acordes do repertório de longe, música por música." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Palco,
});

function Palco() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    const result = loadSongs();
    if (result.corrupted) backupCorruptedSongs();
    setSongs(result.songs);
    setLoaded(true);
  }, []);

  // Keep the screen on while on stage; silently skip when unsupported.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const request = async () => {
      try {
        const wl = (navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } }).wakeLock;
        if (wl && document.visibilityState === "visible") lock = await wl.request("screen");
      } catch {
        lock = null;
      }
    };
    void request();
    document.addEventListener("visibilitychange", request);
    return () => {
      document.removeEventListener("visibilitychange", request);
      lock?.release().catch(() => {});
    };
  }, []);

  const song = songs[i];
  const setKey = (k: Key) => {
    const next = songs.map((s, j) => (j === i ? { ...s, key: k } : s));
    setSongs(next);
    const stored = loadSongs();
    if (!stored.corrupted || backupCorruptedSongs()) saveSongs(next);
  };
  const go = (d: number) => setI((x) => Math.min(Math.max(x + d, 0), songs.length - 1));

  return (
    <main className="dark fixed inset-0 flex flex-col overflow-hidden bg-background text-foreground">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link to="/repertorio" className="flex items-center gap-1 rounded-2xl bg-secondary px-4 py-3 text-lg font-extrabold" aria-label="Sair do modo palco">
          <X className="h-6 w-6" /> Sair
        </Link>
        {song && <span className="text-lg font-bold text-muted-foreground">{i + 1}/{songs.length}</span>}
        {song && <KeyPicker variant="select" value={song.key} onChange={setKey} className="ml-auto rounded-xl bg-primary px-3 py-2 font-display text-3xl font-extrabold text-primary-foreground" />}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {!loaded ? null : !song ? (
          <p className="text-2xl font-bold text-muted-foreground">Nenhuma música no repertório.</p>
        ) : (
          <SongView song={song} />
        )}
      </div>

      {song && (
        <nav className="grid grid-cols-2 gap-3 border-t border-border p-3">
          <button onClick={() => go(-1)} disabled={i === 0} className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-6 text-2xl font-extrabold disabled:opacity-30">
            <ChevronLeft className="h-8 w-8" /> Anterior
          </button>
          <button onClick={() => go(1)} disabled={i === songs.length - 1} className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-6 text-2xl font-extrabold text-primary-foreground disabled:opacity-30">
            Próxima <ChevronRight className="h-8 w-8" />
          </button>
        </nav>
      )}
    </main>
  );
}

function SongView({ song }: { song: Song }) {
  return (
    <>
      <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">{song.title}</h1>
      <p className="mt-1 text-2xl font-bold text-muted-foreground">
        Tom {song.key} · {scaleById(song.scale)?.name}{song.bpm && ` · ${song.bpm} BPM`}
      </p>
      {song.notes && <p className="mt-1 text-xl font-medium text-muted-foreground">{song.notes}</p>}
      <div className="mt-5 space-y-5">
        {song.sections.map((sec) => (
          <section key={sec.id}>
            <p className="text-lg font-extrabold uppercase tracking-widest text-muted-foreground">{sec.type}</p>
            <SectionChords key={`${song.id}-${sec.id}`} song={song} section={sec} stage />
          </section>
        ))}
      </div>
    </>
  );
}
