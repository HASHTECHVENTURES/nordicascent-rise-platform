
# Comprehensive Nordic Ascent Update Plan

## Overview
This plan addresses all 8 points you've outlined: pipeline renaming, mentoring integration, relocation module enhancement, company journey design improvements, public website restructuring, and logo asset management.

---

## Phase 1: Pipeline Renaming & Stage Updates

### 1.1 Rename "Trainee" to "Readiness"
Update all references to reflect the new terminology:

**Files to update:**
- `src/pages/candidate/Dashboard.tsx` - Pipeline stages array
- `src/pages/candidate/Trainee.tsx` - Rename to `Readiness.tsx`, update content
- `src/components/layouts/CandidateLayout.tsx` - Navigation item name
- `src/pages/employer/Dashboard.tsx` - Pipeline stages array
- `src/pages/Home.tsx` - Pipeline stages array
- `src/App.tsx` - Route paths (`/candidate/trainee` → `/candidate/readiness`)

### 1.2 Update Readiness Module Content
Expand the page to include:
- Social readiness testing
- Cultural readiness assessment
- Technical skills validation
- Clear indication that mentoring begins here

---

## Phase 2: Mentoring Section Integration

### 2.1 Add Mentoring to Sidebar Navigation
Add a dedicated "Mentoring" section to both portals:

**Candidate Layout (`CandidateLayout.tsx`):**
```
Navigation items:
- My Journey
- Preparation
- Selection
- Readiness (renamed)
- Internship
- Relocation
- Onboarding
- Follow-up
- [separator]
- Mentoring ← NEW
- Profile
- Messages
```

**Employer Layout (`EmployerLayout.tsx`):**
```
Navigation items:
- Pipeline Overview
- Candidates
- Roles
- Company Profile
- [separator]
- Mentoring ← NEW
- Messages
- Analytics
```

### 2.2 Create Mentoring Pages
**New files to create:**
- `src/pages/candidate/Mentoring.tsx` - Candidate view of mentoring sessions, mentor info, schedule
- `src/pages/employer/Mentoring.tsx` - Company mentor assignment, candidate mentees overview

### 2.3 Update Routes
Add routes in `App.tsx`:
- `/candidate/mentoring`
- `/employer/mentoring`

---

## Phase 3: Relocation Module Enhancement

### 3.1 Update Relocation Page (`src/pages/candidate/Relocation.tsx`)
Add new tabs/sections:
- **Language Courses** - Track language learning progress, scheduled sessions
- **Cultural Preparation** - Work culture understanding, society integration content

Update delivery method indicators:
- Digital learning modules
- Scheduled sessions with relocation team

### 3.2 Suggested Tab Structure
```
Tabs:
- Visa & Work Permit (existing)
- Housing (existing)
- Language Courses ← NEW
- Cultural Preparation ← NEW
- City Guides (existing)
- Resources (existing)
```

---

## Phase 4: Company Journey Design Improvements

### 4.1 Redesign Employer Dashboard (`src/pages/employer/Dashboard.tsx`)

**Current issues:**
- Too crowded
- Pipeline stages not displayed at top like candidate journey
- Bottleneck view takes too much space

**Proposed changes:**

1. **Pipeline at top** - Horizontal pipeline visualization matching candidate journey style
2. **Compact bottleneck indicator** - Single-line summary instead of full card:
   ```
   ⚠️ Bottlenecks: Selection (5) | High volume in Selection stage
   ```
3. **Cleaner card layout** - Reduce information density
4. **Remove redundant sections** - Consolidate similar information

**New layout structure:**
```
┌────────────────────────────────────────────────────┐
│ Pipeline Progress (horizontal stages at top)       │
├────────────────────────────────────────────────────┤
│ ⚠️ Bottleneck: Selection (5 candidates)           │ ← Single line
├────────────────────────────────────────────────────┤
│ Stats Cards (4 columns)                            │
├────────────────────────────────────────────────────┤
│ Action Required (compact list)                     │
└────────────────────────────────────────────────────┘
```

---

## Phase 5: Public Website Restructuring

### 5.1 Header/Navigation Updates (`PublicLayout.tsx`)

**Changes:**
1. **Remove "Home" from navigation** - Logo serves as home link
2. **Rename "Login" to "Login / Sign in"** button
3. **Rename "Services" to "Platform"** in navigation and route

**Updated navigation:**
```
[Logo] .......................... Platform | About | Insight | Contact | [Login / Sign in] [Book Demo]
```

