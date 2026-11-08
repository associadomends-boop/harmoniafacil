export interface ScaleDef {
  id: string;
  name: string;
  category: string;
  /** Degree formula, e.g. ["1","2","b3"]. Letter = degree number, accidental = b/#. */
  formula: string[];
}

const CAT = {
  modes: "Modos gregos",
  minor: "Escalas menores",
  penta: "Pentatônicas e blues",
  major: "Escalas maiores e variações",
  sym: "Escalas simétricas",
  bebop: "Escalas bebop",
  exotic: "Escalas exóticas",
};

const f = (s: string) => s.split(" ");

export const SCALES: ScaleDef[] = [
  { id: "jonio", name: "Jônio (Maior)", category: CAT.modes, formula: f("1 2 3 4 5 6 7") },
  { id: "dorico", name: "Dórico", category: CAT.modes, formula: f("1 2 b3 4 5 6 b7") },
  { id: "frigio", name: "Frígio", category: CAT.modes, formula: f("1 b2 b3 4 5 b6 b7") },
  { id: "lidio", name: "Lídio", category: CAT.modes, formula: f("1 2 3 #4 5 6 7") },
  { id: "mixolidio", name: "Mixolídio", category: CAT.modes, formula: f("1 2 3 4 5 6 b7") },
  { id: "eolio", name: "Eólio", category: CAT.modes, formula: f("1 2 b3 4 5 b6 b7") },
  { id: "locrio", name: "Lócrio", category: CAT.modes, formula: f("1 b2 b3 4 b5 b6 b7") },

  { id: "menor-natural", name: "Menor natural", category: CAT.minor, formula: f("1 2 b3 4 5 b6 b7") },
  { id: "menor-harmonica", name: "Menor harmônica", category: CAT.minor, formula: f("1 2 b3 4 5 b6 7") },
  { id: "menor-melodica", name: "Menor melódica", category: CAT.minor, formula: f("1 2 b3 4 5 6 7") },
  { id: "menor-napolitana", name: "Menor napolitana", category: CAT.minor, formula: f("1 b2 b3 4 5 b6 7") },
  { id: "menor-cigana", name: "Menor cigana", category: CAT.minor, formula: f("1 2 b3 #4 5 b6 7") },
  { id: "menor-espanhola", name: "Menor harmônica espanhola", category: CAT.minor, formula: f("1 b2 b3 3 4 b5 b6 b7") },

  { id: "penta-maior", name: "Pentatônica maior", category: CAT.penta, formula: f("1 2 3 5 6") },
  { id: "penta-menor", name: "Pentatônica menor", category: CAT.penta, formula: f("1 b3 4 5 b7") },
  { id: "blues-maior", name: "Blues maior", category: CAT.penta, formula: f("1 2 b3 3 5 6") },
  { id: "blues-menor", name: "Blues menor", category: CAT.penta, formula: f("1 b3 4 b5 5 b7") },

  { id: "maior-harmonica", name: "Maior harmônica", category: CAT.major, formula: f("1 2 3 4 5 b6 7") },
  { id: "dupla-harmonica", name: "Maior dupla harmônica", category: CAT.major, formula: f("1 b2 3 4 5 b6 7") },
  { id: "lidia-dominante", name: "Lídia dominante", category: CAT.major, formula: f("1 2 3 #4 5 6 b7") },
  { id: "mixolidia-b6", name: "Mixolídia b6", category: CAT.major, formula: f("1 2 3 4 5 b6 b7") },

  { id: "cromatica", name: "Cromática", category: CAT.sym, formula: f("1 b2 2 b3 3 4 #4 5 b6 6 b7 7") },
  { id: "tons-inteiros", name: "Tons inteiros", category: CAT.sym, formula: f("1 2 3 #4 #5 b7") },
  { id: "dim-tst", name: "Diminuta tom-semitom", category: CAT.sym, formula: f("1 2 b3 4 b5 b6 6 7") },
  { id: "dim-stt", name: "Diminuta semitom-tom", category: CAT.sym, formula: f("1 b2 b3 3 #4 5 6 b7") },
  { id: "alterada", name: "Alterada (superlócria)", category: CAT.sym, formula: f("1 b2 b3 b4 b5 b6 b7") },

  { id: "bebop-dom", name: "Bebop dominante", category: CAT.bebop, formula: f("1 2 3 4 5 6 b7 7") },
  { id: "bebop-maior", name: "Bebop maior", category: CAT.bebop, formula: f("1 2 3 4 5 #5 6 7") },
  { id: "bebop-dorica", name: "Bebop dórica", category: CAT.bebop, formula: f("1 2 b3 3 4 5 6 b7") },

  { id: "frigia-dom", name: "Frígia dominante", category: CAT.exotic, formula: f("1 b2 3 4 5 b6 b7") },
  { id: "maior-napolitana", name: "Maior napolitana", category: CAT.exotic, formula: f("1 b2 b3 4 5 6 7") },
  { id: "hungara-maior", name: "Húngara maior", category: CAT.exotic, formula: f("1 #2 3 #4 5 6 b7") },
  { id: "hirajoshi", name: "Japonesa (Hirajoshi)", category: CAT.exotic, formula: f("1 2 b3 5 b6") },
  { id: "arabe", name: "Árabe", category: CAT.exotic, formula: f("1 2 3 4 b5 b6 b7") },
  { id: "persa", name: "Persa", category: CAT.exotic, formula: f("1 b2 3 4 b5 b6 7") },
];

