/**
 * SPOTIFY WEB PLAYER ENGINE & ARCHITECTURE
 * Clean-Room reverse engineered from Spotify Web Player client models & state machines.
 */

// =============================================================================
// 1. DATA REPOSITORY & CATALOG
// =============================================================================
const TRACKS_CATALOG = [
  {
    id: "trk-01",
    title: "Midnight City Lights",
    artist: "Neon Horizon",
    artistId: "art-01",
    album: "Synthwave Nights",
    albumId: "alb-01",
    art: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    duration: 194, // 3:14
    dateAdded: "3 days ago",
    explicit: true,
    audioUrl: "https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3",
    color: "#7928ca",
    lyrics: [
      { time: 0, text: "Neon glows across the rain-slicked boulevard" },
      { time: 8, text: "The midnight engine roars beneath the stars" },
      { time: 16, text: "Speeding through shadows of a digital dream" },
      { time: 24, text: "Nothing is ever quite what it seems" },
      { time: 32, text: "Catch the frequency, ride the purple wave" },
      { time: 40, text: "This is the city light we crave" }
    ]
  },
  {
    id: "trk-02",
    title: "Coffee & Rain Drops",
    artist: "Aura Beats",
    artistId: "art-02",
    album: "Lo-Fi Chill Sanctuary",
    albumId: "alb-02",
    art: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80",
    duration: 158, // 2:38
    dateAdded: "1 week ago",
    explicit: false,
    audioUrl: "https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3",
    color: "#b07d62",
    lyrics: [
      { time: 0, text: "Steam rises slowly from the porcelain cup" },
      { time: 10, text: "Rain tap-dances on the window pane" },
      { time: 20, text: "Lost in pages of an old paperback" },
      { time: 30, text: "Quiet moments never wash away" },
      { time: 42, text: "Just breathing in the afternoon" }
    ]
  },
  {
    id: "trk-03",
    title: "Starlight Cyberpunk",
    artist: "Hyperion Drive",
    artistId: "art-03",
    album: "Overdrive Protocol",
    albumId: "alb-03",
    art: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
    duration: 215, // 3:35
    dateAdded: "2 weeks ago",
    explicit: false,
    audioUrl: "https://cdn.freesound.org/previews/653/653023_11861866-lq.mp3",
    color: "#0070f3",
    lyrics: [
      { time: 0, text: "Signal locked on coordinates ahead" },
      { time: 12, text: "Fiber optic pulses through our veins" },
      { time: 24, text: "Pushing past the stratosphere tonight" },
      { time: 36, text: "Beyond the gravity and electric rains" }
    ]
  },
  {
    id: "trk-04",
    title: "Ocean Breeze Reflections",
    artist: "Komorebi Duo",
    artistId: "art-04",
    album: "Sunset Horizons",
    albumId: "alb-04",
    art: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    duration: 182, // 3:02
    dateAdded: "Oct 12, 2026",
    explicit: false,
    audioUrl: "https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3",
    color: "#0288d1",
    lyrics: [
      { time: 0, text: "Golden sands fading in the dusk" },
      { time: 14, text: "Warm wind whispering secrets of the tide" },
      { time: 28, text: "Sun dipping low into amber skies" },
      { time: 42, text: "A peaceful rhythm where we can hide" }
    ]
  },
  {
    id: "trk-05",
    title: "Deep Focus Ambient",
    artist: "Mindful Waves",
    artistId: "art-05",
    album: "Flow State Vol. 4",
    albumId: "alb-05",
    art: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    duration: 240, // 4:00
    dateAdded: "Sep 28, 2026",
    explicit: false,
    audioUrl: "https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3",
    color: "#2e7d32",
    lyrics: [
      { time: 0, text: "Clear your mind and let thoughts float" },
      { time: 20, text: "Continuous waves of gentle harmonic pulse" },
      { time: 45, text: "Entering the deep flow realm" }
    ]
  },
  {
    id: "trk-06",
    title: "Velvet Groove",
    artist: "The Funk Syndicate",
    artistId: "art-06",
    album: "Retro Gold 1984",
    albumId: "alb-06",
    art: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    duration: 198, // 3:18
    dateAdded: "Sep 15, 2026",
    explicit: true,
    audioUrl: "https://cdn.freesound.org/previews/653/653023_11861866-lq.mp3",
    color: "#d81b60",
    lyrics: [
      { time: 0, text: "Slap bass dropping on the one" },
      { time: 10, text: "Brass horns lighting up the room" },
      { time: 22, text: "Feel the velvet groove take you away" }
    ]
  }
];

const PLAYLISTS_CATALOG = [
  {
    id: "pl-today-top-hits",
    title: "Today's Top Hits",
    description: "The hottest tracks right now across synthwave, lo-fi, and chillhop.",
    art: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    owner: "Spotify",
    likes: "32,492,108 saves",
    color: "#1db954",
    trackIds: ["trk-01", "trk-02", "trk-03", "trk-04", "trk-05", "trk-06"]
  },
  {
    id: "pl-synthwave",
    title: "Synthwave Nights",
    description: "Retro-futuristic beats, analog synths, and neon highway rhythms.",
    art: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    owner: "Spotify Curated",
    likes: "1,842,501 saves",
    color: "#7928ca",
    trackIds: ["trk-01", "trk-03", "trk-06"]
  },
  {
    id: "pl-lofi-beats",
    title: "Lo-Fi Chill Sanctuary",
    description: "Mellow vibes, vinyl crackles, and warm melodies to study or relax.",
    art: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80",
    owner: "ChilledCow Vibes",
    likes: "4,210,990 saves",
    color: "#b07d62",
    trackIds: ["trk-02", "trk-04", "trk-05"]
  },
  {
    id: "pl-deep-focus",
    title: "Deep Focus & Ambient",
    description: "Keep calm and focus with ambient electronic soundscapes.",
    art: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    owner: "Spotify",
    likes: "2,618,340 saves",
    color: "#2e7d32",
    trackIds: ["trk-05", "trk-04", "trk-02"]
  },
  {
    id: "pl-liked-songs",
    title: "Liked Songs",
    description: "Your personal collection of favorites.",
    art: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    owner: "Developer",
    likes: "Curated by you",
    color: "#450af5",
    isLikedPlaylist: true,
    trackIds: ["trk-01", "trk-02"]
  }
];

