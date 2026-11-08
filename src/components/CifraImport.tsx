import { useMemo, useState } from "react";
import { ClipboardPaste, Search, Check, X } from "lucide-react";
import { toast } from "sonner";
import { buildSong, detectKey, parseCifra, runCue, type Block, type Section as ParsedSection } from "@/lib/cifra-import";
import { importedSong } from "@/lib/cifra-song";
import { KEYS, keyIndex, type Key } from "@/lib/harmony";
import { SEVEN_NOTE_SCALES } from "@/lib/scales";
import { parseBackup, type Song } from "@/lib/setlist";
import { KeyPicker, ScalePicker } from "@/components/pickers";
import { SectionChords } from "@/components/SectionChords";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const field = "w-full min-w-0 rounded-xl border border-border bg-background px-3 py-3 text-lg font-semibold";
const action = "h-auto min-h-12 whitespace-normal py-3 text-base font-bold";

export function CifraSearch() {
  const [query, setQuery] = useState("");
  return <div className="mt-4 space-y-2">
    <div className="flex gap-2">
      <input aria-label="Buscar música" placeholder="Buscar música" value={query} onChange={(e) => setQuery(e.target.value)} className={field} />
      <Button asChild variant="secondary" className={action}>
        <a href={`https://www.google.com/search?q=${encodeURIComponent(`cifra ${query.trim()}`)}`} target="_blank" rel="noopener noreferrer"><Search /> Buscar cifra</a>
      </Button>
    </div>
    <p className="text-sm text-muted-foreground">Copie a cifra no site, volte aqui e toque em Colar cifra.</p>
  </div>;
}

export function CifraImport({ onImport }: { onImport: (song: Song) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState<ParsedSection[] | null>(null);
  const [key, setKey] = useState<Key>("C");
  const [scale, setScale] = useState("jonio");
  const [simple, setSimple] = useState(true);
  const [labels, setLabels] = useState<Record<number, string>>({});
  const [excluded, setExcluded] = useState<number[]>([]);
  const blocks: Block[] = useMemo(() => {
    if (!source) return [];
    if (simple) return buildSong(source);
    return source.map((s, i) => {
      const run = { loop: s.chords, reps: 1 };
      return { label: s.label || `Parte ${i + 1}`, runs: [run], cues: [runCue(run)], same: false };
    });
  }, [source, simple]);
  const preview = useMemo(() => importedSong(title, key, scale, blocks), [title, key, scale, blocks]);
  const close = () => { setOpen(false); setText(""); setTitle(""); setSource(null); setLabels({}); setExcluded([]); setSimple(true); };
  const paste = async () => {
    try {
      const pasted = await navigator.clipboard.readText();
      if (pasted.length > 50000) { toast.error("A cifra deve ter no máximo 50.000 caracteres."); return; }
      setText(pasted);
    } catch { toast.error("Não foi possível acessar a área de transferência. Cole manualmente no campo."); }
  };
  const analyze = () => {
    if (text.length > 50000) { toast.error("A cifra deve ter no máximo 50.000 caracteres."); return; }
    const parsed = parseCifra(text);
    const all = parsed.sections.flatMap((s) => s.chords);
    if (!all.length) { toast.error("Não encontrei acordes. Cole a cifra com os acordes sobre a letra."); return; }
    const detected = detectKey(all, parsed.hint);
    setKey(KEYS.find((k) => keyIndex(k) === detected.root) ?? "C");
    setScale(detected.minor ? "menor-natural" : "jonio");
    setSource(parsed.sections);
    setText("");
  };
  const submit = () => {
    const selected = blocks.map((b, i) => ({ ...b, label: labels[i] ?? b.label })).filter((_, i) => !excluded.includes(i));
    // A removed predecessor must not cause a newly adjacent, different block to collapse.
    selected.forEach((b, i) => {
      const signature = (block: Block) => block.runs.map((r) => r.loop.map((c) => c.sig).join(" ")).join(" | ");
      const prev = selected[i - 1];
      b.same = simple && !!prev && signature(b) === signature(prev);
    });
    const song = importedSong(title, key, scale, selected);
    if (!parseBackup(JSON.stringify([song]))) { toast.error("Há acordes inválidos nesta cifra. Confira o texto e tente novamente."); return; }
    onImport(song); toast.success("Música importada"); close();
  };
  return <Dialog open={open} onOpenChange={(value) => value ? setOpen(true) : close()}>
    <DialogTrigger asChild><Button variant="secondary" className={`${action} rounded-2xl`}><ClipboardPaste /> Colar cifra</Button></DialogTrigger>
    <DialogContent aria-describedby={undefined} className="max-h-[90dvh] w-[calc(100%-1rem)] max-w-2xl overflow-y-auto p-4 sm:p-6 [&>button:last-child]:hidden">
      <div className="flex items-center justify-between gap-3"><DialogTitle className="text-2xl font-extrabold">Colar cifra</DialogTitle><Button variant="ghost" size="icon" aria-label="Fechar" onClick={close}><X /></Button></div>
      {!source ? <>
        <textarea aria-label="Texto da cifra" placeholder="Cole a cifra com os acordes sobre a letra" maxLength={50000} className={`${field} min-h-64 font-mono text-base`} value={text} onChange={(e) => setText(e.target.value)} />
        <Button variant="secondary" className={action} onClick={paste}><ClipboardPaste /> Colar da área de transferência</Button>
        <input aria-label="Título" placeholder="Título" className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button className={action} onClick={analyze} disabled={!text.trim()}><Search /> Analisar</Button>
        <Button variant="secondary" className={action} onClick={close}><X /> Cancelar</Button>
      </> : <>
        <input aria-label="Título" placeholder="Título" className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-[5rem_1fr] gap-2"><KeyPicker variant="select" value={key} onChange={setKey} className={field} /><ScalePicker value={scale} onChange={setScale} scales={SEVEN_NOTE_SCALES} /></div>
        <label className="flex min-h-12 items-center gap-3 text-lg font-bold"><input type="checkbox" className="h-5 w-5 accent-primary" checked={simple} onChange={(e) => { setSimple(e.target.checked); setExcluded([]); setLabels({}); }} />Simplificar repetições</label>
        <div className="space-y-4">
          {preview.sections.map((section, i) => <div key={`${simple}-${i}`} className="border-b border-border pb-3">
            <div className="mb-2 flex items-center gap-3"><input type="checkbox" aria-label={`Importar ${section.type}`} className="h-5 w-5 shrink-0 accent-primary" checked={!excluded.includes(i)} onChange={(e) => setExcluded((v) => e.target.checked ? v.filter((n) => n !== i) : [...v, i])} /><input aria-label={`Nome da parte ${i + 1}`} className={field} value={labels[i] ?? section.type} onChange={(e) => setLabels((v) => ({ ...v, [i]: e.target.value }))} /></div>
            <SectionChords song={preview} section={section} />
          </div>)}
        </div>
        <div className="grid grid-cols-2 gap-2"><Button variant="secondary" className={action} onClick={close}><X /> Cancelar</Button><Button className={action} onClick={submit} disabled={!title.trim() || excluded.length === blocks.length}><Check /> Importar</Button></div>
      </>}
    </DialogContent>
  </Dialog>;
}