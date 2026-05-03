#!/usr/bin/env node
/**
 * Reads pending.csv from the project root and creates a JSON content entry
 * in src/content/artworks/ for each row.
 *
 * Run with: npm run add
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root      = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const CSV_PATH  = join(root, 'pending.csv');
const JSON_DIR  = join(root, 'src/content/artworks');
const IMG_DIR   = join(root, 'src/assets/images');
const IMG_EXTS  = ['.JPEG', '.JPG', '.jpeg', '.jpg', '.PNG', '.png'];

// ---------------------------------------------------------------------------
// Minimal RFC-4180 CSV parser (handles double-quoted fields with embedded commas)
// ---------------------------------------------------------------------------
function parseCSVLine(line) {
  line = line.replace(/\r$/, '');
  const fields = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let field = '';
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { field += '"'; i += 2; }
        else if (line[i] === '"') { i++; break; }
        else { field += line[i++]; }
      }
      if (i < line.length && line[i] === ',') i++;
      fields.push(field);
    } else {
      const comma = line.indexOf(',', i);
      if (comma === -1) { fields.push(line.slice(i).trim()); break; }
      fields.push(line.slice(i, comma).trim());
      i = comma + 1;
    }
  }
  if (line.endsWith(',')) fields.push('');
  return fields;
}

function findImage(id) {
  for (const ext of IMG_EXTS) {
    if (existsSync(join(IMG_DIR, `${id}${ext}`))) return `${id}${ext}`;
  }
  return null;
}

// ---------------------------------------------------------------------------
function main() {
  if (!existsSync(CSV_PATH)) {
    console.error('Error: pending.csv not found in the project root.');
    console.error('Create it from the template in docs/adding-artwork.md.');
    process.exit(1);
  }

  const lines = readFileSync(CSV_PATH, 'utf8')
    .replace(/^﻿/, '')   // strip UTF-8 BOM added by Excel
    .split('\n')
    .filter(l => l.trim() && !l.trim().startsWith('#'));

  if (lines.length < 2) {
    console.log('pending.csv has no data rows to process.');
    return;
  }

  // Map header names → column indices (tolerates extra/reordered columns)
  const header = parseCSVLine(lines[0]);
  const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

  const REQUIRED_COLS = ['id', 'title_eng', 'title_ch', 'description_eng', 'description_ch'];
  const missingCols = REQUIRED_COLS.filter(c => col[c] === undefined);
  if (missingCols.length) {
    console.error(`Error: pending.csv is missing header columns: ${missingCols.join(', ')}`);
    process.exit(1);
  }

  const overwrite = process.argv.includes('--update');
  let created = 0, updated = 0, skipped = 0, errors = 0;

  for (let r = 0; r < lines.length - 1; r++) {
    const line = lines[r + 1].trim();
    if (!line) continue;

    const f      = parseCSVLine(line);
    const rowNum = r + 2; // human-readable row number (header = 1)
    const id     = f[col.id]?.trim();

    if (!id) continue;

    if (!/^\d{8}(_\w+)?$/.test(id)) {
      console.error(`Row ${rowNum}: "${id}" — invalid ID, must be YYYYMMDD or YYYYMMDD_suffix`);
      errors++;
      continue;
    }

    const jsonPath = join(JSON_DIR, `${id}.json`);
    const exists = existsSync(jsonPath);
    if (exists && !overwrite) {
      console.log(`Row ${rowNum}: ${id} — already exists, skipped`);
      skipped++;
      continue;
    }

    const titleEng = f[col.title_eng]?.trim();
    const titleCh  = f[col.title_ch]?.trim();
    const descEng  = f[col.description_eng]?.trim();
    const descCh   = f[col.description_ch]?.trim();

    const empty = [
      ['title_eng', titleEng], ['title_ch', titleCh],
      ['description_eng', descEng], ['description_ch', descCh],
    ].filter(([, v]) => !v).map(([k]) => k);

    if (empty.length) {
      console.error(`Row ${rowNum}: ${id} — missing required fields: ${empty.join(', ')}`);
      errors++;
      continue;
    }

    const medium  = f[col.medium]?.trim() || 'marker';
    const tagsRaw = (col.tags !== undefined ? f[col.tags]?.trim() : '') ?? '';
    const tags    = tagsRaw ? tagsRaw.split('|').map(t => t.trim()).filter(Boolean) : [];

    const date  = id.slice(0, 8);
    const year  = parseInt(date.slice(0, 4));
    const found = findImage(id);
    const imageSrc = found ?? `${id}.JPEG`;

    const entry = {
      title:       { eng: titleEng, ch: titleCh },
      date, year, medium,
      description: { eng: descEng, ch: descCh },
      imageSrc, tags,
    };

    writeFileSync(jsonPath, JSON.stringify(entry, null, 2) + '\n');

    const warn = found ? '' : '  [!] image not found in src/assets/images/';
    if (exists) {
      console.log(`Row ${rowNum}: ${id} — updated${warn}`);
      updated++;
    } else {
      console.log(`Row ${rowNum}: ${id} — created${warn}`);
      created++;
    }
  }

  console.log(`\n${created} created  |  ${updated} updated  |  ${skipped} skipped  |  ${errors} error${errors !== 1 ? 's' : ''}`);

  if (created + updated > 0) {
    console.log('\nNext steps:');
    console.log('  npm run dev     — preview locally');
    console.log('  npm run deploy  — publish to GitHub Pages');
  }
}

main();
