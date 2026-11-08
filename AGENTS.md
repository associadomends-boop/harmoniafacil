<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Resolve stored chords through `resolveChord`: diatonic items are degrees and off-scale items are root-relative semitone offsets; key/scale changes only rename them, preserving stored values.
- Keep cifra parsing and its sanitized song projection separate from the import dialog; reuse SectionChords for repetition/cue rendering in preview, repertory and stage to keep persisted and displayed structures consistent.
- Browser storage (`harmonia-prefs`, `harmonia-setlist`) is read only in useEffect and validated with zod in `src/lib/setlist.ts`/`prefs.ts`, so SSR and corrupted data never break a page.
