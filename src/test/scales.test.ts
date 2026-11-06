import { describe, expect, it } from "vitest";
import { SCALES, noteToPc, spell, steps, intervals } from "@/lib/scales";
import { chordsForScale } from "@/lib/harmony";

const s = (id: string) => SCALES.find((x) => x.id === id)!;
const names = (pc: number, id: string) => chordsForScale(pc, id).map((c) => c.name);

describe("scales", () => {
  it("has 35 scales", () => expect(SCALES).toHaveLength(35));
  it("C major", () => expect(spell(0, s("jonio")).notes).toEqual(["C", "D", "E", "F", "G", "A", "B"]));
  it("A# minor natural spells as Bb minor", () => expect(spell(10, s("menor-natural"))).toEqual({ root: "Bb", notes: ["Bb", "C", "Db", "Eb", "F", "Gb", "Ab"] }));
  it("A harmonic minor has G#", () => expect(spell(9, s("menor-harmonica")).notes).toEqual(["A", "B", "C", "D", "E", "F", "G#"]));
  it("A blues minor", () => expect(spell(9, s("blues-menor")).notes).toEqual(["A", "C", "D", "Eb", "E", "G"]));
  it("Ab minor uses B and E instead of Cb and Fb", () => expect(spell(8, s("eolio")).notes).toEqual(["G#", "A#", "B", "C#", "D#", "E", "F#"]));
  it("C# major simplifies E# and B#", () => expect(spell(1, s("jonio")).notes).toEqual(["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"]));
  it("new formulas", () => {
    expect(s("menor-espanhola").formula.join(" ")).toBe("1 b2 b3 3 4 b5 b6 b7");
    expect(s("dim-stt").formula.join(" ")).toBe("1 b2 b3 3 #4 5 6 b7");
  });
  it("every note pitch matches the formula, 35 scales × 12 keys, no hard spellings", () => {
    for (const sc of SCALES)
      for (let r = 0; r < 12; r++) {
        const { notes } = spell(r, sc);
        const st = steps(sc);
        notes.forEach((n, i) => expect(noteToPc(n), `${sc.id} ${r} ${n}`).toBe((r + st[i]!) % 12));
        notes.forEach((n) => expect(["E#", "B#", "Cb", "Fb"]).not.toContain(n));
      }
  });
  it("greek modes never have ## or bb", () => {
    for (const sc of SCALES.filter((x) => x.category === "Modos gregos"))
      for (let r = 0; r < 12; r++) for (const n of spell(r, sc).notes) expect(n).not.toMatch(/##|bb/);
  });
  it("all intervals sum to an octave", () => {
    for (const sc of SCALES) expect(intervals(sc).reduce((a, b) => a + b, 0)).toBe(12);
  });
  it("steps strictly ascending", () => {
    for (const sc of SCALES) {
      const st = steps(sc);
      st.forEach((v, i) => i && expect(v).toBeGreaterThan(st[i - 1]!));
    }
  });
});

describe("chordsForScale", () => {
  it("C major", () => expect(names(0, "jonio")).toEqual(["C", "Dm", "Em", "F", "G", "Am", "Bdim"]));
  it("A natural minor", () => {
    expect(names(9, "menor-natural")).toEqual(["Am", "Bdim", "C", "Dm", "Em", "F", "G"]);
    expect(chordsForScale(9, "menor-natural").map((c) => c.roman)).toEqual(["i", "ii°", "♭III", "iv", "v", "♭VI", "♭VII"]);
  });
  it("Db major", () => expect(names(1, "jonio")).toEqual(["Db", "Ebm", "Fm", "Gb", "Ab", "Bbm", "Cdim"]));
  it("F# major", () => expect(names(6, "jonio")).toEqual(["F#", "G#m", "A#m", "B", "C#", "D#m", "Fdim"]));
  it("A harmonic minor has augmented III and major V", () => expect(names(9, "menor-harmonica")).toEqual(["Am", "Bdim", "C+", "Dm", "E", "F", "G#dim"]));
});
