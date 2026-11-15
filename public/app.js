(function () {
  const $ = (id) => document.getElementById(id);
  const els = {
    start: $("start"), loading: $("loading"), result: $("result"),
    form: $("form"), url: $("url"), error: $("error"), samples: $("samples"),
    preview: $("preview"), resultCard: $("result-card"), loadingText: $("loading-text"),
    save: $("save"), copy: $("copy"), again: $("again"), toast: $("toast"),
    tpl: $("card-tpl"),
  };

  const ERRORS = {
    bad_link: "That doesn't look like a playlist link. In Spotify, tap Share, then Copy link to playlist.",
    not_found: "Can't open that playlist. Make sure it's public and made by a person, not by Spotify.",
    not_configured: "Live playlists aren't switched on for this site yet. Try one of the sample playlists below.",
    rate_limited: "Spotify is busy right now. Try again in a minute.",
    empty: "That playlist has no songs we can read. Add a few and try again.",
    upstream: "Couldn't reach Spotify. Check your connection and try again.",
    preview: "This preview only runs the sample playlists. Real links work once the site is deployed.",
  };
  const PREVIEW = /claude|localhost-preview/.test(location.host);

  let lang = "en";
  try { lang = localStorage.getItem("era-lang") || "en"; } catch (_) {}
  let current = null; // { playlist, result }

  // ---- Rendering ----
  function buildCard(playlist, result) {
    const node = els.tpl.content.firstElementChild.cloneNode(true);
    const s = result.stats;
    const fill = (t) => EraEngine.fill(t, s);
    const values = {
      playlist: playlist.name,
      era: result.era.name,
      tagline: fill(result.era.tagline),
      vibe: result.vibe,
      song: result.anthem ? result.anthem.name : "",
      artist: result.anthem ? result.anthem.artist : "",
      songs: s.n,
      artists: s.artists,
      year: s.avgYear,
      roast: fill(result.era.roast[lang] || result.era.roast.en),
      site: location.host && !location.host.includes("claude") ? location.host : "era check",
    };
    node.querySelectorAll("[data-f]").forEach((el) => { el.textContent = values[el.dataset.f]; });
    const look = result.era.look;
    node.dataset.bg = look.bg;
    const ink = (c) => `var(--${c === "paper" ? "paper" : c})`;
    node.style.setProperty("--a", ink(look.a));
    node.style.setProperty("--b", ink(look.b));
    node.setAttribute("aria-label", `${values.era}. ${values.tagline} Vibe score ${values.vibe}.`);
    return node;
  }

  function show(section) {
    for (const k of ["start", "loading", "result"]) els[k].hidden = k !== section;
    window.scrollTo({ top: 0 });
  }

  function showError(code) {
    els.error.textContent = ERRORS[code] || ERRORS.upstream;
    els.error.hidden = false;
    show("start");
    els.url.focus();
  }

  function renderResult() {
    if (!current) return;
    els.resultCard.replaceChildren(buildCard(current.playlist, current.result));
  }

  function renderPreview() {
    const sample = EraSamples[0];
    els.preview.replaceChildren(buildCard(sample, EraEngine.analyze(sample)));
  }

  // ---- Flow ----
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function run(getPlaylist, label) {
    els.error.hidden = true;
    els.loadingText.textContent = label || "Reading the songs";
    show("loading");
    try {
      const [playlist] = await Promise.all([getPlaylist(), wait(1100)]);
      if (!playlist.tracks || !playlist.tracks.length) return showError("empty");
      const result = EraEngine.analyze(playlist);
      current = { playlist, result };
      renderResult();
      show("result");
      els.resultCard.classList.remove("stamp");
      void els.resultCard.offsetWidth;
      els.resultCard.classList.add("stamp");
      els.toast.textContent = "";
      els.save.focus({ preventScroll: true });
    } catch (e) {
      showError(e.code || "upstream");
    }
  }

  async function fetchPlaylist(url) {
    const res = await fetch(`/api/playlist?url=${encodeURIComponent(url)}`);
    let data = null;
    try { data = await res.json(); } catch (_) {}
    if (!res.ok || !data) {
      const err = new Error("fetch");
      err.code = (data && data.error) || (res.status === 404 && !data ? "not_configured" : "upstream");
      throw err;
    }
    return data;
  }

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = els.url.value.trim();
    if (!/playlist[/:][A-Za-z0-9]{22}/.test(url) && !/^[A-Za-z0-9]{22}$/.test(url)) return showError("bad_link");
    if (PREVIEW) return showError("preview");
    run(() => fetchPlaylist(url));
  });

  EraSamples.forEach((sample) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = sample.name;
    b.addEventListener("click", () => run(async () => sample, `Reading ${sample.tracks.length} songs`));
    els.samples.appendChild(b);
  });

  els.again.addEventListener("click", () => {
    els.url.value = "";
    show("start");
    els.url.focus();
  });

  // ---- Language ----
  function setLang(next) {
    lang = next;
    try { localStorage.setItem("era-lang", lang); } catch (_) {}
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    renderPreview();
    if (current && !els.result.hidden) renderResult();
  }
  document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  // ---- Sharing ----
  function say(msg) {
    els.toast.textContent = msg;
  }

  els.save.addEventListener("click", async () => {
    const card = els.resultCard.querySelector(".card");
    if (PREVIEW) return say("Saving works on the deployed site. For now, take a screenshot.");
    if (!card || !window.htmlToImage) return say("Image saving isn't available here. Take a screenshot instead.");
    els.save.disabled = true;
    els.resultCard.classList.remove("stamp");
    try {
      const shadow = card.style.boxShadow;
      card.style.boxShadow = "none";
      const dataUrl = await window.htmlToImage.toPng(card, { pixelRatio: 1080 / card.offsetWidth, cacheBust: true });
      card.style.boxShadow = shadow;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `era-check-${current.result.key}.png`;
      a.click();
      say("Saved. Post it and tag your friends.");
    } catch (_) {
      say("Couldn't save the image. Take a screenshot instead.");
    } finally {
      els.save.disabled = false;
    }
  });

  els.copy.addEventListener("click", async () => {
    if (!current) return;
    const origin = location.host.includes("claude") ? "" : ` ${location.origin}`;
    const text = `${EraEngine.fill(current.result.era.caption, current.result.stats)} Vibe score ${current.result.vibe}. Check yours:${origin}`;
    try {
      await navigator.clipboard.writeText(text);
      say("Caption copied.");
    } catch (_) {
      say(text);
    }
  });

  setLang(lang);
})();
