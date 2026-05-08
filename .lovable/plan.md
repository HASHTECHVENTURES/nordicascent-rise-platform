## Make Entry Track / Fast Track a real feature

Treat the track as a per-candidate attribute that drives the pipeline, badges, and admin controls. UI prototype only — no backend; track lives in mock data + a lightweight client store so it can be changed at runtime.

### 1. Data model (mock)

In `src/data/mockData.ts`:

- Add `track: "entry" | "fast"` to each candidate.
- Add a shared `TRACK_META` export with display label, short description, and which stages apply:
  - `entry`: stages `["preparation","selection","readiness","activation","relocation","onboarding","followup"]`
  - `fast`: stages `["readiness","activation","relocation","onboarding","followup"]` (Preparation + Selection are not part of Fast Track)
- Seed roughly 70% Entry / 30% Fast across the candidate list.

### 2. Current candidate's track (prototype state)

Create `src/lib/track-store.ts` — a tiny `useSyncExternalStore`-based store with:
- `getTrack()` / `setTrack(t)` persisted in `localStorage` under `na.candidateTrack` (default `"entry"`).
- A `useTrack()` hook returning `[track, setTrack]`.

Used by candidate pages and the admin "Set track" action (admin updates the same key for the demo candidate).

### 3. Track-aware candidate pipeline

`src/components/candidate/PipelineProgress.tsx`:

- Read current track via `useTrack()`.
- Keep all 7 stage definitions, but for `fast`: render Preparation + Selection in a muted/dimmed style with a "Not in Fast Track" tooltip and disable their links.
- Active/completed stage logic stays the same; just the first two are skipped visually for Fast Track.
- Add a small **track badge** at the left edge of the bar: `Entry Track` or `Fast Track` chip (Nordic Deep Blue outline).

### 4. Candidate dashboard (My Journey)

`src/pages/candidate/Dashboard.tsx`:

- Show the track badge prominently next to the page title.
- Keep the "Entry Track vs. Fast Track — Step by step" explanation card (already added), but highlight the candidate's current track section.
- If track is `fast`, hide/grey-out Preparation and Selection summary tiles.

Also lock direct navigation to `/candidate/preparation` and `/candidate/selection` for Fast Track users — show a small "Not part of Fast Track" notice on those pages instead of the normal content.

### 5. Admin controls

`src/pages/admin/Candidates.tsx`:
- Add a **Track** column (badge) to the candidate table.
- Add a **Track** filter (All / Entry / Fast) next to existing filters.

`src/pages/admin/CandidateDetail.tsx`:
- Add a "Track" section with current value and a dropdown to switch between Entry Track / Fast Track. Switching updates mock data in memory (and, for the demo candidate id, the `track-store` so the candidate view reflects it live).
- Show the same track-aware pipeline preview using `AdminPipelineProgress` with the candidate's track.

`src/components/admin/AdminPipelineProgress.tsx`:
- Accept a `track` prop and dim Preparation + Selection when `track === "fast"`, mirroring the candidate component.

### 6. Employer view (light touch)

`src/pages/employer/Candidates.tsx`:
- Show the track as a badge next to each candidate name.
- Add a Track filter chip row (All / Entry / Fast).
No changes to employer pipeline logic.

### 7. Analytics

`src/pages/admin/Analytics.tsx`:
- Add a small "Candidates by track" KPI tile (Entry count / Fast count) computed from mock data. No new charts.

### 8. Copy & capitalization

- Confirm "Entry Track" / "Fast Track" capitalization remains consistent everywhere.
- Activation page still has no track-explanation text (already done).

### Out of scope

- No backend, no auth-based assignment, no migrations.
- No changes to stage content pages beyond the Fast-Track "not part of your track" notice on Preparation/Selection.
- No analytics drill-downs beyond the single KPI tile.

### Technical notes

- Track type lives in `src/data/mockData.ts` and is re-exported as `Track` for reuse.
- `track-store.ts` is a 30-line file; no new deps.
- Pipeline components share a small helper `isStageInTrack(stageId, track)` to avoid duplicating the skip rules.
