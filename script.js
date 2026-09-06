const GLASSWALL_API = "https://room.saintjules.org/api/glasswall";
let labelContactEmail = "hello@glasswallrecords.com";

const menuButton = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-menu]");

function closeMenu() {
  menuButton?.setAttribute("aria-expanded", "false");
  menu?.classList.remove("open");
  document.body.classList.remove("menu-open");
}

menuButton?.addEventListener("click", () => {
  const opening = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(opening));
  menu?.classList.toggle("open", opening);
  document.body.classList.toggle("menu-open", opening);
});

menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function firstText(source, keys) {
  const item = record(source);
  for (const key of keys) {
    const value = text(item[key]);
    if (value) return value;
  }
  return "";
}

function safeUrl(value) {
  const candidate = text(value);
  if (!candidate) return "";
  try {
    const url = new URL(candidate, window.location.href);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function mediaDetails(value) {
  if (typeof value === "string") return { url: safeUrl(value), alt: "" };
  const source = record(value);
  return {
    url: safeUrl(source.url || source.imageUrl || source.src),
    alt: firstText(source, ["altText", "alt", "description"]),
  };
}

function extractArray(source, keys) {
  const root = record(source);
  for (const key of keys) {
    if (Array.isArray(root[key])) return root[key];
  }
  const data = record(root.data);
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
}

function hydrateSettings(payload) {
  const root = record(payload);
  const settings = record(root.settings || record(root.data).settings);
  const labelName = firstText(settings, ["labelName", "name"]);
  if (labelName) {
    const words = labelName.split(/\s+/).filter(Boolean);
    const suffix = words.length > 1 ? words.pop() : "";
    const primary = words.join(" ") || labelName;
    document.querySelectorAll(".wordmark").forEach((wordmark) => {
      const main = wordmark.querySelector("span");
      const small = wordmark.querySelector("small");
      if (main) main.textContent = primary;
      if (small) {
        small.textContent = suffix;
        small.hidden = !suffix;
      }
    });
    document.title = `${labelName} — Independent label`;
    document.querySelector('meta[property="og:site_name"]')?.setAttribute("content", labelName);
    document.querySelector('meta[property="og:title"]')?.setAttribute(
      "content",
      `${labelName} — Independent label`,
    );
  }
  const headline = firstText(settings, ["headline", "heroHeadline"]);
  const headlineNode = document.querySelector(".hero h1");
  if (headline && headlineNode) {
    const words = headline.split(/\s+/).filter(Boolean);
    const accentSize = words.length > 2 ? 2 : 1;
    const leading = words.slice(0, -accentSize).join(" ");
    const accent = words.slice(-accentSize).join(" ");
    const emphasis = document.createElement("span");
    emphasis.textContent = accent;
    headlineNode.replaceChildren(document.createTextNode(leading || accent));
    if (leading) {
      headlineNode.append(document.createElement("br"), emphasis);
    }
  }
  const eyebrow = firstText(settings, ["eyebrow"]);
  const location = firstText(settings, ["location", "locationLabel"]);
  const edition = document.querySelectorAll(".edition-line span");
  if (eyebrow && edition[0]) edition[0].textContent = eyebrow;
  if (location && edition[1]) edition[1].textContent = location;
  const intro = firstText(settings, ["introduction", "intro", "description", "heroIntro"]);
  const introNode = document.querySelector("[data-site-intro]");
  if (intro && introNode) introNode.textContent = intro;

  const heroMedia = mediaDetails(
    settings.heroArtwork || settings.heroArt || settings.heroImage || settings.hero,
  );
  if (!heroMedia.url) {
    heroMedia.url = safeUrl(settings.heroArtUrl || settings.heroImageUrl);
    heroMedia.alt = firstText(settings, ["heroArtAlt", "heroImageAlt"]);
  }
  const heroArt = document.querySelector("[data-hero-art]");
  const heroFrame = document.querySelector("[data-hero-frame]");
  if (heroMedia.url && heroArt && heroFrame) {
    let heroImage = heroFrame.querySelector("img");
    if (!heroImage) {
      heroImage = document.createElement("img");
      heroFrame.prepend(heroImage);
    }
    heroImage.src = heroMedia.url;
    heroImage.alt = heroMedia.alt || "Glasswall Records label artwork";
    heroArt.hidden = false;
    heroArt.classList.add("has-media");
    heroArt.closest(".hero")?.classList.add("has-label-art");
  }

  if (settings.submissionsOpen === false) {
    const form = document.querySelector("[data-submission-form]");
    const status = document.querySelector("[data-form-status]");
    form?.querySelectorAll("input, select, textarea, button").forEach((control) => {
      control.disabled = true;
    });
    if (status) status.textContent = "Submissions are paused right now. Please check back later.";
  }

  const contactEmail = firstText(settings, ["contactEmail", "email"]);
  if (contactEmail) {
    labelContactEmail = contactEmail;
    document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
      link.href = `mailto:${contactEmail}`;
      if (link.closest(".submission-intro")) link.textContent = contactEmail;
    });
  }
}

