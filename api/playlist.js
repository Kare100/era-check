// Vercel serverless function: GET /api/playlist?url=<spotify playlist link>
// Needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET set in your Vercel project.
// Uses the client-credentials flow, so no user login is needed (public playlists only).

const MAX_TRACKS = 300;
let cachedToken = null;

function playlistIdFrom(input) {
  if (!input) return null;
  const s = String(input).trim();
  const m =
    s.match(/playlist[/:]([A-Za-z0-9]{22})/) || // open.spotify.com/playlist/ID or spotify:playlist:ID
    s.match(/^([A-Za-z0-9]{22})$/);
  return m ? m[1] : null;
}

async function getToken() {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return cachedToken.value;
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) {
    const err = new Error("not_configured");
    err.status = 503;
    throw err;
  }
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const err = new Error("auth_failed");
    err.status = 502;
    throw err;
  }
  const data = await res.json();
  cachedToken = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

async function spotify(path, token) {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = new Error("spotify_" + res.status);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function normalizeItem(item) {
  const t = item && (item.track || item.item);
  if (!t || t.type === "episode" || !t.name) return null;
  const date = t.album && t.album.release_date;
  return {
    name: t.name,
    artists: (t.artists || []).map((a) => a.name).filter(Boolean),
    year: date ? parseInt(date.slice(0, 4), 10) || null : null,
    explicit: !!t.explicit,
    popularity: typeof t.popularity === "number" ? t.popularity : null,
    durationMs: t.duration_ms || null,
    addedAt: item.added_at || null,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  const id = playlistIdFrom(req.query && req.query.url);
  if (!id) {
    res.status(400).end(JSON.stringify({ error: "bad_link" }));
    return;
  }

  try {
    const token = await getToken();
    const meta = await spotify(
      `/playlists/${id}?fields=name,owner(display_name),images`,
      token
    );

    const tracks = [];
    let offset = 0;
    while (tracks.length < MAX_TRACKS) {
      const page = await spotify(
        `/playlists/${id}/tracks?limit=100&offset=${offset}&additional_types=track`,
        token
      );
      for (const item of page.items || []) {
        const n = normalizeItem(item);
        if (n) tracks.push(n);
      }
      if (!page.next) break;
      offset += 100;
    }

    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
    res.status(200).end(
      JSON.stringify({
        name: meta.name,
        owner: meta.owner && meta.owner.display_name,
        image: meta.images && meta.images[0] ? meta.images[0].url : null,
        tracks: tracks.slice(0, MAX_TRACKS),
      })
    );
  } catch (err) {
    const status = err.status || 500;
    const code =
      err.message === "not_configured"
        ? "not_configured"
        : status === 404
        ? "not_found"
        : status === 429
        ? "rate_limited"
        : "upstream";
    res.status(status === 404 ? 404 : status === 503 ? 503 : 502).end(JSON.stringify({ error: code }));
  }
};

module.exports.playlistIdFrom = playlistIdFrom;
