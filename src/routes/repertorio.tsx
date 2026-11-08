import { useEffect, useState, type KeyboardEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, ClipboardCopy, MonitorPlay, Plus, Save, Share2, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { chordsForScale, keyIndex, type Key } from "@/lib/harmony";
import { SEVEN_NOTE_SCALES, scaleById } from "@/lib/scales";
import { loadPrefs, savePrefs } from "@/lib/prefs";
import { PART_TYPES, loadSongs, parseBackup, saveSongs, shareText, resolveChord, backupCorruptedSongs, type Section, type Song } from "@/lib/setlist";
import { cn } from "@/lib/utils";
import { FN_CLASSES } from "@/components/harmony/fn-styles";
import { KeyPicker, ScalePicker } from "@/components/pickers";
import { CifraImport, CifraSearch } from "@/components/CifraImport";
import { SectionChords } from "@/components/SectionChords";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/repertorio")({
  head: () => ({
    meta: [
      { title: "Repertório do Show — Harmonia Fácil" },
      { name: "description", content: "Monte a ordem das músicas do seu show com tom, escala, andamento, partes e anotações." },
      { property: "og:title", content: "Repertório do Show — Harmonia Fácil" },
      { property: "og:description", content: "Organize o setlist do show: ordem, tom, BPM e partes de cada música." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Repertorio,
});

function moveItem<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const n = [...arr];
  const first = n[i];
  const second = n[j];
  if (first === undefined || second === undefined) return arr;
  n[i] = second;
  n[j] = first;
  return n;
}

const onActivate = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.target !== e.currentTarget) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
};