function artistImage(artist) {
  const source = record(artist);
  const media = mediaDetails(source.portrait || source.image || source.artwork);
  if (media.url) return media;
  return {
    url: safeUrl(source.portraitUrl || source.imageUrl || source.artworkUrl),
    alt: firstText(source, ["portraitAlt", "imageAlt", "artworkAlt"]),
  };
}

function artistWebsite(artist) {
  const source = record(artist);
  const links = record(source.links);
  return safeUrl(
    source.websiteUrl || source.website || source.url || links.website || links.instagram || links.music,
  );
}

const REEL_TONES = ["#c5d8dc", "#c8c1dc", "#bfc8d5", "#d3d1d8"];
const FILTER_TONES = {
  glasswall: {
    listen: "#b8cde4",
    seeking: "#c8c1dc",
  },
  "saint-jules": {
    portrait: "#e8b6c8",
    listen: "#ead477",
    seeking: "#e7a9bf",
  },
};

function createNode(tagName, className = "", content = "") {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (content) node.textContent = content;
  return node;
}

function normalizeName(value) {
  return text(value).toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function artistTracks(artist, tracks) {
  const source = record(artist);
  const artistId = firstText(source, ["id", "artistId"]);
  const artistName = normalizeName(firstText(source, ["name", "artistName"]));
  return tracks.filter((entry) => {
    const track = record(entry);
    const trackArtistId = firstText(track, ["artistId"]);
    if (artistId && trackArtistId) return artistId === trackArtistId;
    return artistName && normalizeName(firstText(track, ["artist", "artistName"])) === artistName;
  });
}

function appendFilmEdges(figure, label, frame) {
  const top = createNode("div", "reel-perf reel-perf-top");
  top.setAttribute("aria-hidden", "true");
  const caption = document.createElement("figcaption");
  caption.append(createNode("span", "", label), createNode("span", "", frame));
  const bottom = createNode("div", "reel-perf reel-perf-bottom");
  bottom.setAttribute("aria-hidden", "true");
  figure.prepend(top);
  figure.append(caption, bottom);
}

function createArtistLink(href, label) {
  const link = createNode("a", "artist-layer-link");
  link.href = href;
  link.append(document.createTextNode(`${label} `), createNode("span", "", "↗"));
  link.lastElementChild?.setAttribute("aria-hidden", "true");
  if (/^https?:/i.test(href)) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  return link;
}

function createArtistSlide(entry, index, tracks) {
  const artist = record(entry);
  const name = firstText(artist, ["name", "artistName"]) || "Glasswall artist";
  const tagline = firstText(artist, ["tagline", "role"]) || "Glasswall Records artist";
  const bio = firstText(artist, ["bio", "description"]) || "An artist on the Glasswall Records roster.";
  const seeking = firstText(artist, ["seeking", "supportNeeds", "lookingFor"]);
  const website = artistWebsite(artist);
  const links = record(artist.links);
  const isSaintJules = normalizeName(name) === "saint jules";
  const musicLink = safeUrl(
    links.music || links.spotify || links.bandcamp || (isSaintJules ? "https://www.saintjules.org/" : ""),
  );
  const matches = artistTracks(artist, tracks);
  const firstTrack = record(matches[0]);
  const trackTitle = firstText(firstTrack, ["title", "name"]);
  const audio = mediaDetails(firstTrack.audio);
  const audioUrl = audio.url || safeUrl(firstTrack.audioUrl);
  const frameNumber = String(index + 1).padStart(3, "0");

  const slide = createNode("article", "reel-slide reel-artist-slide");
  slide.dataset.reelSlide = "";
  slide.dataset.reelKind = "artist";
  slide.dataset.artistName = name;
  slide.dataset.palette = isSaintJules ? "saint-jules" : "glasswall";
  slide.dataset.tone = isSaintJules ? "#e8b6c8" : REEL_TONES[index % REEL_TONES.length];
  slide.dataset.filter = "portrait";
  const slug = firstText(artist, ["slug"]) || normalizeName(name).replace(/\s+/g, "-");
  slide.id = `artist-${slug || frameNumber}`;

  const figure = createNode("figure", "reel-film-card reel-artist-card");
  figure.dataset.reelArt = "";
  const imageWrap = createNode("div", "reel-image-pair");
  const image = artistImage(artist);
  if (image.url) {
    const portrait = document.createElement("img");
    portrait.src = image.url;
    portrait.alt = image.alt || `${name} artist artwork`;
    portrait.loading = "lazy";
    imageWrap.append(portrait);
  } else if (isSaintJules) {
    const foil = document.createElement("img");
    foil.src = "assets/saint-jules-foil-art.jpeg";
    foil.alt = "Saint Jules Polaroid artwork on reflective silver foil";
    foil.width = 360;
    foil.height = 360;
    foil.loading = "lazy";
    imageWrap.append(foil);
  }
  if (!imageWrap.children.length) {
    const placeholder = createNode("div", "empty-exposure artist-placeholder");
    placeholder.append(
      createNode("span", "", name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2)),
      createNode("small", "", "PORTRAIT PENDING"),
    );
    imageWrap.append(placeholder);
  }
  figure.append(imageWrap);
  appendFilmEdges(figure, name, "GLASSWALL RECORDS");

  const copy = createNode("div", "reel-slide-copy reel-artist-copy");
  copy.append(createNode("p", "eyebrow", tagline), createNode("h2", "", name));

  const lenses = createNode("div", "artist-lenses");
  lenses.setAttribute("role", "group");
  lenses.setAttribute("aria-label", `Explore ${name}`);
  const aboutButton = createNode("button", "", "Portrait");
  aboutButton.type = "button";
  aboutButton.dataset.artistFilter = "portrait";
  aboutButton.setAttribute("aria-pressed", "true");
  lenses.append(aboutButton);
  if (matches.length || musicLink) {
    const listenButton = createNode("button", "", "Listen");
    listenButton.type = "button";
    listenButton.dataset.artistFilter = "listen";
    listenButton.setAttribute("aria-pressed", "false");
    lenses.append(listenButton);
  }
  if (seeking) {
    const seekingButton = createNode("button", "", "Looking for");
    seekingButton.type = "button";
    seekingButton.dataset.artistFilter = "seeking";
    seekingButton.setAttribute("aria-pressed", "false");
    lenses.append(seekingButton);
  }

  const layers = createNode("div", "artist-layers");
  layers.setAttribute("aria-live", "polite");
  const portraitLayer = document.createElement("div");
  portraitLayer.dataset.artistLayer = "portrait";
  portraitLayer.append(createNode("p", "", bio));
  if (website) portraitLayer.append(createArtistLink(website, `Visit ${name}`));
  layers.append(portraitLayer);

  if (matches.length || musicLink) {
    const listenLayer = document.createElement("div");
    listenLayer.dataset.artistLayer = "listen";
    listenLayer.hidden = true;
    const musicDescription = trackTitle
      ? `${trackTitle} is available from ${name}${matches.length > 1 ? `, with ${matches.length - 1} more track${matches.length > 2 ? "s" : ""} in the label catalog.` : "."}`
      : isSaintJules
        ? "Lord Have Mercy, He’s A Crash Dummy! is out now."
      : `Hear the latest music from ${name}.`;
    listenLayer.append(createNode("p", "", musicDescription));
    if (audioUrl) {
      const preview = createNode("button", "artist-layer-link artist-preview-button", `Play ${trackTitle || "preview"} `);
      preview.type = "button";
      preview.dataset.previewUrl = audioUrl;
      preview.dataset.previewLabel = trackTitle || "preview";
      preview.append(createNode("span", "", "▶"));
      listenLayer.append(preview);
    } else {
      listenLayer.append(createArtistLink(musicLink || "#releases", musicLink ? "Listen outside Glasswall" : "Go to the music"));
    }
    layers.append(listenLayer);
  }

  if (seeking) {
    const seekingLayer = document.createElement("div");
    seekingLayer.dataset.artistLayer = "seeking";
    seekingLayer.hidden = true;
    seekingLayer.append(createNode("p", "", seeking));
    const subject = encodeURIComponent(`${name} collaboration`);
    seekingLayer.append(createArtistLink(`mailto:${labelContactEmail}?subject=${subject}`, `Work with ${name}`));
    layers.append(seekingLayer);
  }

  copy.append(lenses, layers);
  slide.append(figure, copy);
  return slide;
}