### 5.2 Homepage Transformation (`Home.tsx`)

**Current:** Technical pipeline-focused content
**Goal:** Marketing/Brand Landing Page

**Proposed structure:**
```
1. Hero Section
   - Inspiring headline (less technical)
   - Emotional value proposition
   - Strong CTAs

2. Trust Indicators
   - Company logos / statistics
   - Key differentiators

3. Value Propositions
   - For Companies (high-level benefits)
   - For Candidates (high-level benefits)

4. Brief Pipeline Mention
   - Simple "Our Process" section
   - Link to Platform page for details

5. Testimonials/Social Proof (placeholder)

6. CTA Section
```

**Move to Platform page:**
- Detailed 7-stage pipeline breakdown
- Technical process descriptions
- FAQs about implementation

### 5.3 Services → Platform Page (`Services.tsx`)

Rename and restructure to include:
- Detailed 7-stage pipeline (moved from homepage)
- Platform capabilities
- Integration details
- Technical FAQs

### 5.4 About Page (`About.tsx`)

**Minor adjustments:**
- Add "Careers" / job openings section below the Team section
- Keep existing structure mostly intact

### 5.5 Careers → Insight Page

**Rename route and page:**
- `/careers` → `/insight`
- Page becomes philosophical with short articles

**New `Insight.tsx` structure:**
```
1. Hero - Philosophical messaging about mobility, culture, growth
2. Featured Articles (placeholder content)
   - Short thought leadership pieces
   - Industry insights
3. Newsletter signup (optional)
```

**Job listings:** Move to About page (below Team section)

### 5.6 Contact Page Updates (`Contact.tsx`)

**Changes:**
1. Add email field to contact form (already has email, ensure it's prominent)
2. **Remove "Get in Touch" section** (the bottom cards section)
3. Keep the two main forms (Book Demo, Send Message)

---

## Phase 6: Logo Asset Management

### 6.1 Save Bridge Logo
Copy the new bridge-only logo to assets:
- `user-uploads://bro_3.png` → `src/assets/nordic-bridge-icon.png`

This provides:
- Full logo: `nordic-ascent-logo.png` (text + bridge)
- Icon only: `nordic-bridge-icon.png` (bridge element for favicons, compact uses)

---

## Technical Implementation Summary

### Files to Create
| File | Purpose |
|------|---------|
| `src/pages/candidate/Readiness.tsx` | Renamed from Trainee with expanded content |
| `src/pages/candidate/Mentoring.tsx` | Candidate mentoring view |
| `src/pages/employer/Mentoring.tsx` | Employer mentoring management |
| `src/pages/Insight.tsx` | Philosophical articles page (replaces Careers for articles) |
| `src/assets/nordic-bridge-icon.png` | Bridge icon asset |

### Files to Modify
| File | Changes |
|------|---------|
| `src/App.tsx` | Update routes (readiness, mentoring, platform, insight) |
| `src/components/layouts/CandidateLayout.tsx` | Add Mentoring nav, rename Trainee→Readiness |
| `src/components/layouts/EmployerLayout.tsx` | Add Mentoring nav |
| `src/components/layouts/PublicLayout.tsx` | Update nav (remove Home, rename Services→Platform, Login→Login/Sign in) |
| `src/pages/Home.tsx` | Transform to marketing page |
| `src/pages/Services.tsx` | Rename to Platform, add pipeline details |
| `src/pages/About.tsx` | Add careers/jobs section below team |
| `src/pages/Careers.tsx` | Repurpose or keep for job listings only |
| `src/pages/Contact.tsx` | Remove "Get in Touch" section |
| `src/pages/candidate/Dashboard.tsx` | Rename Trainee→Readiness in stages |
| `src/pages/candidate/Relocation.tsx` | Add Language & Cultural tabs |
| `src/pages/employer/Dashboard.tsx` | Redesign with pipeline at top, compact bottleneck |

### Files to Delete
| File | Reason |
|------|--------|
| `src/pages/candidate/Trainee.tsx` | Replaced by Readiness.tsx |

---

## Implementation Order

1. **Phase 1** - Pipeline renaming (foundation for other changes)
2. **Phase 6** - Logo asset (quick, no dependencies)
3. **Phase 2** - Mentoring integration
4. **Phase 3** - Relocation enhancement
5. **Phase 4** - Company journey redesign
6. **Phase 5** - Public website restructuring
