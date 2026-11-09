# Design System Specification — Maya Sports Centre

## 1. Visual Direction & Aesthetic Integrity

The platform's visual design is crafted around **clarity, premium minimalism, high contrast, and athletic authenticity**.
Designed for maximum ease of use on both desktop and mobile devices.

### Explicitly Excluded:
- **NO** artificial purple glow, neon streaks, or glowing text.
- **NO** heavy or muddy multi-color gradients.
- **NO** low-contrast glassmorphism or blurred surfaces.
- **NO** random emojis or cluttered shapes.
- **NO** exaggerated marketing claims or fake graphics.

### Visual Foundations:
- Crisp white (`#FFFFFF`) and clean neutral surfaces (`#F8FAFC`).
- Slate gray structural dividers (`#E2E8F0`).
- Refined deep athletic emerald accents (`#047857` / `#065F46`).
- High-contrast typography (`Inter`, -apple-system, sans-serif).

---

## 2. Color Tokens

### A. Neutral Surfaces
- **Pure White (`#FFFFFF`):** Base canvas, card bodies, modal dialogs, and available slot buttons.
- **Surface 50 (`#F8FAFC`):** Table striping, secondary backgrounds, and subtle card backdrops.
- **Surface 100 (`#F1F5F9`):** Input fills, hover backdrops, and subtle pill tags.
- **Surface 200 (`#E2E8F0`):** Crisp structural borders and dividers.
- **Surface 500 (`#64748B`):** Secondary metadata text and icon strokes.
- **Surface 900 (`#0F172A`):** High-contrast headlines and dark section backgrounds.

### B. Brand Emerald
- **Brand 50 (`#ECFDF5`):** Success badges, positive alerts.
- **Brand 600 (`#059669`):** Interactive accents and price highlights.
- **Brand 700 (`#047857`):** Primary action buttons, brand logo marks.
- **Brand 800 (`#065F46`):** Active tabs, dark text accents.

### C. Mandatory Slot Status Palette
- **White (`#FFFFFF` on `#E2E8F0` border):** Available (displays price NPR 1,300 or NPR 1,500).
- **Red (`#DC2626` / `#FEE2E2` border):** Booked / Unavailable.
- **Green (`#059669` / `#ECFDF5` tint):** Current customer's confirmed booking.
- **Amber (`#D97706` / `#FEF3C7` tint):** Under Review / Pending verification.

---

## 3. Brand Logo Standards

- **Asset Path:** `/public/logo.png`
- **Component:** `src/components/common/Logo.tsx`
- **Rules:**
  - Preserves original proportions and aspect ratio (`h-10 w-auto object-contain`).
  - Never cropped or recolored.
  - Graceful typographic fallback if asset is loading or missing.
