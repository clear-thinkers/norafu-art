# Updating Fonts

## Quick reference

```
1. Delete old TTF  →  public/fonts/en/   or   public/fonts/zh/
2. Drop new TTF    →  same folder
3. Run             →  npm run update-fonts
4. Preview         →  npm run dev
5. Publish         →  npm run deploy
```

---

## Font folders

| Folder | Applies to | Current font |
|--------|-----------|--------------|
| `public/fonts/en/` | English pages (`/`) | *(none — falls back to ZH font)* |
| `public/fonts/zh/` | Chinese pages (`/zh/`) | `HanyiSentyCrayon Regular.ttf` |

Each folder holds **one TTF file**. If multiple TTF files are present the script uses the first alphabetically and warns you.

---

## Step 1 — Replace the TTF

Delete the existing `.ttf` file from the relevant folder, then copy the new one in.

Filenames can contain spaces — the script URL-encodes them automatically.

---

## Step 2 — Run the script

```
npm run update-fonts
```

This rewrites the `@font-face` blocks inside `src/styles/global.css` (between the `AUTO-FONT-START` / `AUTO-FONT-END` markers). Do not edit that section by hand.

Sample output:
```
✓ global.css updated
  EN font : MyNewFont Regular.ttf
  ZH font : HanyiSentyCrayon Regular.ttf
```

---

## Step 3 — Preview locally

```
npm run dev
```

Open `http://localhost:4321/norafu-art/` and check both the English gallery (`/`) and Chinese gallery (`/zh/`) to confirm the font loaded correctly.

---

## Step 4 — Publish

```
npm run deploy
```

---

## How font selection works

- English pages (`<html lang="en">`) use **NorafuEN** → falls back to NorafuZH → system sans-serif
- Chinese pages (`<html lang="zh">`) use **NorafuZH** → falls back to NorafuEN → system sans-serif

The family names `NorafuEN` and `NorafuZH` are fixed aliases. The script maps whichever TTF is in each folder to those names. Changing the font is always just a file swap + script run.

---

## Troubleshooting

**Font not loading in dev (console error about base path)**
The script reads the base from `astro.config.mjs` automatically. If you see a 404 for the font, re-run `npm run update-fonts` to regenerate the URL.

**No EN font — Chinese font showing on English pages**
That is the intended fallback. Drop a TTF into `public/fonts/en/` and run `npm run update-fonts`.

**Font looks wrong after deploy but fine in dev**
Run `npm run build` locally and check `dist/fonts/` to confirm the file was copied. TTF files in `public/` are copied as-is at build time.
