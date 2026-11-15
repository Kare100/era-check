// Turns OCR text from playlist screenshots into a list of songs.
// Works with Spotify phone screenshots (title line, then artist line) and
// desktop screenshots (one row per song with a duration at the end).
(function (root) {
  const UI_WORDS = /^(home|search|your library|library|premium|create|shuffle|play|add|sort|edit|liked songs|downloaded|download|recommended|recently played|playlists|artists|albums|podcasts|made for you|find in playlist|add to this playlist|add songs|title|album|date added|now playing|lyrics|queue|devices|following|follow|more|see all|filter|songs|about \d.*|\d+ songs?.*|\d+ (hr|min).*)$/i;
  const TIME = /\b\d{1,2}:\d{2}\b/;
  const DEVICE = /^(\d{1,2}:\d{2})(\s|$)|lte|5g|4g|wi-?fi|%$/i;

  function clean(line) {
    return line
      .replace(/[|•·»«©®™_~`^*{}\[\]<>]+/g, " ")
      .replace(/(\s*(\.{2,}|…|⋯|·{2,}|ooo|eee))+\s*$/i, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function letters(s) {
    return (s.match(/\p{L}/gu) || []).length;
  }

  function isNoise(line) {
    if (letters(line) < 2) return true;
    if (UI_WORDS.test(line)) return true;
    if (DEVICE.test(line) && letters(line) < 6) return true;
    if (/^(\+|\.\.\.|…|♡|❤)/.test(line) && letters(line) < 4) return true;
    return false;
  }

  function splitArtistLine(line) {
    let explicit = false;
    let s = line;
    // The explicit badge usually reads as a lone "E" at the start of the artist line.
    if (/^(E|\[E\]|\(E\)|€)\s+/.test(s)) {
      explicit = true;
      s = s.replace(/^(E|\[E\]|\(E\)|€)\s+/, "");
    }
    s = s.replace(/^(single|ep|album|song)\s*[-–]\s*/i, "");
    s = s.split(/\s+[-–]\s+|\s{2,}/)[0];
    const artists = s.split(/\s*,\s*|\s+&\s+|\s+feat\.?\s+|\s+ft\.?\s+/i).map((a) => a.trim()).filter((a) => letters(a) >= 2);
    return { artists, explicit };
  }

  const HEADER_END = /(\d+\s+songs?|\d+\s*(hr|min)\b|\bshuffle\b|\bsaves?\b|^play$)/i;

  function parse(text) {
    let raw = String(text || "").split(/\r?\n/).map(clean).filter(Boolean);
    // Drop the playlist header (cover, name, owner, song count) above the song list.
    let playlistName = null;
    const headerIdx = raw.slice(0, 12).map((l) => HEADER_END.test(l)).lastIndexOf(true);
    if (headerIdx >= 0) {
      const header = raw.slice(0, headerIdx).filter((l) => !isNoise(l));
      if (header.length) playlistName = header[0];
      raw = raw.slice(headerIdx + 1);
    }
    const lines = raw.filter((l) => !isNoise(l));

    const timed = lines.filter((l) => TIME.test(l) && letters(l) > 4);
    const tracks = [];

    if (timed.length >= 3 && timed.length >= lines.length * 0.4) {
      // Desktop rows: "1 Last Last Burna Boy Love, Damini 3 days ago 2:52"
      for (const row of timed) {
        const title = row
          .replace(/^\d{1,3}\s+/, "")
          .replace(/\s*\d+\s+(days?|weeks?|months?|hours?)\s+ago.*$/i, "")
          .replace(/\s*\b\d{1,2}:\d{2}\b.*$/, "")
          .trim();
        if (letters(title) >= 2) tracks.push({ name: title, artists: [], year: null, explicit: false, popularity: null, addedAt: null });
      }
      return { playlistName, tracks };
    }

    // Phone layout: song title, then artist line.
    for (let i = 0; i + 1 < lines.length; i += 2) {
      const title = lines[i].replace(/\s*\b\d{1,2}:\d{2}\b.*$/, "").trim();
      const { artists, explicit } = splitArtistLine(lines[i + 1]);
      if (letters(title) < 2 || !artists.length) continue;
      tracks.push({ name: title, artists, year: null, explicit, popularity: null, addedAt: null });
    }
    return { playlistName, tracks };
  }

  function dedupe(tracks) {
    const seen = new Set();
    return tracks.filter((t) => {
      const k = t.name.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  root.EraOCR = { parse, dedupe };
  if (typeof module !== "undefined") module.exports = root.EraOCR;
})(typeof window !== "undefined" ? window : globalThis);
