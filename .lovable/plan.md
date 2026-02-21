

# Hero Section Redesign -- Full-Width Image with Text Overlay

## What's Changing
The current hero uses a two-column grid layout (text left, image right). Based on your reference, we'll switch to a **full-width background image** with all content (headline, subtitle, CTAs) overlaid directly on top of the image, creating a more immersive, bold landing page feel.

## Design Approach

The hero will become a full-viewport-height section where:
- The existing Unsplash image becomes a **full-bleed background** covering the entire section
- A dark gradient overlay ensures text readability
- All existing content (tagline, headline, subtitle, buttons) is positioned **on top of the image**, aligned left
- The text colors switch to white/light for contrast against the dark overlay

## Layout Structure

```text
+----------------------------------------------------------+
|  [Full-width background image]                            |
|  [Dark gradient overlay from left]                        |
|                                                           |
|    Nordic Talent Mobility (small label)                   |
|                                                           |
|    Building Bridges Between                               |
|    Talent & Opportunity  (gradient highlight)             |
|                                                           |
|    Connecting exceptional engineers...                    |
|                                                           |
|    [Start Your Journey ->]  [Explore Our Platform]        |
|                                                           |
+----------------------------------------------------------+
```

## Content Preserved (No Changes)
- "Nordic Talent Mobility" tagline
- "Building Bridges Between Talent & Opportunity" headline with gradient
- Subtitle paragraph text
- Both CTA buttons ("Start Your Journey" and "Explore Our Platform")

## Technical Details

### File Modified
- `src/components/home/HeroSection.tsx`

### Key Changes
1. Remove the two-column grid layout
2. Make the image a CSS background (or absolute-positioned img with `object-cover`) filling the full section
3. Add a dark gradient overlay (`bg-gradient-to-r from-black/70 via-black/50 to-transparent`)
4. Set section height to roughly viewport height (`min-h-[85vh]`)
5. Switch text colors to white (`text-white`, `text-white/80`) for readability
6. Keep the gradient text effect on "Talent & Opportunity"
7. Adjust button styles for light-on-dark contrast (white outline variant, bright primary fill)
8. Remove the decorative floating accent shapes (no longer needed with full-bleed image)

