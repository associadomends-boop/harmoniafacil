import { cn } from "@/lib/utils";
import { KEYS, type Key } from "@/lib/harmony";
import { SCALES, type ScaleDef } from "@/lib/scales";

export function ScalePicker({ value, onChange, scales = SCALES, className, label = "Escala" }: { value: string; onChange: (id: string) => void; scales?: ScaleDef[]; className?: string; label?: string }) {
  const cats = [...new Set(scales.map((s) => s.category))];
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}
      className={cn("w-full rounded-xl border-2 border-border bg-secondary px-3 py-3 font-display text-lg font-extrabold", className)}>
      {cats.map((c) => (
        <optgroup key={c} label={c}>
          {scales.filter((s) => s.category === c).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </optgroup>
      ))}
    </select>
  );
}

export function KeyPicker({ value, onChange, variant = "grid", className }: { value: Key; onChange: (k: Key) => void; variant?: "grid" | "select"; className?: string }) {
  if (variant === "select")
    return (
      <select value={value} onChange={(e) => onChange(e.target.value as Key)} aria-label="Tom" className={className}>
        {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
    );
  return (
    <div className={cn("grid grid-cols-6 gap-2 sm:grid-cols-12", className)}>
      {KEYS.map((k) => (
        <button key={k} type="button" onClick={() => onChange(k)} aria-pressed={k === value}
          className={cn("rounded-xl py-3 font-display text-xl font-extrabold transition-colors sm:text-2xl", k === value ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent")}>
          {k}
        </button>
      ))}
    </div>
  );
}
