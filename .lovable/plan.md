

# Add "My Journey" Overview to Pipeline Progress Bar

## What Changes
Add an "i" (info/overview) icon as the first item in the candidate pipeline progress bar, linking to `/candidate/dashboard`. This gives candidates a quick way to return to their journey overview directly from the pipeline.

## File to Update

### `src/components/candidate/PipelineProgress.tsx`
- Add an `Info` (or `LayoutDashboard`) icon as a new entry at the start of the pipeline stages array
- This entry links to `/candidate/dashboard` with the label "My Journey" (or "Overview")
- It will not have a status like the other stages -- it acts as a persistent anchor point
- It will be visually distinct (e.g., uses `primary` styling or a neutral style) so it doesn't look like a pipeline "stage" but rather a navigation shortcut
- A connector line will link it to the first real stage (Preparation)

## Visual Result
The pipeline bar will look like:

```text
[i] --- [Preparation] --- [Selection] --- [Readiness] --- [Internship] --- [Relocation] --- [Onboarding] --- [Follow-up]
```

Where `[i]` is an info/overview icon linking to `/candidate/dashboard`.

## Technical Details
- Import `Info` (or `LayoutDashboard`) icon from `lucide-react`
- Add a new entry at position 0 in the `pipelineStages` array with `status: "info"` and `href: "/candidate/dashboard"`
- Style the "info" status with a distinct but subtle appearance (e.g., `bg-primary/20 border-primary text-primary`) so it stands apart from the stage progression colors
- Active/current-page highlighting (`ring-2`) will apply when on `/candidate/dashboard`

