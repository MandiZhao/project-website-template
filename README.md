# Project website template

A reusable research-project website built with plain HTML, CSS, JavaScript, and
local Inter fonts. Each project keeps its own content, media, repository, and URL.
Requires Node.js 18+; no dependencies to install.

The header theme button switches between light and dark mode. It follows the
system preference until the visitor chooses a mode, then remembers that choice.
Dark mode uses a charcoal background and a lighter version of the project accent;
research images and videos retain their original colors.

## Create or migrate a site

From this repository, create a new site:

```sh
node scripts/update-project.mjs /path/to/new-project --init
```

Edit the generated `content.js` and open `index.html` to preview. Replace the
sample content, media, and `paper.siteUrl` before publishing.

For an existing site, prepare `content.js` using [the example](example/content.js),
then install the shared files:

```sh
node scripts/update-project.mjs /path/to/project --adopt --dry-run
node scripts/update-project.mjs /path/to/project --adopt
```

`--adopt` allows replacing overlapping layout files on the first migration.

## Edit content

Project text, links, media, colors, and section order belong in `content.js`.
Shared layout and behavior belong in `template/`.

- `paper`: title, description, site URL, authors, affiliations, resources, and teaser.
- `theme`: accent/text colors and optional background tint.
- `media`: autoplay and playback options.
- `sectionOrder`: ordered section IDs; each names a section with a `title`.
- `navTitle`: optional section label for the sidebar.

Sections render `paragraphs`, `figure`, `videos`, `bibtex`, then nested `blocks`.
Use ordered blocks to interleave text and media. Captions can be blank.
Paragraphs accept plain strings or inline text/link segments:

```js
paragraphs: [
  "A normal paragraph.",
  ["See the ", { text: "method", url: "#method" }, " for details."]
]
```

To choose title breaks, add `paper.titleLines`. Its combined text must
match `paper.title`, which supplies browser and social titles:

```js
title: "Reconstruct Articulated Objects via Code Generation",
titleLines: ["Reconstruct Articulated Objects", "via Code Generation"],
```

Each entry starts a new line and can wrap further on small screens. Omit
`titleLines` for automatic wrapping.

Before publishing, run these from the project directory to update and validate
page metadata and local media:

```sh
node build-index.mjs
node build-index.mjs --check
```

## Update the shared template

Choose a release in this repository, then update a project:

```sh
git switch --detach v1.0.0
node scripts/update-project.mjs /path/to/project --dry-run
node scripts/update-project.mjs /path/to/project
node scripts/update-project.mjs /path/to/project --check
```

The updater preserves project content and media, stops on local edits to shared
files, and records the installed version in `template-version.json`. Each site
remains self-contained. Updates do not commit, push, or publish anything.

To release a design change, return to `main`, edit `template/`, run `npm test`,
and preview at desktop and mobile widths. Bump `template.json`, commit, and tag
`vX.Y.Z`. Update each project separately, then review and publish through its
existing GitHub Pages workflow.
