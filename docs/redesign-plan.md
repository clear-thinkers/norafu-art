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
- Created `src/assets/images/index.js` — `import.meta.glob` registry of all images
- `ArtCard.astro` uses `<Image width={600}>` → lazy-loaded WebP gallery thumbnails
- `ArtworkDetail.astro` uses `<Image width={1200}>` + `getImage()` for `og:image`
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

Replace `src/data/artworkData.js` with Astro Content Collections.

**What was done:**
- Created `src/content/config.ts` — Zod schema for type safety
- Generated `src/content/artworks/[id].json` — one file per artwork (42 files)
- Deleted `src/data/artworkData.js`
- All pages updated to use `getCollection('artworks')`
- Fixed `base: '/norafu-art/'` trailing slash (was causing malformed hrefs)

**Adding a new artwork** = drop a `.json` into `src/content/artworks/` and an image into
`src/assets/images/`. The filename becomes the URL slug. Zod validates the shape at build time.

---

## Phase 4 — Polish ✅ Complete

- **Bilingual URL routing** via Astro i18n — EN at root (`/`, `/artwork/...`), ZH at `/zh/`, `/zh/artwork/...`; EN↔ZH switcher in navbar links between equivalent pages
- **View Transitions API** — `<ViewTransitions />` in BaseLayout; `transition:name="artwork-{id}"` on gallery thumbnails and detail images creates a smooth morph animation
- **RSS feed** — `/rss.xml` with 42 items sorted newest-first; autodiscovery `<link>` in every page `<head>`
- **`application/ld+json` structured data** — per-artwork `VisualArtwork` schema (name, date, medium, image, author) on all detail pages
- **PWA manifest** — `start_url` corrected to `/norafu-art/`

---

## Current Architecture

### File tree

```
src/
├── assets/images/          ← 56 source images (JPEG/JPG); build produces WebP variants
│   └── index.js            ← import.meta.glob registry
├── components/
│   ├── ArtCard.astro       ← gallery card; locale prop selects EN/ZH title
│   ├── ArtworkDetail.astro ← shared detail template (EN + ZH pages both use this)
│   └── Navbar.astro        ← nav with year filter + EN|中文 language switcher
├── content/
│   ├── config.ts           ← Zod schema for artworks collection
│   └── artworks/           ← 42 × [id].json (one per artwork)
├── layouts/
│   └── BaseLayout.astro    ← HTML shell; ViewTransitions; RSS autodiscovery
├── pages/
│   ├── index.astro         ← EN gallery (all years)
│   ├── about.astro         ← EN about page
│   ├── rss.xml.js          ← RSS feed endpoint
│   ├── artwork/[id].astro  ← EN detail (42 static pages)
│   ├── year/[year].astro   ← EN year-filtered gallery (6 static pages)
│   └── zh/
│       ├── index.astro     ← ZH gallery
│       ├── about.astro     ← ZH about page
│       ├── artwork/[id].astro ← ZH detail (42 static pages)
│       └── year/[year].astro  ← ZH year-filtered gallery (6 static pages)
├── styles/
│   └── global.css
└── utils/
    └── ageCalculation.js   ← "created at X years old" label
public/
├── favicon.ico
├── manifest.json           ← PWA; start_url: /norafu-art/
└── robots.txt
```

### Build output

| Metric | Value |
|--------|-------|
| Total static pages | 100 (50 EN + 50 ZH) |
| Image variants | 127 WebP/JPEG generated at build time |
| JS sent to browser | ~14 kB (View Transitions runtime only) |
| RSS items | 42 |

### URL structure

| Route | Description |
|-------|-------------|
| `/norafu-art/` | EN gallery |
| `/norafu-art/artwork/:id` | EN artwork detail |
| `/norafu-art/year/:year` | EN year filter |
| `/norafu-art/about` | EN about |
| `/norafu-art/zh/` | ZH gallery |
| `/norafu-art/zh/artwork/:id` | ZH artwork detail |
| `/norafu-art/zh/year/:year` | ZH year filter |
| `/norafu-art/zh/about` | ZH about |
| `/norafu-art/rss.xml` | RSS feed |
