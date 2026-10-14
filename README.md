# Project website template

A reusable research website built with HTML, CSS, JavaScript, and Inter.
Requires Node.js 18+; no dependencies to install.

## Create a site

From this repository:

```sh
node scripts/update-project.mjs /path/to/project --init
```

Edit the generated `content.js` and open `index.html` to preview. Replace the
sample content, media, and `paper.siteUrl` before publishing.

## Preview an existing site

Prepare `content.js` using [the example](example/content.js), copying your existing
text and media paths. Then run from this repository:

```sh
node scripts/update-project.mjs /path/to/project --preview
node scripts/update-project.mjs /path/to/project --preview --check
```

Open `preview.html`. Only that file is generated: existing `index.html`, styles,
scripts, and assets stay untouched. Content edits appear on refresh; rerun the
command to refresh metadata or template code. Add `--dry-run` to inspect changes.

When ready to replace the homepage, run with `--adopt` instead of `--preview`.
This installs the shared files and replaces overlapping layout files.

## Edit and publish

Project content and colors belong in `content.js`; shared design changes belong
in `template/`. Before publishing, run from the project directory:

```sh
node build-index.mjs
node build-index.mjs --check
```

Commit and publish through the project's own GitHub Pages repository.

## Update a site

From the desired template checkout:

```sh
node scripts/update-project.mjs /path/to/project --dry-run
node scripts/update-project.mjs /path/to/project
node scripts/update-project.mjs /path/to/project --check
```

Updates preserve project content and media, stop on local edits to shared files,
and record the version in `template-version.json`. Each site updates separately.

For a template release, run `npm test`, bump `template.json`, commit, and tag
`vX.Y.Z`.
