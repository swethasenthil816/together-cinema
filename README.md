# Together Cinema ❤️ - Private Virtual Movie Dates for Two

A synchronized long-distance movie-watching platform designed specifically for couples in different locations. Watch the same film with millisecond-precision playback sync, talk and see each other via live WebRTC video/audio, send romantic reactions, and chat in real time.

---

## 🌟 Key Features

1. **Millisecond-Accurate Playback Synchronization**:
   - Synchronized Play, Pause, Seeking, and Speed Adjustment.
   - Network delay compensation using UTC timestamps.
   - Smart drift correction: gently snaps playback into alignment if drift exceeds 0.35s.
   - Buffering detection: if one partner's network buffers, playback automatically pauses for both until buffer recovers.
   - Loop-prevention engine: prevents feedback loops between partner sockets.

2. **Live WebRTC Video & Audio Calling**:
   - Dual webcam screens: See your partner's live video while watching the movie.
   - Camera ON/OFF toggle.
   - Microphone mute/unmute toggle.
   - Peer-to-peer WebRTC connection using public Google STUN servers.
   - Connection status indicators and audio indicators.

3. **Shared Movie Library & 3+ Hour Streaming**:
   - Upload personal MP4 and WebM movie files up to 4GB.
   - Powered by HTTP 206 Partial Content Range streaming (`Range: bytes=start-end`), enabling instantaneous seeking across full-length 3+ hour films without loading the entire video into memory.
   - Real-time upload progress bar.
   - Search, thumbnail previews, durations, file sizes, and delete controls.

4. **Real-Time Live Date Chat (Socket.IO)**:
   - Instant 2-way messaging with timestamps and sender avatars.
   - Quick romantic phrases ("I love you ❤️", "Pass the popcorn 🍿", "Hold my hand ✨").
   - Emoji palette and typing indicators ("Alex is typing love...").

5. **Romantic Atmosphere & Netflix-Inspired UI**:
   - Deep cinematic dark theme (`#08080a`, `#14141b`) with Netflix red (`#E50914`) and romantic rose accents (`#ff3366`).
   - Floating heart animations on screen.
   - Instant reaction bursts (❤️ Love, 💋 Kiss, 🍿 Popcorn, ✨ Sparkle, 😂 Laugh, 🥹 Emotional).
   - Movie date countdown timer and scheduler.
   - Celebratory welcome modal when both partners join the room.

6. **Strict 2-Person Private Rooms**:
   - Generates unique 6-character room codes (e.g., `XBL7WG`).
   - Max 2 participants: prevents third-party eavesdropping or unauthorized entry.
   - 1-click invite link copying.

---

## 🏗️ Architecture & Folder Structure

```
together-cinema/
├── client/                          # React + Vite + Tailwind CSS Frontend
│   ├── public/                      # Static assets & favicons
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Navbar, Footer
│   │   │   ├── player/              # CustomVideoPlayer with Netflix controls & sync status
│   │   │   ├── webrtc/              # WebRTCCallingTile (dual video feeds, mic/camera toggles)
│   │   │   ├── chat/                # ChatPanel (live chat, emoji tray, quick love pills)
│   │   │   ├── romantic/            # FloatingHearts, ReactionOverlay, RomanticDateCountdown, RomanticWelcomeModal
│   │   │   └── library/             # MovieCard, UploadMovieModal, MovieSelectorModal
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication & user state
│   │   ├── hooks/
│   │   │   ├── useWebRTC.js         # WebRTC peer connection, media streams, STUN config
│   │   │   └── useMovieSync.js      # Synchronized playback engine & loop prevention
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Netflix-style hero banner & 1-click test partner logins
│   │   │   ├── LoginPage.jsx        # Login page with demo partner buttons
│   │   │   ├── RegisterPage.jsx     # Registration with avatar picker & partner nickname
│   │   │   ├── DashboardPage.jsx    # Date countdown, active rooms, movie library preview
│   │   │   ├── CreateRoomPage.jsx   # Private room creator & invite link generator
│   │   │   ├── JoinRoomPage.jsx     # Room code input & joiner
│   │   │   ├── MovieRoomPage.jsx    # Central theater room (player, dual webcams, chat)
│   │   │   ├── LibraryPage.jsx      # Shared movie collection & upload manager
│   │   │   ├── ProfilePage.jsx      # Couple profile, nickname, & watch stats
│   │   │   └── SettingsPage.jsx     # Webcam/mic diagnostic test & streaming preferences
│   │   ├── services/
│   │   │   ├── api.js               # REST API client with JWT interceptor & XHR upload progress
│   │   │   └── socket.js            # Socket.IO client instance
│   │   ├── App.jsx                  # React Router routes & ProtectedRoute guard
│   │   ├── index.css                # Custom scrollbars, animations, & glassmorphism
│   │   └── main.jsx                 # Client entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                          # Node.js + Express + Socket.IO Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # MongoDB connection with resilient JSON store fallback
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, demo login, profile
│   │   │   ├── roomController.js    # Create room, join room (max 2 rule), leave room
│   │   │   └── movieController.js   # Library list, upload, HTTP 206 range stream, delete
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification middleware
│   │   │   └── upload.js            # Multer disk storage for MP4/WebM videos up to 4GB
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /api/auth routes
│   │   │   ├── roomRoutes.js        # /api/rooms routes
│   │   │   └── movieRoutes.js       # /api/movies routes
│   │   ├── sockets/
│   │   │   └── socketHandler.js     # Real-time room, sync, WebRTC signaling, chat & reactions
│   │   ├── utils/
│   │   │   ├── dataStore.js         # Resilient atomic data persistence
│   │   │   └── videoStreamer.js     # HTTP 206 Partial Content Range streaming engine
│   │   └── server.js                # Express & Socket.IO server entry point
│   ├── uploads/
│   │   ├── movies/                  # Stored MP4/WebM video files
│   │   └── thumbnails/              # Uploaded poster images
│   ├── data/
│   │   └── db.json                  # Persistent local database storage
│   ├── package.json
│   └── .env
├── package.json                     # Root orchestrator scripts
├── test_e2e.js                      # Automated End-to-End verification test suite
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ and npm installed.

### 1. Installation
In the project root directory:
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
cd ..
```

