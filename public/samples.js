// Sample playlists so the app works without Spotify keys (and for local dev).
(function (root) {
  const t = (name, artists, year, explicit, addedAt) => ({
    name, artists: artists.split(" & "), year, explicit: !!explicit, popularity: null, addedAt: addedAt || null,
  });

  const SAMPLES = [
    {
      id: "sample-nbi",
      name: "westlands on a friday",
      owner: "sample",
      tracks: [
        t("Last Last", "Burna Boy", 2022, 1), t("Water", "Tyla", 2023), t("Calm Down", "Rema", 2022),
        t("Rush", "Ayra Starr", 2022), t("Lonely At The Top", "Asake", 2023), t("Free Mind", "Tems", 2023),
        t("Mapopo", "Diamond Platnumz", 2023), t("Extravaganza", "Sauti Sol & Bien", 2021),
        t("Tusi", "Bien", 2023), t("Kudade", "Wakadinali", 2022, 1), t("Unavailable", "Davido & Musa Keys", 2023),
        t("Essence", "Wizkid & Tems", 2020), t("Tshwala Bam", "Uncle Waffles", 2024), t("Ojapiano", "Kcee", 2023),
        t("Peru", "Fireboy DML", 2021), t("Mnike", "Tyler ICU", 2023), t("Kwangwaru", "Harmonize & Diamond Platnumz", 2018),
        t("Sugarcane", "Camidoh", 2022), t("Joha", "Asake", 2022), t("City Boys", "Burna Boy", 2023, 1),
        t("Sungba", "Asake", 2022), t("Stamina", "Tiwa Savage", 2023), t("Feel", "Davido", 2023),
        t("Wait For U", "Future & Drake & Tems", 2022, 1),
      ],
    },
    {
      id: "sample-sad",
      name: "do not text him",
      owner: "sample",
      tracks: [
        t("Someone Like You", "Adele", 2011), t("Liability", "Lorde", 2017), t("traitor", "Olivia Rodrigo", 2021),
        t("Happier Than Ever", "Billie Eilish", 2021), t("Ghost", "Justin Bieber", 2021), t("Without You", "The Kid LAROI", 2020),
        t("Cry", "Cigarettes After Sex", 2019), t("drivers license", "Olivia Rodrigo", 2021), t("Lonely", "Justin Bieber", 2020),
        t("Kill Bill", "SZA", 2022, 1), t("Glimpse of Us", "Joji", 2022), t("The Night We Met", "Lord Huron", 2015),
        t("All Too Well", "Taylor Swift", 2021), t("I Miss You", "Clean Bandit", 2017), t("Lost", "Frank Ocean", 2012),
        t("Heartbreak Anniversary", "Giveon", 2020), t("Cold", "Maroon 5", 2017), t("Empty", "Juice WRLD", 2018, 1),
        t("Ivy", "Frank Ocean", 2016), t("Pain", "PinkPantheress", 2021), t("Nobody", "Mitski", 2018),
      ].map((x, i) => ({ ...x, addedAt: `2026-0${(i % 9) + 1}-1${i % 9}T22:${10 + i}:00Z` })),
    },
    {
      id: "sample-2014",
      name: "tumblr 2014",
      owner: "sample",
      tracks: [
        t("Do I Wanna Know?", "Arctic Monkeys", 2013), t("Sweater Weather", "The Neighbourhood", 2012),
        t("Electric Feel", "MGMT", 2007), t("Young and Beautiful", "Lana Del Rey", 2013), t("Riptide", "Vance Joy", 2013),
        t("Pumped Up Kicks", "Foster the People", 2011), t("Somebody That I Used to Know", "Gotye", 2011),
        t("Take Me to Church", "Hozier", 2013), t("Little Talks", "Of Monsters and Men", 2011), t("Royals", "Lorde", 2013),
        t("Mr. Brightside", "The Killers", 2004), t("Fluorescent Adolescent", "Arctic Monkeys", 2007),
        t("Ho Hey", "The Lumineers", 2012), t("Stolen Dance", "Milky Chance", 2013), t("Youth", "Daughter", 2011),
        t("Habits (Stay High)", "Tove Lo", 2013), t("Breezeblocks", "alt-J", 2012), t("Shut Up and Dance", "WALK THE MOON", 2014),
      ],
    },
  ];

  root.EraSamples = SAMPLES;
  if (typeof module !== "undefined") module.exports = SAMPLES;
})(typeof window !== "undefined" ? window : globalThis);
