import { describe, expect, it } from "vitest";
import { backupCorruptedSongs, migrateSong, parseBackup, parseSongs, shareText, songChords, type Song } from "@/lib/setlist";

const song = { id: "1", title: "Minha", key: "G", scale: "jonio", bpm: "120", notes: "", sections: [{ id: "a", type: "Refrão", prog: [0, 4, 5, 3] }] };

describe("setlist storage", () => {
  it("preserves marks, same and off-scale chords during migration", () => {
    const extended = { ...song, sections: [{ id: "a", type: "Intro", prog: [0, { off: 11, suf: "m7" }], marks: [{ at: 0, reps: 2, cue: "Volta pra casa hoje" }], same: true }] };
    expect(migrateSong(extended)?.sections).toEqual(extended.sections);
  });
  it("backup accepts extended chord sections", () => {
    const extended = { ...song, sections: [{ id: "a", type: "Intro", prog: [0, { off: 11, suf: "m7" }], marks: [{ at: 0, reps: 2 }], same: true }] };
    expect(parseBackup(JSON.stringify([extended]))?.[0]?.sections).toEqual(extended.sections);
  });
  it("shares off-scale chords", () => {
    const extended: Song = { ...song, key: "G", sections: [{ id: "a", type: "Intro", prog: [0, { off: 11, suf: "m7" }] }] };
    expect(shareText([extended])).toContain("Intro: G F#m7");
  });
  it("copies the exact corrupt original before it can be rewritten", () => {
    localStorage.setItem("harmonia-setlist", "[original quebrado");
    expect(backupCorruptedSongs()).toBe(true);
    expect(localStorage.getItem("harmonia-setlist-backup")).toBe("[original quebrado");
    localStorage.removeItem("harmonia-setlist");
    localStorage.removeItem("harmonia-setlist-backup");
  });
  it("migrates old songs without scale and with legacy prog", () => {
    const { songs, corrupted } = parseSongs(JSON.stringify([{ id: "x", title: "Velha", key: "C", bpm: "90", notes: "capo 2", prog: [0, 3, 4] }]));
    expect(corrupted).toBe(false);
    expect(songs[0]).toMatchObject({ scale: "jonio", bpm: "90", notes: "capo 2", sections: [{ type: "Música", prog: [0, 3, 4] }] });
  });
  it("drops bad items and flags corruption", () => {
    const r = parseSongs(JSON.stringify([song, { title: 5 }, null]));
    expect(r.songs).toHaveLength(1);
    expect(r.corrupted).toBe(true);
  });
  it("invalid JSON never throws", () => expect(parseSongs("{oops")).toEqual({ songs: [], corrupted: true }));
  it("restore rejects any invalid item", () => {
    expect(parseBackup(JSON.stringify([song, { id: "2" }]))).toBeNull();
    expect(parseBackup("nada")).toBeNull();
    expect(parseBackup(JSON.stringify([song]))).toHaveLength(1);
  });
  it("changing key/scale keeps degrees and renames chords", () => {
    expect(songChords(song as never).map((c) => c.name).slice(0, 2)).toEqual(["G", "Am"]);
    const s = { ...song, key: "A", scale: "eolio" } as never;
    expect([0, 4, 5, 3].map((d) => songChords(s)[d]!.name)).toEqual(["Am", "Em", "F", "Dm"]);
  });
  it("share text format", () =>
    expect(shareText([song as never])).toBe("1. Minha — Tom G (Jônio (Maior)) — 120 BPM / Refrão: G D Em C"));
});
