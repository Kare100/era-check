# Era Check 🎀

Screenshot your Spotify playlist and find out what era you're in: Villain Arc, Delulu Romantic, Crying in the Matatu, Nairobi Nights and more. You get a vibe score, your main character song, a roast (in English or Sheng), and a card you can save and post.

It's designed like a risograph zine, with raspberry, bubblegum and lilac inks on blush paper and headlines that print slightly out of register.

## How it works

- `public/`: the whole site in plain HTML, CSS and JS, with no build step and no backend.
- You upload a screenshot of your playlist and [Tesseract.js](https://github.com/naptha/tesseract.js) reads the song names right in your browser. Screenshots never leave your device.
- `public/ocr.js` turns the text from the screenshot into songs and artists.
- `public/eras.js` is the era engine. It scores song titles, artists and explicit tracks, then picks the strongest era.
- Sample playlists are built in so anyone can try it in one tap.

### Why screenshots and not Spotify links?

Since February 2026, new Spotify developer apps need a Premium account and can't read other people's playlists, so pasting a playlist link isn't possible for new projects. Screenshots work for everyone with no login and no keys.

## Run it locally

Open `public/index.html` in a browser, or serve the folder:

```bash
npx serve public
```

## Deploy

Import the repo on [vercel.com](https://vercel.com) and deploy. No environment variables are needed.

## Add your own era

Add an entry to `ERAS` in `public/eras.js` with a name, tagline, roast (`en` and `sh`), caption and card colors, then add a score for it in `analyze()`.

---

Made in Nairobi by [Valerie Mwangi](https://github.com/Kare100). Not affiliated with Spotify.
