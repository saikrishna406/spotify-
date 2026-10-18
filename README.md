# 🎵 Spotify Clone (with Live JioSaavn Streaming)

A modern, high-performance **Spotify Web Player Clone** built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. 

It streams real-time, high-quality audio directly from JioSaavn's official Content Delivery Networks (Akamai & CloudFront) without requiring any paid API keys or third-party paid subscriptions.

---

## ✨ Features

- 🎧 **Live Audio Streaming**: High-fidelity audio playback (160kbps AAC/MP4) streamed directly in real-time.
- 🔍 **Instant Search**: Search millions of songs, albums, and artists across multiple languages (Telugu, Tamil, Hindi, English, Punjabi, etc.).
- 🎛️ **Full-Featured Media Player**:
  - Play, Pause, Previous, Next, Shuffle, and Repeat modes.
  - Interactive scrub/seek bar with accurate time indicators.
  - Smooth volume control & mute toggling.
  - Persistent bottom player bar that stays synchronized across navigation.
- 📜 **Queue Drawer**: View upcoming tracks in the current playlist and jump directly to any track.
- 🇮🇳 **Curated Regional Hubs**: Handpicked playlists and trending hits for South Indian music (Telugu, Tamil), Bollywood, and global charts.
- 🖼️ **High-Resolution Artwork**: Automatically transforms thumbnail artwork into uncompressed 500x500 album covers.
- 👥 **Multi-User Profiles & Auth**:
  - Pre-seeded with 10 friend demo accounts with instant 1-click profile switching.
  - Custom registration and login with bcrypt password hashing and JWT authentication.
  - User-specific "Liked Songs" and custom playlist creation stored with server-side persistence.

---

## 🔬 How Audio Streaming Works (Reverse Engineering Breakdown)

Many people wonder: **"Where does the audio come from? Is there a private database?"**

**No external music database is needed.** All tracks, metadata, and media stream straight from JioSaavn’s production servers. Here is how the reverse-engineered pipeline works:

```
┌────────────────────────────────┐
│   User Browser (Music App)     │
└───────────────┬────────────────┘
                │ 1. Search Query ("Pushpa 2", "Arijit Singh")
                ▼
┌────────────────────────────────────────────────────────┐
│  JioSaavn RPC API (jiosaavn.com/api.php)               │
│  __call=search.getResults                              │
└───────────────┬────────────────────────────────────────┘
                │ 2. Returns song metadata + encrypted_media_url
                ▼
┌────────────────────────────────────────────────────────┐
│  JioSaavn Token Generator                              │
│  __call=song.generateAuthToken                         │
└───────────────┬────────────────────────────────────────┘
                │ 3. Generates signed, time-limited CDN audio URL (CloudFront / Akamai)
                ▼
┌────────────────────────────────────────────────────────┐
│  Next.js Audio Proxy (/api/music/stream)               │
│  • Attaches Referer: https://www.jiosaavn.com/         │
│  • Bypasses CORS & CDN 403 hotlink protection          │
│  • Forwards HTTP Range headers (bytes=0-) for seeking   │
└───────────────┬────────────────────────────────────────┘
                │ 4. Piped binary audio stream (audio/mp4)
                ▼
┌────────────────────────────────┐
│   HTML5 Audio Engine / Player  │
└────────────────────────────────┘
```

### 1. Internal RPC Discovery
JioSaavn’s web player communicates via an internal RPC endpoint:
```text
https://www.jiosaavn.com/api.php?__call=<METHOD_NAME>&_format=json&_marker=0
```
This endpoint exposes internal methods such as `search.getResults` and `song.getDetails`.

### 2. Audio URL Resolution (`encrypted_media_url`)
JioSaavn obfuscates raw stream URLs in API responses into an `encrypted_media_url` token. By calling JioSaavn's internal `song.generateAuthToken` method with the encrypted URL and target bitrate (`160` or `320`), JioSaavn's servers generate an authenticated, signed CloudFront or Akamai CDN stream URL.

### 3. Server-Side Audio Proxy & CORS Bypass
Directly loading JioSaavn's CDN link in an HTML `<audio>` tag results in a `403 Forbidden` error because their CDN checks `Origin` and `Referer` headers.

To resolve this, the Next.js server proxies the stream through `/api/music/stream`:
- Injects `Referer: https://www.jiosaavn.com/` and browser `User-Agent`.
- Pipes incoming HTTP `Range` headers (e.g. `bytes=1048576-`) to allow smooth scrubbing, fast-forwarding, and rewinding.

### 4. High-Definition Album Art Trick
JioSaavn APIs default to low-res `150x150.jpg` thumbnails. By replacing `150x150.jpg` with `500x500.jpg` in the image URL, the CDN immediately delivers crisp, uncompressed 500x500 artwork.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **State Management**: React Context (`AudioContext`, `AuthContext`)

---

## 📁 Project Structure

```text
Music_app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/           # Login, register, profile switch, session
│   │   │   ├── music/
│   │   │   │   ├── search/     # Live JioSaavn search endpoint
│   │   │   │   ├── stream/     # Byte-range audio proxy with CDN headers
│   │   │   │   └── trending/   # Trending tracks & regional playlists
│   │   │   └── user/
│   │   │       ├── liked/      # User liked songs management
│   │   │       └── playlists/  # User custom playlist management
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   ├── layout.tsx          # Root layout with AudioContext & AuthContext
│   │   └── page.tsx            # Spotify home screen (featured, search, hero)
│   ├── components/
│   │   ├── PlayerBar.tsx       # Bottom media controls (play, seek, volume)
│   │   ├── Sidebar.tsx         # Left navigation & user playlist drawer
│   │   ├── TopNav.tsx          # Top search bar, quick user switcher & avatar
│   │   ├── TrackRow.tsx        # Individual track list row with like & play
│   │   ├── PlaylistCard.tsx    # Square album/playlist cards
│   │   ├── QueueDrawer.tsx     # Slide-over view for currently queued tracks
│   │   └── AuthModal.tsx       # Sign-in / profile modal
│   ├── context/
│   │   ├── AudioContext.tsx    # HTML5 Audio controller & queue state
│   │   └── AuthContext.tsx     # Current user state & token storage
│   ├── lib/
│   │   ├── saavn.ts            # JioSaavn RPC client, token resolver, decoders
│   │   ├── auth.ts             # JWT cookie verification & password helpers
│   │   └── db.ts               # Local file-based & in-memory database
│   └── types/
│       └── index.ts            # Core TypeScript interfaces
├── data/
│   └── users.json              # Persistent mock users & playlists
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js 18+** installed:
```bash
node -v
```

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/saikrishna406/spotify-.git
   cd spotify-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 👥 Demo Accounts

The application comes pre-loaded with demo profiles so you can test multi-user features immediately:

| Username | Password | Display Name |
| :--- | :--- | :--- |
| `sai` | `sai123` | Sai Krishna |
| `de` | `de123` | Developer (Admin) |
| `rahul` | `rahul123` | Rahul Sharma |
| `priya` | `priya123` | Priya Reddy |
| `karthik` | `karthik123` | Karthik Raja |

You can also use the **Switch Profile** dropdown at the top right of the navigation bar to toggle between accounts with one click without retyping credentials.

---

## ⚖️ Legal Disclaimer

This project is created strictly for **educational and portfolio purposes**. 
- All music audio, track titles, album covers, and artist data are the intellectual property of **JioSaavn** and their respective music labels/copyright owners.
- This application does not store, re-encode, or host any copyrighted audio files on its own servers; all media is piped directly from official content distribution networks.
