# FK Marble brand guidelines

These rules keep the website, print pieces, and later product photography looking like one showroom.

## Logo variations

| File | Use |
| --- | --- |
| `public/images/brand/fk-marble-logo-dark.svg` | Full lockup on cream, white, and light photography. Charcoal lettering, gold linework. |
| `public/images/brand/fk-marble-logo-light.svg` | Full lockup on charcoal and dark photography. White lettering, gold linework. |
| `public/images/brand/fk-marble-icon.svg` | FK monogram only, for compact spaces on light backgrounds. |
| `public/images/brand/favicon.svg` | Browser tab icon. Charcoal tile with a gold FK monogram. |

The full lockup contains the FK monogram, **FK MARBLE**, and **STONE & SURFACES**. The icon contains only the monogram.

In the interface, use `BrandLogo` from `src/components/common/BrandLogo.tsx`:

- `variant="dark"` on light surfaces
- `variant="light"` on charcoal surfaces
- `size="sm" | "md" | "lg"` (180px, 260px, and 340px wide, shrinking to the container)
- `showTagline={false}` when the vertical space only fits the monogram and wordmark

## Logo usage

- Keep the clear space around the lockup at least the height of the gold monogram frame.
- Do not recolor the gold (`#B18A58`) or redraw the letters.
- Do not place the dark lockup on a dark photograph, or the light lockup on a cream background.
- Do not stretch the artwork. Scale it with the SVG viewBox.
- Do not add shadows, outlines, or a container behind the transparent lockup.

## Color palette

| Token | Hex | Role |
| --- | --- | --- |
| `--color-primary` | `#24231F` | Charcoal. Headings, primary buttons, wordmark on light backgrounds. |
| `--color-accent` | `#B18A58` | Gold. Rules, eyebrows, accent buttons, focus rings. |
| `--color-background` | `#F7F5F0` | Page background. Warm limestone. |
| `--color-surface` | `#FFFFFF` | Cards and panels. |
| `--color-muted` | `#F1EDE6` | Quiet surface behind secondary content. |
| `--color-muted-foreground` | `#77766F` | Secondary text. |
| `--color-border` | `#E7E2D9` | Hairline borders and dividers. |

Tailwind utilities map to these tokens: `bg-background`, `bg-surface`, `bg-primary`, `text-accent`, `text-muted-foreground`, `border-border`.

The public site uses the cream palette. A `.dark` class is available for a later theme toggle. The operating system theme does not swap the page colors.

## Typography

| Role | Family | Weight |
| --- | --- | --- |
| Headings | Playfair Display | 500, 600 |
| Body, buttons, navigation | DM Sans | 400, 500, 600 |

Use `font-heading` for titles and `font-sans` for everything else. Heading sizes are set in `src/app/globals.css` and scale with the viewport. Body copy uses a relaxed line height. Eyebrows are uppercase DM Sans with wide letter spacing, in gold.

## Spacing, radius, and breakpoints

Spacing follows Tailwind’s 4px scale. A full section uses the `section` spacing token (`5rem`).

| Radius | Size | Use |
| --- | --- | --- |
| `sm` | 4px | Small controls |
| `md` | 6px | Buttons |
| `lg` | 8px | Cards |

Breakpoints stay on the Tailwind defaults:

| Name | Width |
| --- | --- |
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

## Buttons

Apply `btn` together with one variant:

- `btn btn-primary` — charcoal fill, cream label
- `btn btn-accent` — gold fill, charcoal label
- `btn btn-outline` — transparent fill, stone border, gold border on hover

Labels are uppercase with wide tracking. Do not mix these classes with a second filled background.

## Backgrounds

- Default page background is `#F7F5F0`.
- Cards sit on `#FFFFFF` with a `#E7E2D9` border. Use the `card` class.
- Charcoal (`#24231F`) is for bands that need the light logo, not for the whole page.

## Category images

Temporary artwork lives in `public/images/categories/`. Each category has its own pattern. Do not reuse one file for every category.

| Category | File |
| --- | --- |
| Tiles | `tiles-placeholder.svg` |
| Marble | `marble-placeholder.svg` |
| Granite | `granite-placeholder.svg` |
| Kota Stone | `kota-stone-placeholder.svg` |
| Sandstone | `sandstone-placeholder.svg` |
| Other Natural Stone | `natural-stone-placeholder.svg` |

Paths are also stored on each entry in `src/config/site.ts`. Replace a placeholder with showroom photography from the admin dashboard later. Photography should be natural light, neutral, and free of competing logos. Keep the same crop ratio, 4:3, so cards do not jump.
