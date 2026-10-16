# Project website template

A reusable research website built with HTML, CSS, JavaScript, and Inter.
Requires Node.js 18+; no dependencies to install.

Open [example/example.html](example/example.html) for a placeholder gallery of
text, figures, numbered explanations, wrapped figures, video grids, task carousels, disclosures,
code, embeds, and citations. The editable source is [example/content.js](example/content.js).
After template or example metadata changes, run `npm run build:example` and
`npm run check:example`. Content edits appear on refresh.

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

For expandable code blocks, set `format: "code"` on a `details` entry.
`theme.codeTintPercent` sets the accent tint (0–100, default 8); an entry's
`tintPercent` overrides it. Text stays in `paragraphs`, preserving line breaks.

For numbered explanations beside an image, use a block with `layout: "figure-wrap"`,
`figure`, and `orderedList`. The image takes half the content width on the right;
text wraps beside and below it. On screens up to 600px, the image stacks above
the text. List entries accept a `title` and the usual body fields, including
`paragraphs` with inline links. `orderedList` also works without a wrapped figure.

```js
{
  layout: "figure-wrap",
  figure: { src: "assets/method.png", alt: "Method diagram", width: 800, height: 900 },
  orderedList: [
    { title: "First mechanism", paragraphs: ["Explain the first mechanism."] },
    { title: "Second mechanism", paragraphs: ["Explain the second mechanism."] }
  ]
}
```

Use ordinary `blocks` for experiment videos that should always be visible;
`details` adds a collapsible disclosure.

For task-by-task experiments, add a `carousel` to a section or block:

```js
carousel: {
  label: "Forward transfer tasks",
  slides: [{
    title: "Task name",
    playbackRate: 3,
    paragraphs: ["Describe this task."],
    groups: [
      { title: "Our method", metric: "77% success", videos: [/* clips */] },
      { title: "Baseline", metric: "33% success", videos: [/* clips */] }
    ]
  }]
}
```

Slides and groups accept the usual body fields, including figures and blocks.
Each group represents one method or baseline, with its own horizontal row,
success rate, and independent arrows. Secondary arrow buttons are 15% smaller
than the outer task buttons. Desktop
rows show up to 2½ cards; mobile rows show 1¼ for readable videos and captions.
The partial next card hints that more examples are available. Touch/trackpad
scrolling and focused arrow-key navigation work at the method level, while the
outer arrows cycle whole tasks. Each method remembers its scroll position.
An accompanying task figure shares its method's row. Hidden tasks unload their
videos, and only visible clips play. Printing includes every task and clip.
For a standalone video row, set `videoLayout: "carousel"` on any body containing
`videos`; ordinary videos keep the existing grid layout.

Playback defaults to at most two simultaneous clips across the page. Set
`media.maxConcurrentVideos` (1–8) to change that limit, or `media.pauseOthers: true`
for a single clip. Manual play takes priority; an explicit pause is respected
while the video remains visible. Offscreen sources are released after a short
delay, and playback pauses while the page is hidden. Add a `poster` to each clip
for a lightweight preview before it plays. `playbackRate` can be set per slide
or per clip; a clip's value takes precedence. For web copies with speed already
encoded, set the clip's `playbackRate: 1`. An optional `originalSrc` points the
fallback download link to the original recording. Prefer H.264 MP4 web copies
with a fast-start header, suitable display resolution, and a modest frame rate.

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
