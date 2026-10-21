import { Track, MoodCategory, SongProfile } from '@/types';

// Multi-lingual mood dictionaries
const MOOD_KEYWORDS: Record<MoodCategory, string[]> = {
  romantic_melody: [
    'melody', 'love', 'kadhal', 'kaadhal', 'prema', 'pyaar', 'dil', 'ishq', 'romantic',
    'feel', 'unplugged', 'acoustic', 'soul', 'valibam', 'kanmani', 'thalli', 'priya',
    'samajavaragamana', 'chuttamalle', 'kesariya', 'tum hi ho', 'raataan lambiyan',
    'aradhya', 'hosanna', 'malare', 'ennodu nee irundhal', 'vaseegara', 'munbe vaa',
    'poove', 'uyire', 'radha', 'mohabbat', 'humsafar', 'subhanallah', 'jeena jeena',
    'zaalima', 'hawayein', 'channa ve', 'invece', 'soniye', 'heer', 'mehbooba', 'khuda jaane'
  ],
  energetic_dance: [
    'party', 'remix', 'dance', 'club', 'dj', 'blast', 'kuthu', 'mass', 'dappan', 'item',
    'nach', 'dhamaka', 'tauba', 'aaj ki raat', 'hookah', 'thumka', 'daku', 'lungi dance',
    'rowdy', 'arabic kuthu', 'jalabulanjangu', 'kaavaalaa', 'naatu naatu', 'oo antava',
    'badtameez', 'garmi', 'kar gayi chull', 'morni', 'sauda khara', 'coka', 'galla goriyan',
    'proper patola', 'high rated gabru', 'illuminate', 'beat', 'drop', 'bhangra'
  ],
  chill_lofi: [
    'chill', 'lofi', 'lo-fi', 'midnight', 'coffee', 'peace', 'breeze', 'night', 'rain',
    'sleep', 'relax', 'slowed', 'reverb', 'ambient', 'calm', 'soft', 'vibes', 'peaceful',
    'afternoon', 'sunset', 'morning'
  ],
  melancholic_sad: [
    'sad', 'dard', 'breakup', 'alone', 'cry', 'pain', 'tears', 'judaai', 'tanhai', 'pirivu',
    'valigal', 'maruvaarthai', 'channa mereya', 'agar tum saath ho', 'bekhayali',
    'pogatha yennavittu', 'kanneer', 'rooth na', 'tadap', 'judai', 'bewafa', 'ae dil hai mushkil',
    'tera ban jaunga', 'tujhe kitna chahne lage', 'dua', 'hamari adhuri kahani'
  ],
  folk_acoustic: [
    'folk', 'acoustic', 'unplugged', 'desi', 'raw', 'guitar', 'village', 'natpu', 'kural',
    'gaana', 'marana', 'nadaswaram', 'thavil', 'dhol', 'sufi', 'qawwali', 'tappe', 'boliyan',
    'jugni', 'mitti', 'dehat'
  ],
  anthem_inspirational: [
    'anthem', 'rise', 'power', 'motivational', 'fight', 'hero', 'singam', 'baahubali',
    'devara', 'kgf', 'salaar', 'vikram', 'jailer', 'master', 'leo', 'theme', 'roar',
    'warrior', 'fire', 'hukum', 'lokiverse', 'badass', 'toofan', 'sultan', 'chak de'
  ]
};

// Signature artist tendencies for initial profiling baseline
const ARTIST_MOOD_PROFILES: Record<string, { mood: MoodCategory; energy: number; valence: number }> = {
  'sid sriram': { mood: 'romantic_melody', energy: 0.35, valence: 0.65 },
  'pradeep kumar': { mood: 'romantic_melody', energy: 0.30, valence: 0.55 },
  'arijit singh': { mood: 'romantic_melody', energy: 0.40, valence: 0.45 },
  'shreya ghoshal': { mood: 'romantic_melody', energy: 0.38, valence: 0.70 },
  'armaan malik': { mood: 'romantic_melody', energy: 0.45, valence: 0.65 },
  'chinmayi': { mood: 'romantic_melody', energy: 0.35, valence: 0.60 },
  'atif aslam': { mood: 'romantic_melody', energy: 0.42, valence: 0.50 },
  'anirudh ravichander': { mood: 'energetic_dance', energy: 0.85, valence: 0.80 },
  'badshah': { mood: 'energetic_dance', energy: 0.90, valence: 0.85 },
  'diljit dosanjh': { mood: 'energetic_dance', energy: 0.80, valence: 0.82 },
  'devi sri prasad': { mood: 'energetic_dance', energy: 0.85, valence: 0.80 },
  'thaman s': { mood: 'energetic_dance', energy: 0.82, valence: 0.78 },
  'yo yo honey singh': { mood: 'energetic_dance', energy: 0.88, valence: 0.82 },
  'mika singh': { mood: 'energetic_dance', energy: 0.85, valence: 0.80 },
  'neha kakkar': { mood: 'energetic_dance', energy: 0.85, valence: 0.80 },
  'a.r. rahman': { mood: 'romantic_melody', energy: 0.50, valence: 0.65 },
  'harris jayaraj': { mood: 'romantic_melody', energy: 0.48, valence: 0.68 },
  'yuvan shankar raja': { mood: 'melancholic_sad', energy: 0.52, valence: 0.45 },
  'santhosh narayanan': { mood: 'folk_acoustic', energy: 0.60, valence: 0.58 },
  'ed sheeran': { mood: 'romantic_melody', energy: 0.45, valence: 0.65 },
  'the weeknd': { mood: 'chill_lofi', energy: 0.65, valence: 0.50 },
  'taylor swift': { mood: 'romantic_melody', energy: 0.55, valence: 0.60 }
};

