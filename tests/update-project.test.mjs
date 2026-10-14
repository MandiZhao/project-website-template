import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const repository = fileURLToPath(new URL('..', import.meta.url));
function fixture(t) {
  const base = mkdtempSync(join(tmpdir(), 'website-template-test-'));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const source = join(base, 'source');
  mkdirSync(source);
  for (const name of ['template', 'example', 'scripts', 'template.json']) cpSync(join(repository, name), join(source, name), { recursive: true });
  const project = join(base, 'project');
  const run = (...flags) => spawnSync(process.execPath, [join(source, 'scripts/update-project.mjs'), project, ...flags], { encoding: 'utf8' });
  const ok = (...flags) => { const r = run(...flags); assert.equal(r.status, 0, r.stderr); return r; };
  return { source, project, run, ok };
}
const read = path => readFileSync(path, 'utf8');

test('metadata helpers can be imported from a stdin script without running the CLI', t => {
  const { source } = fixture(t);
  const result = spawnSync(process.execPath, ['--input-type=module', '-'], {
    cwd: source,
    input: "import { renderIndex } from './template/build-index.mjs'; console.log(typeof renderIndex);",
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'function');
});

test('new project is self-contained, checked, and unchanged by a repeated update', t => {
  const { project, source, ok } = fixture(t);
  ok('--init');
  assert.equal(read(join(project, 'styles.css')), read(join(source, 'template/styles.css')));
  assert.ok(existsSync(join(project, 'assets/example-method.svg')));
  const record = JSON.parse(read(join(project, 'template-version.json')));
  assert.equal(record.version, JSON.parse(read(join(source, 'template.json'))).version);
  assert.equal(Object.keys(record.files).length, 7);
  const before = read(join(project, 'template-version.json'));
  ok('--check'); ok();
  assert.equal(read(join(project, 'template-version.json')), before);
  const result = spawnSync(process.execPath, [join(project, 'build-index.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('dry-run creates no project files or directories', t => {
  const { project, ok } = fixture(t);
  const result = ok('--init', '--dry-run');
  assert.ok(result.stdout.includes('content.js'));
  assert.equal(existsSync(project), false);
});

test('preview writes only preview.html, embeds shared assets, and supports repeat/check/dry-run', t => {
  const { project, source, ok, run } = fixture(t);
  cpSync(join(source, 'example'), project, { recursive: true });
  const originals = {
    'index.html': '<p>Original live site</p>',
    'styles.css': '/* Original stylesheet */',
    'project.js': '// Original script',
    'template-version.json': 'Unrelated project record',
    'README.md': 'Existing documentation',
  };
  for (const [name, text] of Object.entries(originals)) writeFileSync(join(project, name), text);
  assert.deepEqual(JSON.parse(ok('--preview', '--dry-run').stdout).update, ['preview.html']);
  assert.equal(existsSync(join(project, 'preview.html')), false);
  assert.notEqual(run('--preview', '--check').status, 0);
  ok('--preview'); ok('--preview', '--check');
  const html = read(join(project, 'preview.html'));
  assert.match(html, /data:font\/woff2;base64,/);
  assert.match(html, /SIL OPEN FONT LICENSE/);
  assert.match(html, /<script src="content.js" defer><\/script>/);
  assert.doesNotMatch(html, /(?:src|href)="(?:styles.css|render-content.js|project.js)"/);
  assert.match(html, /<meta name="robots" content="noindex">/);
  for (const name of ['render-content.js', 'build-index.mjs', 'assets/fonts/InterVariable.woff2']) {
    assert.equal(existsSync(join(project, name)), false);
  }
  ok('--preview'); assert.equal(read(join(project, 'preview.html')), html);
  for (const [name, text] of Object.entries(originals)) assert.equal(read(join(project, name)), text);
  writeFileSync(join(project, 'content.js'), read(join(project, 'content.js')).replace('Project Name', 'New Name'));
  assert.notEqual(run('--preview', '--check').status, 0);
  ok('--preview'); ok('--preview', '--check');
  assert.match(read(join(project, 'preview.html')), /New Name/);
  assert.equal(read(join(project, 'index.html')), originals['index.html']);
});

test('preview rejects conflicting flags, unrelated output, symlinks, and missing media without writes', t => {
  const { project, source, run } = fixture(t);
  cpSync(join(source, 'example'), project, { recursive: true });
  for (const flags of [['--preview', '--init'], ['--preview', '--adopt'], ['--preview', '--dry-run', '--check']]) {
    assert.notEqual(run(...flags).status, 0);
  }
  writeFileSync(join(project, 'preview.html'), 'Original preview');
  assert.match(run('--preview').stderr, /not generated by this template/);
  assert.equal(read(join(project, 'preview.html')), 'Original preview');
  rmSync(join(project, 'preview.html'));
  const outside = resolve(project, '../outside.html'); writeFileSync(outside, 'Outside');
  symlinkSync(outside, join(project, 'preview.html'));
  assert.match(run('--preview').stderr, /symlink/);
  assert.equal(read(outside), 'Outside');
  rmSync(join(project, 'preview.html'));
  rmSync(join(project, 'assets/example-method.svg'));
  assert.match(run('--preview').stderr, /Missing local media/);
  assert.equal(existsSync(join(project, 'preview.html')), false);
});

test('preview can be adopted later without treating preview output as the homepage', t => {
  const { project, source, ok, run } = fixture(t);
  cpSync(join(source, 'example'), project, { recursive: true });
  writeFileSync(join(project, 'index.html'), 'Original site');
  ok('--preview'); const preview = read(join(project, 'preview.html'));
  assert.match(run().stderr, /explicit --adopt/);
  ok('--adopt'); ok('--check');
  assert.equal(read(join(project, 'preview.html')), preview);
  assert.match(read(join(project, 'index.html')), /src="render-content.js"/);
});

test('expandable examples, highlights, and embeds validate before generation', t => {
  const { project, source, ok, run } = fixture(t);
  cpSync(join(source, 'example'), project, { recursive: true });
  const original = read(join(project, 'content.js'));
  const withBody = body => original + `\nObject.assign(window.PAPER_CONTENT.results, ${JSON.stringify(body)});\n`;
  writeFileSync(join(project, 'content.js'), withBody({
    details: [{ title: 'Example', paragraphs: [['Question\n', { text: 'Answer', highlight: true }]] }],
    embed: { src: 'https://www.youtube.com/embed/abc', title: 'Video', width: 800, height: 450 },
  }));
  ok('--preview'); const before = read(join(project, 'preview.html'));
  for (const body of [
    { details: [{ paragraphs: ['No title'] }] },
    { details: [{ title: 'Missing media', figure: { src: 'missing.jpg' } }] },
    { embed: { src: 'javascript:alert(1)', title: 'Video', width: 800, height: 450 } },
    { embed: { src: 'https://example.com', title: 'Video', width: 0, height: 450 } },
  ]) {
    writeFileSync(join(project, 'content.js'), withBody(body));
    assert.notEqual(run('--preview').status, 0);
    assert.equal(read(join(project, 'preview.html')), before);
  }
});

test('custom title lines preserve metadata and reject empty or mismatched text before writes', t => {
  const { project, source, run, ok } = fixture(t); ok('--init');
  const path = join(project, 'content.js');
  const original = read(path);
  const withLines = lines => original.replace('name: "Project Name",',
    `name: "Project Name", titleLines: ${JSON.stringify(lines)},`);
  writeFileSync(path, withLines(['A Clear Title', 'for Your Research']));
  ok('--check');
  assert.match(read(join(project, 'index.html')), /Project Name — A Clear Title for Your Research/);
  const before = read(join(project, 'styles.css'));
  writeFileSync(join(source, 'template/styles.css'), before + '\n/* update */\n');
  for (const lines of [[], [''], ['A Clear Title', 42], 'A Clear Title', ['A Different Title']]) {
    writeFileSync(path, withLines(lines));
    const result = run();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /paper.titleLines/);
    assert.equal(read(join(project, 'styles.css')), before);
  }
});

test('inline links work in nested blocks; invalid paragraphs stop updates before writes', t => {
  const { project, source, run, ok } = fixture(t); ok('--init');
  const contentPath = join(project, 'content.js');
  const original = read(contentPath);
  const placeholder = '"Describe the experiment and its outcome."';
  const paragraph = ['Read ', { text: 'the method', url: '#method' }, ' and ',
    { text: '<paper & results>', url: 'https://example.com/paper' }, '.'];
  writeFileSync(contentPath, original.replace(placeholder, JSON.stringify(paragraph)));
  ok('--check');
  writeFileSync(join(source, 'template/styles.css'), read(join(source, 'template/styles.css')) + '\n/* update */\n');
  const before = read(join(project, 'styles.css'));
  for (const [value, error] of [
    [[{ text: 'Missing URL' }], /Inline links need/],
    [[{ text: 'Unsafe URL', url: 'javascript:alert(1)' }], /Inline links must use/],
    [42, /Each paragraph must be/],
  ]) {
    writeFileSync(contentPath, original.replace(placeholder, JSON.stringify(value)));
    const result = run();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, error);
    assert.equal(read(join(project, 'styles.css')), before);
  }
});

test('version update preserves edited content, README, and project media', t => {
  const { project, source, ok } = fixture(t); ok('--init');
  const content = read(join(project, 'content.js')).replace('Project Name', () => 'Second Project $& <Title>');
  writeFileSync(join(project, 'content.js'), content);
  writeFileSync(join(project, 'README.md'), 'My project documentation');
  writeFileSync(join(project, 'assets/my-results.txt'), 'Project data');
  writeFileSync(join(source, 'template/styles.css'), read(join(source, 'template/styles.css')) + '\n/* new release */\n');
  const manifest = JSON.parse(read(join(source, 'template.json'))); manifest.version = '1.0.1';
  writeFileSync(join(source, 'template.json'), JSON.stringify(manifest));
  ok(); ok('--check');
  assert.equal(read(join(project, 'content.js')), content);
  assert.equal(read(join(project, 'README.md')), 'My project documentation');
  assert.equal(read(join(project, 'assets/my-results.txt')), 'Project data');
  assert.ok(read(join(project, 'index.html')).includes('Second Project $&amp; &lt;Title&gt;'));
  assert.equal(JSON.parse(read(join(project, 'template-version.json'))).version, '1.0.1');
});

test('metadata rebuilt after a content edit is not treated as a local layout edit', t => {
  const { project, ok } = fixture(t); ok('--init');
  writeFileSync(join(project, 'content.js'), read(join(project, 'content.js')).replace('Project Name', 'Renamed Project'));
  const built = spawnSync(process.execPath, [join(project, 'build-index.mjs')], { encoding: 'utf8' });
  assert.equal(built.status, 0, built.stderr);
  ok('--check'); ok();
});

test('locally edited shared files stop the whole update before any writes', t => {
  const { project, source, run, ok } = fixture(t); ok('--init');
  writeFileSync(join(project, 'styles.css'), '/* local style change */');
  writeFileSync(join(source, 'template/project.js'), '// next version');
  const before = read(join(project, 'project.js'));
  const result = run();
  assert.notEqual(result.status, 0); assert.match(result.stderr, /Locally edited template files/);
  assert.equal(read(join(project, 'project.js')), before);
  assert.equal(read(join(project, 'styles.css')), '/* local style change */');
});

test('first migration requires --adopt for overlapping files; later --adopt cannot bypass edits', t => {
  const { project, source, run, ok } = fixture(t);
  cpSync(join(source, 'example'), project, { recursive: true });
  writeFileSync(join(project, 'index.html'), '<p>Old layout</p>');
  assert.match(run().stderr, /explicit --adopt/);
  assert.equal(read(join(project, 'index.html')), '<p>Old layout</p>');
  ok('--adopt');
  writeFileSync(join(project, 'styles.css'), 'local edit');
  assert.notEqual(run('--adopt').status, 0);
  assert.equal(read(join(project, 'styles.css')), 'local edit');
});

test('missing media fails preflight without overwriting existing files', t => {
  const { project, source, run } = fixture(t);
  cpSync(join(source, 'example'), project, { recursive: true });
  writeFileSync(join(project, 'index.html'), 'Original');
  rmSync(join(project, 'assets/example-method.svg'));
  const result = run('--adopt');
  assert.match(result.stderr, /Missing local media/);
  assert.equal(read(join(project, 'index.html')), 'Original');
  assert.equal(existsSync(join(project, 'template-version.json')), false);
});

test('reserved and duplicate section IDs are rejected', t => {
  const { project, source, run } = fixture(t);
  cpSync(join(source, 'example'), project, { recursive: true });
  const original = read(join(project, 'content.js'));
  writeFileSync(join(project, 'content.js'), original.replace('["abstract", "method", "results", "citation"]', '["abstract", "abstract"]'));
  assert.match(run().stderr, /Duplicate or reserved section id/);
  writeFileSync(join(project, 'content.js'), original.replace('["abstract", "method", "results", "citation"]', '["project"]').replace('abstract: {', 'project: {'));
  assert.match(run().stderr, /Duplicate or reserved section id/);
});

test('managed symlinks and path traversal cannot write outside a project', t => {
  const { project, source, run, ok } = fixture(t); ok('--init');
  const outside = resolve(project, '../outside.css'); writeFileSync(outside, 'outside');
  rmSync(join(project, 'styles.css')); symlinkSync(outside, join(project, 'styles.css'));
  assert.match(run().stderr, /symlink/); assert.equal(read(outside), 'outside');
  const manifest = JSON.parse(read(join(source, 'template.json'))); manifest.files = ['../outside.css', 'index.html'];
  writeFileSync(join(source, 'template.json'), JSON.stringify(manifest));
  assert.match(run().stderr, /Invalid managed path/); assert.equal(read(outside), 'outside');
});

test('obsolete managed files are removed while unrelated files remain', t => {
  const { project, source, ok } = fixture(t);
  const manifest = JSON.parse(read(join(source, 'template.json')));
  manifest.files.push('obsolete.js'); writeFileSync(join(source, 'template/obsolete.js'), '// old shared helper');
  writeFileSync(join(source, 'template.json'), JSON.stringify(manifest)); ok('--init');
  writeFileSync(join(project, 'keep.txt'), 'Project file');
  manifest.files.pop(); writeFileSync(join(source, 'template.json'), JSON.stringify(manifest));
  ok(); assert.equal(existsSync(join(project, 'obsolete.js')), false);
  assert.equal(read(join(project, 'keep.txt')), 'Project file');
});
