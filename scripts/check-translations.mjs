import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['resources/js', 'app'];
const pattern = /\b(?:t|__|trans)\(\s*(['"])((?:\\.|(?!\1).)*)\1/g;
const raw = readFileSync('lang/nl.json', 'utf8');
const translations = JSON.parse(raw);

// JSON.parse silently keeps the last duplicate, so count keys in the raw text
const seen = new Set();
const duplicates = new Set();
for (const [, key] of raw.matchAll(/^ {4}("(?:\\.|[^"\\])*"):/gm)) {
    (seen.has(key) ? duplicates : seen).add(key);
}

function* files(dir) {
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
            yield* files(path);
        } else if (/\.(tsx?|php)$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
            yield path;
        }
    }
}

const missing = new Set();
for (const root of roots) {
    for (const file of files(root)) {
        for (const match of readFileSync(file, 'utf8').matchAll(pattern)) {
            const key = match[2].replace(/\\(['"])/g, '$1');
            if (!(key in translations)) {
                missing.add(`${key} (${file})`);
            }
        }
    }
}

const dashes = Object.entries(translations).filter(([, value]) => /[–—]/.test(value));

if (missing.size > 0) {
    console.error('Keys missing from lang/nl.json:');
    for (const key of missing) console.error(`  ${key}`);
}
if (dashes.length > 0) {
    console.error('Translations containing an em or en dash:');
    for (const [key] of dashes) console.error(`  ${key}`);
}
if (duplicates.size > 0) {
    console.error('Duplicate keys in lang/nl.json:');
    for (const key of duplicates) console.error(`  ${key}`);
}
if (missing.size > 0 || dashes.length > 0 || duplicates.size > 0) {
    process.exit(1);
}
