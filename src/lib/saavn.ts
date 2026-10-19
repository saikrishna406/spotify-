import { Track, Playlist } from '@/types';

const BASE_URL = 'https://www.jiosaavn.com/api.php';

function decodeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '0:00';
  const mins = Math.floor(sec / 60);
  const remainder = Math.floor(sec % 60);
  return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
}

export function formatHighResImage(imageUrl: string): string {
  if (!imageUrl) return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80';
  return imageUrl
    .replace(/150x150\.jpg/g, '500x500.jpg')
    .replace(/50x50\.jpg/g, '500x500.jpg')
    .replace(/http:\/\//g, 'https://');
}

export function normalizeSaavnSong(raw: any): Track {
  const durationSec = parseInt(raw.duration || '210', 10);
  return {
    id: raw.id || raw.songid || Math.random().toString(),
    name: decodeHtml(raw.song || raw.title || 'Untitled Track'),
    album: decodeHtml(raw.album || raw.more_info?.album || 'Single'),
    albumId: raw.albumid,
    artists: decodeHtml(raw.primary_artists || raw.more_info?.primary_artists || raw.singers || raw.artist || 'Various Artists'),
    duration: durationSec,
    durationFormatted: formatDuration(durationSec),
    image: formatHighResImage(raw.image),
    encryptedMediaUrl: raw.encrypted_media_url || raw.more_info?.encrypted_media_url,
    streamUrl: (raw.encrypted_media_url || raw.more_info?.encrypted_media_url)
      ? `/api/music/stream?url=${encodeURIComponent(raw.encrypted_media_url || raw.more_info?.encrypted_media_url)}`
      : (raw.id ? `/api/music/stream?id=${raw.id}` : undefined),
    language: raw.language || raw.more_info?.language || 'Unknown',
    year: raw.year || '2026',
    hasLyrics: raw.has_lyrics === 'true'
  };
}

/** Search songs with JioSaavn's public search engine */
export async function searchSongs(query: string, page = 1, limit = 20): Promise<Track[]> {
  try {
    const url = `${BASE_URL}?__call=search.getResults&_format=json&_marker=0&cc=in&p=${page}&n=${limit}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 300 } // cache for 5 minutes
    });

    if (!res.ok) throw new Error(`Saavn search HTTP error: ${res.status}`);
    const data = await res.json();
    if (!data || !data.results) return [];

    return data.results.map(normalizeSaavnSong);
  } catch (error) {
    console.error('Error searching songs in Saavn:', error);
    return [];
  }
}

/** Generate verified, signed CloudFront CDN streaming audio URL */
export async function getStreamUrl(encryptedUrl: string, bitrate: '96' | '160' | '320' = '160'): Promise<string | null> {
  if (!encryptedUrl) return null;
  try {
    const url = `${BASE_URL}?__call=song.generateAuthToken&_marker=0&_format=json&bitrate=${bitrate}&url=${encodeURIComponent(encryptedUrl)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === 'success' && data.auth_url) {
      return data.auth_url;
    }
    return null;
  } catch (error) {
    console.error('Error getting stream URL from Saavn:', error);
    return null;
  }
}

/** Get Song details by ID */
export async function getSongDetails(pid: string): Promise<Track | null> {
  try {
    const url = `${BASE_URL}?__call=song.getDetails&cc=in&_marker=0&_format=json&pids=${encodeURIComponent(pid)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data[pid];
    if (!raw) return null;

    const track = normalizeSaavnSong(raw);
    if (track.encryptedMediaUrl) {
      const stream = await getStreamUrl(track.encryptedMediaUrl, '160');
      if (stream) track.streamUrl = stream;
    }
    return track;
  } catch (err) {
    console.error('Error getting song details:', err);
    return null;
  }
}

/** Curated Featured Indian Playlists matching user's request (Telugu, Tamil, Hindi, South State) */
export async function getIndianFeaturedSections(): Promise<{ title: string; playlists: Playlist[] }[]> {
  // Curated collections that resolve live queries on the fly
  return [
    {
      title: 'Global & English Top Hits',
      playlists: [
        {
          id: 'album-edsheeran',
          name: 'Ed Sheeran',
          description: 'Shape of You, Perfect, Bad Habits, Thinking Out Loud',
          image: 'https://c.saavncdn.com/346/Shape-of-You-English-2017-500x500.jpg',
          owner: 'Atlantic Records',
          followerCount: '89,400,000 saves',
          color: '#0284c7'
        },
        {
          id: 'album-taylorswift',
          name: 'Taylor Swift',
          description: 'Cruel Summer, Anti-Hero, Blank Space, Lover',
          image: 'https://c.saavncdn.com/141/1989-Taylor-s-Version-Deluxe-English-2023-20231027000551-500x500.jpg',
          owner: 'Republic Records',
          followerCount: '112,000,000 saves',
          color: '#ec4899'
        },
        {
          id: 'album-imaginedragons',
          name: 'Imagine Dragons',
          description: 'Believer, Radioactive, Demons, Thunder',
          image: 'https://c.saavncdn.com/978/Evolve-English-2017-500x500.jpg',
          owner: 'Interscope Records',
          followerCount: '64,200,000 saves',
          color: '#6366f1'
        },
        {
          id: 'album-coldplay',
          name: 'Coldplay',
          description: 'Something Just Like This, Hymn for the Weekend, Yellow',
          image: 'https://c.saavncdn.com/464/A-Head-Full-of-Dreams-English-2015-500x500.jpg',
          owner: 'Parlophone UK',
          followerCount: '78,900,000 saves',
          color: '#e11d48'
        },
        {
          id: 'album-alanwalker',
          name: 'Alan Walker',
          description: 'Faded, Alone, Darkside, On My Way',
          image: 'https://c.saavncdn.com/466/Faded-English-2015-500x500.jpg',
          owner: 'Sony Music',
          followerCount: '58,300,000 saves',
          color: '#10b981'
        }
      ]
    },
    {
      title: 'Popular albums and singles',
      playlists: [
        {
          id: 'album-pushpa2',
          name: 'Pushpa 2 The Rule',
          description: 'Devi Sri Prasad, Allu Arjun, Rashmika Mandanna (Telugu & South)',
          image: 'https://c.saavncdn.com/366/Pushpa-2-The-Rule-Telugu-Telugu-2024-20241205211012-500x500.jpg',
          owner: 'T-Series Telugu',
          followerCount: '24,192,400 saves',
          color: '#e50914'
        },
        {
          id: 'album-devara',
          name: 'Devara - Part 1',
          description: 'Anirudh Ravichander, Jr NTR, Janhvi Kapoor',
          image: 'https://c.saavncdn.com/714/Devara-Thandavam-From-Devara-Part-1-Telugu-2024-20241107141003-500x500.jpg',
          owner: 'T-Series',
          followerCount: '19,842,000 saves',
          color: '#1e3a8a'
        },
        {
          id: 'album-aashiqui2',
          name: 'Aashiqui 2',
          description: 'Mithoon, Ankit Tiwari, Jeet Gannguli, Arijit Singh',
          image: 'https://c.saavncdn.com/430/Aashiqui-2-Hindi-2013-500x500.jpg',
          owner: 'T-Series Hindi',
          followerCount: '45,820,100 saves',
          color: '#4c1d95'
        },
        {
          id: 'album-sanamterikasam',
          name: 'Sanam Teri Kasam (Original Motion...)',
          description: 'Himesh Reshammiya, Sameer Anjaan, Subrat...',
          image: 'https://c.saavncdn.com/150/Sanam-Teri-Kasam-Hindi-2025-20260404111304-500x500.jpg',
          owner: 'Eros Music',
          followerCount: '28,340,000 saves',
          color: '#991b1b'
        },
        {
          id: 'album-raanjhan',
          name: 'Raanjhan (From "Do Patti")',
          description: 'Sachet-Parampara, Parampara Tandon, Kaus...',
          image: 'https://c.saavncdn.com/436/Do-Patti-Hindi-2024-20250509181115-500x500.jpg',
          owner: 'T-Series',
          followerCount: '22,400,000 saves',
          color: '#ea580c'
        },
        {
          id: 'album-findingher',
          name: 'Finding Her',
          description: 'Kushagra, Bharath, Saaheal',
          image: 'https://c.saavncdn.com/067/Finding-Her-Hindi-2025-20250104190643-500x500.jpg',
          owner: 'Warner Music India',
          followerCount: '18,900,000 saves',
          color: '#059669'
        },
        {
          id: 'album-arijitsingh',
          name: 'Ultimate Love Songs - Arijit Singh',
          description: 'Arijit Singh',
          image: 'https://c.saavncdn.com/954/Come-Fall-in-Love-Hit-Tracks-From-YRF-Hindi-2014-500x500.jpg',
          owner: 'YRF Music',
          followerCount: '52,100,000 saves',
          color: '#4338ca'
        },
        {
          id: 'album-yjhd',
          name: 'Yeh Jawaani Hai Deewani',
          description: 'Pritam',
          image: 'https://c.saavncdn.com/440/Yeh-Jawaani-Hai-Deewani-2013-500x500.jpg',
          owner: 'T-Series',
          followerCount: '34,800,000 saves',
          color: '#ca8a04'
        },
        {
          id: 'album-leo',
          name: 'Leo (Tamil & Telugu)',
          description: 'Anirudh Ravichander, Thalapathy Vijay, Lokesh Kanagaraj',
          image: 'https://c.saavncdn.com/109/Leo-Das-Entry-From-Leo-Tamil-2024-20240108151125-500x500.jpg',
          owner: 'Sony Music South',
          followerCount: '31,520,000 saves',
          color: '#b91c1c'
        },
        {
          id: 'album-animal',
          name: 'Animal (Hindi & South)',
          description: 'Ranbir Kapoor, Pritam, Vishal Mishra, Harshavardhan Rameshwar',
          image: 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20260724191152-500x500.jpg',
          owner: 'T-Series',
          followerCount: '38,100,500 saves',
          color: '#7f1d1d'
        },
        {
          id: 'album-gunturkaaram',
          name: 'Guntur Kaaram',
          description: 'Thaman S, Mahesh Babu, Sreeleela',
          image: 'https://c.saavncdn.com/000/Guntur-Kaaram-Telugu-2023-20240126145901-500x500.jpg',
          owner: 'Aditya Music',
          followerCount: '16,240,000 saves',
          color: '#c2410c'
        }
      ]
    },
    {
      title: 'South India Superhits (Telugu & Tamil)',
      playlists: [
        {
          id: 'pl-telugu-top50',
          name: 'Hot Hits Telugu',
          description: 'Catch the biggest Telugu chartbusters with Pushpa 2, Devara, RRR, and more.',
          image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80',
          owner: 'Spotify India',
          followerCount: '12,500,000 saves',
          color: '#15803d'
        },
        {
          id: 'pl-tamil-top50',
          name: 'Tamil Blockbusters',
          description: 'High voltage Tamil tracks from Anirudh, AR Rahman, Yuvan Shankar Raja.',
          image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80',
          owner: 'Spotify India',
          followerCount: '15,300,000 saves',
          color: '#6d28d9'
        },
        {
          id: 'pl-anirudh-vibes',
          name: 'Best of Anirudh',
          description: 'Rockstar Anirudh Ravichander’s chart-topping anthems across Tamil and Telugu.',
          image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
          owner: 'South State Radio',
          followerCount: '9,800,000 saves',
          color: '#0369a1'
        },
        {
          id: 'pl-sid-sriram',
          name: 'Sid Sriram Soulful',
          description: 'Magical melodies: Samajavaragamana, Inkem Inkem, Srivalli, Kadhaippoma.',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80',
          owner: 'Spotify India',
          followerCount: '8,400,000 saves',
          color: '#b45309'
        }
      ]
    },
    {
      title: 'Bollywood & Hindi Melodies',
      playlists: [
        {
          id: 'pl-arijit-singh',
          name: 'Ultimate Love Songs - Arijit Singh',
          description: 'Tum Hi Ho, Channa Mereya, O Maahi, Chaleya and more romantic melodies.',
          image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80',
          owner: 'Arijit Singh Official',
          followerCount: '28,900,000 saves',
          color: '#be185d'
        },
        {
          id: 'pl-hindi-romance',
          name: 'Romantic Hindi Melodies',
          description: 'Timeless love anthems that heal the soul.',
          image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=500&q=80',
          owner: 'Spotify India',
          followerCount: '18,400,000 saves',
          color: '#831843'
        }
      ]
    }
  ];
}
