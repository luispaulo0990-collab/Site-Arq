# Project Rules & Aesthetic Guidelines: Taste Skill (Anti-Slop Frontend)

This project strictly follows the **Taste Skill** (`design-taste-frontend` v2) design engineering framework from [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill).

---

## 1. Design Read (Mandatory First Step)
Before generating any frontend code or component, always output a one-line Design Read:
> **"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system or aesthetic family>."**

And configure the Three Dials:
* `DESIGN_VARIANCE: 7-9` (Asymmetry, deliberate composition, never cookie-cutter)
* `MOTION_INTENSITY: 6-7` (Spring physics, entrance reveals, hover depth, reduced-motion compliant)
* `VISUAL_DENSITY: 3-4` (Spacious, breathing room, editorial hierarchy)

---

## 2. Core Aesthetic Directives & Anti-Slop Rules

### Typography
- **No generic Inter as default.** Prefer **Geist**, **Outfit**, **Cabinet Grotesk**, **Satoshi**, or **PP Neue Montreal**.
- **Serif Discipline:** Never use `Fraunces` or `Instrument_Serif` as defaults. Serif is only for deliberate editorial/luxury moments.
- **Emphasis Rule:** Italic or bold of the *same font family*, never mixed font injection inside headlines.
- **Italic Clearance:** Always add `leading-[1.1]` and `pb-1` when italic display fonts contain descenders (`g, j, p, q, y`).

### Color & Palette
- **The Lila Rule:** Strict ban on generic AI purple gradients, blue glows, or cyan button glows.
- **Palette Consistency:** Single accent color (saturation < 80%) with neutral bases (Zinc, Slate, Stone, Off-Black `#0c0c0c` / `#121212`). Lock color scheme across all sections.

### Layout & Composition
- **Anti-Center Bias:** Avoid centering the hero when variance > 4. Use split-screen (50/50), asymmetric whitespace, or left-aligned typography.
- **Hero Viewport Discipline:** Hero MUST fit in the initial viewport (`min-h-[100dvh]`), headline max 2 lines desktop, subtext max 20 words, max 4 text elements total.
- **Eyebrow Restraint:** Maximum 1 eyebrow per 3 sections.
- **Split-Header Ban:** Do not use "big left headline + floating right paragraph" repeatedly. Stack vertically or anchor to content.
- **Bento Grids:** Exact cell counts (no empty gap filler), varied background tints/images.
- **Zigzag Ban:** Max 2 consecutive alternating left-image/right-text rows. Break rhythm with full-bleed, carousel, or bento.

### Assets & Visuals
- **No div-based fake screenshots.** Use real photography, generated images, or actual functional component previews.
- **Logo walls:** Clean SVG marks only, no category labels beneath logos.
- **Buttons:** Single-line label desktop, high contrast (WCAG AA), active tactile push (`scale-[0.98]`).
- **Typography Purity:** Hard ban on em-dashes (`—`). Use standard hyphens (`-`).
