const { test } = require("node:test");
const assert = require("node:assert/strict");
const { parse, dedupe } = require("../public/ocr.js");

const phoneScreenshot = `9:41 5G 87%
do not text him
kare100
21 songs, 1 hr 12 min
Someone Like You
Adele
Kill Bill
E SZA
Calm Down
Rema, Selena Gomez`;

test("reads songs and artists from a phone screenshot", () => {
  const { tracks } = parse(phoneScreenshot);
  assert.deepEqual(
    tracks.map((t) => [t.name, t.artists]),
    [
      ["Someone Like You", ["Adele"]],
      ["Kill Bill", ["SZA"]],
      ["Calm Down", ["Rema", "Selena Gomez"]],
    ]
  );
});

test("uses the header to find the playlist name and skips it", () => {
  const { playlistName, tracks } = parse(phoneScreenshot);
  assert.equal(playlistName, "do not text him");
  assert.ok(!tracks.some((t) => t.name === "kare100"));
});

test("marks songs with the explicit badge", () => {
  const { tracks } = parse(phoneScreenshot);
  assert.equal(tracks.find((t) => t.name === "Kill Bill").explicit, true);
  assert.equal(tracks.find((t) => t.name === "Someone Like You").explicit, false);
});

test("removes the menu dots and stray punctuation after titles", () => {
  const { tracks } = parse("Liability ...\nLorde\nWater ⋯\nTyla\nSomeone Like You .\nAdele");
  assert.deepEqual(tracks.map((t) => t.name), ["Liability", "Water", "Someone Like You"]);
});

test("ignores app buttons like Shuffle and Home", () => {
  const { tracks } = parse("Shuffle\nRush\nAyra Starr\nHome\nSearch\nYour Library");
  assert.deepEqual(tracks.map((t) => t.name), ["Rush"]);
});

test("reads desktop rows that end with a song length", () => {
  const { tracks } = parse(
    "1 Last Last Burna Boy 2:52\n2 Water Tyla 3:20\n3 Calm Down Rema 3:59"
  );
  assert.equal(tracks.length, 3);
  assert.equal(tracks[0].name, "Last Last Burna Boy");
});

test("returns no songs for text that isn't a playlist", () => {
  assert.equal(parse("").tracks.length, 0);
  assert.equal(parse("hello").tracks.length, 0);
});

test("dedupe keeps the first copy of a song from overlapping screenshots", () => {
  const songs = [{ name: "Water" }, { name: "Rush" }, { name: "water" }];
  assert.deepEqual(dedupe(songs).map((t) => t.name), ["Water", "Rush"]);
});
