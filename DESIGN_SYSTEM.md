# Design System Specification — Clean Minimalist Turf

## 1. Aesthetic Philosophy & Visual Direction

The platform's visual identity embodies **clarity, premium minimalism, high contrast, and athletic energy**.
Inspired by the clean product design of Apple, Stripe, and Linear, it rejects generic AI design clichés:
- **NO** artificial purple glow or glowing text.
- **NO** excessive or muddy multi-color gradients.
- **NO** heavy glassmorphism or low-contrast blurs.
- **NO** random decorative emojis or oversized unreadable display titles.
- **YES** pure crisp white backgrounds, subtle border dividers, precise typography, refined card shadows, and purposeful emerald green turf accents.

---

## 2. Color Palette

### A. Core Neutral Surfaces (White-Based)
| Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Pure White** | `#FFFFFF` | Primary page background, main card backgrounds, clean modal sheets |
| **Surface 50** | `#F8FAFC` | Subtle secondary sections, table headers, inactive slot chips |
| **Surface 100** | `#F1F5F9` | Hover states, card border dividers, badge backdrops |
| **Surface 200** | `#E2E8F0` | Structural borders, hairline rules, input borders |
| **Surface 400** | `#94A3B8` | Placeholder text, disabled labels, icon strokes |
| **Surface 600** | `#475569` | Secondary body text, metadata captions |
| **Surface 800** | `#1E293B` | Section subheadings, bold navigation links |
| **Surface 900** | `#0F172A` | Primary high-contrast headings, main body text |

### B. Brand Pitch Emerald (Athletic Energy)
| Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Brand 50** | `#F0FDF4` | Success badges, customer's confirmed slot tint |
| **Brand 100** | `#DCFCE7` | Hover chips, tag backgrounds |
| **Brand 600** | `#16A34A` | Interactive green accents, available price tags |
| **Brand 700** | `#15803D` | Primary action buttons, brand logo mark, active tabs |
| **Brand 900** | `#14532D` | Dark high-contrast brand text |

### C. Booking Slot Status Colors (Mandatory Specification)
- **White (`#FFFFFF` on `#E2E8F0` border):** Available slot (clickable, displays price).
- **Red (`#DC2626` / `#FEE2E2` tint):** Booked / Unavailable slot (disabled, clear label).
- **Green (`#16A34A` / `#DCFCE7` tint):** Signed-in customer's confirmed booking.
- **Amber (`#D97706` / `#FEF3C7` tint):** Under Review / Pending approval (slot reserved).

---

## 3. Typography

- **Primary Font Family:** `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Scale:**
  - `Hero Title`: `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-surface-900`
  - `Section Heading (H2)`: `text-2xl sm:text-3xl font-bold tracking-tight text-surface-900`
  - `Card Heading (H3)`: `text-lg sm:text-xl font-semibold text-surface-900`
  - `Body Standard`: `text-base text-surface-600 leading-relaxed`
  - `Caption & Micro-copy`: `text-xs sm:text-sm font-medium text-surface-500`
  - `Price Display`: `font-bold text-brand-700 tracking-tight`

---

## 4. Elevation, Borders & Shadows

- **Borders:** Crisp `border border-surface-200` for cards, inputs, and dividers.
- **Card Shadows:**
  - `shadow-subtle`: `0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)`
  - `shadow-card`: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)`
  - `shadow-floating`: Used exclusively for active modals and dropdown menus.
- **Border Radius:**
  - Buttons & Inputs: `rounded-lg` (8px)
  - Cards & Containers: `rounded-xl` (12px)
  - Modals & Hero Banners: `rounded-2xl` (16px)
  - Badges & Status Pills: `rounded-full`

---

## 5. UI Components Guidelines

### Buttons
- **Primary:** Solid `#15803D`, white text, subtle hover lift, focus-ring emerald.
- **Secondary:** White background, `#E2E8F0` border, `#0F172A` text, hover: `#F8FAFC`.
- **Destructive:** Red tone `#DC2626`, hover: `#B91C1C` for booking cancellation or reject.
- **Ghost:** Transparent background with subtle surface hover.

### Form Inputs
- Background: `#FFFFFF`.
- Border: `1px solid #CBD5E1`, transition to `2px solid #15803D` on focus with zero jarring layout shifts.
- Text: Clear 16px font on mobile to prevent iOS Safari auto-zooming.

### Modals & Dialogs
- Backdrop: `rgba(15, 23, 42, 0.45)` with subtle blur (`backdrop-blur-sm`).
- Modal card: Solid white `#FFFFFF`, `rounded-2xl`, responsive padding (`p-6` to `p-8`).
