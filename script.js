const THEMES = {
  aura: {
    label: "Aura",
    source: "~/.local/bin/jpOSh/themes/aura/palette.css",
    background: "#282A36",
    foreground: "#BDE0FE",
    borderStrong: "#BDE0FE",
    accent: "#ECBCD7",
    accent2: "#72859A",
    selectedText: "#72859A",
    preview: "assets/theme-previews/aura.webp",
  },
  blueberry: {
    label: "Blueberry",
    source: "~/.local/bin/jpOSh/themes/blueberry/palette.css",
    background: "#111422",
    foreground: "#8eb0e6",
    borderStrong: "#8eb0e6",
    accent: "#69C3FF",
    accent2: "#4F6284",
    selectedText: "#4F6284",
    preview: "assets/theme-previews/blueberry.webp",
  },
  blueridge: {
    label: "Blueridge",
    source: "~/.local/bin/jpOSh/themes/blueridge/palette.css",
    background: "#1c2128",
    foreground: "#7ea67c",
    borderStrong: "#7ea67c",
    accent: "#6D8CAB",
    accent2: "#4D6352",
    selectedText: "#4D6352",
    preview: "assets/theme-previews/blueridge.webp",
  },
  gruvbox: {
    label: "Gruvbox",
    source: "~/.local/bin/jpOSh/themes/gruvbox/palette.css",
    background: "#282828",
    foreground: "#ebdbb2",
    borderStrong: "#ebdbb2",
    accent: "#9BAA5F",
    accent2: "#89816D",
    selectedText: "#89816D",
    preview: "assets/theme-previews/gruvbox.webp",
  },
  "matte-black": {
    label: "Matte-Black",
    source: "~/.local/bin/jpOSh/themes/matte-black/palette.css",
    background: "#121212",
    foreground: "#8A8A8D",
    borderStrong: "#8A8A8D",
    accent: "#DA870E",
    accent2: "#4E4E4F",
    selectedText: "#4E4E4F",
    preview: "assets/theme-previews/matte-black.webp",
  },
  "osaka-jade": {
    label: "Osaka-Jade",
    source: "~/.local/bin/jpOSh/themes/osaka-jade/palette.css",
    background: "#11221C",
    foreground: "#82a397",
    borderStrong: "#82a397",
    accent: "#449656",
    accent2: "#496259",
    selectedText: "#496259",
    preview: "assets/theme-previews/osaka-jade.webp",
  },
  ristretto: {
    label: "Ristretto",
    source: "~/.local/bin/jpOSh/themes/ristretto/palette.css",
    background: "#2c2525",
    foreground: "#e48b7a",
    borderStrong: "#e48b7a",
    accent: "#DE8569",
    accent2: "#88584F",
    selectedText: "#88584F",
    preview: "assets/theme-previews/ristretto.webp",
  },
  "tokyo-night": {
    label: "Tokyo-Night",
    source: "~/.local/bin/jpOSh/themes/tokyo-night/palette.css",
    background: "#1a1b26",
    foreground: "#B49AE6",
    borderStrong: "#B49AE6",
    accent: "#A683D8",
    accent2: "#675A86",
    selectedText: "#675A86",
    preview: "assets/theme-previews/tokyo-night.webp",
  },
};

const THEME_ORDER = [
  "aura",
  "blueberry",
  "blueridge",
  "gruvbox",
  "matte-black",
  "osaka-jade",
  "tokyo-night",
  "ristretto",
];

const THEME_ALIASES = {
  tokyonight: "tokyo-night",
  matteblack: "matte-black",
  osakajade: "osaka-jade",
};

const RGB_MODE_KEY = "jpOSh-rgb-mode";
const GETS_LOST_MODE_KEY = "jpOSh-gets-lost-mode";
const RGB_CYCLE_MS = 2200;
const RGB_AUDIO_SRC = "assets/audio/afraid-to-feel.mp3";
const CONFETTI_TICK_MS = 220;
const CONFETTI_BATCH_MIN = 2;
const CONFETTI_BATCH_MAX = 5;
const CONFETTI_MAX_ACTIVE = 64;
const CONFETTI_COLORS = [
  "#ff6b6b",
  "#ffd93d",
  "#6bff9f",
  "#6bd4ff",
  "#b98bff",
  "#ff7adf",
];

