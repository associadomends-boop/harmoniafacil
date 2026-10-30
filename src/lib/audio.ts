let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export function playChord(midi: number[], when = 0, duration = 1.2) {
  const ac = getCtx();
  const start = ac.currentTime + when;
  const master = ac.createGain();
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  master.connect(ac.destination);
  midi.forEach((m) => {
    ["triangle", "sine"].forEach((type, i) => {
      const o = ac.createOscillator();
      o.type = type as OscillatorType;
      o.frequency.value = freq(m) * (i ? 2 : 1);
      const g = ac.createGain();
      g.gain.value = i ? 0.08 : 0.25;
      o.connect(g).connect(master);
      o.start(start);
      o.stop(start + duration + 0.05);
    });
  });
}

export function playSequence(chords: number[][], step = 1.1) {
  chords.forEach((c, i) => playChord(c, i * step, step * 1.1));
  return chords.length * step * 1000;
}