function renderArtists(payload) {
  const artists = extractArray(payload, ["artists", "roster"]).filter((entry) => {
    const source = record(entry);
    return source.status === undefined || source.status === "published";
  });
  if (!artists.length) return;

  const track = document.querySelector("[data-reel-track]");
  if (!track) return;
  track.querySelectorAll('[data-reel-kind="artist"]').forEach((slide) => slide.remove());
  const tracks = extractArray(payload, ["tracks"]);
  artists.forEach((artist, index) => {
    track.append(createArtistSlide(artist, index, tracks));
  });
  setupArtistReel();
}

function releaseArtwork(release) {
  const source = record(release);
  const direct = mediaDetails(source.artwork || source.cover || source.image);
  if (direct.url) return direct;
  const tracks = list(source.tracks);
  for (const track of tracks) {
    const artwork = mediaDetails(record(track).artwork);
    if (artwork.url) return artwork;
  }
  return { url: "", alt: "" };
}

function releaseArtist(release) {
  const source = record(release);
  const direct = firstText(source, ["artist", "artistName"]);
  if (direct) return direct;
  const firstTrack = record(list(source.tracks)[0]);
  return firstText(firstTrack, ["artist", "artistName"]);
}

function releaseAudio(release) {
  const source = record(release);
  const firstTrack = record(list(source.tracks)[0]);
  const audio = mediaDetails(firstTrack.audio);
  return audio.url || safeUrl(firstTrack.audioUrl);
}

