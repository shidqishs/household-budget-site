// SakuRumah — Anggaran Rumah Tangga. Entry for
// best-household-budget-site-20261126-1457 (Node 22, standard library only).
//
// The site itself lives in app/: five static pages (dashboard, budget planner,
// expense tracker, savings goals, reports) with hand-rolled SVG charts, all
// data held in app/data.js, nothing loaded over the network. Screenshots of
// the running site live in screenshots/.
//
// This program hands the entry in: it copies app/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json, the summary the judge
// reads, with the vendored make.fun library. vendor/makefun-frontend.ts is the
// kit's copy, unchanged: the scorer rebuilds the dossier with its own copy and
// compares the two byte for byte.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The program is fully deterministic: it copies files and writes the dossier
// with no timestamps, no randomness and no environment-dependent output, so
// two runs write identical bytes.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Pre-flight gates: refuse to hand in a broken site instead of letting the
// scorer find it. These checks read only; they never change the bytes written
// below, so output stays deterministic.
const PAGES = ['index.html', 'anggaran.html', 'pengeluaran.html', 'tabungan.html', 'laporan.html'];
for (const page of PAGES) {
  if (!existsSync(join(here, 'app', page))) throw new Error(`missing page app/${page}`);
}
const shotDir = join(here, 'screenshots');
const shots = existsSync(shotDir) ? readdirSync(shotDir).filter((f) => f.endsWith('.jpg')) : [];
if (shots.length === 0 || shots.length > 4) throw new Error(`expected 1-4 screenshots, found ${shots.length}`);
for (const shot of shots) {
  const path = join(shotDir, shot);
  if (statSync(path).size > 262144) throw new Error(`screenshot ${shot} over 256 KiB`);
  const head = readFileSync(path);
  if (head[0] !== 0xff || head[1] !== 0xd8) throw new Error(`screenshot ${shot} is not a JPEG`);
}

// The brief forbids network requests: every script, stylesheet and media
// must be a file under app/ or a data: URI (the inline SVG favicon is one).
// Refuse a hand-in that fetches anything from another origin. The patterns
// only match real URL-bearing attributes, so the data: favicon's
// xmlns="http://www.w3.org/2000/svg" does not trip them.
const EXTERNAL = [
  /(?:src|href)\s*=\s*["']https?:\/\//i,
  /(?:src|href)\s*=\s*["']\/\//i,
  /url\(\s*["']?https?:\/\//i,
  /@import\s+(?:url\(\s*)?["']?https?:/i,
  /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/,
];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(html|js|css)$/.test(entry.name)) {
      const text = readFileSync(p, 'utf8');
      for (const re of EXTERNAL) {
        if (re.test(text)) throw new Error(`external reference in ${p} (${re})`);
      }
    }
  }
};
walk(join(here, 'app'));

// Every page must declare a viewport, or the phone screenshot's promise
// ("works on a phone") is only half kept.
for (const page of PAGES) {
  const html = readFileSync(join(here, 'app', page), 'utf8');
  if (!/<meta[^>]*name=["']viewport["']/i.test(html)) {
    throw new Error(`app/${page} is missing a viewport meta tag`);
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 16 MiB of app
// files, counting beside /output's own 1000-entry cap).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

// Read-back gate: the dossier must be valid JSON and non-empty, and the
// copied screenshots must match the repository bytes exactly.
const dossier = JSON.parse(readFileSync(join(out, 'dossier.json'), 'utf8'));
if (!dossier || typeof dossier !== 'object') throw new Error('dossier.json did not parse to an object');
for (const shot of shots) {
  const a = readFileSync(join(shotDir, shot));
  const b = readFileSync(join(out, 'screenshots', shot));
  if (!a.equals(b)) throw new Error(`screenshot ${shot} did not copy byte-identically`);
}
