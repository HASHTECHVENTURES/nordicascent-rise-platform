
# Add Overlay/Tooltip on Pipeline Stage Click

## What Changes
When a user clicks on a pipeline stage in the progress bar, a small overlay popup will appear showing the stage's purpose/description. The overlay will also contain a button/link to navigate to that stage's page. This gives candidates context about each stage before navigating.

## How It Works
1. Clicking a pipeline stage icon shows a popover overlay below/above the icon
2. The overlay displays: stage name, a short description of what that stage is for, and a "Go to [Stage]" link
3. Clicking the link navigates to the stage page
4. Clicking outside the overlay closes it

## Stage Descriptions
Each stage will have a brief purpose description:
- **My Journey** -- "Overview of your complete candidate journey and progress"
- **Preparation** -- "Document collection, CV review, and initial assessments"
- **Selection** -- "Interview process and employer matching"
- **Readiness** -- "Skills assessment and pre-departure preparation"
- **Internship** -- "On-the-job training and workplace integration"
- **Relocation** -- "Language courses, cultural integration, and settling in"
- **Onboarding** -- "Final workplace onboarding and long-term setup"
- **Follow-up** -- "Ongoing support and career development check-ins"

## Technical Details

### File: `src/components/candidate/PipelineProgress.tsx`
- Add a `description` field to each entry in the `pipelineStages` array
- Replace the `<Link>` wrapper with a clickable `<button>` that toggles a popover
- Use Radix `Popover` component (already available via `@/components/ui/popover`) to show the overlay
- Inside the popover content: show the stage name, description text, and a `<Link>` button to navigate to the page
- Track which stage popover is open via local state (`activePopover`)
- Clicking the same stage again or clicking outside closes the popover

### Imports to Add
- `Popover`, `PopoverTrigger`, `PopoverContent` from `@/components/ui/popover`
- `useNavigate` from `react-router-dom` (for the "Go to stage" button)
- `useState` from React

### UI of the Overlay
- Small card-style popover (max-width ~250px)
- Stage icon + name as header
- 1-2 line description
- "Open [Stage Name]" button that navigates to the page