function renderCatalogCard(release) {
  const source = record(release);
  const card = document.createElement("article");
  card.className = "catalog-card";
  const artwork = releaseArtwork(source);
  if (artwork.url) {
    const image = document.createElement("img");
    image.src = artwork.url;
    image.alt = artwork.alt || `${firstText(source, ["title", "name"]) || "Release"} cover artwork`;
    image.loading = "lazy";
    card.append(image);
  }
  const heading = document.createElement("h3");
  heading.textContent = firstText(source, ["title", "name", "releaseGroup"]) || "Untitled release";
  const details = document.createElement("p");
  const kind = firstText(source, ["type", "releaseType"]);
  details.textContent = [releaseArtist(source), kind].filter(Boolean).join(" / ") || "Glasswall Records";
  card.append(heading, details);
  return card;
}

function renderReleases(payload) {
  let releases = extractArray(payload, ["releases", "catalog"]);
  const publishedTracks = extractArray(payload, ["tracks"]);
  if (releases.length && publishedTracks.length) {
    const tracksById = new Map(
      publishedTracks.map((track) => [firstText(track, ["id", "trackId"]), track]),
    );
    releases = releases.map((release) => {
      const source = record(release);
      const trackReferences = list(source.trackIds).length ? list(source.trackIds) : list(source.tracks);
      const resolvedTracks = trackReferences
        .map((entry) => typeof entry === "string" ? tracksById.get(entry) : entry)
        .filter(Boolean);
      return { ...source, tracks: resolvedTracks };
    });
  }
  if (!releases.length) {
    releases = publishedTracks.map((track) => ({
      title: firstText(track, ["releaseGroup", "album", "release", "title"]),
      artist: firstText(track, ["artist"]),
      type: firstText(track, ["releaseType"]),
      tracks: [track],
      artwork: record(track).artwork,
    }));
  }
  if (!releases.length) return;

  const primary = record(releases[0]);
  const title = firstText(primary, ["title", "name", "releaseGroup"]);
  const artist = releaseArtist(primary);
  const type = firstText(primary, ["type", "releaseType"]);
  const description = firstText(primary, ["description", "summary"]);
  const artwork = releaseArtwork(primary);

  const primaryCard = document.querySelector("[data-release-feature]");
  if (primaryCard) {
    const heading = primaryCard.querySelector("h3");
    const name = primaryCard.querySelector(".release-name");
    const code = primaryCard.querySelector(".release-number");
    const body = primaryCard.querySelector(".release-description");
    const image = primaryCard.querySelector("img");
    if (artist && heading) heading.textContent = artist;
    if (title && name) name.textContent = title;
    if (type && code) code.textContent = `${type.toUpperCase()} / OUT NOW`;
    if (description && body) body.textContent = description;
    if (artwork.url && image) {
      image.src = artwork.url;
      image.alt = artwork.alt || `${title || artist || "Glasswall release"} cover artwork`;
    }
  }

  const audioUrl = releaseAudio(primary);
  const previewButton = document.querySelector("[data-track-preview]");
  if (audioUrl && previewButton) {
    previewButton.hidden = false;
    const player = new Audio(audioUrl);
    player.preload = "none";
    previewButton.addEventListener("click", async () => {
      if (player.paused) {
        try {
          await player.play();
          previewButton.textContent = "Pause preview";
        } catch {
          previewButton.textContent = "Preview unavailable";
        }
      } else {
        player.pause();
        previewButton.textContent = "Play preview";
      }
    });
    player.addEventListener("ended", () => {
      previewButton.textContent = "Play preview";
    });
  }

  const catalog = document.querySelector("[data-catalog]");
  if (catalog && releases.length > 1) {
    catalog.replaceChildren(...releases.slice(1).map(renderCatalogCard));
  }
}

