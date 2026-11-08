import { KEYS, toSharpKey, type Key } from "./harmony";
import { scaleById } from "./scales";

export interface Prefs {
  key: Key;
  scale: string;
}

const STORAGE = "harmonia-prefs";
export const DEFAULT_PREFS: Prefs = { key: "C", scale: "jonio" };

/** Browser only: call inside useEffect. */
export function loadPrefs(): Prefs {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE) || "{}");
    return {
      key: KEYS.includes(toSharpKey(raw.key)) ? toSharpKey(raw.key) : DEFAULT_PREFS.key,
      scale: typeof raw.scale === "string" && scaleById(raw.scale) ? raw.scale : DEFAULT_PREFS.scale,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(p: Partial<Prefs>) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify({ ...loadPrefs(), ...p }));
  } catch {
    /* storage full or blocked: ignore */
  }
}
