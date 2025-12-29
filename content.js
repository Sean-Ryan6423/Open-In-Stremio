// Adds "Open in Stremio" links to Google's "Where to watch" and "Watch show" panels.

(function () {
  const BTN_ID_WHERE_TO_WATCH = "stremio-btn-where-to-watch";
  const BTN_ID_WATCH_SHOW = "stremio-btn-watch-show";

  // Stremio purple color
  const STREMIO_COLOR = "#7b5bf5";

  function extractImdbIdFromPage() {
    const a = document.querySelector('a[href*="imdb.com/title/tt"]');
    if (!a) return null;
    const m = a.href.match(/tt\d{5,}/);
    return m ? m[0] : null;
  }

  function guessType() {
    const text = document.body.innerText.toLowerCase();
    if (text.includes("episodes") || text.includes("seasons") || text.includes("tv series") || text.includes("tv show")) {
      return "series";
    }
    const episodesTab = Array.from(document.querySelectorAll("a, span, div"))
      .some(el => (el.textContent || "").trim().toLowerCase() === "episodes");
    return episodesTab ? "series" : "movie";
  }

  function extractTitle() {
    const titleEl = document.querySelector('[data-attrid="title"]');
    if (titleEl && titleEl.textContent) {
      return titleEl.textContent.trim();
    }
    const q = document.querySelector('textarea[name="q"], input[name="q"]');
    if (q && q.value) return q.value.trim();
    const t = document.title.replace(/\s*-\s*Google Search\s*$/i, "").trim();
    return t || "stremio";
  }

  function buildStremioUrls() {
    const imdbId = extractImdbIdFromPage();
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

  // Create Stremio play icon SVG
  function createPlayIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "white");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M8 5v14l11-7z");
    svg.appendChild(path);
    return svg;
  }

  // Create circular Stremio icon background
  function createIconBackground() {
    const iconBg = document.createElement("div");
    iconBg.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${STREMIO_COLOR} 0%, #6b4ce0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    `;
    iconBg.appendChild(createPlayIcon());
    return iconBg;
  }

  // Create Stremio icon matching Google's "Watch show" style exactly
  function createWatchShowStremioButton(urls, id) {
    // Match the fOYFme container structure
    const container = document.createElement("div");
    container.className = "fOYFme";
    container.id = id;

    const link = document.createElement("a");
    link.href = urls.app;
    link.setAttribute("aria-label", "Watch now on Stremio");
    link.style.cssText = "text-decoration: none; color: inherit;";

    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = urls.app;
    });

    // Match the Fjeoze wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "Fjeoze";

    // Match the mNte6b icon container (40x40)
    const iconContainer = document.createElement("div");
    iconContainer.className = "mNte6b";
    iconContainer.style.cssText = "height: 40px; width: 40px;";

    const iconBg = createIconBackground();
    iconContainer.appendChild(iconBg);

    // Match the esuhec label (Watch now)
    const watchNowLabel = document.createElement("div");
    watchNowLabel.className = "esuhec sjVJQd";
    watchNowLabel.textContent = "Watch now";
    watchNowLabel.style.cssText = "color: #1a73e8;";

    // Match the ZYHQ7e subscription text
    const freeLabel = document.createElement("div");
    freeLabel.className = "ZYHQ7e hWgrdb ApHyTb";
    freeLabel.textContent = "Free";
    freeLabel.style.cssText = "color: #188038;";

    wrapper.appendChild(iconContainer);
    wrapper.appendChild(watchNowLabel);
    wrapper.appendChild(freeLabel);
    link.appendChild(wrapper);
    container.appendChild(link);

    // Hover effect
    container.addEventListener("mouseenter", () => {
      iconBg.style.transform = "scale(1.05)";
      iconBg.style.boxShadow = "0 4px 8px rgba(123, 91, 245, 0.3)";
    });
    container.addEventListener("mouseleave", () => {
      iconBg.style.transform = "scale(1)";
      iconBg.style.boxShadow = "none";
    });

    return container;
  }

  // Create Stremio icon for "Where to watch" section - matching exact Google structure
  function createWhereToWatchStremioButton(urls, id) {
    // Outer wrapper: <div class="gbIPt coTbne" style="width:75px">
    const outerWrapper = document.createElement("div");
    outerWrapper.className = "gbIPt coTbne";
    outerWrapper.style.cssText = "width: 75px;";
    outerWrapper.id = id;

    // Link: <a class="coTbne">
    const link = document.createElement("a");
    link.className = "coTbne";
    link.href = urls.app;
    link.setAttribute("aria-label", "Watch now on Stremio");

    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = urls.app;
    });

    // Content wrapper: <div class="Fjeoze">
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "Fjeoze";

    // Icon container: <div class="mNte6b" style="height:40px;width:40px">
    const iconContainer = document.createElement("div");
    iconContainer.className = "mNte6b";
    iconContainer.style.cssText = "height: 40px; width: 40px;";

    const iconBg = createIconBackground();
    iconContainer.appendChild(iconBg);

    // Label: <div class="NP4tUe ZYHQ7e ApHyTb">
    const label = document.createElement("div");
    label.className = "NP4tUe ZYHQ7e ApHyTb";
    label.textContent = "Free";
    label.style.cssText = "color: #188038;"; // Green for free

    contentWrapper.appendChild(iconContainer);
    contentWrapper.appendChild(label);
    link.appendChild(contentWrapper);
    outerWrapper.appendChild(link);

    // Hover effect
    outerWrapper.addEventListener("mouseenter", () => {
      iconBg.style.transform = "scale(1.05)";
      iconBg.style.boxShadow = "0 4px 8px rgba(123, 91, 245, 0.3)";
    });
    outerWrapper.addEventListener("mouseleave", () => {
      iconBg.style.transform = "scale(1)";
      iconBg.style.boxShadow = "none";
    });

    return outerWrapper;
  }

  // Find "Watch show" section and inject Stremio
  function injectIntoWatchShow() {
    if (document.getElementById(BTN_ID_WATCH_SHOW)) return;

    // Find the "Watch show" or "Watch movie" header using the specific class
    const headers = document.querySelectorAll("span.mgAbYb");
    let targetHeader = null;
    
    for (const header of headers) {
      const text = header.textContent.trim().toLowerCase();
      if (text === "watch show" || text === "watch movie" || text === "watch film") {
        targetHeader = header;
        break;
      }
    }

    if (!targetHeader) return;

    const urls = buildStremioUrls();
    const stremioButton = createWatchShowStremioButton(urls, BTN_ID_WATCH_SHOW);

    // Find the ynrNJf container (holds the streaming icons row)
    let parent = targetHeader.parentElement;
    for (let i = 0; i < 10 && parent; i++) {
      const iconsContainer = parent.querySelector("div.ynrNJf");
      if (iconsContainer) {
        // Insert Stremio as the FIRST option
        iconsContainer.insertBefore(stremioButton, iconsContainer.firstChild);
        return;
      }
      parent = parent.parentElement;
    }
  }

  // Find "Where to watch" section and inject Stremio
  function injectIntoWhereToWatch() {
    if (document.getElementById(BTN_ID_WHERE_TO_WATCH)) return;

    // Look for "Where to watch" text in the specific container
    const whereToWatchContainers = document.querySelectorAll('[aria-label="Where to watch"]');
    let iconsContainer = null;

    for (const container of whereToWatchContainers) {
      // Find the eGiiEf container which holds the streaming icons
      const eGiiEf = container.querySelector("div.eGiiEf");
      if (eGiiEf) {
        iconsContainer = eGiiEf;
        break;
      }
    }

    // Fallback: look for the text "Where to watch"
    if (!iconsContainer) {
      const allSpans = document.querySelectorAll("span");
      for (const span of allSpans) {
        if (span.textContent.trim().toLowerCase() === "where to watch") {
          let parent = span.parentElement;
          for (let i = 0; i < 10 && parent; i++) {
            const eGiiEf = parent.querySelector("div.eGiiEf");
            if (eGiiEf) {
              iconsContainer = eGiiEf;
              break;
            }
            parent = parent.parentElement;
          }
          if (iconsContainer) break;
        }
      }
    }

    if (!iconsContainer) return;

    const urls = buildStremioUrls();
    const stremioButton = createWhereToWatchStremioButton(urls, BTN_ID_WHERE_TO_WATCH);

    // Insert Stremio as the FIRST option
    iconsContainer.insertBefore(stremioButton, iconsContainer.firstChild);
  }

  function injectButtons() {
    injectIntoWatchShow();
    injectIntoWhereToWatch();
  }

  // Debounce
  let debounceTimer;
  function debouncedInject() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(injectButtons, 150);
  }

  // Observe DOM changes
  const obs = new MutationObserver(debouncedInject);
  obs.observe(document.documentElement, { childList: true, subtree: true });

  // Initial attempts with delays
  injectButtons();
  setTimeout(injectButtons, 500);
  setTimeout(injectButtons, 1500);
  setTimeout(injectButtons, 3000);
})();