const LOST_MODE_SUMMARY = {
  overview: {
    title: "Simple Overview",
    text: "This site tracks your desktop setup in one place.",
    highlights: [
      "Themes apply across the whole site.",
      "RGB mode can auto-cycle themes.",
      "Automation scripts manage display and power behavior.",
    ],
  },
  themes: {
    title: "Simple Themes",
    text: "Theme colors are pulled from your real palette files.",
    highlights: [
      "8 themes available.",
      "One click applies a theme globally.",
      "Previews mirror your real desktop looks.",
    ],
  },
  automation: {
    title: "Simple Automation",
    text: "Core scripts keep your session stable and fast.",
    highlights: [
      "Display and monitor policy scripts are active.",
      "Power/performance scripts coordinate system behavior.",
      "GPU and post-sleep handling are included.",
    ],
  },
  workspace: {
    title: "Simple Workspace",
    text: "Your workflow is grouped for quick daily use.",
    highlights: [
      "Main launch paths are mapped clearly.",
      "Hardware profile and keybind surfaces are documented.",
      "Dev, communication, media, and gaming are covered.",
    ],
  },
};

let rgbEnabled = false;
let rgbIntervalId = null;
let rgbIndex = 0;
let confettiLayer = null;
let confettiIntervalId = null;
let rgbAudio = null;
let rgbAudioUnlockBound = false;
let getsLostModeEnabled = false;

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function hexToRgb(hex) {
  const normalized = hex.replace("#", "").trim();
  const value = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;

  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => value.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixColors(baseHex, mixHex, ratio) {
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixHex);
  return rgbToHex({
    r: Math.round(base.r + (mix.r - base.r) * ratio),
    g: Math.round(base.g + (mix.g - base.g) * ratio),
    b: Math.round(base.b + (mix.b - base.b) * ratio),
  });
}

function normalizeThemeName(input) {
  const name = (input || "").trim().toLowerCase();
  const resolved = THEME_ALIASES[name] || name;
  return THEMES[resolved] ? resolved : "tokyo-night";
}

function applyTheme(themeName, options = {}) {
  const persist = options.persist !== false;
  const initiatedByRgb = options.initiatedByRgb === true;
  const key = normalizeThemeName(themeName);
  const theme = THEMES[key];
  const root = document.documentElement;

  const derived = {
    surface1: mixColors(theme.background, theme.foreground, 0.09),
    surface2: mixColors(theme.background, theme.foreground, 0.16),
    border: mixColors(theme.background, theme.borderStrong, 0.34),
    textDim: mixColors(theme.background, theme.foreground, 0.62),
    textMute: mixColors(theme.background, theme.foreground, 0.42),
    ok: mixColors(theme.accent, "#7ddf99", 0.42),
    warn: mixColors(theme.accent, "#ffc76c", 0.48),
    danger: mixColors(theme.accent, "#ec7584", 0.46),
  };

  root.style.setProperty("--bg", theme.background);
  root.style.setProperty("--surface-1", derived.surface1);
  root.style.setProperty("--surface-2", derived.surface2);
  root.style.setProperty("--border", derived.border);
  root.style.setProperty("--border-strong", theme.borderStrong);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-2", theme.accent2);
  root.style.setProperty("--text", theme.foreground);
  root.style.setProperty("--text-dim", derived.textDim);
  root.style.setProperty("--text-mute", derived.textMute);
  root.style.setProperty("--ok", derived.ok);
  root.style.setProperty("--warn", derived.warn);
  root.style.setProperty("--danger", derived.danger);

  document.body.dataset.activeTheme = key;
  if (persist) localStorage.setItem("jpOSh-theme", key);

  if (!initiatedByRgb) {
    const idx = THEME_ORDER.indexOf(key);
    rgbIndex = idx >= 0 ? idx : 0;
  }

  document.querySelectorAll("[data-theme-key]").forEach((node) => {
    node.classList.toggle("active", node.dataset.themeKey === key);
  });

  document.querySelectorAll("[data-theme-card]").forEach((node) => {
    node.classList.toggle("active", node.dataset.themeCard === key);
  });

  document.querySelectorAll("[data-current-theme]").forEach((node) => {
    node.textContent = theme.label;
  });
}

function updateRgbUi() {
  document.body.classList.toggle("rgb-mode", rgbEnabled);
  document.querySelectorAll("[data-rgb-toggle]").forEach((node) => {
    node.classList.toggle("active", rgbEnabled);
    node.setAttribute("aria-pressed", rgbEnabled ? "true" : "false");
    const label = node.querySelector("[data-rgb-label]");
    if (label) label.textContent = rgbEnabled ? "RGB On" : "RGB";
  });
}

