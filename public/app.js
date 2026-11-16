(function () {
  const $ = (id) => document.getElementById(id);
  const els = {
    start: $("start"), loading: $("loading"), review: $("review"), result: $("result"),
    songList: $("song-list"), reviewCount: $("review-count"), reviewNote: $("review-note"),
    make: $("make"), reviewBack: $("review-back"),
    drop: $("drop"), shots: $("shots"), error: $("error"), samples: $("samples"),
    preview: $("preview"), resultCard: $("result-card"), loadingText: $("loading-text"),
    save: $("save"), copy: $("copy"), again: $("again"), toast: $("toast"),
    tpl: $("card-tpl"),
  };

  const MAX_SHOTS = 5;
  const ERRORS = {
    no_songs: "Couldn't find songs in that screenshot. Make sure the song list is showing, then try again.",
    not_image: "That file isn't an image. Upload a screenshot of your playlist.",
    reader: "Couldn't load the screenshot reader. Check your connection and try again.",
  };
  const PREVIEW = /claude/.test(location.host);

  let lang = "en";
  try { lang = localStorage.getItem("era-lang") || "en"; } catch (_) {}
  let current = null; // { playlist, result }

  // ---- Rendering ----
  function buildCard(playlist, result) {
    const node = els.tpl.content.firstElementChild.cloneNode(true);
    const s = result.stats;
    const fill = (t) => EraEngine.fill(t, s);
    const values = {
      playlist: playlist.name || "my playlist",
      era: result.era.name,
      tagline: fill(result.era.tagline),
      vibe: result.vibe,
      song: result.anthem ? result.anthem.name : "",
      artist: result.anthem ? result.anthem.artist : "",
      songs: s.n,
      artists: s.artists,
      third: s.avgYear ? s.avgYear : `${s.feelsPct}%`,
      thirdLabel: s.avgYear ? "avg year" : "in their feelings",
      roast: fill(result.era.roast[lang] || result.era.roast.en),
      site: location.host && !PREVIEW ? location.host : "era check",
    };
    node.querySelectorAll("[data-f]").forEach((el) => { el.textContent = values[el.dataset.f]; });
    const look = result.era.look;
    node.dataset.bg = look.bg;
    node.style.setProperty("--a", `var(--${look.a})`);
    node.style.setProperty("--b", `var(--${look.b})`);
    node.setAttribute("aria-label", `${values.era}. ${values.tagline} Vibe score ${values.vibe}.`);
    return node;
  }

  function show(section) {
    for (const k of ["start", "loading", "review", "result"]) els[k].hidden = k !== section;
    window.scrollTo({ top: 0 });
  }

  function showError(code) {
    els.error.textContent = ERRORS[code] || ERRORS.no_songs;
    els.error.hidden = false;
    show("start");
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

  function showCard(playlist) {
    const result = EraEngine.analyze(playlist);
    current = { playlist, result };
    renderResult();
    show("result");
    els.resultCard.classList.remove("stamp");
    void els.resultCard.offsetWidth;
    els.resultCard.classList.add("stamp");
    els.toast.textContent = "";
    els.save.focus({ preventScroll: true });
  }

  // Screenshots go through a review step first, so misread songs can be removed.
  async function run(getPlaylist, label, { review = false } = {}) {
    els.error.hidden = true;
    els.loadingText.textContent = label || "Reading your screenshot";
    show("loading");
    try {
      const [playlist] = await Promise.all([getPlaylist(), wait(1100)]);
      if (!playlist.tracks || playlist.tracks.length < 2) return showError("no_songs");
      if (review) showReview(playlist);
      else showCard(playlist);
    } catch (e) {
      showError(e.code || "no_songs");
    }
  }

  // ---- Review step ----
  let reviewing = null;

  function renderReview() {
    const tracks = reviewing.tracks;
    els.reviewCount.textContent = `${tracks.length} song${tracks.length === 1 ? "" : "s"}`;
    els.songList.replaceChildren(
      ...tracks.map((t, i) => {
        const li = document.createElement("li");
        const text = document.createElement("div");
        const name = document.createElement("span");
        name.className = "song-name";
        name.textContent = t.name;
        const artist = document.createElement("span");
        artist.className = "song-artist";
        artist.textContent = t.artists.length ? t.artists.join(", ") : "Unknown artist";
        text.append(name, artist);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "song-remove";
        remove.textContent = "×";
        remove.setAttribute("aria-label", `Remove ${t.name}`);
        remove.addEventListener("click", () => removeSong(i));
        li.append(text, remove);
        return li;
      })
    );
    const enough = tracks.length >= 2;
    els.make.disabled = !enough;
    els.reviewNote.textContent = enough
      ? "Remove anything we misread, then make your card."
      : "Keep at least 2 songs to make a card, or try another screenshot.";
  }

  function removeSong(i) {
    reviewing.tracks.splice(i, 1);
    renderReview();
    const buttons = els.songList.querySelectorAll(".song-remove");
    (buttons[i] || buttons[i - 1] || els.make).focus();
  }

  function showReview(playlist) {
    reviewing = { ...playlist, tracks: playlist.tracks.slice() };
    renderReview();
    show("review");
    els.make.focus({ preventScroll: true });
  }

  els.make.addEventListener("click", () => { if (reviewing) showCard(reviewing); });
  els.reviewBack.addEventListener("click", () => { show("start"); els.shots.focus(); });

  // ---- Screenshot reading (all in the browser) ----
  // Spotify screenshots are light text on dark. Grayscale, invert and upscale them
  // so the text reader sees crisp dark text on white.
  async function prepare(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(3, Math.max(1, 1400 / bitmap.width));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    let total = 0;
    for (let i = 0; i < d.length; i += 4) total += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const dark = total / (d.length / 4) < 128;
    for (let i = 0; i < d.length; i += 4) {
      let y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (dark) y = 255 - y;
      y = y < 150 ? Math.max(0, y * 0.6) : 255; // push grey text to black, background to white
      d[i] = d[i + 1] = d[i + 2] = y;
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  }

  let worker = null;
  async function getWorker(onProgress) {
    if (!window.Tesseract) {
      const err = new Error("reader"); err.code = "reader"; throw err;
    }
    if (!worker) {
      worker = await Tesseract.createWorker("eng", 1, {
        logger: (m) => { if (m.status === "recognizing text") onProgress(m.progress); },
      });
    }
    return worker;
  }

  async function readScreenshots(files) {
    const images = files.filter((f) => f.type.startsWith("image/")).slice(0, MAX_SHOTS);
    if (!images.length) { const e = new Error("not_image"); e.code = "not_image"; throw e; }

    let done = 0;
    const progress = (p) => {
      const pct = Math.round(((done + p) / images.length) * 100);
      els.loadingText.textContent = `Reading your screenshot${images.length > 1 ? "s" : ""}… ${pct}%`;
    };
    let w;
    try { w = await getWorker(progress); } catch (e) { e.code = e.code || "reader"; throw e; }

    let name = null;
    let tracks = [];
    for (const file of images) {
      const canvas = await prepare(file);
      const { data } = await w.recognize(canvas);
      const parsed = EraOCR.parse(data.text);
      name = name || parsed.playlistName;
      tracks = tracks.concat(parsed.tracks);
      done++;
    }
    return { name: name || "my playlist", tracks: EraOCR.dedupe(tracks) };
  }

  function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (PREVIEW) {
      els.error.textContent = "This preview only runs the sample playlists. Screenshots work on the live site.";
      els.error.hidden = false;
      return;
    }
    run(() => readScreenshots(files), "Reading your screenshot…", { review: true });
  }

  els.shots.addEventListener("change", () => { handleFiles(els.shots.files); els.shots.value = ""; });
  ["dragenter", "dragover"].forEach((t) => els.drop.addEventListener(t, (e) => { e.preventDefault(); els.drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach((t) => els.drop.addEventListener(t, () => els.drop.classList.remove("over")));
  els.drop.addEventListener("drop", (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); });
  document.addEventListener("paste", (e) => {
    if (els.start.hidden) return;
    const files = Array.from(e.clipboardData ? e.clipboardData.files : []);
    if (files.length) { e.preventDefault(); handleFiles(files); }
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
    show("start");
    els.shots.focus();
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
  const say = (msg) => { els.toast.textContent = msg; };

  els.save.addEventListener("click", async () => {
    if (PREVIEW) return say("Saving works on the live site. For now, take a screenshot.");
    const card = els.resultCard.querySelector(".card");
    if (!card || !window.htmlToImage) return say("Image saving isn't available here. Take a screenshot instead.");
    els.save.disabled = true;
    els.resultCard.classList.remove("stamp");
    const shadow = card.style.boxShadow;
    try {
      card.style.boxShadow = "none";
      const dataUrl = await window.htmlToImage.toPng(card, { pixelRatio: 1080 / card.offsetWidth, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `era-check-${current.result.key}.png`;
      a.click();
      say("Saved. Post it and tag your friends.");
    } catch (_) {
      say("Couldn't save the image. Take a screenshot instead.");
    } finally {
      card.style.boxShadow = shadow;
      els.save.disabled = false;
    }
  });

  els.copy.addEventListener("click", async () => {
    if (!current) return;
    const origin = PREVIEW ? "" : ` ${location.origin}`;
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
