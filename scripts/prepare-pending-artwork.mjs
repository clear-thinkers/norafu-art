#!/usr/bin/env node
/**
 * Finds artwork image assets that do not have published JSON entries yet and
 * adds them to pending.csv. When OPENAI_API_KEY is available, new rows are
 * prefilled with draft metadata using the image plus nearby historical entries.
 *
 * Run with: npm run artwork:prepare
 */
import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const CSV_PATH = join(root, 'pending.csv');
const JSON_DIR = join(root, 'src/content/artworks');
const IMG_DIR = join(root, 'src/assets/images');
const ARTWORK_ID_RE = /^\d{8}(?:_[A-Za-z0-9-]+)?$/;
const IMG_EXTS = new Set(['.jpeg', '.jpg', '.png']);
const CSV_HEADER = [
  'id',
  'title_eng',
  'title_ch',
  'description_eng',
  'description_ch',
  'medium',
  'tags',
];

const args = new Set(process.argv.slice(2));
const useAi = args.has('--ai')
  || (!args.has('--no-ai') && Boolean(process.env.OPENAI_API_KEY));
const requireAi = args.has('--require-ai');
const replaceMode = args.has('--replace');
const fillExisting = args.has('--fill-existing');
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

function parseCSVLine(line) {
  line = line.replace(/\r$/, '');
  const fields = [];
  let i = 0;

  while (i < line.length) {
    if (line[i] === '"') {
      let field = '';
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          field += line[i++];
        }
      }
      if (i < line.length && line[i] === ',') i++;
      fields.push(field);
    } else {
      const comma = line.indexOf(',', i);
      if (comma === -1) {
        fields.push(line.slice(i).trim());
        break;
      }
      fields.push(line.slice(i, comma).trim());
      i = comma + 1;
    }
  }

  if (line.endsWith(',')) fields.push('');
  return fields;
}

