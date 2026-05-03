# Adding a New Artwork

## Quick reference

**Adding new artwork:**
```
1. Copy image  →  src/assets/images/YYYYMMDD.JPEG
2. Edit        →  pending.csv  (add a row at the bottom)
3. Run         →  npm run add
4. Preview     →  npm run dev
5. Publish     →  npm run deploy
```

**Correcting existing artwork metadata:**
```
1. Edit        →  pending.csv  (update the row)
2. Run         →  npm run update
3. Preview     →  npm run dev
4. Publish     →  npm run deploy
```

---

## Step 1 — Name and place the image

Copy the photo into `src/assets/images/` using the date as the filename.

| Situation | Filename |
|-----------|----------|
| One artwork on a date | `20250405.JPEG` |
| Two or more on the same date | `20250921_01.JPEG`, `20250921_02.JPEG` |
| Named piece | `20250324_self-portrait.JPEG` |

**Rules:**
- Format: `YYYYMMDD` — the date the artwork was made, not today
- Extension: `.JPEG` or `.JPG` (leave it as the camera saves it)
- No spaces — only letters, digits, and `_` after the date part

**Do not resize.** Astro converts and resizes at build time.

---

## Step 2 — Fill in pending.csv

Open `pending.csv` (project root) and add one row per artwork.

> **Excel tip — Chinese characters not displaying?**
> Do not double-click the file. Instead use **Data → From Text/CSV**, then set
> encoding to **UTF-8** in the import wizard. The file is saved as UTF-8 with BOM,
> which Excel recognises automatically when imported this way.
> Alternatively, use VS Code or any text editor that handles UTF-8 natively.

### Column reference

| Column | Required | Format | Example |
|--------|----------|--------|---------|
| `id` | yes | `YYYYMMDD` or `YYYYMMDD_suffix` | `20250405` |
| `title_eng` | yes | plain text | `mushroom cafe` |
| `title_ch` | yes | Chinese text | `蘑菇咖啡馆` |
| `description_eng` | yes | 1–3 sentences | `the happy mushrooms serve coffee.` |
| `description_ch` | yes | Chinese translation | `蘑菇们在做咖啡。` |
| `medium` | no | `marker` or `watercolor` | `marker` (default if blank) |
| `tags` | no | pipe-separated `\|` | `animal\|fantasy` |

The `id` must exactly match the image filename (without extension).  
`date`, `year`, and `imageSrc` are all derived automatically from the `id`.

### CSV formatting rules

- **Commas in a field** — wrap the whole field in double-quotes:
  `"a short description, with a comma."`
- **Tags** — separate with `|` (pipe), not commas:
  `animal|fantasy|sea`
- **Blank medium** — defaults to `marker`
- **Blank tags** — leaves tags as an empty list
- **Comment lines** — start with `#`, ignored by the script

### Example rows

```csv
id,title_eng,title_ch,description_eng,description_ch,medium,tags
20250405,the spider web,蜘蛛网,a spider busy spinning her web.,小蜘蛛在角落里织网。,marker,animal
20250412,flowers in a vase,花瓶里的花,"pink, yellow and white flowers.",粉色、黄色和白色的花。,watercolor,nature|still life
```

### Adding multiple artworks at once

Just add one row per artwork before running `npm run add`. The script processes all rows in one pass.

---

## Step 3 — Run the script

**Adding new artworks:**
```
npm run add
```
Safe mode — creates JSON for new rows, skips any that already exist.

**Correcting existing artwork metadata:**
```
npm run update
```
Update mode — overwrites existing JSON for every row in the CSV. Use this after fixing a title, description, or tags on an artwork that is already on the site.

For each row either command will print one of:

| Output | Meaning |
|--------|---------|
| `Row 2: 20250405 — created` | New JSON file written |
| `Row 2: 20250405 — updated` | Existing JSON overwritten |
| `Row 2: 20250405 — created  [!] image not found` | JSON written, but image is missing — add it before deploying |
| `Row 2: 20250405 — already exists, skipped` | Already exists; run `npm run update` if you want to overwrite |
| `Row 2: 20250405 — missing required fields: title_ch` | Row has an error — fix and rerun |

After a successful run, clear the processed rows from `pending.csv` (or leave them — `npm run add` skips existing entries, so it is safe to leave old rows in place).

---

## Step 4 — Preview locally

```
npm run dev
```

Open `http://localhost:4321/norafu-art/` and confirm:
- The new artwork appears in the gallery (sorted newest-first)
- Clicking the card opens the detail page correctly
- Both EN and ZH detail pages show the right language
- Title, description, year, medium, and tags all look right

---

## Step 5 — Publish

```
npm run deploy
```

Builds the site and pushes to GitHub Pages. Live in ~1 minute.

---

## Tag reference

Use existing tags where possible to keep the tag set consistent.

| Tag | Used for |
|-----|----------|
| `animal` | Birds, fish, insects, mammals |
| `fantasy` | Imaginary worlds, magical creatures |
| `portrait` | Self-portraits, people |
| `still life` | Objects arranged on a surface |
| `food` | Fruit, snacks, meals |
| `family` | Family scenes |
| `friends` | Scenes with named friends |
| `nature` | Plants, flowers, landscapes |
| `mid-autumn` | Moon festival themed |
| `mermaid` | Mermaid / underwater scenes |
| `sea` | Ocean scenes |
| `dinosaur` / `dinosaurs` | Dinosaur scenes |
| `urban sketching` | Street / architecture drawings |
| `science` | Science-themed (Newton, volcanoes, etc.) |
| `toddler art` | Very early works (2020–2021) |
| `mushroom` | Mushroom-themed |
| `earth` | Earth / world-building themed |

You can introduce a new tag if none fit.

---

## Troubleshooting

**Artwork not appearing after `npm run add`**
Check the script output for an error on that row. Then run `npm run build` — Zod will print a clear validation error for any schema problem.

**Image shows as broken**
Confirm the image is in `src/assets/images/` (not `public/`), and that the `id` in the CSV exactly matches the image filename including any `_suffix`.

**`already exists, skipped` but you want to update the entry**
Edit `src/content/artworks/[id].json` directly and re-run `npm run build`.

**Build error: `Invalid content entry`**
A field has the wrong type — most commonly `year` parsed as a string instead of a number. This shouldn't happen via the script, but check the JSON if hand-editing.
