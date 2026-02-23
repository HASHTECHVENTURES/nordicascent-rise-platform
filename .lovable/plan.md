

# Fix: Logo Background to Blue in Sidebar

## What's Changing
The logo section at the top of the sidebar currently has a white background. It will be changed to use a Nordic Deep Blue (#1C3A5F) background, making the logo area stand out with the brand's primary color.

## Changes Needed

### File: `src/components/layouts/CandidateLayout.tsx`
- Change the logo container `div` background from white to `bg-[#1C3A5F]` (Nordic Deep Blue)
- Update the CSS filter on the logo image to render it white (so it's visible on the dark background)
- Apply the same change for both expanded and collapsed sidebar states

### File: `src/components/layouts/EmployerLayout.tsx`
- Same blue background treatment for the employer sidebar logo area

### File: `src/components/layouts/AdminLayout.tsx`
- Same blue background treatment for the admin sidebar logo area

## Technical Details
- Logo container div gets: `bg-[#1C3A5F]` class added
- Logo image filter changes to: `brightness(0) invert(1)` to make logo white on blue background
- Border bottom styling may be adjusted for contrast
- All three portal layouts updated for consistency