function updateGetsLostModeUi() {
  document.body.classList.toggle("lost-mode", getsLostModeEnabled);
  document.querySelectorAll("[data-lost-toggle]").forEach((node) => {
    node.classList.toggle("active", getsLostModeEnabled);
    node.setAttribute("aria-pressed", getsLostModeEnabled ? "true" : "false");
    const label = node.querySelector("[data-lost-label]");
    if (label) label.textContent = getsLostModeEnabled ? "Gets Lost On Me: On" : "Gets Lost On Me";
  });
  updateTopBarLockState();
}

function updateTopBarLockState() {
  const lockTopBar = getsLostModeEnabled;

  document.querySelectorAll(".main-nav .nav-link").forEach((node) => {
    const href = node.getAttribute("href");

    if (lockTopBar) {
      if (href && !node.dataset.prevHref) {
        node.dataset.prevHref = href;
      }
      node.removeAttribute("href");
      node.setAttribute("aria-disabled", "true");
      node.setAttribute("tabindex", "-1");
      node.classList.add("is-disabled");
      return;
    }

    if (node.dataset.prevHref) {
      node.setAttribute("href", node.dataset.prevHref);
      delete node.dataset.prevHref;
    }
    node.removeAttribute("aria-disabled");
    node.removeAttribute("tabindex");
    node.classList.remove("is-disabled");
  });

  document.querySelectorAll(".theme-rail .theme-chip").forEach((node) => {
    if (node.hasAttribute("data-lost-toggle")) return;
    node.disabled = lockTopBar;
    node.classList.toggle("is-disabled", lockTopBar);
    node.setAttribute("aria-disabled", lockTopBar ? "true" : "false");
  });
}

function setGetsLostMode(enabled, options = {}) {
  const save = options.save !== false;
  const force = options.force === true;
  const next = enabled === true;

  if (!force && next === getsLostModeEnabled) {
    updateGetsLostModeUi();
    return;
  }

  getsLostModeEnabled = next;

  // This mode intentionally strips visual/theming complexity.
  if (getsLostModeEnabled && rgbEnabled) {
    setRgbMode(false);
  }

  if (save) {
    localStorage.setItem(GETS_LOST_MODE_KEY, getsLostModeEnabled ? "on" : "off");
  }

  updateGetsLostModeUi();
}

function ensureRgbAudio() {
  if (rgbAudio) return rgbAudio;
  rgbAudio = new Audio(RGB_AUDIO_SRC);
  rgbAudio.preload = "auto";
  rgbAudio.loop = true;
  rgbAudio.volume = 0.94;
  return rgbAudio;
}

function scheduleRgbAudioUnlockAttempt() {
  if (rgbAudioUnlockBound) return;
  rgbAudioUnlockBound = true;

  const unlockAttempt = () => {
    rgbAudioUnlockBound = false;
    if (rgbEnabled) playRgbAudio();
  };

  window.addEventListener("pointerdown", unlockAttempt, { once: true });
  window.addEventListener("keydown", unlockAttempt, { once: true });
}

function playRgbAudio() {
  const audio = ensureRgbAudio();
  const promise = audio.play();
  if (promise && typeof promise.catch === "function") {
    promise.catch(() => {
      scheduleRgbAudioUnlockAttempt();
    });
  }
}

function pauseRgbAudio() {
  if (!rgbAudio) return;
  rgbAudio.pause();
}

function ensureConfettiLayer() {
  if (confettiLayer && document.body.contains(confettiLayer)) return confettiLayer;
  confettiLayer = document.createElement("div");
  confettiLayer.className = "rgb-confetti-layer";
  confettiLayer.setAttribute("aria-hidden", "true");
  document.body.appendChild(confettiLayer);
  return confettiLayer;
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnConfetti(batchCount) {
  if (!rgbEnabled || reducedMotionQuery.matches) return;
  const layer = ensureConfettiLayer();
  const activeCount = layer.childElementCount;
  if (activeCount >= CONFETTI_MAX_ACTIVE) return;

  const allowedCount = Math.min(batchCount, CONFETTI_MAX_ACTIVE - activeCount);
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < allowedCount; i += 1) {
    const piece = document.createElement("span");
    piece.className = "rgb-confetti-piece";

    const left = randomInRange(-5, 105);
    const size = randomInRange(6, 13);
    const duration = randomInRange(2200, 4200);
    const drift = randomInRange(-90, 90);
    const rotate = randomInRange(-60, 60);
    const hue = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

    piece.style.setProperty("--left", `${left}%`);
    piece.style.setProperty("--size", `${size}px`);
    piece.style.setProperty("--dur", `${duration}ms`);
    piece.style.setProperty("--drift", `${drift}px`);
    piece.style.setProperty("--rot", `${rotate}deg`);
    piece.style.setProperty("--confetti", hue);

    piece.addEventListener("animationend", () => piece.remove(), { once: true });
    fragment.appendChild(piece);
  }

  layer.appendChild(fragment);
}

