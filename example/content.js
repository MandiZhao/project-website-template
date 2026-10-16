// Open example.html here, or index.html in a project created with --init.
// Edit this file and refresh. Run npm run build:example after template/metadata edits.
// Copy any section or block into your own content.js and replace the placeholders.
const placeholderVideo = {
  src: "assets/placeholder.mp4", poster: "assets/placeholder-wide.svg",
  alt: "Blank placeholder video", width: 960, height: 540, loop: true
};

window.PAPER_CONTENT = {
  schemaVersion: 1,
  sectionOrder: ["abstract", "method", "lists", "wrapped", "results", "carousel", "details", "citation"],
  theme: {
    accent: "#355E3B", text: "#253243",
    tintBackground: false, backgroundTintPercent: 4, // Enable tintBackground to tint the page.
    codeTintPercent: 8 // Expandable code background tint, 0–100.
  },
  media: {
    autoplay: true, // Muted playback only while a clip is visible.
    pauseOthers: false, // Set true to allow only one playing clip.
    maxConcurrentVideos: 2 // Automatic and manual playback share this limit.
  },
  paper: {
    name: "Project Name",
    title: "A Clear Title for Your Research",
    titleLines: ["A Clear Title", "for Your Research"], // Optional explicit line breaks.
    description: "A placeholder gallery of every section layout in the research website template.",
    siteUrl: "https://example.com/", // Replace before publishing.
    socialImage: "assets/placeholder-wide.svg", analyticsId: "",
    authors: [
      { name: "Author One", website: "https://example.com/", affiliations: ["1"], notes: "*" },
      { name: "Author Two", website: "", affiliations: ["1", "2"], notes: "*" },
      { name: "Author Three", website: "", affiliations: ["2"] }
    ],
    affiliations: [
      { id: "1", name: "Example University", website: "https://example.com/" },
      { id: "2", name: "Example Research Lab", website: "" }
    ],
    authorNotes: ["* Equal contribution", "Correspondence: Author One"],
    conference: "Example Conference · 2026",
    links: [
      { label: "Paper", url: "https://example.com/paper" },
      { label: "Code", url: "" } // Empty URLs show disabled resource links.
    ],
    logos: [{ src: "assets/placeholder-logo.svg", alt: "Placeholder institution logo", width: 240, height: 60 }],
    video: { ...placeholderVideo, title: "Project teaser", caption: "A full-width teaser with native playback controls." }
  },

  // 1. Text-only section, multiple paragraphs, inline links, and highlights.
  abstract: {
    title: "Text and inline formatting", navTitle: "Text",
    paragraphs: [
      "Describe the problem, your approach, and the principal finding here.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. This second paragraph shows the reading width and spacing between paragraphs.",
      ["An inline ", { text: "placeholder link", url: "https://example.com/" }, " can sit beside a ",
        { text: "highlighted finding", highlight: true }, " within a paragraph."]
    ]
  },

  // 2. A full-width figure with a caption; blocks control content order.
  method: {
    title: "Full-width figures and ordered blocks", navTitle: "Figures",
    blocks: [
      { paragraphs: ["Explain the approach and replace the example figure with your own."] },
      { figure: {
        src: "assets/example-method.svg", alt: "Blank full-width figure placeholder", width: 1200, height: 360,
        captionLabel: "Figure 1.", caption: "A wide figure, followed by its caption and then supporting text."
      } },
      { title: "Commentary after a figure", paragraphs: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Use a titled block to introduce a result, explain an illustration, or add a short subsection."] }
    ]
  },

  // 3. Numbered explanations without an image. Omitting navTitle hides only the nav link.
  lists: {
    title: "Numbered explanations",
    orderedList: [
      { title: "First mechanism", paragraphs: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Describe the first part of the approach here."] },
      { title: "Second mechanism", paragraphs: ["Integer posuere erat a ante venenatis dapibus. Describe the second part of the approach here."] },
      { paragraphs: ["A list entry can also omit its title and contain only a paragraph."] }
    ]
  },

  // 4. Half-width images float right; at 600px and below they stack above the text.
  wrapped: {
    title: "Half-width figures with wrapped text", navTitle: "Wrap",
    blocks: [
      {
        title: "Wrapped paragraphs", layout: "figure-wrap",
        figure: {
          src: "assets/placeholder-tall.svg", alt: "Blank portrait figure placeholder", width: 800, height: 900,
          captionLabel: "Figure 2.", caption: "A half-width portrait figure."
        },
        paragraphs: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. The image sits to the right of the opening paragraphs.",
          "Donec ullamcorper nulla non metus auctor fringilla. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Keep enough text here to demonstrate how the paragraph wraps around the image.",
          "Vestibulum id ligula porta felis euismod semper. Curabitur blandit tempus porttitor. Once the text reaches the bottom of the figure, it continues across the full available width."
        ]
      },
      {
        title: "Wrapped numbered mechanisms", layout: "figure-wrap",
        figure: {
          src: "assets/placeholder-tall.svg", alt: "Blank mechanism diagram placeholder", width: 800, height: 900,
          captionLabel: "Figure 3.", caption: "An image paired with a numbered list."
        },
        orderedList: [
          { title: "Prediction targets", paragraphs: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Describe the predicted outputs and explain why they are useful. Integer posuere erat a ante venenatis dapibus posuere velit aliquet."] },
          { title: "Multistage fusion", paragraphs: ["Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Describe how multiple inputs are combined and how their information reaches the model."] },
          { title: "Experience replay", paragraphs: ["Donec ullamcorper nulla non metus auctor fringilla. Explain the final mechanism here. Cras mattis consectetur purus sit amet fermentum. Longer text continues below the figure at the full reading width."] }
        ]
      }
    ]
  },

  // 5. Always-visible single clips, paired clips, larger grids, and video embeds.
  results: {
    title: "Videos and experiment results", navTitle: "Media",
    blocks: [
      { title: "Single full-width video", paragraphs: ["Describe the experiment and its outcome."] },
      { videos: [{ ...placeholderVideo, title: "Experiment A", caption: "A single clip fills the content width.", autoplay: false,
        links: [{ label: "Download placeholder clip", url: "assets/placeholder.mp4" }] }] },
      { title: "Two-column comparison", paragraphs: ["These results stay visible. Clips form two columns on larger screens and one column on mobile."] },
      { videos: [
        { ...placeholderVideo, title: "Method A", caption: "Placeholder result for the first method." },
        { ...placeholderVideo, title: "Method B", caption: "Placeholder result for the second method." }
      ] },
      { title: "Multiple rows of results" },
      { videos: [
        { ...placeholderVideo, title: "Trial 1", caption: "Placeholder caption." },
        { ...placeholderVideo, title: "Trial 2", caption: "Placeholder caption." },
        { ...placeholderVideo, title: "Trial 3", caption: "Placeholder caption." },
        { ...placeholderVideo, title: "Trial 4", caption: "Placeholder caption." }
      ] },
      { paragraphs: ["Use ordered blocks to place commentary after figures or videos."] },
      {
        title: "Embedded video",
        paragraphs: ["Replace this reserved example.com URL with a video provider's embed URL. Direct file previews show the watch link; HTTP previews also render the iframe."],
        embed: { src: "https://example.com/", url: "https://example.com/video", title: "Placeholder video embed", width: 960, height: 540 }
      }
    ]
  },

  // 6. Nested carousels: tasks at the outer level, one scrollable row per method.
  carousel: {
    title: "Task carousel with method comparisons", navTitle: "Tasks",
    paragraphs: ["Use the task arrows to change experiments, then each method's arrows to browse its clips. Rows show up to 2½ cards on desktop, with a smaller peek on mobile."],
    carousel: {
      label: "Example experiment tasks",
      slides: [
        {
          title: "Task A", playbackRate: 3,
          paragraphs: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Describe the first task and the evaluation setup here."],
          groups: [
            { title: "Method A", metric: "77% success", videos: [
              { ...placeholderVideo, title: "Trial 1", caption: "Placeholder outcome for Method A." },
              { ...placeholderVideo, title: "Trial 2", caption: "Another placeholder outcome." },
              { ...placeholderVideo, title: "Trial 3", caption: "Move right to reveal this clip." },
              { ...placeholderVideo, title: "Trial 4", caption: "The last clip in this method's row." }
            ] },
            { title: "Baseline A", metric: "33% success", videos: [
              { ...placeholderVideo, title: "Trial 1", caption: "Placeholder outcome for the baseline." },
              { ...placeholderVideo, title: "Trial 2", caption: "Another placeholder outcome." }
            ] },
            { title: "Baseline B", metric: "53% success", videos: [
              { ...placeholderVideo, title: "Trial 3", caption: "An additional baseline example." },
              { ...placeholderVideo, title: "Trial 4", caption: "The final baseline example." }
            ] }
          ]
        },
        {
          title: "Task B", playbackRate: 1,
          paragraphs: ["Integer posuere erat a ante venenatis dapibus. Groups can include ordinary blocks, figures, videos, and supporting text."],
          groups: [
            { title: "Method A", metric: "87% success", blocks: [
              { videos: [{ ...placeholderVideo, caption: "A clip for the second task." }] },
              { figure: { src: "assets/placeholder-wide.svg", alt: "Blank task illustration", width: 960, height: 540, caption: "An accompanying task illustration." } }
            ] },
            { title: "Baseline", metric: "60% success", videos: [{ ...placeholderVideo, caption: "The matching baseline clip." }] }
          ]
        },
        {
          title: "Task C", playbackRate: 2,
          paragraphs: ["A task can also use its own clip row without comparison groups. Set videoLayout to carousel on any body with videos."],
          videoLayout: "carousel",
          videos: [
            { ...placeholderVideo, title: "Result 1", caption: "The first example." },
            { ...placeholderVideo, title: "Result 2", caption: "The second example." },
            { ...placeholderVideo, title: "Result 3", caption: "The third example." },
            { ...placeholderVideo, title: "Result 4", caption: "The fourth example." }
          ]
        }
      ]
    }
  },

  // 7. Expandable prose, nested content, and code with global/individual tint.
  details: {
    title: "Expandable prose and code", navTitle: "Details",
    paragraphs: ["Expand these entries to inspect prose, nested media, and code formatting."],
    details: [
      {
        title: "Supplementary explanation",
        paragraphs: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit. This disclosure contains ordinary body text.",
          ["An answer can include ", { text: "highlighted text", highlight: true }, " and ", { text: "links", url: "https://example.com/" }, "."]],
        blocks: [{ title: "Nested content", figure: {
          src: "assets/placeholder-wide.svg", alt: "Blank supplementary figure placeholder", width: 960, height: 540,
          captionLabel: "Figure 4.", caption: "Figures and titled blocks can also appear within a disclosure."
        } }]
      },
      {
        title: "Code with the default accent tint", format: "code",
        paragraphs: ["def example(inputs):\n    prediction = model(inputs)\n    return prediction\n\n# Whitespace and line breaks are preserved."]
      },
      {
        title: "Code with an individual tint override", format: "code", tintPercent: 20,
        paragraphs: ["{\n  \"learning_rate\": 0.001,\n  \"batch_size\": 32,\n  \"epochs\": 100\n}",
          ["Selected value: ", { text: "0.001", highlight: true }]]
      }
    ]
  },

  // 8. BibTeX with a copy button.
  citation: {
    title: "Citation with copy control", navTitle: "Cite",
    bibtex: "@misc{yourproject,\n  title={A Clear Title for Your Research},\n  author={Author One and Author Two and Author Three},\n  year={2026}\n}"
  }
};
