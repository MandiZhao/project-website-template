import { readFileSync, writeFileSync, existsSync, statSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

export function readContent(path) {
  const sandbox = { window: {} };
  runInNewContext(readFileSync(path, 'utf8'), sandbox, { timeout: 1000, filename: path });
  return sandbox.window.PAPER_CONTENT;
}

// Shared by the metadata builder and updater: validate before writing anything.
export function renderIndex(content, currentHtml, root, plannedAssets = new Set()) {
  const paper = content?.paper;
  if ((content?.schemaVersion ?? 1) !== 1) throw new Error('Unsupported content schemaVersion; this template supports version 1.');
  if (!paper?.name || !paper.title || !paper.description || !paper.siteUrl) {
    throw new Error('Set paper.name, title, description, and siteUrl in content.js.');
  }
  if (paper.titleLines !== undefined) {
    if (!Array.isArray(paper.titleLines) || !paper.titleLines.length ||
        paper.titleLines.some(line => typeof line !== 'string' || !line.trim())) {
      throw new Error('paper.titleLines must be a nonempty array of nonempty strings.');
    }
    const normalize = text => text.replace(/\s+/g, ' ').trim();
    if (normalize(paper.titleLines.join(' ')) !== normalize(paper.title)) {
      throw new Error('paper.titleLines must contain the same text as paper.title, split into lines.');
    }
  }
  const siteUrl = new URL(paper.siteUrl);
  if (!['http:', 'https:'].includes(siteUrl.protocol)) throw new Error('paper.siteUrl must be an HTTP(S) URL.');
  if (!Array.isArray(content.sectionOrder) || !content.sectionOrder.length) throw new Error('Set sectionOrder in content.js.');
  const ids = new Set(['project', 'main-content']);
  function checkBody(body) {
    if (body.paragraphs !== undefined) {
      if (!Array.isArray(body.paragraphs)) throw new Error('paragraphs must be an array.');
      for (const paragraph of body.paragraphs) {
        if (typeof paragraph === 'string') continue;
        if (!Array.isArray(paragraph)) throw new Error('Each paragraph must be a string or an array of inline text and links.');
        for (const part of paragraph) {
          if (typeof part === 'string') continue;
          if (part?.highlight === true && typeof part.text === 'string' && part.url === undefined) continue;
          if (!part || typeof part.text !== 'string' || typeof part.url !== 'string' || !part.url.trim()) {
            throw new Error('Inline links need text and url strings.');
          }
          if (!['http:', 'https:', 'mailto:'].includes(new URL(part.url, siteUrl).protocol)) {
            throw new Error('Inline links must use HTTP(S), mailto, or relative URLs.');
          }
        }
      }
    }
    if (body.embed) {
      const embed = body.embed;
      if (typeof embed.title !== 'string' || !embed.title.trim() || typeof embed.src !== 'string' ||
          !/^https?:\/\//i.test(embed.src) || !['http:', 'https:'].includes(new URL(embed.src).protocol) ||
          !Number.isFinite(embed.width) || embed.width <= 0 || !Number.isFinite(embed.height) || embed.height <= 0) {
        throw new Error('Embedded videos need an HTTP(S) src, title, and positive width/height.');
      }
      if (embed.url !== undefined && (typeof embed.url !== 'string' || !/^https?:\/\//i.test(embed.url) ||
          !['http:', 'https:'].includes(new URL(embed.url).protocol))) {
        throw new Error('The optional embed.url must be an HTTP(S) watch link.');
      }
    }
    if (body.details !== undefined) {
      if (!Array.isArray(body.details)) throw new Error('details must be an array.');
      for (const detail of body.details) {
        if (!detail || typeof detail.title !== 'string' || !detail.title.trim()) throw new Error('Each detail needs a title.');
        checkBody(detail);
      }
    }
    for (const block of body.blocks || []) checkBody(block);
  }
  for (const id of content.sectionOrder) {
    if (typeof id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(id) || !content[id]?.title) {
      throw new Error(`Section ${id} needs a valid id and title in content.js.`);
    }
    for (const generatedId of [id, `${id}-heading`]) {
      if (ids.has(generatedId)) throw new Error(`Duplicate or reserved section id: ${generatedId}`);
      ids.add(generatedId);
    }
    checkBody(content[id]);
  }

  const missing = [];
  function checkMedia(value) {
    if (!value || typeof value !== 'object') return;
    for (const [key, item] of Object.entries(value)) {
      if (['src', 'poster', 'socialImage', 'favicon'].includes(key) && typeof item === 'string' && item) {
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(item)) continue;
        const path = resolve(root, decodeURIComponent(item.split(/[?#]/)[0]));
        if (!plannedAssets.has(path) && (!existsSync(path) || !statSync(path).isFile())) missing.push(item);
      } else if (typeof item === 'object') checkMedia(item);
    }
  }
  checkMedia(content);
  if (missing.length) throw new Error(`Missing local media:\n${missing.join('\n')}`);

  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
  const image = paper.socialImage || content.abstract?.figure?.src || paper.video?.poster;
  let html = currentHtml;
  function replaceOnce(pattern, after) {
    if (!pattern.test(html)) throw new Error(`Index marker missing: ${pattern}`);
    // A callback preserves literal dollar signs in project titles/descriptions.
    html = html.replace(pattern, () => after);
  }
  replaceOnce(/<title>[^<]*<\/title>/, `<title>${escapeHtml(`${paper.name} — ${paper.title}`)}</title>`);
  for (const [selector, value] of [
    ['name="description"', paper.description],
    ['property="og:title"', `${paper.name}: ${paper.title}`],
    ['property="og:description"', paper.description],
    ['property="og:url"', siteUrl.href],
    ['property="og:image"', image ? new URL(image, siteUrl).href : ''],
  ]) {
    replaceOnce(new RegExp(`<meta ${selector} content="[^"]*">`), `<meta ${selector} content="${escapeHtml(value)}">`);
  }
  return html;
}

if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  try {
    const root = dirname(fileURLToPath(import.meta.url));
    const indexPath = join(root, 'index.html');
    const currentHtml = readFileSync(indexPath, 'utf8');
    const html = renderIndex(readContent(join(root, 'content.js')), currentHtml, root);
    if (process.argv.includes('--check')) {
      if (html !== currentHtml) throw new Error('index.html metadata is stale; run node build-index.mjs.');
      console.log('Index metadata, sections, and local media are ready.');
    } else {
      const output = process.argv[2] ? resolve(process.argv[2]) : indexPath;
      writeFileSync(output, html);
      console.log(`Wrote ${output}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
