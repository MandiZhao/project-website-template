// Shared content renderer. Classic scripts keep direct file:// opening working.
(() => {
  const content = window.PAPER_CONTENT;
  // Two editable colors drive all page chrome; derived shades live in CSS.
  if (content.theme) {
    const root = document.documentElement;
    if (content.theme.accent && CSS.supports('color', content.theme.accent)) {
      root.style.setProperty('--theme-accent', content.theme.accent);
    }
    if (content.theme.text && CSS.supports('color', content.theme.text)) {
      root.style.setProperty('--theme-text', content.theme.text);
    }
    root.dataset.tintBackground = String(content.theme.tintBackground === true);
    const requestedTint = Number(content.theme.backgroundTintPercent ?? 4);
    const tint = Number.isFinite(requestedTint) ? Math.max(0, Math.min(100, requestedTint)) : 4;
    root.style.setProperty('--background-tint-percent', `${tint}%`);

  }
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const linkedName = (name, website, className) => {
    const node = element(website ? 'a' : 'span', className, name);
    if (website) node.href = website;
    return node;
  };
  const copyText = async (text) => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch { /* Fall back for local files and restricted browsers. */ }
    }
    const input = element('textarea');
    input.value = text;
    input.readOnly = true;
    input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.append(input);
    input.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { /* Show failure below. */ }
    input.remove();
    return copied;
  };
  const renderFigure = (media) => {
    const figure = element('figure', 'method-figure');
    const image = element('img');
    image.src = media.src;
    image.alt = media.alt;
    image.width = media.width;
    image.height = media.height;
    image.decoding = 'async';
    image.loading = 'lazy';
    figure.append(image);
    if (media.caption || media.captionLabel) {
      const caption = element('figcaption');
      if (media.captionLabel) caption.append(element('span', 'caption-label', media.captionLabel), ' ');
      if (media.caption) caption.append(document.createTextNode(media.caption.trim()));
      figure.append(caption);
    }
    return figure;
  };
  let videoCount = 0;
  const renderVideo = (clip) => {
    const figure = element('figure', 'video-figure');
    const video = element('video');
    video.controls = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = 'none';
    const autoplay = clip.autoplay ?? content.media?.autoplay ?? true;
    video.dataset.autoplay = String(autoplay);
    if (clip.poster) video.poster = clip.poster;
    video.width = clip.width;
    video.height = clip.height;
    video.style.aspectRatio = `${clip.width} / ${clip.height}`;
    video.setAttribute('aria-label', clip.alt || clip.title);
    const source = element('source');
    if (autoplay) source.dataset.src = clip.src;
    else source.src = clip.src;
    source.type = clip.type || 'video/mp4';
    video.append(source, 'Your browser does not support video. ', linkedName('Download this clip.', clip.src));
    figure.append(video);
    if (clip.title || clip.caption) {
      const caption = element('figcaption');
      caption.id = `video-caption-${++videoCount}`;
      if (clip.title) caption.append(element('span', '', clip.title));
      if (clip.caption) caption.append(element('small', '', clip.caption));
      video.setAttribute('aria-describedby', caption.id);
      figure.append(caption);
    }
    return figure;
  };
  const renderBody = (container, data) => {
    const paragraphs = data.paragraphs || [];
    if (paragraphs.length) {
      const text = element('div', 'text-block');
      text.append(...paragraphs.map(paragraph => {
        const node = element('p', 'prose');
        if (typeof paragraph === 'string') node.textContent = paragraph.trim();
        else node.append(...paragraph.map(part => typeof part === 'string'
          ? document.createTextNode(part)
          : linkedName(part.text, part.url)));
        return node;
      }));
      container.append(text);
    }
    if (data.figure) container.append(renderFigure(data.figure));
    if (data.videos?.length) {
      const grid = element('div', 'video-grid');
      grid.dataset.count = data.videos.length;
      grid.append(...data.videos.map(renderVideo));
      container.append(grid);
    }
    if (typeof data.bibtex === 'string' && data.bibtex.trim()) {
      const wrapper = element('div', 'citation-code-wrap');
      const pre = element('pre', 'citation-code');
      pre.append(element('code', '', data.bibtex.trim()));
      const button = element('button', 'citation-copy');
      button.type = 'button';
      button.setAttribute('aria-label', 'Copy BibTeX citation');
      button.title = 'Copy BibTeX citation';
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/></svg>';
      const status = element('span', 'citation-copy-status');
      status.setAttribute('role', 'status');
      status.hidden = true;
      let statusTimer;
      button.addEventListener('click', async () => {
        const copied = await copyText(pre.querySelector('code').textContent);
        status.textContent = copied ? 'Copied' : 'Copy failed';
        status.hidden = false;
        clearTimeout(statusTimer);
        statusTimer = setTimeout(() => { status.hidden = true; }, 2000);
      });
      wrapper.append(pre, button, status);
      container.append(wrapper);
    }
    for (const block of data.blocks || []) {
      const item = element('div', 'content-block');
      if (block.title) item.append(element('h3', '', block.title));
      renderBody(item, block);
      if (item.childElementCount) container.append(item);
    }
  };

  const { paper } = content;
  if (paper.favicon) document.querySelector('link[rel="icon"]').href = paper.favicon;
  document.title = `${paper.name} — ${paper.title}`;
  document.querySelector('meta[name="description"]').content = paper.description;
  document.querySelector('meta[property="og:title"]').content = `${paper.name}: ${paper.title}`;
  document.querySelector('meta[property="og:description"]').content = paper.description;
  if (paper.siteUrl) document.querySelector('meta[property="og:url"]').content = paper.siteUrl;
  const socialImage = paper.socialImage || content.abstract?.figure?.src || paper.video?.poster;
  if (socialImage) {
    document.querySelector('meta[property="og:image"]').content = new URL(socialImage, paper.siteUrl || location.href).href;
  }
  if (paper.analyticsId && paper.siteUrl && location.hostname === new URL(paper.siteUrl).hostname) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', paper.analyticsId);
    const analytics = document.createElement('script');
    analytics.async = true;
    analytics.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(paper.analyticsId)}`;
    document.head.append(analytics);
  }
  document.querySelectorAll('[data-content="paper.name"]').forEach(node => { node.textContent = paper.name; });
  document.querySelector('.wordmark').setAttribute('aria-label', `${paper.name} project overview`);
  document.querySelector('h1').replaceChildren(
    element('span', 'project-name', `${paper.name}:`),
    ...(paper.titleLines
      ? paper.titleLines.map((line, index) => element('span', 'title-line',
        `${line.trim()}${index < paper.titleLines.length - 1 ? ' ' : ''}`))
      : [document.createTextNode(` ${paper.title}`)]),
  );
  document.querySelector('.authors').replaceChildren(...(paper.authors || []).map(author => {
    const item = element('span');
    item.append(linkedName(author.name, author.website, 'author-name'));
    const labels = `${(author.affiliations || []).join(',')}${author.notes || ''}`;
    if (labels) item.append(element('sup', '', labels));
    return item;
  }));
  const note = document.querySelector('.contribution');
  const affiliationsRow = document.querySelector('.affiliations');
  affiliationsRow.replaceChildren(...(paper.affiliations || []).map(affiliation => {
    const item = element('span');
    item.append(element('sup', '', affiliation.id), ' ', linkedName(affiliation.name, affiliation.website, 'affiliation-name'));
    return item;
  }), note);
  const resources = document.querySelector('.paper-links');
  const links = paper.links || [];
  resources.replaceChildren(...links.map(link => {
    const item = linkedName(link.label, link.url, 'paper-link');
    if (!link.url) {
      item.setAttribute('role', 'link');
      item.setAttribute('aria-disabled', 'true');
      item.setAttribute('aria-label', `${link.label} (link coming soon)`);
    }
    return item;
  }));
  resources.hidden = links.length === 0;
  const logos = (paper.logos || []).filter(logo => logo.src);
  const logoRow = document.querySelector('.paper-logos');
  logoRow.replaceChildren(...logos.map(logo => {
    const item = element(logo.url ? 'a' : 'span', 'paper-logo');
    if (logo.url) item.href = logo.url;
    const image = element('img');
    image.src = logo.src;
    image.alt = logo.alt || '';
    if (logo.width) image.width = logo.width;
    if (logo.height) image.height = logo.height;
    image.decoding = 'async';
    item.append(image);
    return item;
  }));
  logoRow.hidden = logos.length === 0;
  document.querySelector('.paper-resources').hidden = links.length === 0 && logos.length === 0;
  const authorNotes = Array.isArray(paper.authorNotes) ? paper.authorNotes : [paper.authorNotes];
  const visibleNotes = authorNotes.filter(text => typeof text === 'string' && text.trim());
  note.replaceChildren(...visibleNotes.map(text => element('span', '', text.trim())));
  note.hidden = visibleNotes.length === 0;
  affiliationsRow.hidden = !(paper.affiliations || []).length && note.hidden;
  const conference = document.querySelector('.conference');
  conference.textContent = paper.conference || '';
  conference.hidden = !paper.conference;
  const teaser = document.querySelector('.project-teaser');
  teaser.replaceChildren(...(paper.video ? [renderVideo(paper.video)] : []));

  const sectionContainer = document.querySelector('.sections');
  const navigation = document.querySelector('.section-nav');
  for (const id of content.sectionOrder || []) {
    const section = content[id];
    if (!section) continue;
    const sectionNode = element('section', 'section');
    sectionNode.id = id;
    sectionNode.setAttribute('aria-labelledby', `${id}-heading`);
    const heading = element('h2', 'section-heading', section.title || id);
    heading.id = `${id}-heading`;
    const body = element('div', 'section-content');
    renderBody(body, section);
    sectionNode.append(heading, body);
    sectionContainer.append(sectionNode);
    if (section.navTitle) {
      const link = document.createElement('a');
      link.href = `#${id}`;
      link.append(
        element('span', 'nav-index', String(navigation.children.length).padStart(2, '0')),
        element('span', 'nav-text', section.navTitle),
      );
      navigation.append(link);
    }
  }
})();
