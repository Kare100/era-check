const { test } = require("node:test");
const assert = require("node:assert/strict");
const { analyze, fill, ERAS } = require("../public/eras.js");
const SAMPLES = require("../public/samples.js");

const byName = (name) => SAMPLES.find((s) => s.name === name);

test("an Afrobeats-heavy playlist lands in Nairobi Nights", () => {
  assert.equal(analyze(byName("westlands on a friday")).key, "nairobi");
});

test("a sad playlist lands in Crying in the Matatu", () => {
  assert.equal(analyze(byName("do not text him")).key, "crying");
});

test("an old playlist lands in Throwback Kid", () => {
  assert.equal(analyze(byName("tumblr 2014")).key, "throwback");
});

test("one artist taking over a playlist gives Fan Account Era", () => {
  const tracks = Array.from({ length: 10 }, (_, i) => ({
    name: `Song ${i}`,
    artists: [i < 6 ? "Bien" : `Artist ${i}`],
  }));
  assert.equal(analyze({ tracks }).key, "fan");
});

test("vibe score always stays between 55 and 99", () => {
  for (const playlist of SAMPLES) {
    const { vibe } = analyze(playlist);
    assert.ok(vibe >= 55 && vibe <= 99, `vibe was ${vibe}`);
  }
});

test("picks a main character song from the playlist", () => {
  const playlist = byName("do not text him");
  const { anthem } = analyze(playlist);
  assert.ok(playlist.tracks.some((t) => t.name === anthem.name));
});

test("screenshots without release years leave avgYear empty", () => {
  const tracks = [
    { name: "Rush", artists: ["Ayra Starr"] },
    { name: "Water", artists: ["Tyla"] },
  ];
  assert.equal(analyze({ tracks }).stats.avgYear, null);
});

test("every era has English and Sheng roasts", () => {
  for (const [key, era] of Object.entries(ERAS)) {
    assert.ok(era.roast.en && era.roast.sh, `${key} is missing a roast`);
  }
});

test("fill swaps placeholders for stats", () => {
  assert.equal(fill("{sadPct}% sad", { sadPct: 62 }), "62% sad");
});