export function inferSongMood(track: Track): SongProfile {
  const titleLower = (track.name || '').toLowerCase();
  const albumLower = (track.album || '').toLowerCase();
  const artistsLower = (track.artists || '').toLowerCase();
  const combinedText = `${titleLower} ${albumLower} ${artistsLower}`;

  const matchedKeywords: string[] = [];
  const categoryScores: Record<MoodCategory, number> = {
    romantic_melody: 0,
    energetic_dance: 0,
    chill_lofi: 0,
    melancholic_sad: 0,
    folk_acoustic: 0,
    anthem_inspirational: 0
  };

  // 1. Match keyword signals in title and album
  for (const [category, keywords] of Object.entries(MOOD_KEYWORDS) as [MoodCategory, string[]][]) {
    for (const kw of keywords) {
      if (titleLower.includes(kw)) {
        categoryScores[category] += 2.5; // Title keyword is a very strong indicator
        matchedKeywords.push(kw);
      } else if (albumLower.includes(kw)) {
        categoryScores[category] += 1.2;
        matchedKeywords.push(kw);
      }
    }
  }

  // 2. Check artist profile baseline
  let baseEnergy = 0.5;
  let baseValence = 0.5;
  let artistMatchedMood: MoodCategory | null = null;

  for (const [artistName, profile] of Object.entries(ARTIST_MOOD_PROFILES)) {
    if (artistsLower.includes(artistName)) {
      categoryScores[profile.mood] += 1.8;
      baseEnergy = profile.energy;
      baseValence = profile.valence;
      artistMatchedMood = profile.mood;
      break;
    }
  }

  // 3. Song duration heuristics
  // Fast energetic / party tracks in Indian & pop music are typically shorter (< 3:30)
  // Slow emotional ballads & melodies are typically longer (> 4:15)
  const duration = track.duration || 210;
  if (duration > 260) {
    categoryScores.romantic_melody += 0.8;
    categoryScores.melancholic_sad += 0.6;
    baseEnergy = Math.max(0.2, baseEnergy - 0.1);
  } else if (duration < 195) {
    categoryScores.energetic_dance += 0.8;
    baseEnergy = Math.min(0.95, baseEnergy + 0.1);
  }

  // 4. Select highest scoring mood category
  let topMood: MoodCategory = 'romantic_melody';
  let highestScore = -1;

  for (const [category, score] of Object.entries(categoryScores) as [MoodCategory, number][]) {
    if (score > highestScore) {
      highestScore = score;
      topMood = category;
    }
  }

  // Fallback if no strong signals were found: use artist profile or default melody
  if (highestScore === 0) {
    topMood = artistMatchedMood || 'romantic_melody';
  }

  // 5. Compute fine-grained acoustic estimates (energy, danceability, valence, tempo)
  let energyLevel = baseEnergy;
  let danceability = 0.5;
  let valence = baseValence;
  let tempoEstimate: 'slow' | 'medium' | 'fast' = 'medium';

  switch (topMood) {
    case 'romantic_melody':
      energyLevel = Math.min(energyLevel, 0.45);
      danceability = 0.35;
      valence = 0.62;
      tempoEstimate = 'slow';
      break;
    case 'energetic_dance':
      energyLevel = Math.max(energyLevel, 0.80);
      danceability = 0.88;
      valence = 0.82;
      tempoEstimate = 'fast';
      break;
    case 'chill_lofi':
      energyLevel = 0.28;
      danceability = 0.32;
      valence = 0.50;
      tempoEstimate = 'slow';
      break;
    case 'melancholic_sad':
      energyLevel = 0.30;
      danceability = 0.22;
      valence = 0.25;
      tempoEstimate = 'slow';
      break;
    case 'folk_acoustic':
      energyLevel = 0.52;
      danceability = 0.55;
      valence = 0.65;
      tempoEstimate = 'medium';
      break;
    case 'anthem_inspirational':
      energyLevel = 0.85;
      danceability = 0.60;
      valence = 0.75;
      tempoEstimate = 'fast';
      break;
  }

  // 6. Generate a human-friendly mood label
  const langDisplay = (track.language && track.language !== 'Unknown')
    ? (track.language.charAt(0).toUpperCase() + track.language.slice(1).toLowerCase())
    : '';

  const moodDisplayMap: Record<MoodCategory, string> = {
    romantic_melody: 'Romantic Melody',
    energetic_dance: 'High-Energy Dance & Beat',
    chill_lofi: 'Chill & Lo-Fi',
    melancholic_sad: 'Soulful & Melancholic',
    folk_acoustic: 'Folk & Acoustic',
    anthem_inspirational: 'Anthem & Cinematic OST'
  };

  const moodLabel = langDisplay 
    ? `${langDisplay} ${moodDisplayMap[topMood]}`
    : moodDisplayMap[topMood];

  // Extract artists list
  const primaryArtists = (track.artists || 'Various Artists')
    .split(',')
    .map(a => a.trim())
    .filter(Boolean);

  return {
    trackId: track.id,
    language: (track.language || 'hindi').toLowerCase(),
    mood: topMood,
    moodLabel,
    energyLevel,
    danceability,
    valence,
    tempoEstimate,
    primaryArtists,
    keywords: matchedKeywords
  };
}