let reelObserver;
let reelSlides = [];
let activeReelIndex = 0;
let activePreview;
let activePreviewButton;

function reelTone(slide) {
  if (!slide) return "#e9ebf4";
  const palette = FILTER_TONES[slide.dataset.palette] || FILTER_TONES.glasswall;
  return palette[slide.dataset.filter] || slide.dataset.tone || "#e9ebf4";
}

function setActiveReelSlide(index) {
  if (!reelSlides.length) return;
  activeReelIndex = Math.max(0, Math.min(index, reelSlides.length - 1));
  reelSlides.forEach((slide, slideIndex) => {
    const active = slideIndex === activeReelIndex;
    slide.classList.toggle("is-active", active);
    if (active) slide.setAttribute("aria-current", "true");
    else slide.removeAttribute("aria-current");
  });

  const reel = document.querySelector("[data-artist-reel]");
  reel?.style.setProperty("--reel-tone", reelTone(reelSlides[activeReelIndex]));
  const progress = document.querySelector("[data-reel-progress]");
  if (progress) progress.style.transform = `scaleX(${(activeReelIndex + 1) / reelSlides.length})`;
  const previous = document.querySelector("[data-reel-previous]");
  const next = document.querySelector('.reel-controls [data-reel-next]');
  if (previous) previous.disabled = activeReelIndex === 0;
  if (next) next.disabled = activeReelIndex === reelSlides.length - 1;
}

