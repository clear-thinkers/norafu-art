/**
 * Regenerates the @font-face blocks in global.css from the TTF files found in:
 *   public/fonts/en/   →  family 'NorafuEN'  (English pages)
 *   public/fonts/zh/   →  family 'NorafuZH'  (Chinese pages)
 *
 * Usage: npm run update-fonts
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const fontsDir = join(root, 'public', 'fonts');
const cssPath = join(root, 'src', 'styles', 'global.css');

// Read base path from astro.config.mjs (e.g. '/norafu-art/')
const configText = readFileSync(join(root, 'astro.config.mjs'), 'utf8');
const baseMatch = configText.match(/base:\s*['"]([^'"]+)['"]/);
const base = baseMatch ? baseMatch[1] : '/';

const START = '/* AUTO-FONT-START — managed by scripts/update-fonts.mjs */';
const END   = '/* AUTO-FONT-END */';

function ttfFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => extname(f).toLowerCase() === '.ttf').sort();
}

function encodeName(name) {
  return encodeURIComponent(name).replace(/%20/g, '%20');
}

function fontFace(family, subfolder, filename) {
  return `@font-face {
  font-family: '${family}';
  src: url('${base}fonts/${subfolder}/${encodeName(filename)}') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`;
}

const enFiles = ttfFiles(join(fontsDir, 'en'));
const zhFiles = ttfFiles(join(fontsDir, 'zh'));

if (enFiles.length > 1) console.warn(`⚠  Multiple TTF files in public/fonts/en/ — using "${enFiles[0]}"`);
if (zhFiles.length > 1) console.warn(`⚠  Multiple TTF files in public/fonts/zh/ — using "${zhFiles[0]}"`);

const blocks = [];
if (enFiles.length) blocks.push(fontFace('NorafuEN', 'en', enFiles[0]));
if (zhFiles.length) blocks.push(fontFace('NorafuZH', 'zh', zhFiles[0]));

const replacement = blocks.length
  ? `${START}\n${blocks.join('\n\n')}\n${END}`
  : `${START}\n${END}`;

let css = readFileSync(cssPath, 'utf8');
const s = css.indexOf(START);
const e = css.indexOf(END);

if (s === -1 || e === -1) {
  console.error('❌  AUTO-FONT-START / AUTO-FONT-END markers not found in global.css');
  process.exit(1);
}

writeFileSync(cssPath, css.slice(0, s) + replacement + css.slice(e + END.length), 'utf8');

console.log('✓ global.css updated');
console.log(`  EN font : ${enFiles[0] ?? '(none — will fall back to system sans-serif)'}`);
console.log(`  ZH font : ${zhFiles[0] ?? '(none — will fall back to system sans-serif)'}`);
