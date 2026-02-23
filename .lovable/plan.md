

# Logo Visibility Fix on Blue Backgrounds

## Problem
The logo currently uses the `logo-boost` CSS filter on dark blue backgrounds (header, footer, sidebars), making it hard to see. The Login page already solves this correctly using `brightness-0 invert` to render the logo white.

## Solution
Replace `logo-boost` with `brightness-0 invert` on all logo instances that sit on blue/dark backgrounds, matching the Login page approach.

## Files to Update

### 1. `src/components/layouts/PublicLayout.tsx`
- **Header logo** (line 30): Change `logo-boost` to `brightness-0 invert`
- **Footer logo** (line 87): Change `logo-boost` to `brightness-0 invert`

### 2. `src/components/layouts/CandidateLayout.tsx`
- **Sidebar logo expanded** (line 109): Change `logo-boost` to `brightness-0 invert`
- **Sidebar logo collapsed** (line 114): Change `logo-boost` to `brightness-0 invert`

### 3. `src/components/layouts/EmployerLayout.tsx`
- **Sidebar logo expanded** (line 61): Change `logo-boost` to `brightness-0 invert`
- **Sidebar logo collapsed** (line 66): Change `logo-boost` to `brightness-0 invert`

### 4. `src/components/layouts/AdminLayout.tsx`
- **Sidebar logo expanded** (line 65): Change `logo-boost` to `brightness-0 invert`
- **Sidebar logo collapsed** (line 74): Change `logo-boost` to `brightness-0 invert`

## Technical Details
- `brightness-0` makes the image fully black, then `invert` flips it to white
- This is the same approach already used on the Login page (line 72)
- No new CSS or dependencies needed

