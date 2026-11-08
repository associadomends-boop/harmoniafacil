import { scaleById, spell, steps } from "./scales";

export type HarmonicFunction = "tonic" | "subdominant" | "dominant";

export const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export type Key = (typeof KEYS)[number];

const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
/** Converts old flat key names (e.g. "Eb") to the sharp equivalent; unknown values pass through. */
export const toSharpKey = (k: unknown) => (typeof k === "string" && FLATS.includes(k) ? SHARPS[FLATS.indexOf(k)] : k);
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
const QUALITIES = ["", "m", "m", "", "", "m", "dim"] as const;
const ROMANS = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
const FUNCTIONS: HarmonicFunction[] = ["tonic", "subdominant", "tonic", "subdominant", "dominant", "tonic", "dominant"];

export interface Chord {
  degree: number; // 0-6
  roman: string;
  name: string;
  root: number; // pitch class
  quality: "" | "m" | "dim" | "aug";
  fn: HarmonicFunction;
}

export function keyIndex(key: Key | string) {
  return SHARPS.indexOf(key) >= 0 ? SHARPS.indexOf(key) : FLATS.indexOf(key);
}

export function chordsForKey(key: Key): Chord[] {
  const base = keyIndex(key);
  const names = SHARPS;
  return MAJOR_STEPS.map((step, i) => {
    const root = (base + step) % 12;
    return {
      degree: i,
      roman: ROMANS[i]!,
      name: names[root]! + QUALITIES[i]!,
      root,
      quality: QUALITIES[i]!,
      fn: FUNCTIONS[i]!,
    };
  });
}

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];
const SUFFIX = { "": "", m: "m", dim: "dim", aug: "+" } as const;

/** Triads stacked in thirds over a 7-note scale. Functions follow the degree (I/iii/vi repouso, ii/IV preparação, V/vii tensão). */
export function chordsForScale(rootPc: number, scaleId: string): Chord[] {
  const scale = scaleById(scaleId) ?? scaleById("jonio")!;
  const st = steps(scale);
  const { notes } = spell(rootPc, scale);
  return st.map((s, i) => {
    const third = (st[(i + 2) % 7]! - s + 12) % 12;
    const fifth = (st[(i + 4) % 7]! - s + 12) % 12;
    const quality: Chord["quality"] = third === 4 ? (fifth === 8 ? "aug" : "") : fifth === 6 ? "dim" : "m";
    const acc = scale.formula[i]!.replace(/[0-9]/g, "").replace(/b/g, "♭").replace(/#/g, "♯");
    const num = quality === "" || quality === "aug" ? NUMERALS[i]! : NUMERALS[i]!.toLowerCase();
    return {
      degree: i,
      roman: acc + num + (quality === "dim" ? "°" : quality === "aug" ? "+" : ""),
      name: notes[i]! + SUFFIX[quality],
      root: (rootPc + s) % 12,
      quality,
      fn: FUNCTIONS[i]!,
    };
  });
}

export const FN_INFO: Record<HarmonicFunction, { label: string; feel: string; desc: string }> = {
  tonic: { label: "Tônica", feel: "Repouso", desc: "Estabilidade e sensação de conclusão." },
  subdominant: { label: "Subdominante", feel: "Preparação", desc: "Cria movimento e prepara a progressão." },
  dominant: { label: "Dominante", feel: "Tensão", desc: "Cria expectativa e pede resolução." },
};

export interface Path {
  degree: number;
  note: string;
  main?: boolean;
}

/** Most common next chords per degree (major key). */
export const NEXT: Record<number, Path[]> = {
  0: [
    { degree: 3, note: "Sai do repouso e prepara o movimento.", main: true },
    { degree: 4, note: "Vai direto para a tensão." },
    { degree: 5, note: "Tônica relativa, mantém a estabilidade com cor mais suave." },
    { degree: 1, note: "Preparação clássica para o V (ii–V–I)." },
  ],
  1: [
    { degree: 4, note: "Caminho mais característico: ii → V.", main: true },
    { degree: 3, note: "Continua na preparação." },
    { degree: 6, note: "Tensão mais leve, com o vii°." },
  ],
  2: [
    { degree: 5, note: "Desce por quintas até o vi.", main: true },
    { degree: 3, note: "Segue para a preparação." },
    { degree: 1, note: "Possível, dependendo do contexto." },
  ],
  3: [
    { degree: 4, note: "Preparação pedindo tensão: IV → V.", main: true },
    { degree: 0, note: "Cadência plagal (o famoso 'Amém')." },
    { degree: 1, note: "Continua preparando." },
  ],
  4: [
    { degree: 0, note: "Resolução mais característica: repouso total.", main: true },
    { degree: 5, note: "Tônica relativa — cadência de engano." },
    { degree: 2, note: "Possível continuação, dependendo do contexto." },
  ],
  5: [
    { degree: 1, note: "Segue o ciclo: vi → ii → V → I.", main: true },
    { degree: 3, note: "Vai para a preparação." },
    { degree: 4, note: "Vai para a tensão." },
  ],
  6: [
    { degree: 0, note: "Resolve na tônica.", main: true },
    { degree: 2, note: "Resolução alternativa no iii." },
  ],
};

export const MEANING: Record<HarmonicFunction, string> = {
  tonic: "Você está em um momento de repouso. A música está 'em casa'.",
  subdominant: "Você está em um momento de preparação. A música está saindo de casa.",
  dominant: "Você está em um momento de tensão harmônica. O ouvido pede resolução.",
};

export const CONTEXT_NOTES: Record<number, string | undefined> = {
  2: "O iii pode soar como tônica ou como dominante (ele compartilha duas notas com o V).",
  5: "O vi é a tônica relativa, mas também pode preparar como subdominante.",
  1: "O ii é o substituto do IV — muito usado antes do V.",
  6: "O vii° funciona como um V7 sem a fundamental.",
};

/** MIDI notes for a chord voicing around middle C. */
export function chordMidi(chord: Chord): number[] {
  const third = chord.quality === "" ? 4 : 3;
  const fifth = chord.quality === "dim" ? 6 : chord.quality === "aug" ? 8 : 7;
  const root = 60 + chord.root;
  return [root - 24, root, root + third, root + fifth];
}