function toCSVValue(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCSVLine(row) {
  return CSV_HEADER.map((field) => toCSVValue(row[field])).join(',');
}

function readPendingRows() {
  if (!existsSync(CSV_PATH)) return [];

  const lines = readFileSync(CSV_PATH, 'utf8')
    .replace(/^\uFEFF/, '')
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'));

  if (lines.length < 2) return [];

  const header = parseCSVLine(lines[0]);
  const col = Object.fromEntries(header.map((name, index) => [name.trim(), index]));

  return lines.slice(1)
    .map((line) => {
      const fields = parseCSVLine(line);
      return Object.fromEntries(
        CSV_HEADER.map((field) => [field, fields[col[field]]?.trim() ?? ''])
      );
    })
    .filter((row) => row.id);
}

function listImageEntries() {
  return readdirSync(IMG_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const ext = extname(entry.name);
      const id = entry.name.slice(0, -ext.length);
      return { id, filename: entry.name, ext: ext.toLowerCase() };
    })
    .filter((entry) => IMG_EXTS.has(entry.ext) && ARTWORK_ID_RE.test(entry.id))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function listPublishedIds() {
  return new Set(
    readdirSync(JSON_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile() && extname(entry.name) === '.json')
      .map((entry) => entry.name.slice(0, -'.json'.length))
  );
}

function readHistoricalEntries() {
  return readdirSync(JSON_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && extname(entry.name) === '.json')
    .map((entry) => {
      const id = entry.name.slice(0, -'.json'.length);
      const data = JSON.parse(readFileSync(join(JSON_DIR, entry.name), 'utf8'));
      return { id, ...data };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function chooseExamples(targetId, historicalEntries) {
  const targetDate = targetId.slice(0, 8);
  const before = historicalEntries.filter((entry) => entry.id <= targetDate).slice(-8);
  const after = historicalEntries.filter((entry) => entry.id > targetDate).slice(0, 4);
  return [...before, ...after].map((entry) => ({
    id: entry.id,
    title_eng: entry.title?.eng,
    title_ch: entry.title?.ch,
    description_eng: entry.description?.eng,
    description_ch: entry.description?.ch,
    medium: entry.medium,
    tags: entry.tags,
  }));
}

function allKnownTags(historicalEntries) {
  return [...new Set(historicalEntries.flatMap((entry) => entry.tags ?? []))].sort();
}

function mimeType(filename) {
  const ext = extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  return 'image/jpeg';
}

function fallbackRow(id) {
  return {
    id,
    title_eng: '',
    title_ch: '',
    description_eng: '',
    description_ch: '',
    medium: 'marker',
    tags: '',
  };
}

function needsFill(row) {
  return ['title_eng', 'title_ch', 'description_eng', 'description_ch']
    .some((field) => !row[field]);
}

async function generateDraft(entry, historicalEntries) {
  if (!process.env.OPENAI_API_KEY) {
    if (requireAi) {
      throw new Error('OPENAI_API_KEY is required when --require-ai is used.');
    }
    return fallbackRow(entry.id);
  }

  const imagePath = join(IMG_DIR, entry.filename);
  const imageData = readFileSync(imagePath).toString('base64');
  const examples = chooseExamples(entry.id, historicalEntries);
  const knownTags = allKnownTags(historicalEntries);

  const prompt = [
    `Create draft metadata for artwork id ${entry.id}.`,
    'Use the image as the primary source. Use the historical examples only to match voice, length, casing, tag vocabulary, and bilingual style.',
    'Return concise, parent-friendly gallery copy. English descriptions should usually be one short sentence, lowercase when natural, matching the existing collection style.',
    'Chinese should be natural Simplified Chinese, not a literal word-for-word translation when smoother wording is better.',
    'Medium must be "marker", "watercolor", or "marker, watercolor". Tags should reuse known tags when possible and be pipe-separated in the CSV later.',
    `Known tags: ${knownTags.join(', ')}`,
    `Historical examples: ${JSON.stringify(examples)}`,
  ].join('\n\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      instructions: 'You draft metadata for a child artwork gallery. Be accurate, humble, and do not invent named characters unless visually obvious.',
      input: [{
        role: 'user',
        content: [
          { type: 'input_text', text: prompt },
          {
            type: 'input_image',
            image_url: `data:${mimeType(entry.filename)};base64,${imageData}`,
            detail: 'low',
          },
        ],
      }],
      text: {
        format: {
          type: 'json_schema',
          name: 'artwork_pending_row',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: CSV_HEADER.filter((field) => field !== 'id'),
            properties: {
              title_eng: { type: 'string' },
              title_ch: { type: 'string' },
              description_eng: { type: 'string' },
              description_ch: { type: 'string' },
              medium: {
                type: 'string',
                enum: ['marker', 'watercolor', 'marker, watercolor'],
              },
              tags: { type: 'string' },
            },
          },
        },
      },
      max_output_tokens: 600,
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error?.message ?? `OpenAI request failed with ${response.status}`);
  }

  const text = body.output_text
    ?? body.output?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === 'output_text')?.text;

  if (!text) throw new Error('OpenAI response did not include output text.');

  const draft = JSON.parse(text);
  return {
    id: entry.id,
    title_eng: draft.title_eng?.trim() ?? '',
    title_ch: draft.title_ch?.trim() ?? '',
    description_eng: draft.description_eng?.trim() ?? '',
    description_ch: draft.description_ch?.trim() ?? '',
    medium: draft.medium?.trim() || 'marker',
    tags: draft.tags?.split('|').map((tag) => tag.trim()).filter(Boolean).join('|') ?? '',
  };
}

async function main() {
  if (requireAi && !process.env.OPENAI_API_KEY) {
    console.error('Error: --require-ai was used, but OPENAI_API_KEY is not set.');
    process.exit(1);
  }

  const images = listImageEntries();
  const publishedIds = listPublishedIds();
  const historicalEntries = readHistoricalEntries();
  const pendingRows = readPendingRows();
  const pendingById = new Map(pendingRows.map((row) => [row.id, row]));
  const unpublishedImages = images.filter((entry) => !publishedIds.has(entry.id));
  const unpublishedIds = new Set(unpublishedImages.map((entry) => entry.id));
  const rows = replaceMode
    ? pendingRows.filter((row) => unpublishedIds.has(row.id))
    : [...pendingRows];
  const rowById = new Map(rows.map((row) => [row.id, row]));

  let added = 0;
  let filled = 0;
  let aiErrors = 0;

  for (const image of unpublishedImages) {
    const existing = rowById.get(image.id);
    if (existing && !(fillExisting && needsFill(existing))) continue;

    try {
      const draft = useAi ? await generateDraft(image, historicalEntries) : fallbackRow(image.id);
      if (existing) {
        Object.assign(existing, { ...existing, ...draft, id: image.id });
        filled++;
        console.log(`${image.id} - filled existing row${useAi ? ' with AI draft' : ''}`);
      } else {
        rows.push(draft);
        rowById.set(image.id, draft);
        added++;
        console.log(`${image.id} - added${useAi ? ' with AI draft' : ''}`);
      }
    } catch (error) {
      aiErrors++;
      const row = existing ?? fallbackRow(image.id);
      if (!existing) {
        rows.push(row);
        rowById.set(image.id, row);
        added++;
      }
      console.error(`${image.id} - AI draft failed; kept id-only row: ${error.message}`);
    }
  }

  const output = [
    CSV_HEADER.join(','),
    ...rows.sort((a, b) => a.id.localeCompare(b.id)).map(toCSVLine),
    '',
  ].join('\n');

  writeFileSync(CSV_PATH, `\uFEFF${output}`, 'utf8');

  console.log('');
  console.log(`${unpublishedImages.length} unpublished image${unpublishedImages.length === 1 ? '' : 's'} found`);
  console.log(`${added} row${added === 1 ? '' : 's'} added | ${filled} existing row${filled === 1 ? '' : 's'} filled | ${aiErrors} AI error${aiErrors === 1 ? '' : 's'}`);

  const pendingPublishedIds = pendingRows
    .filter((row) => row.id && publishedIds.has(row.id))
    .map((row) => row.id);
  if (!replaceMode && pendingPublishedIds.length) {
    console.log(`Note: pending.csv still contains ${pendingPublishedIds.length} already-published row${pendingPublishedIds.length === 1 ? '' : 's'}; run with --replace to keep only unpublished image IDs.`);
  }

  if (pendingById.size === rowById.size && added === 0 && filled === 0) {
    console.log('pending.csv was already up to date.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
