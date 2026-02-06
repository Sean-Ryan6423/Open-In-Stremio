// Adds "Open in Stremio" links to Google's "Where to watch" and "Watch show" panels.
// Also adds a Stremio button to anime knowledge panels that might not have streaming info.
// Also adds a Stremio button to search filter chips when Season/Episode links are detected.

(function () {
  const BTN_ID_WHERE_TO_WATCH = "stremio-btn-where-to-watch";
  const BTN_ID_WATCH_SHOW = "stremio-btn-watch-show";
  const BTN_ID_ANIME_PANEL = "stremio-btn-anime-panel";
  const BTN_ID_SEARCH_CHIPS = "stremio-btn-search-chips";

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

  // Detect if the page contains anime-related content
  function detectAnimeContent() {
    const text = document.body.innerText.toLowerCase();
    
    // Check for anime-specific indicators
    const animeIndicators = [
      "anime", "manga", "light novel", "japanese animation",
      "aired", "premiered", "studio:", "studios:",
      "myanimelist", "anilist", "crunchyroll", "funimation",
      "japanese tv series", "anime series", "anime film",
      "original run", "episodes", "seasons"
    ];
    
    // Check for anime streaming/database links
    const animeLinks = document.querySelectorAll('a[href*="myanimelist.net"], a[href*="anilist.co"], a[href*="crunchyroll.com"], a[href*="funimation.com"], a[href*="anime-planet.com"], a[href*="kitsu.io"], a[href*="anidb.net"]');
    
    // Check for anime-related text
    const hasAnimeText = animeIndicators.some(indicator => text.includes(indicator));
    
    // Check if there's a knowledge panel with anime-like content
    const knowledgePanel = document.querySelector('[data-attrid="title"], .kp-header, .knowledge-panel');
    const hasKnowledgePanel = knowledgePanel !== null;
    
    // Look for genre labels containing anime
    const genreLabels = document.querySelectorAll('[data-attrid*="genre"], [data-attrid*="type"]');
    let hasAnimeGenre = false;
    genreLabels.forEach(label => {
      if (label.textContent.toLowerCase().includes("anime")) {
        hasAnimeGenre = true;
      }
    });
    
    return {
      isAnime: hasAnimeText || animeLinks.length > 0 || hasAnimeGenre,
      hasAnimeLinks: animeLinks.length > 0,
      hasKnowledgePanel: hasKnowledgePanel,
      confidence: (hasAnimeText ? 1 : 0) + (animeLinks.length > 0 ? 2 : 0) + (hasAnimeGenre ? 2 : 0)
    };
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
    // Match the structure used by paid providers (e.g., Amazon Prime Video)
    // Outer wrapper: <div class="bLddW U5EKEf coTbne ZEISdd">
    const outerWrapper = document.createElement("div");
    outerWrapper.className = "bLddW U5EKEf coTbne ZEISdd";
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

    // Content wrapper matching paid items: <div class="o0DLIc w6bhBd u8GRde PKT65" role="listitem">
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "o0DLIc w6bhBd u8GRde PKT65";
    contentWrapper.setAttribute("role", "listitem");

    // Icon container: <div class="hvFKJe mTMorf q1MG4e">
    const iconContainer = document.createElement("div");
    iconContainer.className = "hvFKJe mTMorf q1MG4e";

    const iconBg = createIconBackground();
    iconContainer.appendChild(iconBg);

    // Text container matching paid items: <div class="ellip phXTff">
    const textContainer = document.createElement("div");
    textContainer.className = "ellip phXTff";

    // Provider name: <div class="ellip bclEt">Stremio</div>
    const nameLabel = document.createElement("div");
    nameLabel.className = "ellip bclEt";
    nameLabel.textContent = "Stremio";

    // Price/status: <div class="ellip rsj3fb"><span><span>Free</span></span></div>
    const priceLabel = document.createElement("div");
    priceLabel.className = "ellip rsj3fb";
    priceLabel.style.cssText = "color: #188038;"; // Green for free
    const priceSpanOuter = document.createElement("span");
    const priceSpanInner = document.createElement("span");
    priceSpanInner.textContent = "Free";
    priceSpanOuter.appendChild(priceSpanInner);
    priceLabel.appendChild(priceSpanOuter);

    textContainer.appendChild(nameLabel);
    textContainer.appendChild(priceLabel);

    contentWrapper.appendChild(iconContainer);
    contentWrapper.appendChild(textContainer);
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

  // Create a standalone Stremio button for anime/manga knowledge panels
  function createAnimePanelStremioButton(urls, id) {
    const container = document.createElement("div");
    container.id = id;
    container.style.cssText = `
      display: flex;
      align-items: center;
      padding: 12px 16px;
      margin: 12px 0;
      background: linear-gradient(135deg, #f8f7ff 0%, #f0eeff 100%);
      border-radius: 12px;
      border: 1px solid rgba(123, 91, 245, 0.2);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      z-index: 10;
    `;

    const link = document.createElement("a");
    link.href = urls.app;
    link.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
      width: 100%;
    `;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = urls.app;
    });

    // Create icon
    const iconBg = document.createElement("div");
    iconBg.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${STREMIO_COLOR} 0%, #6b4ce0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    `;
    iconBg.appendChild(createPlayIcon());

    // Create text content
    const textContainer = document.createElement("div");
    textContainer.style.cssText = "display: flex; flex-direction: column; gap: 2px;";

    const mainText = document.createElement("span");
    mainText.textContent = "Open in Stremio";
    mainText.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      color: ${STREMIO_COLOR};
    `;

    const subText = document.createElement("span");
    subText.textContent = "Free";
    subText.style.cssText = `
      font-size: 12px;
      color: #188038;
    `;

    textContainer.appendChild(mainText);
    textContainer.appendChild(subText);

    link.appendChild(iconBg);
    link.appendChild(textContainer);
    container.appendChild(link);

    // Hover effects
    container.addEventListener("mouseenter", () => {
      container.style.background = "linear-gradient(135deg, #f0eeff 0%, #e8e5ff 100%)";
      container.style.borderColor = "rgba(123, 91, 245, 0.4)";
      container.style.transform = "translateY(-1px)";
      container.style.boxShadow = "0 4px 12px rgba(123, 91, 245, 0.15)";
    });
    container.addEventListener("mouseleave", () => {
      container.style.background = "linear-gradient(135deg, #f8f7ff 0%, #f0eeff 100%)";
      container.style.borderColor = "rgba(123, 91, 245, 0.2)";
      container.style.transform = "translateY(0)";
      container.style.boxShadow = "none";
    });

    return container;
  }

  // Create a Stremio button styled like Google's search filter chips
  function createSearchChipStremioButton(urls, id) {
    const container = document.createElement("div");
    container.setAttribute("role", "listitem");
    container.id = id;

    const link = document.createElement("a");
    link.href = urls.app;
    link.setAttribute("aria-label", "Open in Stremio");
    link.className = "nPDzT T3FoJb";
    link.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      margin: 0 4px;
      background: linear-gradient(135deg, ${STREMIO_COLOR} 0%, #6b4ce0 100%);
      border-radius: 16px;
      text-decoration: none;
      color: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(123, 91, 245, 0.3);
    `;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = urls.app;
    });

    // Create small play icon
    const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    iconSvg.setAttribute("width", "14");
    iconSvg.setAttribute("height", "14");
    iconSvg.setAttribute("viewBox", "0 0 24 24");
    iconSvg.setAttribute("fill", "white");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M8 5v14l11-7z");
    iconSvg.appendChild(path);

    const text = document.createElement("span");
    text.textContent = "Stremio";
    text.style.cssText = "white-space: nowrap;";

    link.appendChild(iconSvg);
    link.appendChild(text);
    container.appendChild(link);

    // Hover effects
    link.addEventListener("mouseenter", () => {
      link.style.transform = "scale(1.05)";
      link.style.boxShadow = "0 4px 8px rgba(123, 91, 245, 0.4)";
    });
    link.addEventListener("mouseleave", () => {
      link.style.transform = "scale(1)";
      link.style.boxShadow = "0 2px 4px rgba(123, 91, 245, 0.3)";
    });

    return container;
  }

  // Find search filter chips with Season/Episode links and inject Stremio button
  function injectIntoSearchChips() {
    if (document.getElementById(BTN_ID_SEARCH_CHIPS)) return;
    // Don't inject if other buttons are already present
    if (document.getElementById(BTN_ID_WATCH_SHOW) || 
        document.getElementById(BTN_ID_WHERE_TO_WATCH) ||
        document.getElementById(BTN_ID_ANIME_PANEL)) {
      return;
    }

    // Look for search filter chips that indicate a TV show
    // These are links with "Season" or "Episodes" in the text or aria-label
    const allLinks = document.querySelectorAll('a[aria-label*="Season"], a[aria-label*="Episode"], a[aria-label*="Anime"]');
    
    if (allLinks.length === 0) return;

    // Find the chip that contains Season/Episodes
    let targetChip = null;
    for (const link of allLinks) {
      const label = link.getAttribute("aria-label") || "";
      const text = link.textContent || "";
      if (label.includes("Season") || label.includes("Episode") || 
          text.includes("Season") || text.includes("Episode")) {
        targetChip = link;
        break;
      }
    }

    if (!targetChip) return;

    // Find the list container (role="list") that holds these chips
    let listContainer = targetChip.closest('[role="list"]');
    if (!listContainer) {
      // Fallback: walk up to find a container with multiple listitems
      let parent = targetChip.parentElement;
      for (let i = 0; i < 5 && parent; i++) {
        if (parent.querySelectorAll('[role="listitem"]').length >= 2) {
          listContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }
    }

    if (!listContainer) return;

    const urls = buildStremioUrls();
    const stremioChip = createSearchChipStremioButton(urls, BTN_ID_SEARCH_CHIPS);

    // Insert at the beginning of the list
    listContainer.insertBefore(stremioChip, listContainer.firstChild);
    console.log("[Stremio] Button inserted into search chips");
  }

  // Find "Watch show" section and inject Stremio
  function injectIntoWatchShow() {
    if (document.getElementById(BTN_ID_WATCH_SHOW)) return;

    // Find the "Watch show" or "Watch movie" SECTION HEADER (not tab link)
    // The section header has role="heading", tabs don't
    let targetHeader = null;
    const headings = document.querySelectorAll('[role="heading"], h2, h3');
    
    for (const el of headings) {
      const text = el.textContent.trim().toLowerCase();
      // Check for exact match to avoid matching partial text
      if (text === "watch show" || text === "watch movie" || text === "watch film") {
        targetHeader = el;
        console.log("[Stremio] Found Watch show section header:", el);
        break;
      }
    }

    if (!targetHeader) {
      console.log("[Stremio] No Watch show section header found");
      return;
    }

    const urls = buildStremioUrls();
    const stremioButton = createWatchShowStremioButton(urls, BTN_ID_WATCH_SHOW);

    // Look for the streaming icons container near the header
    // It typically contains links with aria-label="Watch now on ..."
    let parent = targetHeader.parentElement;
    for (let i = 0; i < 8 && parent; i++) {
      // Look for the container with streaming provider links
      const watchNowLinks = parent.querySelectorAll('a[aria-label^="Watch now"]');
      if (watchNowLinks.length > 0) {
        // Found a streaming link - find its parent container (the row of streaming options)
        let streamingRow = watchNowLinks[0].parentElement;
        // Walk up to find the container that holds all streaming options
        while (streamingRow && streamingRow.parentElement) {
          const siblingCount = streamingRow.parentElement.children.length;
          // The streaming row container typically has multiple children (streaming options + action buttons)
          if (siblingCount >= 2) {
            streamingRow = streamingRow.parentElement;
            break;
          }
          streamingRow = streamingRow.parentElement;
        }
        
        // Insert Stremio as the FIRST option in the streaming row
        if (streamingRow) {
          streamingRow.insertBefore(stremioButton, streamingRow.firstChild);
          console.log("[Stremio] Button inserted into Watch show section");
          return;
        }
      }
      parent = parent.parentElement;
    }
    
    console.log("[Stremio] Could not find streaming container in Watch show section");
  }

  // Find "Where to watch" section and inject Stremio
  function injectIntoWhereToWatch() {
    if (document.getElementById(BTN_ID_WHERE_TO_WATCH)) return;

    let iconsContainer = null;
    let whereToWatchSection = null;

    // Method 1: Look for aria-label="Where to watch"
    const whereToWatchContainers = document.querySelectorAll('[aria-label="Where to watch"]');
    for (const container of whereToWatchContainers) {
      whereToWatchSection = container;
      break;
    }

    // Method 2: Look for "Where to watch" text
    if (!whereToWatchSection) {
      const allElements = document.querySelectorAll("span, div, h2, h3");
      for (const el of allElements) {
        if (el.textContent.trim().toLowerCase() === "where to watch") {
          whereToWatchSection = el;
          break;
        }
      }
    }

    if (!whereToWatchSection) return;

    // Find the container with streaming provider links/icons
    let parent = whereToWatchSection;
    for (let i = 0; i < 10 && parent; i++) {
      // Look for a container with multiple streaming provider items
      const containers = parent.querySelectorAll("div");
      for (const container of containers) {
        const links = container.querySelectorAll("a");
        const items = container.querySelectorAll('[role="listitem"], [data-ved]');
        // Check if this looks like a list of streaming providers
        if (links.length >= 1 || items.length >= 1) {
          const rect = container.getBoundingClientRect();
          // Streaming container should have reasonable dimensions
          if (rect.width > 80 && rect.height > 30 && container.children.length >= 1) {
            // Check if container has provider-like content (images or styled items)
            const hasProviderContent = container.querySelector('img') || 
                                       container.querySelector('[role="listitem"]') ||
                                       container.querySelectorAll('a').length >= 1;
            if (hasProviderContent) {
              iconsContainer = container;
              break;
            }
          }
        }
      }
      if (iconsContainer) break;
      parent = parent.parentElement;
    }

    if (!iconsContainer) return;

    const urls = buildStremioUrls();
    const stremioButton = createWhereToWatchStremioButton(urls, BTN_ID_WHERE_TO_WATCH);

    // Insert Stremio as the FIRST option
    iconsContainer.insertBefore(stremioButton, iconsContainer.firstChild);
  }

  // Detect if page has TV show/movie content (broader than just anime)
  function detectTVShowContent() {
    const text = document.body.innerText.toLowerCase();
    
    // Look for TV show indicators
    const tvIndicators = [
      "episodes", "seasons", "tv series", "tv show", "series",
      "premiered", "aired", "first episode", "network:",
      "imdb", "rotten tomatoes", "streaming"
    ];
    
    const hasTVIndicators = tvIndicators.some(indicator => text.includes(indicator));
    
    // Check for knowledge panel with title
    const hasKnowledgePanel = document.querySelector('[data-attrid="title"]') !== null;
    
    // Check for tabs like Episodes, Cast, Reviews (indicates TV show/movie)
    const tabs = document.querySelectorAll('[role="tab"], [role="tablist"] a');
    let hasTVTabs = false;
    for (const tab of tabs) {
      const tabText = tab.textContent.toLowerCase();
      if (tabText.includes("episodes") || tabText.includes("cast") || tabText.includes("reviews")) {
        hasTVTabs = true;
        break;
      }
    }
    
    return {
      isTVShow: (hasTVIndicators && hasKnowledgePanel) || hasTVTabs,
      hasKnowledgePanel: hasKnowledgePanel
    };
  }

  // Find anime/manga/TV show knowledge panels and inject Stremio button
  function injectIntoAnimePanel() {
    // Don't inject if we already have buttons from Watch Show or Where to Watch
    if (document.getElementById(BTN_ID_WATCH_SHOW) || 
        document.getElementById(BTN_ID_WHERE_TO_WATCH) ||
        document.getElementById(BTN_ID_ANIME_PANEL)) {
      return;
    }

    // Check if this page has anime or TV show content
    const animeInfo = detectAnimeContent();
    const tvInfo = detectTVShowContent();
    
    if (!animeInfo.isAnime && !tvInfo.isTVShow) return;

    // Find the "About" section - look for the heading or description area
    let insertionPoint = null;
    let insertBefore = true;
    
    // Method 1: Look for "About" heading text (exact match)
    const allElements = document.querySelectorAll('span, div, h2, h3');
    for (const el of allElements) {
      const text = el.textContent.trim().toLowerCase();
      if (text === "about" || text === "overview" || text === "description") {
        // Found the About heading, get its parent container
        insertionPoint = el.closest('[data-attrid]') || el.parentElement;
        break;
      }
    }

    // Method 2: Look for the description container with data-attrid
    if (!insertionPoint) {
      insertionPoint = document.querySelector('[data-attrid*="description"]');
    }

    // Method 3: Look for common description classes
    if (!insertionPoint) {
      const descSelectors = ['.kno-rdesc', '.LGOjhe', '.kno-desc'];
      for (const selector of descSelectors) {
        insertionPoint = document.querySelector(selector);
        if (insertionPoint) break;
      }
    }

    // Method 4: Find the knowledge panel title and insert after header area
    if (!insertionPoint) {
      const titleEl = document.querySelector('[data-attrid="title"]');
      if (titleEl) {
        // Walk up to find the header container
        let headerContainer = titleEl;
        for (let i = 0; i < 5; i++) {
          if (headerContainer.parentElement) {
            const parent = headerContainer.parentElement;
            // Look for a container that has multiple children (header area)
            if (parent.children.length >= 2) {
              headerContainer = parent;
              break;
            }
            headerContainer = parent;
          }
        }
        // Insert after the header container
        insertionPoint = headerContainer;
        insertBefore = false;
      }
    }

    // Method 5: Look for tabs row and insert before it
    if (!insertionPoint) {
      const tabsRow = document.querySelector('[role="tablist"]');
      if (tabsRow) {
        insertionPoint = tabsRow;
        insertBefore = true;
      }
    }

    if (!insertionPoint) return;

    const urls = buildStremioUrls();
    const stremioButton = createAnimePanelStremioButton(urls, BTN_ID_ANIME_PANEL);

    // Insert the button
    if (insertionPoint.parentElement) {
      if (insertBefore) {
        insertionPoint.parentElement.insertBefore(stremioButton, insertionPoint);
      } else {
        // Insert after
        insertionPoint.parentElement.insertBefore(stremioButton, insertionPoint.nextSibling);
      }
    }
  }

  function injectButtons() {
    injectIntoWatchShow();
    injectIntoWhereToWatch();
    // Only inject anime panel button if no other buttons were added
    injectIntoAnimePanel();
    // Inject into search chips if Season/Episode links are present
    injectIntoSearchChips();
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