export const CATEGORIES = [...new Set(SCALES.map((s) => s.category))];

export const ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_ROOTS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];

function parse(token: string) {
  const acc = [...token].reduce((a, c) => a + (c === "#" ? 1 : c === "b" ? -1 : 0), 0);
  const deg = Number(token.replace(/[#b]/g, ""));
  return { deg, acc };
}

/** Semitones from the root for each degree. */
export function steps(scale: ScaleDef): number[] {
  return scale.formula.map((t) => {
    const { deg, acc } = parse(t);
    return (((MAJOR[deg - 1]! + acc) % 12) + 12) % 12;
  });
}

function spellFrom(rootName: string, rootPc: number, scale: ScaleDef) {
  const rl = LETTERS.indexOf(rootName[0]!);
  return scale.formula.map((t, i) => {
    const { deg } = parse(t);
    const li = (rl + deg - 1) % 7;
    const target = (rootPc + steps(scale)[i]!) % 12;
    let diff = (target - LETTER_PC[li]! + 12) % 12;
    if (diff > 6) diff -= 12;
    return LETTERS[li]! + (diff >= 0 ? "#".repeat(diff) : "b".repeat(-diff));
  });
}

const accCount = (notes: string[]) => notes.reduce((n, s) => n + s.length - 1, 0);

/** Correct spelling: one letter per degree, choosing the enharmonic root (sharp/flat) with fewer accidentals. */
export function spell(rootPc: number, scale: ScaleDef): { root: string; notes: string[] } {
  const a = { root: ROOTS[rootPc]!, notes: spellFrom(ROOTS[rootPc]!, rootPc, scale) };
  const b = { root: FLAT_ROOTS[rootPc]!, notes: spellFrom(FLAT_ROOTS[rootPc]!, rootPc, scale) };
  const best = FLAT_ROOTS[rootPc] !== ROOTS[rootPc] && accCount(b.notes) < accCount(a.notes) ? b : a;
  // Always display sharps: convert every note to its sharp (or natural) equivalent.
  void best;
  return { root: ROOTS[rootPc]!, notes: steps(scale).map((st) => ROOTS[(rootPc + st) % 12]!) };
}

/** Pitch class of a note name like "Eb" or "F##". */
export function noteToPc(n: string) {
  const acc = [...n.slice(1)].reduce((a, c) => a + (c === "#" ? 1 : -1), 0);
  return (((LETTER_PC[LETTERS.indexOf(n[0]!)]! + acc) % 12) + 12) % 12;
}

/** Replace ##, bb, E#, B#, Cb, Fb with the simple enharmonic (natural when possible). */
export function simplify(n: string) {
  const acc = n.slice(1);
  if (!(acc.length > 1 || ["E#", "B#", "Cb", "Fb"].includes(n))) return n;
  const pc = noteToPc(n);
  const nat = LETTERS[LETTER_PC.indexOf(pc)];
  if (nat) return nat;
  return acc[0] === "#" ? ROOTS[pc]! : FLAT_ROOTS[pc]!;
}

export const SEVEN_NOTE_SCALES = SCALES.filter((s) => s.formula.length === 7);
export const scaleById = (id: string) => SCALES.find((s) => s.id === id);

export function intervalLabel(semis: number) {
  return ({ 1: "St", 2: "T", 3: "T½", 4: "2T" } as Record<number, string>)[semis] ?? `${semis}st`;
}

export function intervals(scale: ScaleDef) {
  const s = steps(scale);
  return s.map((v, i) => (s[i + 1] ?? 12) - v);
}
