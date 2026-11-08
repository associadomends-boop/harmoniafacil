import { useState } from "react";
import { resolveChord, sectionRuns, type Section, type Song } from "@/lib/setlist";
import { cn } from "@/lib/utils";
import { FN_CLASSES } from "@/components/harmony/fn-styles";
import { Button } from "@/components/ui/button";

export function SectionChords({ song, section, stage = false }: { song: Pick<Song, "key" | "scale">; section: Section; stage?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      {section.same && <Button variant="ghost" className={cn("h-auto justify-start whitespace-normal px-0 py-2 font-medium text-muted-foreground", stage ? "text-xl" : "text-sm")} aria-expanded={expanded}
        onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }} onKeyDown={(e) => e.stopPropagation()}>↺ mesma sequência</Button>}
      {(!section.same || expanded) && sectionRuns(section).map((run, i) => (
        <div key={i}>
          <div className={cn("flex flex-wrap items-baseline gap-y-1", stage ? "gap-x-5" : "gap-x-2")}>
            {run.prog.map((item, j) => {
              const chord = resolveChord(song, item);
              return <span key={j} className={cn("break-all font-display font-extrabold", stage ? "text-6xl leading-tight sm:text-7xl" : "text-3xl", chord.fn ? FN_CLASSES[chord.fn].text : "text-muted-foreground")}>{chord.name}</span>;
            })}
            {run.reps > 1 && <span className={cn("font-bold text-muted-foreground", stage ? "text-xl" : "text-sm")}>×{run.reps}</span>}
          </div>
          {run.cue && <p className={cn("break-words italic text-muted-foreground", stage ? "text-xl" : "text-sm")}>&quot;{run.cue}&quot;</p>}
        </div>
      ))}
    </>
  );
}