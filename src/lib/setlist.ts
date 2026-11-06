import { z } from "zod";
import { KEYS, chordsForScale, keyIndex, type Key } from "./harmony";
import { scaleById } from "./scales";

export const PART_TYPES = ["Intro", "Verso", "Pré-Refrão", "Refrão", "Ponte", "Solo", "Final"] as const;
export const STORAGE = "harmonia-setlist";

export interface Section {
  id: string;
  type: string;
  /** Scale degrees (0-6); chord names derive from key + scale. */
  prog: number[];
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
const sectionSchema = z.object({ id: z.string().min(1), type: z.string().min(1), prog: z.array(degree) });
const rawSongSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  key: z.enum(KEYS),
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

export function shareText(songs: Song[]) {
  return songs
    .map((s, i) => {
      const head = `${i + 1}. ${s.title} — Tom ${s.key} (${scaleById(s.scale)?.name ?? s.scale})${s.bpm ? ` — ${s.bpm} BPM` : ""}`;
      const ch = songChords(s);
      const parts = s.sections.filter((x) => x.prog.length).map((x) => `${x.type}: ${x.prog.map((d) => ch[d]!.name).join(" ")}`);
      return [head, ...parts].join(" / ");
    })
    .join("\n");
}
