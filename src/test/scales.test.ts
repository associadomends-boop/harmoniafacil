import { describe, expect, it } from "vitest";
import { SCALES, spell, steps, intervals } from "@/lib/scales";

const s = (id: string) => SCALES.find((x) => x.id === id)!;

describe("scales", () => {
  it("C major", () => expect(spell(0, s("jonio")).notes).toEqual(["C", "D", "E", "F", "G", "A", "B"]));
  it("A# minor natural spells as Bb minor", () => expect(spell(10, s("menor-natural"))).toEqual({ root: "Bb", notes: ["Bb", "C", "Db", "Eb", "F", "Gb", "Ab"] }));
  it("G# minor stays sharp", () => expect(spell(8, s("eolio")).notes).toEqual(["G#", "A#", "B", "C#", "D#", "E", "F#"]));
  it("A harmonic minor has G#", () => expect(spell(9, s("menor-harmonica")).notes).toEqual(["A", "B", "C", "D", "E", "F", "G#"]));
  it("A blues minor", () => expect(spell(9, s("blues-menor")).notes).toEqual(["A", "C", "D", "Eb", "E", "G"]));
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
