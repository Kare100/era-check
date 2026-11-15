# Era Check 🎀

Paste a Spotify playlist and find out what era you're in: Villain Arc, Delulu Romantic, Crying in the Matatu, Nairobi Nights and more. You get a vibe score, your main character song, a roast (in English or Sheng), and a card you can save and post.

It's designed like a risograph zine, with raspberry, bubblegum and lilac inks on blush paper and headlines that print slightly out of register.

## How it works

- `public/`: the whole frontend in plain HTML, CSS and JS, with no build step.
- `public/eras.js`: the era engine. It scores song titles, artists, release years, explicit tracks and the times songs were added, then picks the strongest era.
- `api/playlist.js`: a Vercel serverless function that reads public playlists through the Spotify Web API (client-credentials flow, so nobody has to log in).
- Sample playlists are built in, so the app works even before you add Spotify keys.

## Run it locally

```bash
npx vercel dev
```

Or just open `public/index.html` and try the sample playlists.

## Deploy

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) and copy its Client ID and Client Secret.
2. Import this repo on [vercel.com](https://vercel.com).
3. Add the environment variables `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.
4. Deploy.

Only public playlists made by people work. Spotify blocks its own editorial playlists from new apps.

## Add your own era

Add an entry to `ERAS` in `public/eras.js` with a name, tagline, roast (`en` and `sh`), caption and card colors, then add a score for it in `analyze()`.

---

Made in Nairobi by [Valerie Mwangi](https://github.com/Kare100). Not affiliated with Spotify.