function stopConfetti() {
  if (confettiIntervalId) {
    clearInterval(confettiIntervalId);
    confettiIntervalId = null;
  }
  if (confettiLayer) {
    confettiLayer.classList.remove("active");
    confettiLayer.replaceChildren();
  }
}

function startConfetti() {
  stopConfetti();
  if (reducedMotionQuery.matches) return;

  const layer = ensureConfettiLayer();
  layer.classList.add("active");
  spawnConfetti(18);

  confettiIntervalId = setInterval(() => {
    const count = Math.floor(randomInRange(CONFETTI_BATCH_MIN, CONFETTI_BATCH_MAX));
    spawnConfetti(count);
  }, CONFETTI_TICK_MS);
}

function stopRgbCycle() {
  if (rgbIntervalId) {
    clearInterval(rgbIntervalId);
    rgbIntervalId = null;
  }
}

function startRgbCycle() {
  stopRgbCycle();
  rgbIntervalId = setInterval(() => {
    rgbIndex = (rgbIndex + 1) % THEME_ORDER.length;
    applyTheme(THEME_ORDER[rgbIndex], { initiatedByRgb: true, persist: false });
  }, RGB_CYCLE_MS);
}

function setRgbMode(enabled, options = {}) {
  const save = options.save !== false;
  rgbEnabled = enabled;

  if (save) {
    localStorage.setItem(RGB_MODE_KEY, rgbEnabled ? "on" : "off");
  }

  if (rgbEnabled) {
    const activeKey = normalizeThemeName(document.body.dataset.activeTheme);
    const idx = THEME_ORDER.indexOf(activeKey);
    rgbIndex = idx >= 0 ? idx : 0;
    startRgbCycle();
    startConfetti();
    playRgbAudio();
  } else {
    stopRgbCycle();
    stopConfetti();
    pauseRgbAudio();
    const activeKey = normalizeThemeName(document.body.dataset.activeTheme);
    localStorage.setItem("jpOSh-theme", activeKey);
  }

  updateRgbUi();
}

function renderThemeRail() {
  document.querySelectorAll("[data-theme-rail]").forEach((container) => {
    container.innerHTML = "";

    const getsLostButton = document.createElement("button");
    getsLostButton.type = "button";
    getsLostButton.className = "theme-chip theme-chip-lost";
    getsLostButton.dataset.lostToggle = "true";
    getsLostButton.setAttribute("aria-pressed", "false");
    getsLostButton.innerHTML = `
      <span class="lost-switch" aria-hidden="true">
        <span class="lost-switch-knob"></span>
      </span>
      <span data-lost-label>Gets Lost On Me</span>
    `;
    getsLostButton.addEventListener("click", () => setGetsLostMode(!getsLostModeEnabled));
    container.appendChild(getsLostButton);

    const rgbButton = document.createElement("button");
    rgbButton.type = "button";
    rgbButton.className = "theme-chip theme-chip-rgb";
    rgbButton.dataset.rgbToggle = "true";
    rgbButton.setAttribute("aria-pressed", "false");
    rgbButton.innerHTML = `
      <span class="theme-dot rgb-dot"></span>
      <span data-rgb-label>RGB</span>
    `;
    rgbButton.addEventListener("click", () => setRgbMode(!rgbEnabled));
    container.appendChild(rgbButton);

    THEME_ORDER.forEach((key) => {
      const theme = THEMES[key];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "theme-chip";
      button.dataset.themeKey = key;
      button.dataset.bound = "true";
      button.innerHTML = `<span class="theme-dot" style="background:${theme.accent}"></span>${theme.label}`;
      button.addEventListener("click", () => applyTheme(key));
      container.appendChild(button);
    });
  });
}