function setupArtistReel() {
  reelObserver?.disconnect();
  reelSlides = Array.from(document.querySelectorAll("[data-reel-slide]"));
  if (!reelSlides.length) return;
  document.querySelector("[data-artist-reel]")?.classList.toggle(
    "has-multiple-artists",
    reelSlides.length > 1,
  );
  reelSlides.forEach((slide, index) => {
    if (!slide.id) slide.id = `reel-frame-${String(index).padStart(2, "0")}`;
  });
  setActiveReelSlide(Math.min(activeReelIndex, reelSlides.length - 1));

  reelObserver = new IntersectionObserver(
    () => {
      const viewportCenter = window.innerHeight / 2;
      const centered = reelSlides
        .map((slide, index) => ({ index, bounds: slide.getBoundingClientRect() }))
        .filter(({ bounds }) => bounds.bottom > 0 && bounds.top < window.innerHeight)
        .sort((a, b) => {
          const aCenter = a.bounds.top + a.bounds.height / 2;
          const bCenter = b.bounds.top + b.bounds.height / 2;
          return Math.abs(aCenter - viewportCenter) - Math.abs(bCenter - viewportCenter);
        })[0];
      if (centered) setActiveReelSlide(centered.index);
    },
    { rootMargin: "-24% 0px -24% 0px", threshold: [0, 0.2, 0.5, 0.8] },
  );
  reelSlides.forEach((slide) => reelObserver.observe(slide));
}

function moveArtistReel(direction) {
  const targetIndex = Math.max(0, Math.min(activeReelIndex + direction, reelSlides.length - 1));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  reelSlides[targetIndex]?.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
  setActiveReelSlide(targetIndex);
}

function selectArtistLayer(button) {
  const slide = button.closest(".reel-artist-slide");
  const layer = button.dataset.artistFilter;
  if (!slide || !layer) return;
  slide.dataset.filter = layer;
  slide.querySelectorAll("[data-artist-filter]").forEach((control) => {
    control.setAttribute("aria-pressed", String(control === button));
  });
  slide.querySelectorAll("[data-artist-layer]").forEach((panel) => {
    panel.hidden = panel.dataset.artistLayer !== layer;
  });
  if (slide.classList.contains("is-active")) {
    document.querySelector("[data-artist-reel]")?.style.setProperty("--reel-tone", reelTone(slide));
  }
}

function labelPreviewButton(button, playing) {
  const title = button.dataset.previewLabel || "preview";
  const icon = createNode("span", "", playing ? "Ⅱ" : "▶");
  icon.setAttribute("aria-hidden", "true");
  button.replaceChildren(document.createTextNode(`${playing ? "Pause" : "Play"} ${title} `), icon);
}

