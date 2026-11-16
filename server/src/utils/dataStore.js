import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// In production on Render (with persistent disk), store db.json on the disk mount
const DB_FILE = (process.env.NODE_ENV === 'production' && process.env.UPLOAD_DIR)
  ? path.join(path.resolve(process.env.UPLOAD_DIR), 'db.json')
  : path.resolve(__dirname, '../../data/db.json');

// Default initial state with sample movies
const defaultData = {
  users: [
    {
      id: 'demo-user-1',
      name: 'Partner 1',
      email: 'partner1@cinema.com',
      passwordHash: '$2a$10$pLwF8.48jW6UoVreJkW7c.vW6gC0N22H912eS15Qn9E6Yq0KjYgqC', // password: "password123"
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      partnerNickname: 'My Dearest ❤️',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-user-2',
      name: 'Partner 2',
      email: 'partner2@cinema.com',
      passwordHash: '$2a$10$pLwF8.48jW6UoVreJkW7c.vW6gC0N22H912eS15Qn9E6Yq0KjYgqC', // password: "password123"
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      partnerNickname: 'Sweetheart 💖',
      createdAt: new Date().toISOString()
    }
  ],
  rooms: [
    {
      id: 'room-demo-1',
      code: 'DATE26',
      name: 'Romantic Starlight Cinema ✨',
      hostId: 'demo-user-1',
      participantId: null,
      activeMovieId: 'sample-movie-1',
      createdAt: new Date().toISOString()
    }
  ],
  movies: [
    {
      id: 'sample-movie-1',
      title: 'Romantic Starlight Romance (High-Def Cinema)',
      description: 'A cinematic high-definition showcase with synchronized audio and video, optimized for private couple streaming.',
      duration: '03:15',
      durationSeconds: 195,
      size: '1.1 MB',
      filename: 'together_cinema_sample.mp4',
      streamUrl: '/api/movies/stream/file/together_cinema_sample.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
      isSample: true,
      uploadedBy: 'system',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-movie-2',
      title: 'Tears of Steel (Sci-Fi Feature)',
      description: 'In an apocalyptic future, a couple reconnects in the heart of Amsterdam while battling giant robotic creatures.',
      duration: '12:14',
      durationSeconds: 734,
      size: '168 MB',
      filename: 'tears_of_steel.mp4',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
      isSample: true,
      uploadedBy: 'system',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-movie-2',
      title: 'Big Buck Bunny (Animation Feature)',
      description: 'A gentle, giant rabbit meets three bullying rodents in a delightful forest adventure.',
      duration: '09:56',
      durationSeconds: 596,
      size: '158 MB',
      filename: 'big_buck_bunny.mp4',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
      isSample: true,
      uploadedBy: 'system',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-movie-3',
      title: 'Cosmos Laundromat: First Cycle',
      description: 'On a desolate island, a suicidal sheep named Franck meets a quirky salesman who offers him the adventure of a lifetime.',
      duration: '10:02',
      durationSeconds: 602,
      size: '180 MB',
      filename: 'cosmos_laundromat.mp4',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      isSample: true,
      uploadedBy: 'system',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-movie-4',
      title: 'Romantic Sunset Symphony',
      description: 'A breathtaking cinematic showcase of golden sunset horizons, gentle waves, and romantic melodies.',
      duration: '05:30',
      durationSeconds: 330,
      size: '95 MB',
      filename: 'sunset_symphony.mp4',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      isSample: true,
      uploadedBy: 'system',
      createdAt: new Date().toISOString()
    }
  ],
  messages: []
};

// Ensure data folder and file exist
export const initDataStore = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
};

export const readStore = () => {
  initDataStore();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB_FILE:', err);
    return defaultData;
  }
};

export const writeStore = (data) => {
  initDataStore();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// User methods
export const findUserByEmail = (email) => {
  const store = readStore();
  return store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const findUserById = (id) => {
  const store = readStore();
  return store.users.find(u => u.id === id);
};

export const createUser = ({ name, email, passwordHash, avatar, partnerNickname }) => {
  const store = readStore();
  const newUser = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    partnerNickname: partnerNickname || 'My Darling ❤️',
    createdAt: new Date().toISOString()
  };
  store.users.push(newUser);
  writeStore(store);
  return newUser;
};

export const updateUser = (id, updates) => {
  const store = readStore();
  const index = store.users.findIndex(u => u.id === id);
  if (index === -1) return null;
  store.users[index] = { ...store.users[index], ...updates };
  writeStore(store);
  return store.users[index];
};

// Room methods
export const createRoom = ({ name, hostId, hostName, hostAvatar, activeMovieId }) => {
  const store = readStore();
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newRoom = {
    id: uuidv4(),
    code,
    name: name || `${hostName || 'Partner 1'}'s Movie Date Room ❤️`,
    hostId,
    hostName: hostName || null,
    hostAvatar: hostAvatar || null,
    participantId: null,
    participantName: null,
    participantAvatar: null,
    activeMovieId: activeMovieId || (store.movies[0] ? store.movies[0].id : null),
    playbackState: {
      isPlaying: false,
      currentTime: 0,
      playbackRate: 1,
      updatedAt: Date.now()
    },
    createdAt: new Date().toISOString()
  };
  store.rooms.push(newRoom);
  writeStore(store);
  return newRoom;
};

export const findRoomByCode = (code) => {
  const store = readStore();
  return store.rooms.find(r => r.code.toUpperCase() === code.trim().toUpperCase());
};

export const findRoomById = (id) => {
  const store = readStore();
  return store.rooms.find(r => r.id === id);
};

export const updateRoom = (id, updates) => {
  const store = readStore();
  const index = store.rooms.findIndex(r => r.id === id);
  if (index === -1) return null;
  store.rooms[index] = { ...store.rooms[index], ...updates };
  writeStore(store);
  return store.rooms[index];
};

export const deleteRoom = (id) => {
  const store = readStore();
  store.rooms = store.rooms.filter(r => r.id !== id);
  writeStore(store);
  return true;
};

// Movie methods
export const getMovies = () => {
  const store = readStore();
  return store.movies;
};

export const findMovieById = (id) => {
  const store = readStore();
  return store.movies.find(m => m.id === id);
};

export const createMovie = (movieData) => {
  const store = readStore();
  const newMovie = {
    id: uuidv4(),
    ...movieData,
    createdAt: new Date().toISOString()
  };
  store.movies.unshift(newMovie);
  writeStore(store);
  return newMovie;
};

export const deleteMovie = (id) => {
  const store = readStore();
  const movie = store.movies.find(m => m.id === id);
  if (!movie) return false;
  // If local file, delete it
  if (movie.localPath && fs.existsSync(movie.localPath)) {
    try {
      fs.unlinkSync(movie.localPath);
    } catch (e) {
      console.warn('Could not delete local movie file:', e.message);
    }
  }
  store.movies = store.movies.filter(m => m.id !== id);
  writeStore(store);
  return true;
};

// Chat message methods
export const getRoomMessages = (roomId) => {
  const store = readStore();
  return store.messages.filter(m => m.roomId === roomId);
};

export const addChatMessage = (message) => {
  const store = readStore();
  const newMsg = {
    id: uuidv4(),
    ...message,
    timestamp: new Date().toISOString()
  };
  store.messages.push(newMsg);
  // Keep last 300 messages per room
  if (store.messages.length > 1000) {
    store.messages = store.messages.slice(-500);
  }
  writeStore(store);
  return newMsg;
};