function renderThemeCatalog() {
  const target = document.getElementById("theme-catalog");
  if (!target) return;

  target.innerHTML = "";

  THEME_ORDER.forEach((key) => {
    const theme = THEMES[key];
    const article = document.createElement("article");
    article.className = "theme-card";
    article.dataset.themeCard = key;

    article.innerHTML = `
      <img class="theme-preview" src="${theme.preview}" alt="${theme.label} desktop preview" loading="lazy" />
      <div class="theme-card-body">
        <div class="theme-card-head">
          <h3 class="theme-name">${theme.label}</h3>
          <button type="button" class="theme-chip" data-theme-key="${key}">
            <span class="theme-dot" style="background:${theme.accent}"></span>Apply
          </button>
        </div>
        <div class="palette-strip">
          <div class="palette-chip" style="background:${theme.background}" title="Background"></div>
          <div class="palette-chip" style="background:${theme.foreground}" title="Foreground"></div>
          <div class="palette-chip" style="background:${theme.accent}" title="Accent"></div>
          <div class="palette-chip" style="background:${theme.accent2}" title="Selected Text"></div>
          <div class="palette-chip" style="background:${theme.borderStrong}" title="Border"></div>
        </div>
        <div class="palette-meta">
          <div class="palette-line"><span>Background</span><span class="mono">${theme.background}</span></div>
          <div class="palette-line"><span>Foreground</span><span class="mono">${theme.foreground}</span></div>
          <div class="palette-line"><span>Accent</span><span class="mono">${theme.accent}</span></div>
        </div>
        <div class="theme-source mono">${theme.source}</div>
      </div>
    `;

    const button = article.querySelector("button[data-theme-key]");
    button.dataset.bound = "true";
    button.addEventListener("click", () => applyTheme(key));
    article.addEventListener("dblclick", () => applyTheme(key));

    target.appendChild(article);
  });
}

function setupAnimationObserver() {
  const nodes = document.querySelectorAll("[data-animate]");
  if (nodes.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  nodes.forEach((node) => observer.observe(node));
}

function setupNavActiveState() {
  const current = document.body.dataset.page;
  if (!current) return;

  document.querySelectorAll(".nav-link[data-nav]").forEach((node) => {
    node.classList.toggle("active", node.dataset.nav === current);
  });
}

function syncStaticThemeButtons() {
  document.querySelectorAll("button[data-theme-key]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => applyTheme(button.dataset.themeKey));
  });
}

function renderLostModeSummary() {
  const page = document.body.dataset.page || "overview";
  const data = LOST_MODE_SUMMARY[page] || LOST_MODE_SUMMARY.overview;
  const root = document.querySelector("main.page");
  if (!root) return;

  let section = root.querySelector("[data-lost-summary]");
  if (!section) {
    section = document.createElement("section");
    section.className = "lost-summary";
    section.dataset.lostSummary = "true";
    root.prepend(section);
  }

  const items = data.highlights
    .map((line) => `<li class="lost-summary-item">${line}</li>`)
    .join("");

  section.innerHTML = `
    <p class="lost-summary-pill">Simple Mode</p>
    <h2 class="lost-summary-title">${data.title}</h2>
    <p class="lost-summary-text">${data.text}</p>
    <ul class="lost-summary-list">${items}</ul>
    <p class="lost-summary-note">Turn off Gets Lost On Me to return to the full site.</p>
  `;
}

function hydrate() {
  renderThemeRail();
  renderThemeCatalog();
  renderLostModeSummary();
  syncStaticThemeButtons();
  setupNavActiveState();
  setupAnimationObserver();

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const saved = localStorage.getItem("jpOSh-theme");
  applyTheme(normalizeThemeName(saved));

  const savedRgb = localStorage.getItem(RGB_MODE_KEY) === "on";
  setRgbMode(savedRgb, { save: false });
  const savedGetsLostMode = localStorage.getItem(GETS_LOST_MODE_KEY) === "on";
  setGetsLostMode(savedGetsLostMode, { save: false, force: true });

  const onMotionChange = () => {
    if (reducedMotionQuery.matches) {
      stopConfetti();
      return;
    }
    if (rgbEnabled) startConfetti();
  };

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", onMotionChange);
  } else if (typeof reducedMotionQuery.addListener === "function") {
    reducedMotionQuery.addListener(onMotionChange);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopRgbCycle();
      stopConfetti();
      pauseRgbAudio();
      return;
    }

    if (rgbEnabled) {
      startRgbCycle();
      startConfetti();
      playRgbAudio();
    }
  });
}

hydrate();