async function toggleArtistPreview(button) {
  const url = safeUrl(button.dataset.previewUrl);
  if (!url) return;
  if (activePreview && activePreviewButton === button) {
    if (activePreview.paused) {
      try {
        await activePreview.play();
        labelPreviewButton(button, true);
      } catch {
        labelPreviewButton(button, false);
      }
    } else {
      activePreview.pause();
      labelPreviewButton(button, false);
    }
    return;
  }
  if (activePreview) activePreview.pause();
  if (activePreviewButton) labelPreviewButton(activePreviewButton, false);
  activePreview = new Audio(url);
  activePreview.preload = "none";
  activePreviewButton = button;
  activePreview.addEventListener("ended", () => labelPreviewButton(button, false), { once: true });
  try {
    await activePreview.play();
    labelPreviewButton(button, true);
  } catch {
    labelPreviewButton(button, false);
  }
}

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const filterButton = target?.closest("[data-artist-filter]");
  if (filterButton instanceof HTMLButtonElement) {
    selectArtistLayer(filterButton);
    return;
  }
  const previewButton = target?.closest("[data-preview-url]");
  if (previewButton instanceof HTMLButtonElement) {
    void toggleArtistPreview(previewButton);
    return;
  }
  const previousButton = target?.closest("[data-reel-previous]");
  if (previousButton instanceof HTMLButtonElement) {
    moveArtistReel(-1);
    return;
  }
  const nextButton = target?.closest("[data-reel-next]");
  if (nextButton instanceof HTMLButtonElement) {
    moveArtistReel(1);
    return;
  }
  const choice = target?.closest("[data-submission-choice]");
  if (choice instanceof HTMLAnchorElement) {
    const select = document.querySelector('select[name="stage"]');
    if (select instanceof HTMLSelectElement) {
      select.value = choice.dataset.submissionChoice || "";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
});

setupArtistReel();

async function loadStudioContent() {
  try {
    const response = await fetch(GLASSWALL_API, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      headers: { accept: "application/json" },
    });
    if (!response.ok) return;
    const payload = await response.json();
    hydrateSettings(payload);
    renderArtists(payload);
    renderReleases(payload);
  } catch {
    // The authored page remains complete when the publishing API is offline.
  }
}

void loadStudioContent();

const submissionForm = document.querySelector("[data-submission-form]");
const submissionStatus = document.querySelector("[data-form-status]");
const submitButton = document.querySelector("[data-submit-button]");
const submissionType = submissionForm?.querySelector('select[name="stage"]');
const submissionLink = submissionForm?.querySelector('input[name="musicUrl"]');

function validateSubmissionLink() {
  if (!(submissionType instanceof HTMLSelectElement) || !(submissionLink instanceof HTMLInputElement)) return;
  const musicRequired = submissionType.value === "Music submission";
  submissionLink.setCustomValidity(
    musicRequired && !text(submissionLink.value)
      ? "Add a private music link so the label can hear your submission."
      : "",
  );
}

submissionType?.addEventListener("change", validateSubmissionLink);
submissionLink?.addEventListener("input", validateSubmissionLink);

function setSubmissionStatus(message, state = "") {
  if (!submissionStatus) return;
  submissionStatus.textContent = message;
  submissionStatus.classList.toggle("is-error", state === "error");
  submissionStatus.classList.toggle("is-success", state === "success");
}

submissionForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  validateSubmissionLink();
  if (!submissionForm.reportValidity() || submitButton?.disabled) return;
  const formData = new FormData(submissionForm);
  const payload = {
    name: text(formData.get("name")),
    artistName: text(formData.get("artistName")),
    email: text(formData.get("email")),
    stage: text(formData.get("stage")),
    musicUrl: text(formData.get("musicUrl")),
    socialUrl: text(formData.get("socialUrl")),
    links: [text(formData.get("musicUrl")), text(formData.get("socialUrl"))]
      .filter(Boolean)
      .join("\n"),
    message: text(formData.get("message")),
    website: text(formData.get("website")),
    consent: formData.get("consent") === "on",
    source: window.location.hostname || "glasswallrecords.com",
  };

  if (submitButton) submitButton.disabled = true;
  setSubmissionStatus("Sending your submission…");
  try {
    const response = await fetch(`${GLASSWALL_API}/submissions`, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = (response.headers.get("content-type") || "").includes("application/json")
      ? await response.json()
      : {};
    if (!response.ok) {
      throw new Error(firstText(result, ["message", "error"]) || "The submission could not be sent.");
    }
    submissionForm.reset();
    setSubmissionStatus("Received. Thank you for trusting us with your work.", "success");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "The submission could not be sent.";
    setSubmissionStatus(`${reason} You can also email ${labelContactEmail}.`, "error");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});
