export type Chord = { name: string; root: number; qual: "" | "m" | "dim" | "aug"; sig: string; cue: string };
export type Section = { label: string; chords: Chord[] };
export type Run = { loop: Chord[]; reps: number };
export type Block = { label: string; runs: Run[]; cues: string[]; same: boolean };
export type KeyHint = { root: number; minor: boolean } | null;

const LETTER: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SUFFIX_OK = /^(?:maj|min|dim|aug|sus|add|m|M|º|°|\+|-|[0-9]|#|b|\(|\)|,)*$/;
const NOISE = /^(?:\(?\d+x\)?|x\d+|\|+|[-–—.]+|N\.?C\.?)$/i;
const WORDS = "Intro(?:dução)?|Verso|Estrofe|(?:Primeira|Segunda|Terceira)\\s+Parte|Pré-?\\s?Refrão|Refrão|Ponte|Solo|Final|Coda|Interl[úu]dio|Instrumental";
const BRACKET = /^\s*\[(.+?)\]\s*(.*)$/;
const NAMED = new RegExp(`^\\s*(${WORDS})\\s*\\d*\\s*:?\\s*(.*)$`, "i");

export function parseChord(raw: string): Chord | null {
  let t = raw.replace(/^\(+/, "");
  const open = (t.match(/\(/g) ?? []).length;
  const close = (t.match(/\)/g) ?? []).length;
  if (close > open) t = t.replace(/\)+$/, "");
  const [main, bass] = t.split("/");
  const m = /^([A-G])([#b]?)(.*)$/.exec(main ?? "");
  if (!m || !SUFFIX_OK.test((m[3] ?? ""))) return null;
  if (bass !== undefined && !/^[A-G][#b]?$/.test(bass)) return null;
  const rest = (m[3] ?? "");
  const qual: Chord["qual"] =
    /^(dim|º|°)/.test(rest) || (/^m(?!aj)/.test(rest) && /b5/.test(rest)) ? "dim"
    : /^(m(?!aj)|min|-)/.test(rest) ? "m"
    : /^(aug|\+)/.test(rest) ? "aug" : "";
  const root = ((LETTER[m[1] ?? ""] ?? 0) + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + 12) % 12;
  return { name: t, root, qual, sig: `${root}${qual}`, cue: "" };
}

/** Linha só de acordes? Devolve os acordes, ou null se for letra/tablatura. */
export function parseChordLine(line: string): Chord[] | null {
  if (/[-|]{3,}/.test(line) || /^\s*[eBGDAE]\|/.test(line)) return null;
  const tokens = line.trim().split(/\s+/).filter((t) => t && !NOISE.test(t));
  if (!tokens.length) return null;
  const chords = tokens.map(parseChord).filter((c): c is Chord => c !== null);
  return chords.length / tokens.length >= 0.75 ? chords : null;
}

function matchLabel(line: string): { label: string; chords: Chord[] } | null {
  const lab = BRACKET.exec(line) ?? NAMED.exec(line);
  if (!lab) return null;
  const rest = (lab[2] ?? "").trim();
  const cs = rest ? parseChordLine(rest) : [];
  return cs ? { label: (lab[1] ?? "").trim(), chords: cs } : null;
}

/** Pista: primeiras palavras (até 5 / 40 letras) da frase que está embaixo da linha de acordes. "" se não houver letra. */
function cueFor(lines: string[], idx: number): string {
  const next = lines[idx + 1];
  if (next === undefined || !next.trim() || parseChordLine(next) || matchLabel(next)) return "";
  let cue = "";
  for (const w of next.trim().split(/\s+/).slice(0, 5)) {
    if ((cue + " " + w).trim().length > 40) break;
    cue = (cue + " " + w).trim();
  }
  return cue;
}

/** Pista de um trecho: a primeira frase que aparece nele. */
export const runCue = (r: Run) => r.loop.find((c) => c.cue)?.cue ?? "";

export function parseCifra(text: string): { sections: Section[]; hint: KeyHint } {
  const h = /^\s*Tom\s*:\s*([A-G][#b]?)(m(?!aj))?\s*$/im.exec(text);
  const hint: KeyHint = h ? { root: (parseChord(h[1] ?? "")?.root ?? 0), minor: !!h[2] } : null;
  const sections: Section[] = [];
  let cur: Section = { label: "", chords: [] };
  const flush = () => { if (cur.chords.length) sections.push(cur); };
  const lines = text.split(/\r?\n/);
  for (let idx = 0; idx < lines.length; idx++) {
    const line = (lines[idx] ?? "");
    const lab = matchLabel(line);
    if (lab) { flush(); cur = { label: lab.label, chords: lab.chords }; continue; }
    const cs = parseChordLine(line);
    if (cs) {
      const cue = cueFor(lines, idx);
      for (const c of cs) c.cue = cue;
      cur.chords.push(...cs);
    }
  }
  flush();
  return { sections, hint };
}

/** Acordes repetidos em sequência (C C G) NÃO são simplificados: é a continuidade do acorde, não uma repetição. */

/** Acha ciclos repetidos: C G Am F C G Am F -> {loop:[C G Am F], reps:2}. Tolera ciclo final incompleto. */
export function compressRuns(cs: Chord[]): Run[] {
  const n = cs.length;
  const eq = (a: number, b: number) => cs[a]?.sig === cs[b]?.sig;
  const raw: Run[] = [];
  let i = 0;
  while (i < n) {
    type Cand = { p: number; reps: number; used: number };
    let full: Cand | null = null; // repete 2x ou mais (preferido; empate -> ciclo menor)
    let half: Cand | null = null; // 1 ciclo + metade ou mais de um 2º ciclo cortado
    for (let p = 2; p <= n - i - 2; p++) {
      let reps = 1;
      const same = (from: number) => { for (let k = 0; k < p; k++) if (!eq(i + k, from + k)) return false; return true; };
      while (i + (reps + 1) * p <= n && same(i + reps * p)) reps++;
      let k = 0;
      while (i + reps * p + k < n && k < p - 1 && eq(i + k, i + reps * p + k)) k++;
      if (reps >= 2) {
        if (k < 2) k = 0; // 1 acorde sobrando fica para a próxima parte
        if (!full || reps * p > full.reps * full.p) full = { p, reps, used: reps * p + k };
      } else if (k >= Math.max(2, Math.ceil(p / 2)) && (!half || p + k > half.used)) {
        half = { p, reps: 1, used: p + k };
      }
    }
    const best = full ?? half;
    if (best) { raw.push({ loop: cs.slice(i, i + best.p), reps: best.reps }); i += best.used; }
    else { raw.push({ loop: cs.slice(i, i + 1), reps: 1 }); i++; }
  }
  const out: Run[] = [];
  for (const r of raw) {
    const last = out[out.length - 1];
    if (r.reps === 1 && last && last.reps === 1) last.loop = [...last.loop, ...r.loop];
    else out.push({ loop: [...r.loop], reps: r.reps });
  }
  return out;
}

const sigOf = (runs: Run[]) => runs.map((r) => r.loop.map((c) => c.sig).join(" ")).join(" | ");

/**
 * A música na ordem original, com os nomes originais (Intro, Refrão...).
 * same=true: a sequência é igual à do bloco anterior (não mudou). Só quando muda é que se mostra
 * a cifra e a pista (frase de onde a sequência começa). Pista repetida em seguida é omitida.
 */
export function buildSong(sections: Section[]): Block[] {
  const labeled = sections.some((s) => s.label);
  const segs: { label: string; runs: Run[] }[] = [];
  for (const s of sections) {
    const runs = compressRuns(s.chords);
    if (labeled) segs.push({ label: s.label, runs });
    else {
      // sem marcações: cada trecho que repete vira um bloco; acordes soltos antes dele são a "entrada" desse bloco
      let lead: Run[] = [];
      for (const r of runs) {
        if (r.reps === 1) { lead.push(r); continue; }
        segs.push({ label: "", runs: [...lead, r] });
        lead = [];
      }
      if (lead.length) segs.push({ label: "", runs: lead });
    }
  }
  const blocks: Block[] = [];
  let prev = "";
  let n = 0;
  for (const sg of segs) {
    const sig = sigOf(sg.runs);
    const cues: string[] = [];
    let last = "";
    for (const r of sg.runs) {
      const c = runCue(r);
      cues.push(c && c !== last ? c : "");
      if (c) last = c;
    }
    blocks.push({ label: sg.label || `Parte ${++n}`, runs: sg.runs, cues, same: sig === prev });
    prev = sig;
  }
  return blocks;
}

const MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10];
const MAJ_Q = ["", "m", "m", "", "", "m", "dim"], MIN_Q = ["m", "dim", "", "m", "m", "", ""];
export function detectKey(all: Chord[], hint: KeyHint = null) {
  let best = { root: 0, minor: false, score: -1 };
  for (let t = 0; t < 12; t++) for (const minor of [false, true]) {
    const sc = minor ? MIN : MAJ, qs = minor ? MIN_Q : MAJ_Q;
    let score = 0;
    for (const c of all) {
      const d = sc.findIndex((s) => (t + s) % 12 === c.root);
      if (d < 0) continue;
      score += qs[d] === c.qual ? 1 : minor && d === 4 && c.qual === "" ? 0.8 : 0.4;
    }
    const tonicQ = minor ? "m" : "";
    if (all[0] && all[0].root === t && all[0].qual === tonicQ) score += 2;
    const last = all[all.length - 1];
    if (last && last.root === t && last.qual === tonicQ) score += 1.5;
    if (hint && hint.root === t && hint.minor === minor) score += 3;
    if (score > best.score) best = { root: t, minor, score };
  }
  return best;
}
