import { chordsForScale, keyIndex, type Key } from "./harmony";
import { type Block, type Chord } from "./cifra-import";
import { type ChordItem, type Section, type Song } from "./setlist";

export function chordItem(chord: Chord, key: Key, scale: string): ChordItem {
  const match = chordsForScale(keyIndex(key), scale).find((c) => c.root === chord.root && c.quality === chord.qual);
  return match ? match.degree : { off: (chord.root - keyIndex(key) + 12) % 12, suf: chord.name.replace(/^[A-G][#b]?/, "").split("/")[0] ?? "" };
}

/** Only this sanitized projection is persisted, never the pasted text or full lyrics. */
export function importedSong(title: string, key: Key, scale: string, blocks: Block[]): Song {
  const sections: Section[] = blocks.map((block) => {
    const prog: ChordItem[] = [];
    const marks = block.runs.map((run, i) => {
      const at = prog.length;
      prog.push(...run.loop.map((c) => chordItem(c, key, scale)));
      const cue = (block.cues[i] ?? "").split(/\s+/).slice(0, 5).join(" ").slice(0, 40);
      return { at, ...(run.reps > 1 ? { reps: Math.min(run.reps, 32) } : {}), ...(cue ? { cue } : {}) };
    });
    return { id: crypto.randomUUID(), type: block.label.trim() || "Parte", prog, marks, ...(block.same ? { same: true } : {}) };
  });
  return { id: crypto.randomUUID(), title: title.trim(), key, scale, bpm: "", notes: "", sections };
}