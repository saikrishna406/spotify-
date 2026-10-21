import { Track } from '@/types';
import { searchSongs } from '@/lib/saavn';
import { inferSongMood } from './moodProfiler';

export async function discoverCandidatesForTrack(seedTrack: Track, limit = 25): Promise<Track[]> {
  const seedProfile = inferSongMood(seedTrack);
  const primaryArtist = seedProfile.primaryArtists[0] || '';
  const language = seedProfile.language || 'hindi';

  // Build targeted discovery queries based on seed track's language and mood
  const queries: string[] = [];

  // Query 1: Language + Mood search (e.g. "tamil melody" or "telugu melody" or "hindi romantic")
  const moodSearchTerms: Record<string, string> = {
    romantic_melody: 'melody love',
    energetic_dance: 'party dance',
    chill_lofi: 'chill lofi',
    melancholic_sad: 'sad emotional',
    folk_acoustic: 'folk acoustic',
    anthem_inspirational: 'mass anthem'
  };

  const moodTerm = moodSearchTerms[seedProfile.mood] || 'melody';
  queries.push(`${language} ${moodTerm}`);

  // Query 2: Primary artist in same language
  if (primaryArtist && primaryArtist.toLowerCase() !== 'various artists') {
    queries.push(`${primaryArtist} ${language}`);
  }

  // Query 3: Seed album or language top hits
  if (seedTrack.album && seedTrack.album.toLowerCase() !== 'single' && !seedTrack.album.toLowerCase().includes('untitled')) {
    queries.push(seedTrack.album);
  } else {
    queries.push(`${language} top hits`);
  }

  // Execute candidate searches in parallel with error shielding
  const searchPromises = queries.map(q => 
    searchSongs(q, 1, 15).catch(err => {
      console.warn('[Recommendation Discovery] Search failed for query:', q, err);
      return [] as Track[];
    })
  );

  const rawResultsArrays = await Promise.all(searchPromises);
  const candidateMap = new Map<string, Track>();

  for (const list of rawResultsArrays) {
    for (const track of list) {
      // Exclude seed track itself
      if (!track || !track.id || track.id === seedTrack.id) continue;
      // Skip tracks with duplicate titles or identical artist/name
      if (track.name.toLowerCase() === seedTrack.name.toLowerCase()) continue;

      if (!candidateMap.has(track.id)) {
        candidateMap.set(track.id, track);
      }
    }
  }

  const allCandidates = Array.from(candidateMap.values());
  return allCandidates.slice(0, limit);
}