function Repertorio() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [corrupted, setCorrupted] = useState(false);
  const [backedUp, setBackedUp] = useState(false);
  const [canSave, setCanSave] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [key, setKey] = useState<Key>("C");
  const [scale, setScale] = useState("jonio");
  const [bpm, setBpm] = useState("");
  const [notes, setNotes] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreText, setRestoreText] = useState("");
  const formChords = chordsForScale(keyIndex(key), scale);

  useEffect(() => {
    const r = loadSongs();
    setSongs(r.songs);
    setCorrupted(r.corrupted);
    if (r.corrupted) {
      const copied = backupCorruptedSongs();
      setBackedUp(copied);
      setCanSave(copied);
      if (!copied) toast.error("Não foi possível guardar uma cópia. O original não foi sobrescrito.");
    }
    const p = loadPrefs();
    setKey(p.key);
    if (SEVEN_NOTE_SCALES.some((s) => s.id === p.scale)) setScale(p.scale);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded && canSave && !saveSongs(songs)) toast.error("Não foi possível salvar neste aparelho.");
  }, [songs, loaded, canSave]);

  const resetForm = () => {
    setEditing(null);
    setSections([]);
    setActive(null);
    setTitle("");
    setBpm("");
    setNotes("");
  };
  const startEdit = (s: Song) => {
    setEditing(s.id);
    setTitle(s.title);
    setKey(s.key);
    setScale(s.scale);
    setBpm(s.bpm);
    setNotes(s.notes);
    setSections(s.sections);
    setActive(s.sections[0]?.id ?? null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addPart = (type: string) => {
    const id = crypto.randomUUID();
    setSections((s) => [...s, { id, type, prog: [] }]);
    setActive(id);
  };
  const updatePart = (id: string, fn: (s: Section) => Section) => setSections((all) => all.map((x) => (x.id === id ? fn(x) : x)));
  const addChord = (degree: number) => active && updatePart(active, (s) => ({ ...s, prog: [...s.prog, degree], marks: undefined, same: undefined }));

  const submit = () => {
    if (!title.trim()) return;
    const data = { title: title.trim(), key, scale, bpm, notes, sections };
    if (editing) setSongs((all) => all.map((x) => (x.id === editing ? { ...x, ...data } : x)));
    else setSongs((s) => [...s, { id: crypto.randomUUID(), ...data }]);
    toast.success(editing ? "Música atualizada" : "Música adicionada");
    resetForm();
  };
  const patchSong = (id: string, p: Partial<Song>) => setSongs((s) => s.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const share = async () => {
    const text = shareText(songs);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Repertório do show", text });
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Repertório copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };
  const copyBackup = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(songs));
      toast.success("Backup copiado. Guarde esse texto num lugar seguro.");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };
  const restore = () => {
    const r = parseBackup(restoreText);
    if (!r) {
      toast.error("Backup inválido. Nada foi alterado.");
      return;
    }
    setSongs(r);
    setCorrupted(false);
    setRestoreOpen(false);
    setRestoreText("");
    toast.success(`${r.length} músicas restauradas`);
  };

  const input = "w-full rounded-2xl border border-border bg-background px-4 py-3 text-lg font-semibold";
  const activeSection = sections.find((s) => s.id === active);
  const tool = "flex items-center justify-center gap-2 rounded-2xl bg-secondary px-3 py-3 text-base font-bold disabled:opacity-40";

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-base font-bold">
        <ArrowLeft className="h-5 w-5" /> Mapa
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Repertório do Show</h1>
      <p className="text-base font-medium text-muted-foreground">Monte a ordem das músicas. Fica salvo neste aparelho.</p>

      <CifraSearch />
      {corrupted && (
        <div role="alert" className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-dominant bg-dominant/15 p-4">
          <p className="flex-1 text-base font-bold">Alguns dados estavam corrompidos{backedUp ? ". Guardei uma cópia do original." : ". O original foi preservado."}</p>
          <button onClick={() => { if (!backedUp && !backupCorruptedSongs()) { toast.error("Não foi possível guardar uma cópia do original."); return; } saveSongs(songs); setCanSave(true); setCorrupted(false); }} className="rounded-xl bg-dominant px-4 py-2 font-extrabold text-fn-foreground">Limpar</button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Link to="/palco" className={cn(tool, "col-span-2 bg-primary text-primary-foreground sm:col-span-1", !songs.length && "pointer-events-none opacity-40")}>
          <MonitorPlay className="h-5 w-5" /> Modo palco
        </Link>
        <CifraImport onImport={(song) => setSongs((all) => [...all, song])} />
        <button onClick={share} disabled={!songs.length} className={tool}><Share2 className="h-5 w-5" /> Compartilhar</button>
        <button onClick={copyBackup} disabled={!songs.length} className={tool}><ClipboardCopy className="h-5 w-5" /> Copiar backup</button>
        <button onClick={() => setRestoreOpen((o) => !o)} className={tool}><Upload className="h-5 w-5" /> Restaurar</button>
      </div>
      {restoreOpen && (
        <div className="mt-3 space-y-2 rounded-2xl border border-border bg-card p-4">
          <textarea className={cn(input, "min-h-32 font-mono text-sm")} placeholder="Cole aqui o texto do backup" value={restoreText} onChange={(e) => setRestoreText(e.target.value)} />
          <p className="text-sm font-medium text-muted-foreground">Isso substitui o repertório atual.</p>
          <button onClick={restore} disabled={!restoreText.trim()} className="w-full rounded-2xl bg-primary py-3 text-lg font-extrabold text-primary-foreground disabled:opacity-40">Restaurar backup</button>
        </div>
      )}

      <section className="mt-6 space-y-3 rounded-3xl border border-border bg-card p-5">
        {editing && <p className="rounded-xl bg-primary/15 px-3 py-2 text-base font-extrabold text-primary">Editando música</p>}
        <input className={input} placeholder="Nome da música" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <KeyPicker variant="select" value={key} onChange={(k) => { setKey(k); savePrefs({ key: k }); }} className={input} />
          <input className={input} inputMode="numeric" placeholder="BPM" value={bpm} onChange={(e) => setBpm(e.target.value.replace(/\D/g, ""))} />
        </div>
        <ScalePicker value={scale} onChange={(id) => { setScale(id); savePrefs({ scale: id }); }} scales={SEVEN_NOTE_SCALES} />
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
              <div key={sec.id} role="button" tabIndex={0} aria-pressed={active === sec.id} aria-label={`Selecionar parte ${sec.type}`}
                onClick={() => setActive(sec.id)} onKeyDown={onActivate(() => setActive(sec.id))}
                className={cn("cursor-pointer rounded-2xl border-2 bg-muted p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active === sec.id ? "border-primary" : "border-transparent")}>
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
                  {sec.prog.map((d, j) => {
                    const chord = resolveChord({ key, scale }, d);
                    return <Button key={j} variant="ghost" type="button" onClick={(e) => { e.stopPropagation(); updatePart(sec.id, (s) => ({ ...s, prog: s.prog.filter((_, k) => k !== j), marks: undefined, same: undefined })); }} aria-label={`Remover acorde ${chord.name}`} className={cn("h-auto rounded-xl border-2 bg-card px-3 py-1 font-display text-2xl font-extrabold", chord.fn ? FN_CLASSES[chord.fn].border : "border-border", chord.fn ? FN_CLASSES[chord.fn].text : "text-muted-foreground")}>
                      {chord.name}
                    </Button>;
                  })}
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

        <div className="flex gap-2">
          <button onClick={submit} disabled={!title.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-extrabold text-primary-foreground disabled:opacity-40">
            {editing ? <><Save className="h-6 w-6" /> Salvar alterações</> : <><Plus className="h-6 w-6" /> Adicionar música</>}
          </button>
          {editing && <button onClick={resetForm} className="rounded-2xl bg-secondary px-5 text-lg font-bold">Cancelar</button>}
        </div>
      </section>

      <ol className="mt-6 space-y-3">
        {songs.length === 0 && <li className="rounded-2xl bg-muted p-5 text-lg font-semibold text-muted-foreground">Nenhuma música ainda.</li>}
        {songs.map((s, i) => {
          const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();
          return (
            <li key={s.id} role="button" tabIndex={0} aria-label={`Editar ${s.title}`} onClick={() => startEdit(s)} onKeyDown={onActivate(() => startEdit(s))}
              className={cn("flex cursor-pointer items-start gap-3 rounded-3xl border-2 bg-card p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", editing === s.id ? "border-primary" : "border-border")}>
              <span className="font-display text-4xl font-extrabold text-muted-foreground">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-2xl font-extrabold">{s.title}</p>
                <p className="text-lg font-bold text-muted-foreground">{scaleById(s.scale)?.name}{s.bpm && ` · ${s.bpm} BPM`}</p>
                {s.sections.map((sec) => (
                  <div key={sec.id} className="mt-2">
                    <p className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">{sec.type}</p>
                    <SectionChords song={s} section={sec} />
                  </div>
                ))}
                {s.notes && <p className="mt-1 text-base font-medium text-muted-foreground">{s.notes}</p>}
              </div>
              <div onClick={stop} onKeyDown={stop}>
                <KeyPicker variant="select" value={s.key} onChange={(k) => patchSong(s.id, { key: k })} className="self-start rounded-xl bg-primary px-2 py-2 font-display text-2xl font-extrabold text-primary-foreground" />
              </div>
              <div className="flex flex-col gap-1" onClick={stop} onKeyDown={stop}>
                <button onClick={() => setSongs((x) => moveItem(x, i, -1))} disabled={i === 0} className="rounded-xl bg-secondary p-2 disabled:opacity-30" aria-label="Subir"><ArrowUp className="h-6 w-6" /></button>
                <button onClick={() => setSongs((x) => moveItem(x, i, 1))} disabled={i === songs.length - 1} className="rounded-xl bg-secondary p-2 disabled:opacity-30" aria-label="Descer"><ArrowDown className="h-6 w-6" /></button>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setSongs((x) => x.filter((y) => y.id !== s.id)); if (editing === s.id) resetForm(); }} className="rounded-xl bg-secondary p-2" aria-label="Remover"><Trash2 className="h-6 w-6" /></button>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
