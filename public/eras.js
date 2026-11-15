// Era Check engine: turns a playlist into an era. Pure functions, no network.
(function (root) {
  const words = (list) => new RegExp("\\b(" + list.join("|") + ")\\b", "i");

  const SAD = words(["cry", "crying", "tears", "sad", "alone", "lonely", "hurt", "broken", "miss", "missing", "goodbye", "without you", "pain", "lost", "empty", "sorry", "drown", "ghost", "cold", "heartbreak", "rain", "liability", "someone like you", "traitor"]);
  const LOVE = words(["love", "lover", "baby", "babe", "heart", "kiss", "mine", "forever", "darling", "honey", "crush", "dream", "dreams", "yours", "together", "sweet", "valentine", "nakupenda", "penzi", "mpenzi", "roho", "sweetie", "calm down"]);
  const VILLAIN = words(["money", "bad", "gang", "savage", "kill", "war", "boss", "rich", "revenge", "villain", "devil", "karma", "enemy", "enemies", "smoke", "bitch", "bag", "bands", "power", "god", "king", "queen", "wicked", "vigilante", "mad", "angry"]);
  const HEAL = words(["heal", "healing", "peace", "free", "breathe", "sunshine", "grow", "growth", "light", "okay", "alright", "better", "slow", "soft", "home", "safe", "grateful", "blessed", "water", "flowers"]);

  const AFRO = [
    "burna boy", "wizkid", "davido", "tems", "rema", "ayra starr", "asake", "tyla", "uncle waffles", "kabza de small",
    "dj maphorisa", "focalistic", "omah lay", "fireboy dml", "ckay", "joeboy", "kizz daniel", "olamide", "seyi vibez",
    "shallipopi", "victony", "bnxn", "ruger", "oxlade", "young jonn", "fave", "simi", "adekunle gold", "tiwa savage",
    "yemi alade", "mr eazi", "patoranking", "black sherif", "king promise", "stonebwoy", "sarkodie", "diamond platnumz",
    "harmonize", "rayvanny", "zuchu", "marioo", "nandy", "jux", "alikiba", "mbosso", "sauti sol", "bien", "nviiri the storyteller",
    "nyashinski", "khaligraph jones", "otile brown", "nikita kering", "savara", "bensoul", "fena gitu", "wakadinali",
    "ssaru", "trio mio", "mejja", "boutross", "bridget blue", "xenia manasseh", "karun", "elsa majimbo", "lady du", "musa keys",
    "young stunna", "dbn gogo", "plutonio", "mavo", "toxic lyrikali", "iyanii", "kenny sol", "chiké", "johnny drille",
    "lojay", "sarz", "gyakie", "amaarae", "moliy", "kidi", "kuami eugene", "cassper nyovest", "nasty c", "a-reece",
  ];

  const ERAS = {
    villain: {
      name: "Villain Arc",
      tagline: "You're not the problem. Everyone else is.",
      roast: {
        en: "This playlist has never apologized to anyone and it's not starting today.",
        sh: "Hii playlist haijawahi omba msamaha, na haitaanza leo.",
      },
      caption: "I'm officially in my Villain Arc.",
      look: { bg: "pink", a: "blue", b: "yellow" },
    },
    crying: {
      name: "Crying in the Matatu",
      tagline: "Window seat. Earphones in. Main character of a sad film.",
      roast: {
        en: "{sadPct}% of these songs are about pain. You stare at Thika Road like it owes you closure.",
        sh: "{sadPct}% ya hizi nyimbo ni stress tupu. Unaangalia Thika Road kama inakudai closure.",
      },
      caption: "Apparently I'm in my Crying in the Matatu era.",
      look: { bg: "paper", a: "blue", b: "pink" },
    },
    delulu: {
      name: "Delulu Romantic",
      tagline: "In love with a person, a plan, and a version of them that doesn't exist.",
      roast: {
        en: "{lovePct}% love songs. Every single one is about someone who still hasn't texted back.",
        sh: "{lovePct}% ni love songs. Na zote ni za msee hajareply text tangu juzi.",
      },
      caption: "Diagnosed: Delulu Romantic.",
      look: { bg: "pink", a: "blue", b: "paper" },
    },
    healing: {
      name: "Healing Era",
      tagline: "Drinking water. Journaling. Leaving people on read, respectfully.",
      roast: {
        en: "This playlist goes to therapy and actually does the homework.",
        sh: "Hii playlist inaenda therapy na inafanya homework kweli.",
      },
      caption: "Healing Era, don't disturb.",
      look: { bg: "yellow", a: "blue", b: "pink" },
    },
    fan: {
      name: "Fan Account Era",
      tagline: "One artist. Full devotion. No notes.",
      roast: {
        en: "{topArtist} is {topPct}% of this playlist. They should be paying you rent.",
        sh: "{topArtist} ni {topPct}% ya hii playlist. Anafaa kukulipia rent.",
      },
      caption: "Running a full-time fan account, apparently.",
      look: { bg: "yellow", a: "pink", b: "blue" },
    },
    throwback: {
      name: "Throwback Kid",
      tagline: "Living in {avgYear} and refusing to leave.",
      roast: {
        en: "Your average song is {age} years old. You peaked and you're proud of it.",
        sh: "Wimbo yako ya kawaida iko na miaka {age}. Ulipeak zamani na hauna shame.",
      },
      caption: "Throwback Kid. Still stuck in {avgYear}.",
      look: { bg: "paper", a: "pink", b: "blue" },
    },
    nairobi: {
      name: "Nairobi Nights",
      tagline: "Outfit loaded. Uber on the way. Home by 6am, maybe.",
      roast: {
        en: "{afroPct}% African bangers. This playlist has a reserved table in Westlands.",
        sh: "{afroPct}% ni bangers za Africa. Hii playlist iko na table imebook Westlands.",
      },
      caption: "Nairobi Nights era, see you on the dancefloor.",
      look: { bg: "blue", a: "yellow", b: "pink" },
    },
    owl: {
      name: "3AM Overthinker",
      tagline: "Lights off. Brain on. Replaying a conversation from 2019.",
      roast: {
        en: "You add songs at {hour}. Put the phone down and sleep.",
        sh: "Unaongeza nyimbo saa {hour} usiku. Weka simu chini ulale, msee.",
      },
      caption: "3AM Overthinker. It's a lifestyle.",
      look: { bg: "blue", a: "pink", b: "yellow" },
    },
    aux: {
      name: "Aux Cord Royalty",
      tagline: "Every genre. Zero skips. People trust you with the vibe.",
      roast: {
        en: "{artists} different artists. Guard this aux like it's your rent money.",
        sh: "Wasanii {artists} tofauti. Shika hii aux kama doh ya rent.",
      },
      caption: "Aux Cord Royalty. Hand it over.",
      look: { bg: "yellow", a: "blue", b: "pink" },
    },
    main: {
      name: "Main Character Era",
      tagline: "Every song is the opening credits of your life.",
      roast: {
        en: "Nothing here is a background track. You walk into Java like there's a camera crew.",
        sh: "Hakuna background track hapa. Unaingia Java kama kuna camera inakufuata.",
      },
      caption: "Main Character Era, obviously.",
      look: { bg: "pink", a: "blue", b: "yellow" },
    },
  };

  function pct(n, d) {
    return d ? Math.round((n / d) * 100) : 0;
  }

  function analyze(playlist) {
    const tracks = (playlist.tracks || []).filter((t) => t && t.name);
    const n = tracks.length;
    const now = new Date().getFullYear();

    const artistCount = {};
    let sad = 0, love = 0, villain = 0, heal = 0, explicit = 0, afro = 0, late = 0, added = 0;
    const years = [];
    const pops = [];
    const hourCount = {};

    for (const t of tracks) {
      const title = t.name.toLowerCase();
      for (const a of t.artists || []) artistCount[a] = (artistCount[a] || 0) + 1;
      if (SAD.test(title)) sad++;
      if (LOVE.test(title)) love++;
      if (VILLAIN.test(title)) villain++;
      if (HEAL.test(title)) heal++;
      if (t.explicit) explicit++;
      if ((t.artists || []).some((a) => AFRO.includes(a.toLowerCase()))) afro++;
      if (t.year) years.push(t.year);
      if (typeof t.popularity === "number") pops.push(t.popularity);
      if (t.addedAt) {
        const d = new Date(t.addedAt);
        if (!isNaN(d)) {
          added++;
          const hour = (d.getUTCHours() + 3) % 24; // Nairobi time
          hourCount[hour] = (hourCount[hour] || 0) + 1;
          if (hour >= 0 && hour < 5) late++;
        }
      }
    }

    const artists = Object.entries(artistCount).sort((a, b) => b[1] - a[1]);
    const uniqueArtists = artists.length;
    const [topArtist, topCount] = artists[0] || ["nobody", 0];
    const avgYear = years.length ? Math.round(years.reduce((s, y) => s + y, 0) / years.length) : null;
    const age = avgYear ? Math.max(0, now - avgYear) : 0;
    const avgPop = pops.length ? pops.reduce((s, p) => s + p, 0) / pops.length : null;
    const lateHour = Object.entries(hourCount)
      .filter(([h]) => +h < 5)
      .sort((a, b) => b[1] - a[1])[0];

    const f = {
      n,
      sadPct: pct(sad, n),
      lovePct: pct(love, n),
      feelsPct: pct(sad + love, n),
      villainPct: pct(villain + explicit * 0.6, n),
      healPct: pct(heal, n),
      explicitPct: pct(explicit, n),
      afroPct: pct(afro, n),
      latePct: pct(late, added),
      topArtist,
      topPct: pct(topCount, n),
      artists: uniqueArtists,
      variety: n ? uniqueArtists / n : 0,
      avgYear,
      age,
      avgPop,
      hour: lateHour ? `${lateHour[0] === "0" ? "12" : lateHour[0]}am` : "3am",
    };

    // Each era gets a score; the strongest signal wins.
    const scores = {
      villain: f.villainPct * 1.6,
      crying: f.sadPct * 2.2,
      delulu: f.lovePct * 1.8,
      healing: f.healPct * 2.4 + (f.explicitPct < 10 ? 8 : 0),
      fan: f.topPct >= 22 ? f.topPct * 2 : 0,
      throwback: f.age >= 9 ? f.age * 4 : 0,
      nairobi: f.afroPct >= 25 ? f.afroPct * 1.2 : 0,
      owl: f.latePct >= 30 && added >= 5 ? f.latePct * 1.3 : 0,
      aux: f.variety >= 0.85 && n >= 25 ? 40 + f.variety * 10 : 0,
      main: 30,
    };
    const eraKey = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

    // Vibe score: how strongly this playlist commits to its era (55–99, never a fail).
    const strength = Math.min(1, scores[eraKey] / 90);
    const vibe = Math.round(55 + strength * 38 + Math.min(6, n / 20));

    // Main character song: the track that best matches the era.
    const matcher = { villain: VILLAIN, crying: SAD, delulu: LOVE, healing: HEAL }[eraKey];
    let anthem =
      (eraKey === "fan" && tracks.find((t) => t.artists.includes(topArtist))) ||
      (eraKey === "nairobi" && tracks.find((t) => t.artists.some((a) => AFRO.includes(a.toLowerCase())))) ||
      (eraKey === "throwback" && tracks.slice().sort((a, b) => (a.year || 9999) - (b.year || 9999))[0]) ||
      (matcher && tracks.find((t) => matcher.test(t.name))) ||
      (pops.length && tracks.slice().sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0]) ||
      tracks[0];

    return {
      key: eraKey,
      era: ERAS[eraKey],
      vibe: Math.min(99, vibe),
      anthem: anthem ? { name: anthem.name, artist: (anthem.artists || []).join(", ") } : null,
      stats: f,
    };
  }

  function fill(text, stats) {
    return text.replace(/\{(\w+)\}/g, (_, k) => (stats[k] !== undefined ? stats[k] : ""));
  }

  root.EraEngine = { analyze, fill, ERAS };
  if (typeof module !== "undefined") module.exports = root.EraEngine;
})(typeof window !== "undefined" ? window : globalThis);
