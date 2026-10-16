#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { renderPreview } from './preview-project.mjs';

const repository = fileURLToPath(new URL('..', import.meta.url));
const output = join(repository, 'example/example.html');
try {
  if (process.argv.slice(2).some(arg => arg !== '--check')) throw new Error('Usage: node scripts/build-example.mjs [--check]');
  const html = renderPreview(repository, join(repository, 'example'));
  if (process.argv.includes('--check')) {
    if (!existsSync(output) || readFileSync(output, 'utf8') !== html) {
      throw new Error('example/example.html needs an update; run npm run build:example.');
    }
    console.log('Example HTML, metadata, and local media are up to date.');
  } else {
    writeFileSync(output, html);
    console.log(`Wrote ${output}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