### 2. Environment Configuration
The backend comes pre-configured with default settings in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/together_cinema
JWT_SECRET=together_cinema_super_secret_romantic_key_2026
CLIENT_URL=http://localhost:5173
```
*Note: If MongoDB is not running locally, the backend automatically activates the embedded persistent JSON database in `server/data/db.json` with zero configuration needed!*

### 3. Running the Application

#### Option A: Run Full-Stack Production Server (Single Port)
```bash
npm run server
```
Visit: **`http://localhost:5000`** (Express serves both backend APIs, Socket.IO, and the compiled React frontend!).

#### Option B: Run in Development Mode with Hot Reload
Terminal 1 (Backend):
```bash
cd server && npm run dev
```
Terminal 2 (Frontend with Vite):
```bash
cd client && npm run dev
```
Visit: **`http://localhost:5173`**

---

## 🧪 Testing the 2-Person Synchronized Experience

To test with two simulated partners on one machine:
1. Open **Browser Window 1** (e.g. Chrome) and navigate to `http://localhost:5173`.
   - Click **"Login as Partner 1 (Alex)"** on the landing page or login screen.
   - Go to **"Create Movie Room"** or open the pre-created room `DATE26`.
2. Open **Browser Window 2** (e.g. Incognito or Safari or Firefox) and navigate to `http://localhost:5173`.
   - Click **"Login as Partner 2 (Sam)"**.
   - Click **"Join with Code"** and enter the room code from Window 1 (or click the invitation link).
3. **Watch Together**:
   - Both partners see the celebratory romantic welcome banner!
   - Press **Play** in Window 1 — Window 2 starts playing simultaneously.
   - **Seek** forward 30 seconds in Window 2 — Window 1 jumps to the exact position instantly.
   - Click **"❤️ Love"** or **"💋 Kiss"** in Window 1 — floating hearts and romantic toast notifications burst across Window 2!
   - Type a chat message in Window 1 — Window 2 shows live typing and displays the message immediately.
   - Turn on Camera & Microphone to test live WebRTC video tiles!

---

## 🔒 Security & Privacy Features

- **Strict 2-Person Room Policy**: If a 3rd user attempts to join a room, the server rejects them with HTTP 403 Forbidden (`ROOM_FULL`).
- **Encrypted WebRTC Calling**: Audio and video streams flow directly peer-to-peer between the two partners.
- **Bcrypt Password Hashing**: Passwords are never stored in plaintext (salted with 10 rounds).
- **JWT Authorization**: All private room and library actions require a valid Bearer token.
- **Directory Traversal Protection**: File paths for video streaming are sanitized using `path.basename`.

---

## 📦 Deployment Guide

### Deploy to Render / Railway / Heroku:
1. Set Environment Variables:
   - `PORT=5000`
   - `JWT_SECRET=<your-random-secret>`
   - `MONGODB_URI=<your-mongodb-atlas-connection-string>`
2. Build Command:
   ```bash
   cd client && npm install && npm run build && cd ../server && npm install
   ```
3. Start Command:
   ```bash
   cd server && node src/server.js
   ```

Enjoy your private movie date with **Together Cinema ❤️**!
