

# Summary of All Planned Changes

## 1. Pipeline Hover Tooltips
When you hover over any stage in the candidate pipeline bar, a small tooltip appears showing what that stage is about (e.g., "Document collection, CV review, and initial assessments" for Preparation).

## 2. Pipeline Click-to-Navigate
Clicking a pipeline stage takes you directly to that page -- no popup or extra button needed. Just click and go.

## 3. Remove the Special "My Journey" Circle
The "My Journey" stage currently has a unique triple-ring design. This will be simplified to match all other stages -- same circle style, just colored blue to show it's the current/active stage.

## 4. Fix Broken "Continue to Trainee" Button
On the Selection page, the button says "Continue to Trainee" and links to a page that doesn't exist. This will be fixed to say "Continue to Readiness" and link to the correct page.

## Files Being Changed
- **PipelineProgress.tsx** -- tooltip on hover, direct navigation on click, simplified circle styles
- **Selection.tsx** -- fix the broken button link

## What Stays the Same
- The blue logo with white sidebar across all portals (already done)
- The pipeline color coding: green = completed, blue = current, gray = not started
- The connector lines between stages

