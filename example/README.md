# Project website

Inside the template repository, open `example.html` for the layout showcase.
Edit `content.js` and refresh. Run `npm run build:example` from the repository
root to regenerate its embedded template styles and scripts, then run
`npm run check:example`. The small local video and SVGs are placeholders.
The embed uses an intentional example.com URL; replace it with your provider URL.

In a project created with `--init`, follow the instructions below.

Edit `content.js` and refresh `index.html` in your browser. Project text, media,
section order, navigation, theme colors, and playback settings all live there.
Place project media in `assets/`. Use `paper.siteUrl` for the published URL.

Before publishing, run:

```sh
node build-index.mjs
node build-index.mjs --check
```

This updates static metadata for link previews and checks local media. The page
body renders in the browser, so JavaScript must be enabled.

Shared files come from `project-website-template`; their version is recorded in
`template-version.json`. To update, use a checkout of the desired template release:

```sh
node /path/to/project-website-template/scripts/update-project.mjs /path/to/this-project --dry-run
node /path/to/project-website-template/scripts/update-project.mjs /path/to/this-project
```

Keep visual changes in the template repository. The updater preserves this
README, `content.js`, and all project assets except the shared Inter font files.
It stops if template-owned files have been edited locally.

See the template repository's README for the content format and release workflow.
