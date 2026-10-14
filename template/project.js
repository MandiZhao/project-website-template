// Theme preference defaults to the OS and persists after an explicit choice.
const themeToggle = document.querySelector('.theme-toggle');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
let themePreference;
try { themePreference = localStorage.getItem('project-website-color-scheme'); } catch { /* Local previews may block storage. */ }
if (!['light', 'dark'].includes(themePreference)) themePreference = null;
function applyTheme() {
  const scheme = themePreference || (systemTheme.matches ? 'dark' : 'light');
  document.documentElement.dataset.colorScheme = scheme;
  themeToggle.setAttribute('aria-pressed', String(scheme === 'dark'));
  themeToggle.title = `Switch to ${scheme === 'dark' ? 'light' : 'dark'} mode`;
}
themeToggle.addEventListener('click', () => {
  themePreference = document.documentElement.dataset.colorScheme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('project-website-color-scheme', themePreference); } catch { /* Still switch for this visit. */ }
  applyTheme();
});
systemTheme.addEventListener('change', applyTheme);
window.addEventListener('storage', event => {
  if (event.key !== 'project-website-color-scheme' && event.key !== null) return;
  themePreference = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
  applyTheme();
});
applyTheme();

// Navigation for the standalone research page.
const navLinks = [...document.querySelectorAll('.section-nav a')];
const sections = navLinks.map(link => document.querySelector(link.hash));

function updateNavigation() {
  const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + 25;
  let current = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= offset) current = section;
  }
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections.at(-1);
  navLinks.forEach(link => {
    if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

let scrollPending = false;
window.addEventListener('scroll', () => {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => { updateNavigation(); scrollPending = false; });
}, { passive: true });
window.addEventListener('resize', updateNavigation);
updateNavigation();

// Load clips near the viewport, then play only while they are visible.
const videos = [...document.querySelectorAll('video')];
const autoplayVideos = videos.filter(video => video.dataset.autoplay === 'true');
if (window.PAPER_CONTENT.media?.pauseOthers) {
  videos.forEach(video => video.addEventListener('play', () => {
    videos.forEach(other => { if (other !== video) other.pause(); });
  }));
}
function loadVideo(video) {
  const source = video.querySelector('source[data-src]');
  if (!source) return;
  source.src = source.dataset.src;
  delete source.dataset.src;
  video.load();
}

if ('IntersectionObserver' in window) {
  const loadObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      loadVideo(entry.target);
      loadObserver.unobserve(entry.target);
    }
  }, { rootMargin: '300px 0px' });
  const playbackObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
        loadVideo(video);
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, { threshold: [0, 0.25] });
  autoplayVideos.forEach(video => {
    loadObserver.observe(video);
    playbackObserver.observe(video);
  });
} else {
  autoplayVideos.forEach(video => {
    loadVideo(video);
    video.autoplay = true;
  });
}
