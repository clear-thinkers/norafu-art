# Redesign Plan — norafu-art

## Context

Nora Fu's bilingual (EN/ZH) art portfolio. ~40 static artworks with date, title,
description, tags, and an image. Three views: gallery, detail, about.
No auth, no backend, no dynamic data.

---

## Stack Assessment

### Why the original stack (CRA + React SPA) was a poor fit

| Problem | Detail |
|---------|--------|
| CRA is unmaintained | `react-scripts@5.0.1` last released 2022; known security warnings |
| SPA for static content | 207KB JS bundle to display static images; no real URLs per artwork |
| No image optimization | 44MB raw JPEGs, nothing converting or compressing them |
| No SEO | No per-artwork meta tags, no shareable `og:image`, no structured data |
| Broken back button | Scroll position manually tracked via `useRef`; state-based routing |

---

## Chosen Stack: Astro (static)

Astro is purpose-built for content-heavy, mostly-static, image-heavy sites.

| Concern | CRA/React SPA | Astro |
|---------|--------------|-------|
| Image optimization | None — raw JPEGs | Built-in `<Image>` → WebP + lazy load + srcset (Phase 2) |
| JS sent to browser | 207KB React runtime | ~0KB — no hydration for static pages |
| Shareable artwork URLs | No (state-based) | Yes — `/artwork/mushroom-cafe` |
| SEO / og:image per artwork | No | Yes — meta tags generated per page |
| Bilingual routing | Manual | i18n built-in (Phase 4) |
| Build tool | Webpack/CRA (dead) | Vite (fast, maintained) |
| GitHub Pages deploy | Works | First-class static adapter |

---

## Phase 1 — Astro Migration ✅ Complete

Replace CRA with Astro. Maintain all existing content and visual design.

```
src/
├── data/
│   └── artworkData.js          ← existing data, process.env.PUBLIC_URL removed
├── utils/
│   └── ageCalculation.js       ← moved from components/
├── styles/
│   └── global.css              ← merged from all component CSS files
├── layouts/
│   └── BaseLayout.astro        ← HTML shell, meta tags, font
├── components/
│   ├── Navbar.astro            ← static nav, year links instead of buttons
│   └── ArtCard.astro           ← artwork card (now a real <a> link)
└── pages/
    ├── index.astro             ← gallery (all years)
    ├── about.astro             ← about page
    ├── artwork/
    │   └── [id].astro          ← artwork detail (one static page per artwork)
    └── year/
        └── [year].astro        ← year-filtered gallery (one static page per year)
public/
├── images/                     ← moved from root /images/
├── favicon.ico
├── manifest.json               ← updated from CRA defaults
└── robots.txt
```

**Key improvements over the SPA:**
- Each artwork has a real URL: `/artwork/20250327_02`
- Year filter is pre-rendered static pages: `/year/2025`, `/year/2024`, etc.
- Zero JS sent to the browser (pure HTML/CSS)
- Per-artwork `<title>` and `og:image` meta tags
- Native browser back button works correctly
- CSS Grid gallery layout (replaces broken flex-wrap)
- All component CSS merged into one global stylesheet with CSS variables

---

## Phase 2 — Image Optimization ✅ Complete

Replace raw `<img>` tags with Astro's `<Image>` component.

**What was done:**
- Moved `public/images/` → `src/assets/images/` (into Astro's build pipeline)
- Created `src/assets/images/index.js` — `import.meta.glob` registry of all 54 images
- `ArtCard.astro` uses `<Image width={600}>` → lazy-loaded WebP gallery thumbnails
- `artwork/[id].astro` uses `<Image width={1200}>` + `getImage()` for `og:image`
- `about.astro` uses direct static import + `<Image width={400}>` for profile photo
- Gallery CSS updated to `height: 280px; object-fit: cover` for consistent card heights

**Actual results (127 image variants generated at build time):**

| | Before | After |
|-|--------|-------|
| Gallery load (42 images) | ~33 MB raw JPEG | **1.9 MB WebP** |
| Per-image gallery avg | ~800 kB | **46 kB** |
| Detail page image | up to 2.4 MB | ~150 kB avg (WebP) |
| Profile photo | 1.5 MB | 22 kB |
| Gallery load reduction | — | **94%** |
| `og:image` | missing | per-artwork JPEG at 1200px |
| Layout shift (CLS) | yes (no dimensions) | none (`width`/`height` auto-set) |

---

## Phase 3 — Content Collections ✅ Complete

Replace `src/data/artworkData.js` with Astro Content Collections:

- `src/content/artworks/[id].json` — one file per artwork
- `src/content/config.ts` — Zod schema for type safety
- Adding new artwork = drop a JSON + image, no JS array editing

Optionally wire up **Decap CMS** (free, GitHub-backed) for browser-based editing.

---

## Phase 4 — Polish ✅ Complete

- Bilingual URL routing (`/zh/`, `/en/`) via Astro i18n — EN at root, ZH at `/zh/`; EN↔ZH switcher in navbar
- View Transitions API for smooth gallery → detail animation — image morphs between card and detail view
- RSS feed of new artworks — `/rss.xml`, autodiscovery link in `<head>`
- `application/ld+json` ArtWork structured data for Google — per-artwork `VisualArtwork` schema
- PWA manifest with correct app name and theme color — `start_url` fixed to `/norafu-art/`
