// Adds "Open in Stremio" button to DuckDuckGo search results for movies and TV shows.

(function () {
  const BTN_ID = "stremio-btn-ddg";
  const STREMIO_COLOR = "#7b5bf5";

  function extractImdbId() {
    // Look for IMDb links on the page
    const imdbLink = document.querySelector('a[href*="imdb.com/title/tt"]');
    if (imdbLink) {
      const match = imdbLink.href.match(/tt\d{5,}/);
      return match ? match[0] : null;
    }
    return null;
  }

  function guessType() {
    const text = document.body.innerText.toLowerCase();
    if (text.includes("tv series") || text.includes("tv show") || text.includes("episodes") || text.includes("seasons")) {
      return "series";
    }
    return "movie";
  }

  function extractTitle() {
    // Try to get title from the instant answer box
    const titleEl = document.querySelector('[data-testid="InfoboxTitle"], .module--about__title, .c-base__title');
    if (titleEl) {
      return titleEl.textContent.trim();
    }
    // Fallback to search query
    const searchInput = document.querySelector('input[name="q"]');
    if (searchInput && searchInput.value) {
      return searchInput.value.trim();
    }
    return "stremio";
  }

  function buildStremioUrls() {
    const imdbId = extractImdbId();
    if (imdbId) {
      const type = guessType();
      return {
        app: `stremio:///detail/${type}/${imdbId}`,
        web: `https://web.stremio.com/#/detail/${type}/${imdbId}`
      };
    }
    const title = encodeURIComponent(extractTitle());
    return {
      app: `stremio:///search?search=${title}`,
      web: `https://web.stremio.com/#/search?search=${title}`
    };
  }

  function createStremioButton(urls) {
    const container = document.createElement("div");
    container.id = BTN_ID;
    container.style.cssText = `
      display: inline-flex;
      align-items: center;
      margin: 10px 0;
    `;

    const link = document.createElement("a");
    link.href = urls.app;
    link.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: linear-gradient(135deg, ${STREMIO_COLOR} 0%, #6b4ce0 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      transition: transform 0.2s, box-shadow 0.2s;
    `;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = urls.app;
    });

    link.addEventListener("mouseenter", () => {
      link.style.transform = "scale(1.02)";
      link.style.boxShadow = "0 4px 12px rgba(123, 91, 245, 0.4)";
    });

    link.addEventListener("mouseleave", () => {
      link.style.transform = "scale(1)";
      link.style.boxShadow = "none";
    });

    // Play icon
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "white");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M8 5v14l11-7z");
    svg.appendChild(path);

    const text = document.createElement("span");
    text.textContent = "Open in Stremio";

    link.appendChild(svg);
    link.appendChild(text);
    container.appendChild(link);

    return container;
  }

  function findMovieInfoBox() {
    // DuckDuckGo uses various selectors for movie/TV info boxes
    const selectors = [
      '[data-testid="InfoboxContainer"]',
      '.module--about',
      '.c-base',
      '.module--movie',
      '.module--tv',
      '.zci--info',
      '.zci--movie',
      '.zci--tv'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  function isMovieOrTVPage() {
    const text = document.body.innerText.toLowerCase();
    const movieKeywords = ["movie", "film", "director", "starring", "runtime", "box office", "released"];
    const tvKeywords = ["tv series", "tv show", "episodes", "seasons", "network", "first aired"];
    
    const hasImdb = !!document.querySelector('a[href*="imdb.com/title/"]');
    const hasMovieKeywords = movieKeywords.some(kw => text.includes(kw));
    const hasTVKeywords = tvKeywords.some(kw => text.includes(kw));

    return hasImdb || hasMovieKeywords || hasTVKeywords;
  }

  function injectButton() {
    if (document.getElementById(BTN_ID)) return;
    if (!isMovieOrTVPage()) return;

    const infoBox = findMovieInfoBox();
    if (!infoBox) return;

    const urls = buildStremioUrls();
    const button = createStremioButton(urls);

    // Find a good place to insert the button
    const titleEl = infoBox.querySelector('[data-testid="InfoboxTitle"], .module--about__title, .c-base__title, h2, h3');
    if (titleEl && titleEl.parentElement) {
      titleEl.parentElement.insertBefore(button, titleEl.nextSibling);
    } else {
      infoBox.insertBefore(button, infoBox.firstChild);
    }
  }

  // Debounce
  let debounceTimer;
  function debouncedInject() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(injectButton, 200);
  }

  // Observe DOM changes (DuckDuckGo loads content dynamically)
  const observer = new MutationObserver(debouncedInject);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Initial attempts
  injectButton();
  setTimeout(injectButton, 500);
  setTimeout(injectButton, 1500);
  setTimeout(injectButton, 3000);
})();

