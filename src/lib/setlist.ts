import { z } from "zod";
import { KEYS, chordsForScale, keyIndex, toSharpKey, type Key } from "./harmony";
import { scaleById, spell } from "./scales";

export const PART_TYPES = ["Intro", "Verso", "Pré-Refrão", "Refrão", "Ponte", "Solo", "Final"] as const;
export const STORAGE = "harmonia-setlist";

export type ChordItem = number | { off: number; suf: string };
export interface Section {
  id: string;
  type: string;
  /** Scale degrees (0-6); chord names derive from key + scale. */
  prog: ChordItem[];
  marks?: { at: number; reps?: number | undefined; cue?: string | undefined }[] | undefined;
  same?: boolean | undefined;
}

export interface Song {
  id: string;
  title: string;
  key: Key;
  scale: string;
  bpm: string;
  notes: string;
  sections: Section[];
}

const degree = z.number().int().min(0).max(6);
const sectionSchema = z.object({
  id: z.string().min(1), type: z.string().min(1),
  prog: z.array(z.union([degree, z.object({ off: z.number().int().min(0).max(11), suf: z.string().max(12) })])),
  marks: z.array(z.object({ at: z.number().int().min(0), reps: z.number().int().min(1).max(32).optional(), cue: z.string().max(60).optional() })).optional(),
  same: z.boolean().optional(),
});
const rawSongSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  key: z.preprocess(toSharpKey, z.enum(KEYS)),
  scale: z.string().optional(),
  bpm: z.union([z.string(), z.number()]).optional(),
  notes: z.string().optional(),
  sections: z.array(sectionSchema).optional(),
  prog: z.array(degree).optional(),
});

/** Validates + migrates one stored item (old saves without scale or with legacy "prog"). */
export function migrateSong(raw: unknown): Song | null {
  const r = rawSongSchema.safeParse(raw);
  if (!r.success) return null;
  const d = r.data;
  const sections = d.sections ?? (d.prog?.length ? [{ id: `${d.id}-legacy`, type: "Música", prog: d.prog }] : []);
  return {
    id: d.id,
    title: d.title,
    key: d.key,
    scale: d.scale && scaleById(d.scale)?.formula.length === 7 ? d.scale : "jonio",
    bpm: d.bpm === undefined ? "" : String(d.bpm),
    notes: d.notes ?? "",
    sections,
  };
}

export function parseSongs(json: string | null): { songs: Song[]; corrupted: boolean } {
  if (!json) return { songs: [], corrupted: false };
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { songs: [], corrupted: true };
  }
  if (!Array.isArray(data)) return { songs: [], corrupted: true };
  const songs = data.map(migrateSong).filter((s): s is Song => s !== null);
  return { songs, corrupted: songs.length !== data.length };
}

/** Strict: restore only accepts a fully valid backup. */
export function parseBackup(json: string): Song[] | null {
  const r = parseSongs(json.trim());
  if (r.corrupted || !json.trim().startsWith("[")) return null;
  return r.songs;
}

export function loadSongs() {
  try {
    return parseSongs(localStorage.getItem(STORAGE));
  } catch {
    return { songs: [], corrupted: true };
  }
}

export function saveSongs(songs: Song[]): boolean {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(songs));
    return true;
  } catch {
    return false;
  }
}

export const songChords = (s: Song) => chordsForScale(keyIndex(s.key), s.scale);

export function resolveChord(song: Pick<Song, "key" | "scale">, item: ChordItem) {
  if (typeof item === "number") {
    const chord = chordsForScale(keyIndex(song.key), song.scale)[item];
    return { name: chord?.name ?? "?", fn: chord?.fn ?? null };
  }
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return { name: `${names[(keyIndex(song.key) + item.off) % 12]}${item.suf}`, fn: null };
}

export function sectionRuns(section: Section) {
  if (!section.marks?.length) return [{ prog: section.prog, reps: 1, cue: "" }];
  return section.marks.map((mark, i) => ({
    prog: section.prog.slice(mark.at, section.marks?.[i + 1]?.at ?? section.prog.length),
    reps: mark.reps ?? 1, cue: mark.cue ?? "",
  }));
}

/** Must run before an automatic save; a failed copy must not overwrite the original. */
export function backupCorruptedSongs(): boolean {
  try {
    const original = localStorage.getItem(STORAGE);
    if (original !== null) localStorage.setItem(`${STORAGE}-backup`, original);
    return true;
  } catch { return false; }
}

export function shareText(songs: Song[]) {
  return songs
    .map((s, i) => {
      const head = `${i + 1}. ${s.title} — Tom ${s.key} (${scaleById(s.scale)?.name ?? s.scale})${s.bpm ? ` — ${s.bpm} BPM` : ""}`;
      const parts = s.sections.filter((x) => x.prog.length).map((x) => `${x.type}: ${sectionRuns(x).map((r) => `${r.prog.map((d) => resolveChord(s, d).name).join(" ")}${r.reps > 1 ? ` ×${r.reps}` : ""}`).join(" / ")}`);
      return [head, ...parts].join(" / ");
    })
    .join("\n");
}