const SEARCH_CATEGORIES = [
  { name: "Pop", color: "#8d67ab", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80" },
  { name: "Hip-Hop", color: "#ba5d07", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80" },
  { name: "Electronic", color: "#006450", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80" },
  { name: "Rock", color: "#e91429", img: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=300&q=80" },
  { name: "Chill", color: "#477d95", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80" },
  { name: "Gaming", color: "#e8115b", img: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=300&q=80" },
  { name: "Focus", color: "#503750", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80" },
  { name: "Mood", color: "#af2896", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80" }
];

// =============================================================================
// 2. QUEUE & AUDIO PLAYBACK ENGINE (Spotify Clean-Room Architecture)
// =============================================================================
class SpotifyPlayerEngine {
  constructor() {
    this.audio = document.getElementById("native-audio");
    
    // Player State
    this.status = "IDLE"; // IDLE, LOADING, PLAYING, PAUSED, ENDED
    this.currentTrack = null;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 0.75;
    this.previousVolume = 0.75;
    this.isMuted = false;
    this.shuffle = false;
    this.repeatMode = "off"; // off, context (all), track (one)
    this.likedTrackIds = new Set(["trk-01", "trk-02"]);

    // Queue Hierarchy (as verified in Spotify Web Player)
    this.contextPlaylist = null; // The active playlist
    this.contextQueue = [];      // Array of track objects in playlist context
    this.userQueue = [];         // Array of track objects manually enqueued
    this.history = [];           // Array of played track objects for 'Prev'
    this.shuffleOrder = [];      // Shuffled track indices

    // Web Audio API & Synth Fallback
    this.audioCtx = null;
    this.analyser = null;
    this.sourceNode = null;
    this.synthOscillator = null;
    this.synthGain = null;
    this.isUsingSynth = false;

    // Listeners Map
    this.subscribers = new Set();

    this.initAudioListeners();
  }

  initAudioListeners() {
    this.audio.volume = this.volume;

    this.audio.addEventListener("timeupdate", () => {
      this.currentTime = this.audio.currentTime;
      this.duration = this.audio.duration || (this.currentTrack ? this.currentTrack.duration : 0);
      this.notify("TIME_UPDATE");
    });

    this.audio.addEventListener("loadedmetadata", () => {
      this.duration = this.audio.duration || (this.currentTrack ? this.currentTrack.duration : 0);
      this.notify("METADATA_LOADED");
    });

    this.audio.addEventListener("play", () => {
      this.status = "PLAYING";
      this.notify("STATE_CHANGE");
    });

    this.audio.addEventListener("pause", () => {
      this.status = "PAUSED";
      this.notify("STATE_CHANGE");
    });

    this.audio.addEventListener("ended", () => {
      this.handleTrackEnded();
    });

    this.audio.addEventListener("error", (e) => {
      console.warn("Native audio playback failed or was blocked by CORS. Activating Web Audio Synthesizer fallback...", e);
      this.startSynthFallback();
    });
  }

  // Setup Web Audio Analyser for the Live Spectrum Visualizer
  initWebAudio() {
    if (this.audioCtx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      try {
        this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      } catch (err) {
        // If element is already connected or CORS cross-origin restricts
        console.log("MediaElementSource attached or restricted.");
      }
    } catch (e) {
      console.warn("Web Audio API not supported in this environment.", e);
    }
  }

  // Built-in Chill Chord Synthesizer to guarantee audio plays seamlessly in all environments
  startSynthFallback() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    this.stopSynthFallback();
    this.isUsingSynth = true;

    // Create dual ambient chord oscillators
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gain = this.audioCtx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "triangle";

    // Ambient chord root frequencies (F minor lo-fi)
    const notes = [174.61, 207.65, 261.63, 311.13];
    const baseFreq = notes[Math.floor(Math.random() * notes.length)];
    osc1.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);
    osc2.frequency.setValueAtTime(baseFreq * 1.5, this.audioCtx.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08 * this.volume, this.audioCtx.currentTime + 1.5);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);

    if (this.analyser) {
      gain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } else {
      gain.connect(this.audioCtx.destination);
    }

    osc1.start();
    osc2.start();

    this.synthOscillator = [osc1, osc2];
    this.synthGain = gain;
    this.status = "PLAYING";
    this.notify("STATE_CHANGE");
  }

  stopSynthFallback() {
    if (this.synthOscillator) {
      try {
        this.synthOscillator.forEach(o => o.stop());
      } catch (e) {}
      this.synthOscillator = null;
    }
    this.isUsingSynth = false;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(event) {
    this.subscribers.forEach(cb => cb(event, this));
  }

  // --- PLAYBACK COMMANDS ---

  /** Play a track immediately within a playlist context */
  playTrack(track, contextPlaylist = null) {
    if (!track) return;
    this.initWebAudio();
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    if (this.currentTrack && this.currentTrack.id !== track.id) {
      this.history.push(this.currentTrack);
    }

    this.currentTrack = track;
    if (contextPlaylist) {
      this.contextPlaylist = contextPlaylist;
      this.contextQueue = contextPlaylist.trackIds
        .map(id => TRACKS_CATALOG.find(t => t.id === id))
        .filter(Boolean);
      this.generateShuffleOrder();
    }

    this.stopSynthFallback();
    this.audio.src = track.audioUrl;
    this.audio.currentTime = 0;
    this.currentTime = 0;
    this.duration = track.duration;

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Autoplay policy or network issue, starting Web Audio synth fallback:", err);
        this.startSynthFallback();
      });
    }

    this.status = "PLAYING";
    this.notify("TRACK_CHANGE");
  }

  togglePlay() {
    this.initWebAudio();
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    if (!this.currentTrack) {
      const defaultTrack = TRACKS_CATALOG[0];
      const defaultPlaylist = PLAYLISTS_CATALOG[0];
      this.playTrack(defaultTrack, defaultPlaylist);
      return;
    }

    if (this.status === "PLAYING") {
      this.pause();
    } else {
      this.resume();
    }
  }

  pause() {
    this.audio.pause();
    if (this.isUsingSynth && this.synthGain) {
      this.synthGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    }
    this.status = "PAUSED";
    this.notify("STATE_CHANGE");
  }

  resume() {
    if (this.isUsingSynth) {
      this.startSynthFallback();
    } else {
      this.audio.play().catch(() => this.startSynthFallback());
    }
    this.status = "PLAYING";
    this.notify("STATE_CHANGE");
  }

  seek(seconds) {
    const clamped = Math.max(0, Math.min(seconds, this.duration));
    this.audio.currentTime = clamped;
    this.currentTime = clamped;
    this.notify("TIME_UPDATE");
  }

  setVolume(fraction) {
    const clamped = Math.max(0, Math.min(fraction, 1));
    this.volume = clamped;
    this.isMuted = clamped === 0;
    this.audio.volume = clamped;
    if (this.synthGain && this.audioCtx) {
      this.synthGain.gain.setValueAtTime(0.08 * clamped, this.audioCtx.currentTime);
    }
    this.notify("VOLUME_CHANGE");
  }

  toggleMute() {
    if (this.isMuted) {
      this.setVolume(this.previousVolume || 0.75);
    } else {
      this.previousVolume = this.volume;
      this.setVolume(0);
    }
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
    if (this.shuffle) {
      this.generateShuffleOrder();
    }
    this.notify("CONTROLS_CHANGE");
  }

  toggleRepeat() {
    // Cycle: off -> context (all) -> track (one) -> off
    if (this.repeatMode === "off") this.repeatMode = "context";
    else if (this.repeatMode === "context") this.repeatMode = "track";
    else this.repeatMode = "off";
    this.notify("CONTROLS_CHANGE");
  }

  toggleLike(trackId) {
    const id = trackId || (this.currentTrack ? this.currentTrack.id : null);
    if (!id) return;
    if (this.likedTrackIds.has(id)) {
      this.likedTrackIds.delete(id);
      showToast("Removed from your Liked Songs");
    } else {
      this.likedTrackIds.add(id);
      showToast("Added to your Liked Songs", "success");
    }
    this.notify("LIKE_CHANGE");
  }

  // --- QUEUE MANAGEMENT (Exact Spotify Web Model) ---

  /** Add a track to the front of the user queue */
  enqueue(track) {
    this.userQueue.push(track);
    showToast(`Added "${track.title}" to queue`, "success");
    this.notify("QUEUE_CHANGE");
  }

  removeFromQueue(index) {
    this.userQueue.splice(index, 1);
    this.notify("QUEUE_CHANGE");
  }

  generateShuffleOrder() {
    this.shuffleOrder = this.contextQueue.map((_, i) => i);
    for (let i = this.shuffleOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffleOrder[i], this.shuffleOrder[j]] = [this.shuffleOrder[j], this.shuffleOrder[i]];
    }
  }

  handleTrackEnded() {
    if (this.repeatMode === "track") {
      this.seek(0);
      this.resume();
      return;
    }
    this.next();
  }

  next() {
    // 1. User manual queue takes top priority
    if (this.userQueue.length > 0) {
      const nextTrack = this.userQueue.shift();
      this.playTrack(nextTrack, this.contextPlaylist);
      return;
    }

    // 2. Play from context queue
    if (!this.contextQueue || this.contextQueue.length === 0) {
      this.seek(0);
      this.pause();
      return;
    }

    const currentIndex = this.contextQueue.findIndex(t => t.id === this.currentTrack?.id);
    let nextIndex;

    if (this.shuffle && this.shuffleOrder.length > 0) {
      const currentShufflePos = this.shuffleOrder.indexOf(currentIndex);
      if (currentShufflePos >= 0 && currentShufflePos < this.shuffleOrder.length - 1) {
        nextIndex = this.shuffleOrder[currentShufflePos + 1];
      } else if (this.repeatMode === "context") {
        nextIndex = this.shuffleOrder[0];
      } else {
        nextIndex = -1;
      }
    } else {
      if (currentIndex >= 0 && currentIndex < this.contextQueue.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (this.repeatMode === "context") {
        nextIndex = 0; // loop playlist
      } else {
        nextIndex = -1;
      }
    }

    if (nextIndex !== -1 && this.contextQueue[nextIndex]) {
      this.playTrack(this.contextQueue[nextIndex], this.contextPlaylist);
    } else {
      this.pause();
      this.seek(0);
    }
  }

  prev() {
    // If song played for more than 3 seconds, restart current track (just like Spotify)
    if (this.currentTime > 3) {
      this.seek(0);
      return;
    }

    // Otherwise go to previous track in history
    if (this.history.length > 0) {
      const prevTrack = this.history.pop();
      this.playTrack(prevTrack, this.contextPlaylist);
      return;
    }

    // Fallback to previous item in context queue
    if (this.contextQueue && this.contextQueue.length > 0) {
      const currentIndex = this.contextQueue.findIndex(t => t.id === this.currentTrack?.id);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : this.contextQueue.length - 1;
      this.playTrack(this.contextQueue[prevIndex], this.contextPlaylist);
    }
  }
}

// Global Singletons
const player = new SpotifyPlayerEngine();

// =============================================================================
// 3. UI VIEW CONTROLLER & ROUTER
// =============================================================================
class SpotifyUI {
  constructor() {
    this.viewport = document.getElementById("view-viewport");
    this.currentView = "home"; // 'home', 'playlist', 'search'
    this.currentViewPayload = null;
    this.historyStack = [];
    this.historyIndex = -1;

    // Right Drawer state
    this.isDrawerOpen = false;
    this.activeDrawerTab = "queue"; // queue, nowplaying, lyrics

    this.cacheDOMElements();
    this.bindEvents();
    this.initPlayerSubscriber();
    this.initVisualizer();

    // Start with Home View
    this.navigateTo("home");
    this.renderSidebarLibrary();
  }

  cacheDOMElements() {
    // Nav
    this.navHome = document.getElementById("nav-home");
    this.navSearch = document.getElementById("nav-search");
    this.btnBack = document.getElementById("history-back");
    this.btnForward = document.getElementById("history-forward");
    this.searchInput = document.getElementById("global-search-input");
    this.searchClearBtn = document.getElementById("search-clear-btn");

    // Drawer
    this.drawer = document.getElementById("right-drawer");
    this.drawerBody = document.getElementById("drawer-body");
    this.closeDrawerBtn = document.getElementById("close-drawer-btn");
    this.tabQueue = document.getElementById("tab-queue");
    this.tabNowPlaying = document.getElementById("tab-now-playing");
    this.tabLyrics = document.getElementById("tab-lyrics");

    // Bottom Player
    this.trackArt = document.getElementById("player-track-art");
    this.trackTitle = document.getElementById("player-track-title");
    this.trackArtist = document.getElementById("player-track-artist");
    this.trackHeart = document.getElementById("player-heart-btn");
    this.explicitTag = document.getElementById("player-explicit-tag");

    this.btnPlayPause = document.getElementById("btn-play-pause");
    this.playIcon = this.btnPlayPause.querySelector(".play-icon");
    this.pauseIcon = this.btnPlayPause.querySelector(".pause-icon");
    this.btnPrev = document.getElementById("btn-prev");
    this.btnNext = document.getElementById("btn-next");
    this.btnShuffle = document.getElementById("btn-shuffle");
    this.btnRepeat = document.getElementById("btn-repeat");
    this.repeatBadge = this.btnRepeat.querySelector(".repeat-one-badge");

    this.currentTimeEl = document.getElementById("current-time");
    this.totalDurationEl = document.getElementById("total-duration");
    this.progressBarWrap = document.getElementById("progress-bar-wrap");
    this.progressBarFill = document.getElementById("progress-bar-fill");
    this.progressThumb = document.getElementById("progress-thumb");

    this.btnVolumeIcon = document.getElementById("btn-volume-icon");
    this.volHighIcon = this.btnVolumeIcon.querySelector(".vol-high");
    this.volMutedIcon = this.btnVolumeIcon.querySelector(".vol-muted");
    this.volumeSliderWrap = document.getElementById("volume-slider-wrap");
    this.volumeSliderFill = document.getElementById("volume-slider-fill");
    this.volumeThumb = document.getElementById("volume-thumb");

    this.btnQueueToggle = document.getElementById("btn-queue-toggle");
    this.btnLyricsToggle = document.getElementById("btn-lyrics-toggle");
    this.btnDeviceToggle = document.getElementById("btn-device-toggle");
    this.deviceModal = document.getElementById("device-modal");
    this.closeModalBtn = document.getElementById("close-modal-btn");
    this.btnFullscreen = document.getElementById("btn-fullscreen-toggle");

    this.visualizerCanvas = document.getElementById("player-visualizer");
  }

  bindEvents() {
    // Navigation items
    this.navHome.addEventListener("click", () => this.navigateTo("home"));
    this.navSearch.addEventListener("click", () => this.navigateTo("search"));

    // History controls
    this.btnBack.addEventListener("click", () => this.goBack());
    this.btnForward.addEventListener("click", () => this.goForward());

    // Search bar
    this.searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim();
      this.searchClearBtn.classList.toggle("hidden", q.length === 0);
      if (this.currentView !== "search") {
        this.navigateTo("search", { query: q });
      } else {
        this.renderSearchResults(q);
      }
    });

    this.searchClearBtn.addEventListener("click", () => {
      this.searchInput.value = "";
      this.searchClearBtn.classList.add("hidden");
      this.searchInput.focus();
      if (this.currentView === "search") {
        this.renderSearchLanding();
      }
    });

    // Player controls
    this.btnPlayPause.addEventListener("click", () => player.togglePlay());
    this.btnPrev.addEventListener("click", () => player.prev());
    this.btnNext.addEventListener("click", () => player.next());
    this.btnShuffle.addEventListener("click", () => player.toggleShuffle());
    this.btnRepeat.addEventListener("click", () => player.toggleRepeat());
    this.trackHeart.addEventListener("click", () => player.toggleLike());

    // Timeline Drag / Click seeking
    this.initSliderScrubbing(this.progressBarWrap, (pct) => {
      player.seek(pct * player.duration);
    });

    // Volume Drag / Click
    this.initSliderScrubbing(this.volumeSliderWrap, (pct) => {
      player.setVolume(pct);
    });
    this.btnVolumeIcon.addEventListener("click", () => player.toggleMute());

    // Right Drawer Controls
    this.btnQueueToggle.addEventListener("click", () => this.toggleDrawer("queue"));
    this.btnLyricsToggle.addEventListener("click", () => this.toggleDrawer("lyrics"));
    this.closeDrawerBtn.addEventListener("click", () => this.toggleDrawer());

    this.tabQueue.addEventListener("click", () => this.switchDrawerTab("queue"));
    this.tabNowPlaying.addEventListener("click", () => this.switchDrawerTab("nowplaying"));
    this.tabLyrics.addEventListener("click", () => this.switchDrawerTab("lyrics"));

    // Device modal
    this.btnDeviceToggle.addEventListener("click", () => {
      this.deviceModal.classList.remove("hidden");
    });
    this.closeModalBtn.addEventListener("click", () => {
      this.deviceModal.classList.add("hidden");
    });
    this.deviceModal.addEventListener("click", (e) => {
      if (e.target === this.deviceModal) this.deviceModal.classList.add("hidden");
    });

    // Fullscreen toggle
    this.btnFullscreen.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Library Pills
    document.querySelectorAll(".filter-pills .pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".filter-pills .pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.renderSidebarLibrary(pill.dataset.filter);
      });
    });

    // Keyboard Shortcuts (Spotify Standard)
    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        player.togglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        player.seek(player.currentTime + 5);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        player.seek(player.currentTime - 5);
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        player.setVolume(player.volume + 0.05);
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        player.setVolume(player.volume - 0.05);
      } else if (e.key === "m" || e.key === "M") {
        player.toggleMute();
      } else if (e.key === "l" || e.key === "L") {
        player.toggleLike();
      } else if (e.key === "q" || e.key === "Q") {
        this.toggleDrawer("queue");
      }
    });

    // Top Nav Scroll Blur Effect
    this.viewport.addEventListener("scroll", () => {
      const topNav = document.getElementById("top-nav");
      if (this.viewport.scrollTop > 40) {
        topNav.classList.add("scrolled");
      } else {
        topNav.classList.remove("scrolled");
      }
    });
  }

  // --- SLIDER INTERACTION HANDLER ---
  initSliderScrubbing(wrapperElement, onUpdate) {
    let isDragging = false;

    const calculatePercent = (e) => {
      const rect = wrapperElement.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const offsetX = clientX - rect.left;
      return Math.max(0, Math.min(offsetX / rect.width, 1));
    };

    const handleStart = (e) => {
      isDragging = true;
      onUpdate(calculatePercent(e));
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("touchend", handleEnd);
    };

    const handleMove = (e) => {
      if (!isDragging) return;
      onUpdate(calculatePercent(e));
    };

    const handleEnd = () => {
      isDragging = false;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };

    wrapperElement.addEventListener("mousedown", handleStart);
    wrapperElement.addEventListener("touchstart", handleStart, { passive: true });
  }

  // --- AUDIO SUBSCRIBER & STATE SYNCHRONIZATION ---
  initPlayerSubscriber() {
    player.subscribe((event, p) => {
      switch (event) {
        case "TRACK_CHANGE":
          this.updatePlayerBarTrack(p.currentTrack);
          this.updatePlayPauseButton(p.status === "PLAYING");
          this.highlightActiveTrackRows(p.currentTrack?.id);
          this.renderDrawerContent();
          break;

        case "STATE_CHANGE":
          this.updatePlayPauseButton(p.status === "PLAYING");
          this.highlightActiveTrackRows(p.currentTrack?.id);
          break;

        case "TIME_UPDATE":
          this.updateTimeline(p.currentTime, p.duration);
          this.syncLyricsTime(p.currentTime);
          break;

        case "VOLUME_CHANGE":
          this.updateVolumeBar(p.volume, p.isMuted);
          break;

        case "CONTROLS_CHANGE":
          this.updateShuffleRepeatButtons(p.shuffle, p.repeatMode);
          break;

        case "LIKE_CHANGE":
          this.updateLikeButton(p.currentTrack?.id);
          this.updateTrackTableHearts();
          this.renderSidebarLibrary();
          break;

        case "QUEUE_CHANGE":
          this.renderDrawerContent();
          break;
      }
    });

    // Initial state push
    const initialTrack = TRACKS_CATALOG[0];
    const initialPlaylist = PLAYLISTS_CATALOG[0];
    player.currentTrack = initialTrack;
    player.contextPlaylist = initialPlaylist;
    player.contextQueue = [...TRACKS_CATALOG];
    player.duration = initialTrack.duration;
    this.updatePlayerBarTrack(initialTrack);
    this.updateVolumeBar(player.volume, false);
  }

  updatePlayerBarTrack(track) {
    if (!track) return;
    this.trackArt.src = track.art;
    this.trackTitle.textContent = track.title;
    this.trackArtist.textContent = track.artist;
    this.explicitTag.classList.toggle("hidden", !track.explicit);
    this.updateLikeButton(track.id);
  }

  updatePlayPauseButton(isPlaying) {
    if (isPlaying) {
      this.playIcon.classList.add("hidden");
      this.pauseIcon.classList.remove("hidden");
    } else {
      this.playIcon.classList.remove("hidden");
      this.pauseIcon.classList.add("hidden");
    }
  }

  updateTimeline(currentTime, duration) {
    this.currentTimeEl.textContent = formatTime(currentTime);
    this.totalDurationEl.textContent = formatTime(duration);
    const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
    this.progressBarFill.style.width = `${pct}%`;
    this.progressThumb.style.left = `${pct}%`;
  }

  updateVolumeBar(volume, isMuted) {
    const effectiveVol = isMuted ? 0 : volume;
    const pct = effectiveVol * 100;
    this.volumeSliderFill.style.width = `${pct}%`;
    this.volumeThumb.style.left = `${pct}%`;

    if (effectiveVol === 0) {
      this.volHighIcon.classList.add("hidden");
      this.volMutedIcon.classList.remove("hidden");
    } else {
      this.volHighIcon.classList.remove("hidden");
      this.volMutedIcon.classList.add("hidden");
    }
  }

  updateShuffleRepeatButtons(shuffle, repeatMode) {
    this.btnShuffle.classList.toggle("active", shuffle);
    this.btnRepeat.classList.toggle("active", repeatMode !== "off");
    this.repeatBadge.classList.toggle("hidden", repeatMode !== "track");
  }

  updateLikeButton(trackId) {
    const isLiked = player.likedTrackIds.has(trackId);
    this.trackHeart.classList.toggle("liked", isLiked);
  }

  // --- LIVE CANVAS SPECTRUM VISUALIZER ---
  initVisualizer() {
    const canvas = this.visualizerCanvas;
    const ctx = canvas.getContext("2d");
    const barCount = 12;

    const render = () => {
      requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let dataArray = new Uint8Array(barCount);
      if (player.status === "PLAYING") {
        if (player.analyser) {
          player.analyser.getByteFrequencyData(dataArray);
        } else {
          // Dynamic procedural fallback waveform when analyser is not ready
          const time = Date.now() * 0.005;
          for (let i = 0; i < barCount; i++) {
            dataArray[i] = Math.floor(100 + Math.sin(time + i * 0.8) * 90);
          }
        }
      } else {
        dataArray.fill(6); // resting line
      }

      const barWidth = 3;
      const gap = 3;
      const totalWidth = barCount * (barWidth + gap);
      const startX = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i];
        const barHeight = Math.max(3, (val / 255) * canvas.height);
        const x = startX + i * (barWidth + gap);
        const y = canvas.height - barHeight;

        ctx.fillStyle = player.status === "PLAYING" ? "#1ed760" : "#727272";
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    render();
  }

  // --- ROUTING & HISTORY ---
  navigateTo(view, payload = null) {
    this.currentView = view;
    this.currentViewPayload = payload;

    // History stack management
    this.historyStack.push({ view, payload });
    this.historyIndex = this.historyStack.length - 1;
    this.updateNavHistoryButtons();

    // Active nav pills
    this.navHome.classList.toggle("active", view === "home");
    this.navSearch.classList.toggle("active", view === "search");

    this.viewport.scrollTop = 0;

    if (view === "home") {
      this.renderHome();
    } else if (view === "playlist") {
      this.renderPlaylist(payload);
    } else if (view === "search") {
      this.renderSearch(payload);
    }
  }

  goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const { view, payload } = this.historyStack[this.historyIndex];
      this.currentView = view;
      this.currentViewPayload = payload;
      this.updateNavHistoryButtons();
      if (view === "home") this.renderHome();
      else if (view === "playlist") this.renderPlaylist(payload);
      else if (view === "search") this.renderSearch(payload);
    }
  }

  goForward() {
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyIndex++;
      const { view, payload } = this.historyStack[this.historyIndex];
      this.currentView = view;
      this.currentViewPayload = payload;
      this.updateNavHistoryButtons();
      if (view === "home") this.renderHome();
      else if (view === "playlist") this.renderPlaylist(payload);
      else if (view === "search") this.renderSearch(payload);
    }
  }

  updateNavHistoryButtons() {
    this.btnBack.classList.toggle("disabled", this.historyIndex <= 0);
    this.btnForward.classList.toggle("disabled", this.historyIndex >= this.historyStack.length - 1);
  }

  // ===========================================================================
  // 4. VIEW RENDERERS
  // ===========================================================================

  renderSidebarLibrary(filter = "all") {
    const list = document.getElementById("library-items-list");
    let items = PLAYLISTS_CATALOG;

    if (filter === "playlist") {
      items = items.filter(p => !p.isArtist);
    } else if (filter === "artist") {
      items = items.filter(p => p.isArtist);
    }

    list.innerHTML = items.map(p => {
      const isLiked = p.isLikedPlaylist;
      const isActive = player.contextPlaylist?.id === p.id;
      return `
        <div class="library-card-row ${isActive ? 'active' : ''}" data-playlist-id="${p.id}">
          ${isLiked ? `
            <div class="library-card-img liked-songs-gradient">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          ` : `
            <img src="${p.art}" alt="${p.title}" class="library-card-img">
          `}
          <div class="library-card-info">
            <span class="library-card-title">${p.title}</span>
            <span class="library-card-subtitle">
              <span>Playlist</span> • <span>${p.owner}</span>
            </span>
          </div>
        </div>
      `;
    }).join("");

    list.querySelectorAll(".library-card-row").forEach(row => {
      row.addEventListener("click", () => {
        const pId = row.dataset.playlistId;
        const pl = PLAYLISTS_CATALOG.find(x => x.id === pId);
        if (pl) this.navigateTo("playlist", pl);
      });
    });
  }

  // --- HOME VIEW ---
  renderHome() {
    const greeting = getGreeting();
    const quickPicks = PLAYLISTS_CATALOG.slice(0, 4);

    this.viewport.innerHTML = `
      <div class="home-section" style="padding-top: 16px;">
        <h2 class="section-title">${greeting}</h2>
        <div class="quick-picks-grid">
          ${quickPicks.map(p => `
            <div class="quick-pick-card" data-playlist-id="${p.id}">
              <img src="${p.art}" alt="${p.title}" class="quick-pick-img">
              <span class="quick-pick-title">${p.title}</span>
              <button class="quick-pick-play-btn" title="Play ${p.title}">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>
              </button>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="home-section">
        <div class="section-header-row">
          <h3 class="section-title">Made For You</h3>
          <a href="#" class="section-show-all">Show all</a>
        </div>
        <div class="cards-grid">
          ${PLAYLISTS_CATALOG.map(p => `
            <div class="media-card" data-playlist-id="${p.id}">
              <div class="media-card-art-wrap">
                <img src="${p.art}" alt="${p.title}" class="media-card-img">
                <button class="card-play-btn" title="Play ${p.title}">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>
                </button>
              </div>
              <span class="media-card-title">${p.title}</span>
              <p class="media-card-desc">${p.description}</p>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="home-section">
        <div class="section-header-row">
          <h3 class="section-title">Trending Tracks Today</h3>
          <a href="#" class="section-show-all">Show all</a>
        </div>
        <div class="cards-grid">
          ${TRACKS_CATALOG.map(t => `
            <div class="media-card" data-track-id="${t.id}">
              <div class="media-card-art-wrap">
                <img src="${t.art}" alt="${t.title}" class="media-card-img">
                <button class="card-play-btn btn-track-play" title="Play ${t.title}">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>
                </button>
              </div>
              <span class="media-card-title">${t.title}</span>
              <p class="media-card-desc">${t.artist} • ${t.album}</p>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    // Bind Quick Pick Clicks
    this.viewport.querySelectorAll(".quick-pick-card, .media-card[data-playlist-id]").forEach(card => {
      card.addEventListener("click", (e) => {
        const pId = card.dataset.playlistId;
        const pl = PLAYLISTS_CATALOG.find(x => x.id === pId);
        if (e.target.closest(".quick-pick-play-btn, .card-play-btn")) {
          // Play first track of playlist
          const firstTrack = TRACKS_CATALOG.find(t => t.id === pl.trackIds[0]);
          player.playTrack(firstTrack, pl);
        } else {
          this.navigateTo("playlist", pl);
        }
      });
    });

    // Bind Track Card Clicks
    this.viewport.querySelectorAll(".media-card[data-track-id]").forEach(card => {
      card.addEventListener("click", () => {
        const tId = card.dataset.trackId;
        const track = TRACKS_CATALOG.find(t => t.id === tId);
        if (track) player.playTrack(track, PLAYLISTS_CATALOG[0]);
      });
    });
  }

  // --- PLAYLIST VIEW (Hero Header + Track Table) ---
  renderPlaylist(playlist) {
    const pl = playlist || PLAYLISTS_CATALOG[0];
    const tracks = pl.trackIds.map(id => TRACKS_CATALOG.find(t => t.id === id)).filter(Boolean);
    const totalDurationSec = tracks.reduce((acc, t) => acc + t.duration, 0);
    const totalDurationFormatted = formatTotalPlaylistTime(totalDurationSec);

    this.viewport.innerHTML = `
      <!-- Hero Banner -->
      <section class="hero-header" style="--hero-accent: ${pl.color};">
        <div class="hero-art-wrapper">
          <img src="${pl.art}" alt="${pl.title}" class="hero-art">
        </div>
        <div class="hero-info">
          <span class="hero-type-label">Public Playlist</span>
          <h1 class="hero-title">${pl.title}</h1>
          <p class="hero-desc">${pl.description}</p>
          <div class="hero-meta-row">
            <span>${pl.owner}</span> • 
            <span class="subdued">${pl.likes}</span> • 
            <span>${tracks.length} songs,</span> 
            <span class="subdued">${totalDurationFormatted}</span>
          </div>
        </div>
      </section>

      <!-- Action Bar -->
      <div class="playlist-action-bar">
        <button class="btn-hero-play" id="btn-hero-play-action" title="Play playlist">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M8 5.14v14l11-7-11-7z"/>
          </svg>
        </button>
        <button class="hero-action-icon" id="btn-hero-heart" title="Save to Your Library">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
        <button class="hero-action-icon" title="More options">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
            <path d="M4.5 10.5C3.67 10.5 3 11.17 3 12s.67 1.5 1.5 1.5S6 12.83 6 12s-.67-1.5-1.5-1.5zm7 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm7 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
          </svg>
        </button>
      </div>

      <!-- Track Table -->
      <div class="track-table-container">
        <div class="track-table-header">
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span class="track-date-col">Date Added</span>
          <span style="text-align: right;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/></svg>
          </span>
        </div>

        <div class="track-table-body" id="track-table-body">
          ${tracks.map((t, idx) => {
            const isPlaying = player.currentTrack?.id === t.id && player.status === "PLAYING";
            const isActive = player.currentTrack?.id === t.id;
            const isLiked = player.likedTrackIds.has(t.id);
            return `
              <div class="track-row ${isActive ? 'active' : ''} ${isPlaying ? 'playing' : ''}" data-track-id="${t.id}">
                <div class="track-index-col">
                  <span class="track-index-num">${idx + 1}</span>
                  <button class="track-row-play-btn" title="Play ${t.title}">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>
                  </button>
                  <div class="equalizer-wave">
                    <div class="equalizer-bar"></div>
                    <div class="equalizer-bar"></div>
                    <div class="equalizer-bar"></div>
                    <div class="equalizer-bar"></div>
                  </div>
                </div>

                <div class="track-title-col">
                  <img src="${t.art}" alt="${t.title}" class="track-table-art">
                  <div class="track-names">
                    <span class="track-row-title">
                      ${t.title}
                      ${t.explicit ? '<span class="explicit-badge">E</span>' : ''}
                    </span>
                    <span class="track-row-artist">${t.artist}</span>
                  </div>
                </div>

                <div class="track-album-col">${t.album}</div>
                <div class="track-date-col">${t.dateAdded}</div>
                <div class="track-duration-col">
                  <button class="track-row-heart ${isLiked ? 'liked' : ''}" data-track-id="${t.id}" title="Save to your Liked Songs">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                  <span>${formatTime(t.duration)}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Bind Hero Play Button
    document.getElementById("btn-hero-play-action").addEventListener("click", () => {
      if (player.contextPlaylist?.id === pl.id && player.status === "PLAYING") {
        player.pause();
      } else {
        const first = tracks[0];
        player.playTrack(first, pl);
      }
    });

    // Bind Row Double-click or Play Button click
    this.viewport.querySelectorAll(".track-row").forEach(row => {
      row.addEventListener("click", (e) => {
        if (e.target.closest(".track-row-heart")) {
          const tId = row.dataset.trackId;
          player.toggleLike(tId);
          return;
        }
        const tId = row.dataset.trackId;
        const track = TRACKS_CATALOG.find(t => t.id === tId);
        player.playTrack(track, pl);
      });
    });
  }

  highlightActiveTrackRows(trackId) {
    document.querySelectorAll(".track-row").forEach(row => {
      const match = row.dataset.trackId === trackId;
      row.classList.toggle("active", match);
      row.classList.toggle("playing", match && player.status === "PLAYING");
    });
  }

  updateTrackTableHearts() {
    document.querySelectorAll(".track-row-heart").forEach(heart => {
      const isLiked = player.likedTrackIds.has(heart.dataset.trackId);
      heart.classList.toggle("liked", isLiked);
    });
  }

  // --- SEARCH VIEW ---
  renderSearch(payload) {
    if (payload && payload.query) {
      this.searchInput.value = payload.query;
      this.searchClearBtn.classList.remove("hidden");
      this.renderSearchResults(payload.query);
    } else {
      this.renderSearchLanding();
    }
  }

  renderSearchLanding() {
    this.viewport.innerHTML = `
      <div class="home-section" style="padding-top: 16px;">
        <h2 class="section-title">Browse all</h2>
        <div class="cards-grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">
          ${SEARCH_CATEGORIES.map(c => `
            <div class="media-card category-card" style="background-color: ${c.color}; min-height: 180px; overflow: hidden; position: relative;">
              <span style="font-size: 1.5rem; font-weight: 800; color: #ffffff;">${c.name}</span>
              <img src="${c.img}" alt="${c.name}" style="position: absolute; right: -16px; bottom: 0; width: 100px; height: 100px; transform: rotate(25deg); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  renderSearchResults(query) {
    const q = query.toLowerCase();
    const matchedTracks = TRACKS_CATALOG.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.artist.toLowerCase().includes(q) || 
      t.album.toLowerCase().includes(q)
    );

    if (matchedTracks.length === 0) {
      this.viewport.innerHTML = `
        <div style="padding: 80px 32px; text-align: center; color: var(--text-subdued);">
          <h3 style="color: var(--text-base); font-size: 1.5rem; margin-bottom: 8px;">No results found for "${query}"</h3>
          <p>Please make sure your words are spelled correctly, or try searching with different keywords.</p>
        </div>
      `;
      return;
    }

    const topResult = matchedTracks[0];

    this.viewport.innerHTML = `
      <div class="home-section" style="padding-top: 16px;">
        <div style="display: grid; grid-template-columns: 2fr 3fr; gap: 24px;">
          <!-- Top Result -->
          <div>
            <h3 class="section-title" style="margin-bottom: 16px;">Top result</h3>
            <div class="media-card" data-track-id="${topResult.id}" style="padding: 20px; background-color: var(--bg-card);">
              <img src="${topResult.art}" alt="${topResult.title}" style="width: 92px; height: 92px; border-radius: var(--radius-xs); margin-bottom: 16px;">
              <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 4px;">${topResult.title}</h2>
              <span style="color: var(--text-subdued); font-size: 0.9rem;">
                <span style="color: var(--text-base); font-weight: 700;">${topResult.artist}</span> • Song
              </span>
            </div>
          </div>

          <!-- Matching Songs List -->
          <div>
            <h3 class="section-title" style="margin-bottom: 16px;">Songs</h3>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${matchedTracks.slice(0, 5).map(t => `
                <div class="track-row" data-track-id="${t.id}" style="grid-template-columns: 1fr auto;">
                  <div class="track-title-col">
                    <img src="${t.art}" alt="${t.title}" class="track-table-art">
                    <div class="track-names">
                      <span class="track-row-title">${t.title}</span>
                      <span class="track-row-artist">${t.artist}</span>
                    </div>
                  </div>
                  <span style="color: var(--text-subdued); font-size: 0.85rem;">${formatTime(t.duration)}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    this.viewport.querySelectorAll(".track-row, .media-card").forEach(el => {
      el.addEventListener("click", () => {
        const tId = el.dataset.trackId;
        const track = TRACKS_CATALOG.find(t => t.id === tId);
        if (track) player.playTrack(track, PLAYLISTS_CATALOG[0]);
      });
    });
  }

  // --- RIGHT DRAWER (Queue & Now Playing) ---
  toggleDrawer(targetTab = null) {
    if (targetTab) {
      if (this.isDrawerOpen && this.activeDrawerTab === targetTab) {
        // Close if same tab toggled
        this.isDrawerOpen = false;
      } else {
        this.isDrawerOpen = true;
        this.switchDrawerTab(targetTab);
      }
    } else {
      this.isDrawerOpen = !this.isDrawerOpen;
    }

    this.drawer.classList.toggle("hidden", !this.isDrawerOpen);
    this.btnQueueToggle.classList.toggle("active", this.isDrawerOpen && this.activeDrawerTab === "queue");
    this.btnLyricsToggle.classList.toggle("active", this.isDrawerOpen && this.activeDrawerTab === "lyrics");

    if (this.isDrawerOpen) {
      this.renderDrawerContent();
    }
  }

  switchDrawerTab(tab) {
    this.activeDrawerTab = tab;
    this.tabQueue.classList.toggle("active", tab === "queue");
    this.tabNowPlaying.classList.toggle("active", tab === "nowplaying");
    this.tabLyrics.classList.toggle("active", tab === "lyrics");
    this.renderDrawerContent();
  }

  renderDrawerContent() {
    if (!this.isDrawerOpen) return;

    if (this.activeDrawerTab === "queue") {
      this.renderQueueDrawer();
    } else if (this.activeDrawerTab === "nowplaying") {
      this.renderNowPlayingDrawer();
    } else if (this.activeDrawerTab === "lyrics") {
      this.renderLyricsDrawer();
    }
  }

  renderQueueDrawer() {
    const cur = player.currentTrack;
    const userQueue = player.userQueue;
    const contextQueue = (player.contextQueue || []).filter(t => t.id !== cur?.id);

    this.drawerBody.innerHTML = `
      <!-- Now Playing Section -->
      <div>
        <h4 class="queue-section-header">Now Playing</h4>
        ${cur ? `
          <div class="queue-track-item">
            <img src="${cur.art}" alt="${cur.title}" class="queue-track-art">
            <div class="queue-track-meta">
              <span class="queue-track-title" style="color: var(--spotify-green);">${cur.title}</span>
              <span class="queue-track-artist">${cur.artist}</span>
            </div>
          </div>
        ` : `<p style="color: var(--text-subdued); font-size: 0.85rem;">Nothing playing right now</p>`}
      </div>

      <!-- Next in Queue (User added) -->
      ${userQueue.length > 0 ? `
        <div>
          <h4 class="queue-section-header">Next In Queue</h4>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            ${userQueue.map((t, idx) => `
              <div class="queue-track-item" data-queue-index="${idx}">
                <img src="${t.art}" alt="${t.title}" class="queue-track-art">
                <div class="queue-track-meta">
                  <span class="queue-track-title">${t.title}</span>
                  <span class="queue-track-artist">${t.artist}</span>
                </div>
                <button class="icon-btn-subtle btn-remove-queue" data-index="${idx}" title="Remove from queue">✕</button>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ''}

      <!-- Next From Playlist Context -->
      <div>
        <h4 class="queue-section-header">Next from: ${player.contextPlaylist ? player.contextPlaylist.title : 'Playlist'}</h4>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${contextQueue.length > 0 ? contextQueue.map(t => `
            <div class="queue-track-item" data-track-id="${t.id}">
              <img src="${t.art}" alt="${t.title}" class="queue-track-art">
              <div class="queue-track-meta">
                <span class="queue-track-title">${t.title}</span>
                <span class="queue-track-artist">${t.artist}</span>
              </div>
            </div>
          `).join("") : `<p style="color: var(--text-subdued); font-size: 0.85rem;">End of queue</p>`}
        </div>
      </div>
    `;

    // Bind item click
    this.drawerBody.querySelectorAll(".queue-track-item[data-track-id]").forEach(item => {
      item.addEventListener("click", () => {
        const tId = item.dataset.trackId;
        const track = TRACKS_CATALOG.find(t => t.id === tId);
        if (track) player.playTrack(track, player.contextPlaylist);
      });
    });

    // Remove from queue
    this.drawerBody.querySelectorAll(".btn-remove-queue").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        player.removeFromQueue(parseInt(btn.dataset.index, 10));
      });
    });
  }

  renderNowPlayingDrawer() {
    const cur = player.currentTrack;
    if (!cur) {
      this.drawerBody.innerHTML = `<p style="color: var(--text-subdued);">No track selected.</p>`;
      return;
    }

    this.drawerBody.innerHTML = `
      <div class="nowplaying-panel">
        <img src="${cur.art}" alt="${cur.title}" class="nowplaying-large-art">
        <div class="nowplaying-details">
          <h2 class="nowplaying-title">${cur.title}</h2>
          <span class="nowplaying-artist">${cur.artist}</span>
        </div>

        <div class="artist-about-card">
          <h4>About the Artist</h4>
          <p>${cur.artist} produces atmospheric, synthesizer-driven music and lo-fi textures created for deep focus, driving under night skies, and contemplative relaxation.</p>
        </div>

        <div class="artist-about-card">
          <h4>Release Details</h4>
          <p><strong>Album:</strong> ${cur.album}</p>
          <p><strong>Format:</strong> High Quality Lossless Stream</p>
          <p><strong>Engine:</strong> Clean-Room Web Audio Engine</p>
        </div>
      </div>
    `;
  }

  renderLyricsDrawer() {
    const cur = player.currentTrack;
    if (!cur || !cur.lyrics || cur.lyrics.length === 0) {
      this.drawerBody.innerHTML = `
        <div style="padding: 40px 0; text-align: center; color: var(--text-subdued);">
          <h3>No lyrics available</h3>
          <p>Looks like we don't have the lyrics for this song yet.</p>
        </div>
      `;
      return;
    }

    this.drawerBody.innerHTML = `
      <div class="lyrics-container" id="lyrics-container">
        ${cur.lyrics.map((line, idx) => `
          <div class="lyrics-line" id="lyric-line-${idx}" data-time="${line.time}">${line.text}</div>
        `).join("")}
      </div>
    `;
  }

  syncLyricsTime(currentTime) {
    if (!this.isDrawerOpen || this.activeDrawerTab !== "lyrics") return;
    const cur = player.currentTrack;
    if (!cur || !cur.lyrics) return;

    cur.lyrics.forEach((line, idx) => {
      const el = document.getElementById(`lyric-line-${idx}`);
      if (!el) return;
      const isCurrent = currentTime >= line.time && (idx === cur.lyrics.length - 1 || currentTime < cur.lyrics[idx + 1].time);
      el.classList.toggle("active", isCurrent);
      if (isCurrent) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
}

// =============================================================================
// 5. HELPER UTILITIES
// =============================================================================
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function formatTotalPlaylistTime(totalSec) {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins} min ${secs} sec`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function showToast(message, type = "normal") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type === "success" ? "success" : ""}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Launch application when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  window.spotifyApp = new SpotifyUI();
  console.log("Spotify Clean-Room Web Player initialized successfully.");
});
