import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { KEYS, keyIndex, type Key } from "@/lib/harmony";

export const Route = createFileRoute("/escalas")({
  head: () => ({
    meta: [
      { title: "Escalas Maior e Menor — Harmonia Fácil" },
      { name: "description", content: "Compare as escalas maior (Jônio) e menor natural (Eólio) no teclado e no braço da guitarra, em qualquer tom." },
      { property: "og:title", content: "Escalas Maior e Menor — Harmonia Fácil" },
      { property: "og:description", content: "Notas, graus, intervalos e diferenças entre Jônio e Eólio, em qualquer tonalidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Escalas,
});

const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const FLAT_MAJORS = [5, 10, 3, 8, 1]; // F Bb Eb Ab Db

interface ScaleDef {
  id: "major" | "minor";
  name: string;
  mode: string;
  steps: number[];
  degrees: string[];
  color: { bg: string; text: string; border: string; soft: string };
}

const SCALES: ScaleDef[] = [
  {
    id: "major",
    name: "Maior",
    mode: "Jônio",
    steps: [0, 2, 4, 5, 7, 9, 11],
    degrees: ["1", "2", "3", "4", "5", "6", "7"],
    color: { bg: "bg-tonic", text: "text-tonic", border: "border-tonic", soft: "bg-tonic/25" },
  },
  {
    id: "minor",
    name: "Menor natural",
    mode: "Eólio",
    steps: [0, 2, 3, 5, 7, 8, 10],
    degrees: ["1", "2", "♭3", "4", "5", "♭6", "♭7"],
    color: { bg: "bg-subdominant", text: "text-subdominant", border: "border-subdominant", soft: "bg-subdominant/25" },
  },
];

function noteNames(root: number, scale: ScaleDef) {
  const relMajor = scale.id === "major" ? root : (root + 3) % 12;
  const names = FLAT_MAJORS.includes(relMajor) || (scale.id === "minor" && relMajor === 0 && false) ? FLATS : SHARPS;
  return scale.steps.map((s) => names[(root + s) % 12]!);
}

function nameFor(pc: number, root: number, scale: ScaleDef) {
  const i = scale.steps.findIndex((s) => (root + s) % 12 === pc);
  return i >= 0 ? noteNames(root, scale)[i]! : null;
}

function Escalas() {
  const [key, setKey] = useState<Key>("C");
  const root = keyIndex(key);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-base font-bold">
        <ArrowLeft className="h-5 w-5" /> Mapa
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
        ESCALAS <span className="text-tonic">MAIOR</span> E <span className="text-subdominant">MENOR</span>
      </h1>
      <p className="text-sm text-muted-foreground">Jônio e Eólio lado a lado. Escolha o tom e tudo se atualiza.</p>

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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {SCALES.map((sc) => (
          <ScaleCard key={sc.id} scale={sc} root={root} keyName={key} />
        ))}
      </div>

      <Comparison root={root} keyName={key} />
    </main>
  );
}

function ScaleCard({ scale, root, keyName }: { scale: ScaleDef; root: number; keyName: string }) {
  const names = noteNames(root, scale);
  const intervals = scale.steps.map((s, i) => (scale.steps[i + 1] ?? 12) - s);
  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <h2 className={cn("text-2xl font-extrabold", scale.color.text)}>
        {keyName} {scale.name}
      </h2>
      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Modo {scale.mode}</p>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {names.map((n, i) => (
          <div key={i} className={cn("rounded-2xl py-3 text-center text-fn-foreground", scale.color.bg)}>
            <span className="block font-display text-2xl font-extrabold leading-none sm:text-3xl">{n}</span>
            <span className="mt-1 block text-sm font-bold">{scale.degrees[i]}</span>
          </div>
        ))}
      </div>

      <p className="mb-2 mt-5 text-sm font-bold uppercase tracking-widest text-muted-foreground">Intervalos</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {intervals.map((iv, i) => (
          <span key={i} className={cn("rounded-xl px-3 py-1.5 font-display text-xl font-extrabold", iv === 2 ? "bg-secondary" : cn("border-2", scale.color.border, scale.color.text))}>
            {iv === 2 ? "T" : "St"}
          </span>
        ))}
      </div>
      <p className="mt-1 text-xs font-medium text-muted-foreground">T = tom · St = semitom</p>

      <p className="mb-2 mt-5 text-sm font-bold uppercase tracking-widest text-muted-foreground">Teclado</p>
      <Keyboard root={root} scale={scale} />

      <p className="mb-2 mt-5 text-sm font-bold uppercase tracking-widest text-muted-foreground">Braço da guitarra</p>
      <Fretboard root={root} scale={scale} />
    </section>
  );
}

const WHITE = [0, 2, 4, 5, 7, 9, 11];
const BLACK: { pc: number; after: number }[] = [
  { pc: 1, after: 0 }, { pc: 3, after: 1 }, { pc: 6, after: 3 }, { pc: 8, after: 4 }, { pc: 10, after: 5 },
];

function Keyboard({ root, scale }: { root: number; scale: ScaleDef }) {
  const octaves = [0, 1];
  const whiteCount = 14;
  const pcs = new Set(scale.steps.map((s) => (root + s) % 12));
  return (
    <div className="relative h-36 w-full select-none overflow-hidden rounded-2xl">
      <div className="flex h-full gap-0.5">
        {octaves.flatMap((o) =>
          WHITE.map((pc) => {
            const on = pcs.has(pc);
            const isRoot = pc === root;
            return (
              <div key={`${o}-${pc}`} className={cn("relative flex-1 rounded-b-lg", on ? scale.color.soft : "bg-foreground/90", "bg-clip-padding")}>
                {!on && <div className="absolute inset-0 rounded-b-lg bg-foreground/90" />}
                {on && (
                  <span className={cn("absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-md px-0.5 text-xs font-extrabold sm:text-sm", isRoot ? cn(scale.color.bg, "text-fn-foreground") : scale.color.text)}>
                    {nameFor(pc, root, scale)}
                  </span>
                )}
              </div>
            );
          }),
        )}
      </div>
      {octaves.flatMap((o) =>
        BLACK.map(({ pc, after }) => {
          const on = pcs.has(pc);
          const left = ((o * 7 + after + 1) / whiteCount) * 100;
          return (
            <div
              key={`b${o}-${pc}`}
              className={cn("absolute top-0 h-[58%] w-[5%] -translate-x-1/2 rounded-b-md border border-border", on ? scale.color.bg : "bg-background")}
              style={{ left: `${left}%` }}
            >
              {on && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-fn-foreground">{nameFor(pc, root, scale)}</span>}
            </div>
          );
        }),
      )}
    </div>
  );
}

const STRINGS = [4, 11, 7, 2, 9, 4]; // high E to low E
const FRETS = 12;

function Fretboard({ root, scale }: { root: number; scale: ScaleDef }) {
  const pcs = new Set(scale.steps.map((s) => (root + s) % 12));
  return (
    <div className="overflow-x-auto rounded-2xl bg-muted p-2">
      <div className="min-w-[560px]">
        {STRINGS.map((open, si) => (
          <div key={si} className="flex h-8 items-center">
            {Array.from({ length: FRETS + 1 }, (_, f) => {
              const pc = (open + f) % 12;
              const on = pcs.has(pc);
              const isRoot = pc === root;
              return (
                <div key={f} className={cn("relative flex h-full flex-1 items-center justify-center", f === 0 ? "border-r-4 border-foreground/60" : "border-r border-border")}>
                  <div className="absolute inset-x-0 top-1/2 h-px bg-muted-foreground/50" />
                  {on && (
                    <span className={cn("relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold", isRoot ? cn(scale.color.bg, "text-fn-foreground") : cn("border-2 bg-card", scale.color.border, scale.color.text))}>
                      {nameFor(pc, root, scale)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div className="flex">
          {Array.from({ length: FRETS + 1 }, (_, f) => (
            <span key={f} className="flex-1 text-center text-xs font-bold text-muted-foreground">{[3, 5, 7, 9, 12].includes(f) ? f : ""}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Comparison({ root, keyName }: { root: number; keyName: string }) {
  const [maj, min] = SCALES as [ScaleDef, ScaleDef];
  const majN = noteNames(root, maj);
  const minN = noteNames(root, min);
  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5">
      <h2 className="text-2xl font-extrabold">Diferenças entre as escalas</h2>
      <p className="mt-1 text-base font-medium text-muted-foreground">
        As notas em <span className="font-bold text-dominant">laranja</span> mudam: na menor, o 3º, o 6º e o 7º graus descem meio tom.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-center">
          <thead>
            <tr className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <th className="py-2 text-left">Grau</th>
              {maj.degrees.map((_, i) => <th key={i}>{i + 1}</th>)}
            </tr>
          </thead>
          <tbody className="font-display text-2xl font-extrabold">
            <tr>
              <td className="py-2 text-left text-base text-tonic">{keyName} Maior</td>
              {majN.map((n, i) => <td key={i} className={maj.steps[i] !== min.steps[i] ? "text-dominant" : ""}>{n}</td>)}
            </tr>
            <tr>
              <td className="py-2 text-left text-base text-subdominant">{keyName} Menor</td>
              {minN.map((n, i) => <td key={i} className={maj.steps[i] !== min.steps[i] ? "text-dominant" : ""}>{n}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <ul className="mt-4 space-y-2 text-base font-medium">
        <li><span className="font-bold text-tonic">Maior:</span> T T St T T T St — som alegre e luminoso.</li>
        <li><span className="font-bold text-subdominant">Menor:</span> T St T T St T T — som mais triste e introspectivo.</li>
        <li><span className="font-bold text-dominant">Dica:</span> a menor de {keyName} usa as mesmas notas da maior de {FLATS[(root + 3) % 12]} (tom relativo).</li>
      </ul>
    </section>
  );
}
