import { describe, expect, it } from "vitest";
import { buildSong, compressRuns, detectKey, parseChordLine, parseCifra } from "@/lib/cifra-import";
import { importedSong } from "@/lib/cifra-song";
import { parseBackup, resolveChord } from "@/lib/setlist";

const names = (text: string) => (parseChordLine(text) ?? []);
export const cifra = `[Intro] G D Em C
[Primeira Parte]
G D Em C
Caminho de terra vermelha
G D Em C
Caminho de terra vermelha
[Refrão]
C G D Em
Volta pra casa hoje
C G D
Deixa
[Segunda Parte]
G D Em C
Cartas que nunca mandei
G D Em C
Cartas que nunca mandei
[Refrão]
C G D Em
Volta pra casa hoje
[Ponte]
Am D Am D
Quando o dia acabar e a noite chegar
G
Eu espero aqui`;

describe("importação de cifras", () => {
  it.each([
    ["C G Am F C G Am F C G", [["C G Am F", 2]]],
    ["C C G G Am", [["C C G G Am", 1]]],
    ["C C G C C G", [["C C G", 2]]],
    ["C G C G C G C G", [["C G", 4]]],
    ["C F G Am F G Am F G", [["C", 1], ["F G Am", 2]]],
    ["C G D Em C G D", [["C G D Em", 1]]],
  ])("compressRuns preserva a sequência %s", (text, expected) => {
    expect(compressRuns(names(text as string)).map((r) => [r.loop.map((c) => c.name).join(" "), r.reps])).toEqual(expected);
  });
  it.each(["E a gente se perdeu", "A vida é bela", "e|---0---2---|", "Uma frase sem acordes"])("ignora letra e tablatura: %s", (line) => expect(parseChordLine(line)).toBeNull());
  it("aceita barras entre acordes", () => expect(parseChordLine("| C | G | Am | F |")).toHaveLength(4));
  it("preserva partes, pistas curtas, mudanças e tom G maior", () => {
    const parsed = parseCifra(cifra);
    const blocks = buildSong(parsed.sections);
    expect(blocks.map((b) => ({ label: b.label, same: b.same, runs: b.runs.map((r) => [r.loop.map((c) => c.name).join(" "), r.reps]), cues: b.cues }))).toEqual([
      { label: "Intro", same: false, runs: [["G D Em C", 1]], cues: [""] },
      { label: "Primeira Parte", same: true, runs: [["G D Em C", 2]], cues: ["Caminho de terra vermelha"] },
      { label: "Refrão", same: false, runs: [["C G D Em", 1]], cues: ["Volta pra casa hoje"] },
      { label: "Segunda Parte", same: false, runs: [["G D Em C", 2]], cues: ["Cartas que nunca mandei"] },
      { label: "Refrão", same: false, runs: [["C G D Em", 1]], cues: ["Volta pra casa hoje"] },
      { label: "Ponte", same: false, runs: [["Am D", 2], ["G", 1]], cues: ["Quando o dia acabar e", "Eu espero aqui"] },
    ]);
    expect(detectKey(parsed.sections.flatMap((s) => s.chords))).toMatchObject({ root: 7, minor: false });
  });
  it("usa Tom: como dica e reconhece partes inline", () => {
    const parsed = parseCifra("Tom: Am\nIntro: Am Em F C");
    expect(parsed.hint).toEqual({ root: 9, minor: true });
    expect(parsed.sections[0]?.label).toBe("Intro");
    expect(detectKey(parsed.sections.flatMap((s) => s.chords), parsed.hint)).toMatchObject({ root: 9, minor: true });
  });
  it("sem marcações dá nomes Parte 1, Parte 2", () => expect(buildSong(parseCifra("C G C G\nAm F Am F").sections).map((b) => b.label)).toEqual(["Parte 1", "Parte 2"]));
  it("guarda apenas acordes e pistas de até cinco palavras/40 caracteres", () => {
    const song = importedSong("Teste", "G", "jonio", buildSong(parseCifra(cifra).sections));
    const json = JSON.stringify(song);
    expect(json).not.toContain("Quando o dia acabar e a noite chegar");
    expect(json).not.toContain('"chords"');
    expect(json).not.toContain('"text"');
    for (const section of song.sections) for (const mark of section.marks ?? []) {
      expect((mark.cue ?? "").length).toBeLessThanOrEqual(40);
      expect((mark.cue ?? "").split(/\s+/).length).toBeLessThanOrEqual(5);
    }
    expect(parseBackup(JSON.stringify([song]))).toEqual([song]);
  });
  it("fora do campo ignora baixo e conserva sufixo, transpondo sem mudar offset", () => {
    const song = importedSong("Fora", "G", "jonio", buildSong(parseCifra("Intro: G F#m7/A").sections));
    expect(song.sections[0]?.prog).toEqual([0, { off: 11, suf: "m7" }]);
    expect(resolveChord({ key: "A", scale: "jonio" }, { off: 11, suf: "m7" })).toEqual({ name: "G#m7", fn: null });
    expect(resolveChord({ key: "F", scale: "jonio" }, { off: 1, suf: "7" })).toEqual({ name: "Gb7", fn: null });
  });
});