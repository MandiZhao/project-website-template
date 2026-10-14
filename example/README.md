# Project website

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
