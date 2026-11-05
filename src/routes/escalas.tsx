import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Guitar, Piano } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, ROOTS, SCALES, intervalLabel, intervals, spell, steps, type ScaleDef } from "@/lib/scales";

export const Route = createFileRoute("/escalas")({
  head: () => ({
    meta: [
      { title: "Escalas — Harmonia Fácil" },
      { name: "description", content: "Compare duas escalas (modos gregos, menores, pentatônicas, bebop, exóticas) no teclado, guitarra e baixo, em qualquer tom." },
      { property: "og:title", content: "Escalas — Harmonia Fácil" },
      { property: "og:description", content: "Notas, graus, intervalos e diferenças entre escalas, em qualquer tonalidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Escalas,
});

type Instrument = "teclado" | "guitarra" | "baixo";
interface Color { bg: string; text: string; border: string; soft: string }
const COLORS: [Color, Color] = [
  { bg: "bg-tonic", text: "text-tonic", border: "border-tonic", soft: "bg-tonic/30" },
  { bg: "bg-subdominant", text: "text-subdominant", border: "border-subdominant", soft: "bg-subdominant/30" },
];

function Escalas() {
  const [root, setRoot] = useState(0);
  const [ids, setIds] = useState<[string, string]>(["jonio", "eolio"]);
  const [inst, setInst] = useState<Instrument>("teclado");
  const scales = ids.map((id) => SCALES.find((s) => s.id === id)!) as [ScaleDef, ScaleDef];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-base font-bold">
        <ArrowLeft className="h-5 w-5" /> Mapa
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
        <span className="text-tonic">ESCALAS</span> LADO A <span className="text-subdominant">LADO</span>
      </h1>
      <p className="text-sm text-muted-foreground">Escolha o tom, as duas escalas e o instrumento. Tudo se atualiza.</p>

      <div className="mt-6">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">Tonalidade</p>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
          {ROOTS.map((k, i) => (
            <button key={k} onClick={() => setRoot(i)}
              className={cn("rounded-xl py-3 font-display text-xl font-extrabold transition-colors sm:text-2xl", i === root ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent")}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">Instrumento</p>
        <div className="grid grid-cols-3 gap-2">
          {([["teclado", "Teclado", Piano], ["guitarra", "Guitarra", Guitar], ["baixo", "Baixo", Guitar]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setInst(id)}
              className={cn("flex items-center justify-center gap-2 rounded-xl py-3 font-display text-lg font-extrabold sm:text-xl", inst === id ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent")}>
              <Icon className="h-6 w-6" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {scales.map((sc, i) => (
          <ScaleCard key={i} scale={sc} root={root} color={COLORS[i as 0 | 1]} inst={inst}
            onChange={(id) => setIds((p) => (i === 0 ? [id, p[1]] : [p[0], id]))} />
        ))}
      </div>

      <Comparison root={root} a={scales[0]} b={scales[1]} />
    </main>
  );
}

function ScaleCard({ scale, root, color, inst, onChange }: { scale: ScaleDef; root: number; color: Color; inst: Instrument; onChange: (id: string) => void }) {
  const sp = spell(root, scale);
  const ivs = intervals(scale);
  return (
    <section className="min-w-0 rounded-3xl border border-border bg-card p-5">
      <select value={scale.id} onChange={(e) => onChange(e.target.value)}
        className={cn("w-full rounded-xl border-2 bg-secondary px-3 py-3 font-display text-lg font-extrabold", color.border, color.text)}>
        {CATEGORIES.map((c) => (
          <optgroup key={c} label={c}>
            {SCALES.filter((s) => s.category === c).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </optgroup>
        ))}
      </select>
      <h2 className={cn("mt-3 text-2xl font-extrabold", color.text)}>{sp.root} {scale.name}</h2>
      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
        {scale.category} · {scale.formula.length} notas{sp.root !== ROOTS[root] && ` · escrita como ${sp.root}`}
      </p>

      <div className="mt-4 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(scale.formula.length, 8)}, minmax(0,1fr))` }}>
        {sp.notes.map((n, i) => (
          <div key={i} className={cn("rounded-2xl py-3 text-center text-fn-foreground", color.bg)}>
            <span className="block font-display text-2xl font-extrabold leading-none">{n}</span>
            <span className="mt-1 block text-sm font-bold">{scale.formula[i]!.replace("b", "♭").replace("#", "♯")}</span>
          </div>
        ))}
      </div>

      <p className="mb-2 mt-5 text-sm font-bold uppercase tracking-widest text-muted-foreground">Intervalos</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {ivs.map((iv, i) => (
          <span key={i} className={cn("rounded-xl px-3 py-1.5 font-display text-xl font-extrabold", iv === 2 ? "bg-secondary" : cn("border-2", color.border, color.text))}>
            {intervalLabel(iv)}
          </span>
        ))}
      </div>
      <p className="mt-1 text-xs font-medium text-muted-foreground">T = tom · St = semitom · T½ = tom e meio · 2T = dois tons</p>

      <p className="mb-2 mt-5 text-sm font-bold uppercase tracking-widest text-muted-foreground">
        {inst === "teclado" ? "Teclado" : inst === "guitarra" ? "Braço da guitarra" : "Braço do baixo"}
      </p>
      {inst === "teclado" ? <Keyboard root={root} scale={scale} color={color} /> : <Neck root={root} scale={scale} color={color} strings={inst === "guitarra" ? GUITAR : BASS} />}
    </section>
  );
}

function pcMap(root: number, scale: ScaleDef) {
  const sp = spell(root, scale);
  const m = new Map<number, string>();
  steps(scale).forEach((s, i) => m.set((root + s) % 12, sp.notes[i]!));
  return m;
}

const WHITE = [0, 2, 4, 5, 7, 9, 11];
const BLACK = [{ pc: 1, after: 0 }, { pc: 3, after: 1 }, { pc: 6, after: 3 }, { pc: 8, after: 4 }, { pc: 10, after: 5 }];

function Keyboard({ root, scale, color }: { root: number; scale: ScaleDef; color: Color }) {
  const m = pcMap(root, scale);
  const octaves = [0];
  return (
    <div className="relative h-48 w-full select-none overflow-hidden rounded-2xl border-4 border-foreground/80 bg-foreground/80">
      <div className="flex h-full gap-[2px]">
        {octaves.flatMap((o) => WHITE.map((pc) => {
          const n = m.get(pc);
          return (
            <div key={`${o}-${pc}`} className={"relative flex-1 rounded-b-md bg-foreground"}>
              {n && <div className={cn("absolute inset-0 rounded-b-md", color.soft)} />}
              {n && (
                <span className={cn("absolute bottom-2 left-1/2 flex h-9 min-w-9 -translate-x-1/2 items-center justify-center rounded-full px-1 text-base font-extrabold text-fn-foreground", pc === root ? "bg-background text-foreground ring-2 ring-foreground" : color.bg)}>
                  {n}
                </span>
              )}
            </div>
          );
        }))}
      </div>
      {octaves.flatMap((o) => BLACK.map(({ pc, after }) => {
        const n = m.get(pc);
        const left = ((o * 7 + after + 1) / 7) * 100;
        return (
          <div key={`b${o}-${pc}`} className="absolute top-0 h-[58%] w-[9%] -translate-x-1/2 rounded-b-md bg-background" style={{ left: `${left}%` }}>
            {n && (
              <span className={cn("absolute bottom-1 left-1/2 flex h-7 min-w-7 -translate-x-1/2 items-center justify-center rounded-full px-0.5 text-xs font-extrabold text-fn-foreground", pc === root ? "bg-foreground text-background" : color.bg)}>
                {n}
              </span>
            )}
          </div>
        );
      }))}
    </div>
  );
}

const GUITAR = [{ n: "E", pc: 4 }, { n: "A", pc: 9 }, { n: "D", pc: 2 }, { n: "G", pc: 7 }, { n: "B", pc: 11 }, { n: "E", pc: 4 }];
const BASS = [{ n: "E", pc: 4 }, { n: "A", pc: 9 }, { n: "D", pc: 2 }, { n: "G", pc: 7 }];
const FRETS = 12;
const MARKS = [3, 5, 7, 9, 12];

/** Vertical neck: strings are columns (grave → agudo, esquerda → direita), frets go down. */
function Neck({ root, scale, color, strings }: { root: number; scale: ScaleDef; color: Color; strings: { n: string; pc: number }[] }) {
  const m = pcMap(root, scale);
  const cols = `2.5rem repeat(${strings.length}, minmax(0,1fr))`;
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-muted p-3">
      <div className="grid" style={{ gridTemplateColumns: cols }}>
        <span />
        {strings.map((s, i) => <span key={i} className="text-center font-display text-lg font-extrabold text-muted-foreground">{s.n}</span>)}
      </div>
      {Array.from({ length: FRETS + 1 }, (_, f) => (
        <div key={f} className={cn("grid h-12", f === 0 ? "border-b-[6px] border-foreground/70" : "border-b-2 border-foreground/25")} style={{ gridTemplateColumns: cols }}>
          <span className={cn("flex items-center justify-center font-display text-base font-extrabold", MARKS.includes(f) ? "text-foreground" : "text-muted-foreground/60")}>
            {f === 0 ? "0" : f}
          </span>
          {strings.map((s, si) => {
            const pc = (s.pc + f) % 12;
            const n = m.get(pc);
            return (
              <div key={si} className="relative flex items-center justify-center">
                <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-muted-foreground/60" />
                {n && (
                  <span className={cn("relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold",
                    pc === root ? "bg-foreground text-background ring-2 ring-background" : cn(color.bg, "text-fn-foreground"))}>
                    {n}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <p className="mt-2 text-center text-xs font-medium text-muted-foreground">Afinação padrão · corda grave à esquerda · tônica em destaque</p>
    </div>
  );
}

function Comparison({ root, a, b }: { root: number; a: ScaleDef; b: ScaleDef }) {
  const ma = pcMap(root, a);
  const mb = pcMap(root, b);
  const semis = Array.from({ length: 12 }, (_, i) => (root + i) % 12);
  const common = semis.filter((pc) => ma.has(pc) && mb.has(pc)).length;
  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5">
      <h2 className="text-2xl font-extrabold">Diferenças entre as escalas</h2>
      <p className="mt-1 text-base font-medium text-muted-foreground">
        Cada coluna é um semitom a partir da tônica. Em <span className="font-bold text-dominant">laranja</span>, notas que só existem em uma das escalas. {common} notas em comum.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-center">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <th className="py-2 text-left">Semitom</th>
              {semis.map((_, i) => <th key={i}>{i}</th>)}
            </tr>
          </thead>
          <tbody className="font-display text-xl font-extrabold">
            {([[a, ma, mb, "text-tonic"], [b, mb, ma, "text-subdominant"]] as const).map(([sc, m, other, cls], r) => (
              <tr key={r}>
                <td className={cn("py-2 pr-2 text-left text-sm", cls)}>{sc.name}</td>
                {semis.map((pc) => {
                  const n = m.get(pc);
                  return <td key={pc} className={cn(!n ? "text-muted-foreground/30" : !other.has(pc) ? "text-dominant" : "")}>{n ?? "·"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-4 space-y-2 text-base font-medium">
        <li><span className="font-bold text-tonic">{a.name}:</span> {intervals(a).map(intervalLabel).join(" ")} — fórmula {a.formula.join(" ")}</li>
        <li><span className="font-bold text-subdominant">{b.name}:</span> {intervals(b).map(intervalLabel).join(" ")} — fórmula {b.formula.join(" ")}</li>
      </ul>
    </section>
  );
}
