// Edit this file and refresh index.html. No build is needed for local previews.
// Before publishing, run: node build-index.mjs
// Text is plain text; paragraphs also accept arrays of strings and { text, url } links.
// Media paths are relative to index.html.
window.PAPER_CONTENT = {
  schemaVersion: 1,
  sectionOrder: ["abstract", "method", "results", "citation"],
  theme: {
    accent: "#355E3B",
    text: "#253243",
    tintBackground: false,
    backgroundTintPercent: 0,
    codeTintPercent: 8 // Background accent percentage for expandable code blocks (0–100).
  },
  media: {
    autoplay: true, // Play muted clips while visible. Individual clips can override this.
    pauseOthers: false
  },
  paper: {
    name: "Project Name",
    title: "A Clear Title for Your Research",
    // Optional line breaks; the combined text must match title. Omit for automatic wrapping.
    // titleLines: ["A Clear Title", "for Your Research"],
    description: "Replace this description with a short summary of your project.",
    siteUrl: "https://example.com/", // Replace with this project's published URL.
    socialImage: "assets/example-method.svg",
    analyticsId: "", // Optional; only runs on the hostname in siteUrl.
    authors: [{ name: "Author Name", website: "", affiliations: ["1"] }],
    affiliations: [{ id: "1", name: "Institution", website: "" }],
    authorNotes: "",
    conference: "",
    links: [{ label: "Paper", url: "" }, { label: "Code", url: "" }],
    logos: [],
    video: null
  },
  abstract: {
    title: "Abstract",
    navTitle: "Abstract", // Omit navTitle to leave a section out of the sidebar.
    paragraphs: ["Describe the problem, your approach, and the principal finding here."]
  },
  method: {
    title: "Method",
    navTitle: "Method",
    paragraphs: ["Explain the approach and replace the example figure with your own."],
    figure: {
      src: "assets/example-method.svg",
      alt: "Example method diagram with input, method, and output stages.",
      width: 1200,
      height: 360,
      captionLabel: "",
      caption: ""
    }
  },
  results: {
    title: "Results",
    navTitle: "Results",
    blocks: [
      // Optional video embed: { embed: { src: "https://example.com/embed/video", title: "Video", width: 800, height: 450 } }.
      // Optional expandable text: { details: [{ title: "Example", paragraphs: ["Prompt\nResponse"] }] }.
      // Add format: "code" for a monospace block; optional tintPercent: 12 overrides theme.codeTintPercent.
      // Inline highlights: paragraphs: [["Answer: ", { text: "Correct option", highlight: true }]].
      { title: "Experiment", paragraphs: ["Describe the experiment and its outcome."] },
      // Add videos as { src, poster, alt, width, height, title: "", caption: "" }.
      // Videos also accept loop: true and links: [{ label: "Transcript", url: "..." }].
      { videos: [] },
      { paragraphs: ["Use ordered blocks to place commentary after figures or videos."] }
    ]
  },
  citation: {
    title: "Citation",
    bibtex: "@misc{yourproject,\n  title={A Clear Title for Your Research},\n  author={Author Name},\n  year={2026}\n}"
  }
};
