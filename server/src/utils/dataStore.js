import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';
import { Room } from '../models/Room.js';
import { Movie } from '../models/Movie.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { getDBStatus } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In production, fallback file database
const DB_FILE = (process.env.NODE_ENV === 'production' && process.env.UPLOAD_DIR)
  ? path.join(path.resolve(process.env.UPLOAD_DIR), 'db.json')
  : path.resolve(__dirname, '../../data/db.json');

// Default initial state with sample movies and couple demo accounts
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
      hostName: 'Partner 1',
      hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      participantId: null,
      participantName: null,
      participantAvatar: null,
      activeMovieId: 'sample-movie-1',
      playbackState: {
        isPlaying: false,
        currentTime: 0,
        playbackRate: 1,
        updatedAt: Date.now()
      },
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
      storageType: 'local',
      uploadedBy: 'system',
      uploadedByName: 'Together Cinema',
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
      storageType: 'external',
      uploadedBy: 'system',
      uploadedByName: 'Together Cinema',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-movie-3',
      title: 'Big Buck Bunny (Animation Feature)',
      description: 'A gentle, giant rabbit meets three bullying rodents in a delightful forest adventure.',
      duration: '09:56',
      durationSeconds: 596,
      size: '158 MB',
      filename: 'big_buck_bunny.mp4',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
      isSample: true,
      storageType: 'external',
      uploadedBy: 'system',
      uploadedByName: 'Together Cinema',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-movie-4',
      title: 'Cosmos Laundromat: First Cycle',
      description: 'On a desolate island, a suicidal sheep named Franck meets a quirky salesman who offers him the adventure of a lifetime.',
      duration: '10:02',
      durationSeconds: 602,
      size: '180 MB',
      filename: 'cosmos_laundromat.mp4',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      isSample: true,
      storageType: 'external',
      uploadedBy: 'system',
      uploadedByName: 'Together Cinema',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-movie-5',
      title: 'Romantic Sunset Symphony',
      description: 'A breathtaking cinematic showcase of golden sunset horizons, gentle waves, and romantic melodies.',
      duration: '05:30',
      durationSeconds: 330,
      size: '95 MB',
      filename: 'sunset_symphony.mp4',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      isSample: true,
      storageType: 'external',
      uploadedBy: 'system',
      uploadedByName: 'Together Cinema',
      createdAt: new Date().toISOString()
    }
  ],
  messages: []
};

// In-memory active cache
let memoryStore = { ...defaultData };
let isInitialized = false;

// Ensure data folder and file exist
export const initDataStore = () => {
  if (isInitialized) return memoryStore;
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
  }
  if (!fs.existsSync(DB_FILE)) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      memoryStore = JSON.parse(JSON.stringify(defaultData));
    } catch (e) {}
  } else {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      memoryStore = JSON.parse(raw);
    } catch (err) {
      memoryStore = JSON.parse(JSON.stringify(defaultData));
    }
  }
  isInitialized = true;
  return memoryStore;
};

export const readStore = () => {
  if (!isInitialized) initDataStore();
  return memoryStore;
};

export const writeStore = (data) => {
  memoryStore = data;
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Non-fatal if filesystem is read-only
  }
};

/**
 * Sync in-memory store with MongoDB Atlas once connected
 */
export const syncFromMongoDB = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      // Seed default users
      console.log('🌱 Seeding default demo accounts to MongoDB Atlas...');
      for (const u of defaultData.users) {
        await User.updateOne({ id: u.id }, { $set: u }, { upsert: true });
      }
    }

    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('🌱 Seeding initial movie library metadata to MongoDB Atlas...');
      for (const m of defaultData.movies) {
        await Movie.updateOne({ id: m.id }, { $set: m }, { upsert: true });
      }
    }

    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      for (const r of defaultData.rooms) {
        await Room.updateOne({ id: r.id }, { $set: r }, { upsert: true });
      }
    }

    // Load fresh data from MongoDB Atlas into memory
    const [users, rooms, movies, messages] = await Promise.all([
      User.find({}).lean(),
      Room.find({}).lean(),
      Movie.find({}).lean(),
      ChatMessage.find({}).sort({ timestamp: -1 }).limit(500).lean()
    ]);

    memoryStore.users = users.length > 0 ? users : memoryStore.users;
    memoryStore.rooms = rooms.length > 0 ? rooms : memoryStore.rooms;
    memoryStore.movies = movies.length > 0 ? movies : memoryStore.movies;
    memoryStore.messages = messages.length > 0 ? messages.reverse() : memoryStore.messages;

    console.log(`✅ Loaded ${memoryStore.users.length} users, ${memoryStore.rooms.length} rooms, ${memoryStore.movies.length} movies from MongoDB Atlas.`);
  } catch (err) {
    console.warn('Sync from MongoDB Atlas skipped or failed:', err.message);
  }
};

// ----------------------------------------------------
// USER METHODS
// ----------------------------------------------------
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

  // Asynchronously persist to MongoDB Atlas if connected
  if (getDBStatus().isMongoConnected) {
    User.create(newUser).catch(err => console.warn('Atlas user save error:', err.message));
  }

  return newUser;
};

export const updateUser = (id, updates) => {
  const store = readStore();
  const index = store.users.findIndex(u => u.id === id);
  if (index === -1) return null;
  store.users[index] = { ...store.users[index], ...updates };
  writeStore(store);

  if (getDBStatus().isMongoConnected) {
    User.updateOne({ id }, { $set: updates }).catch(err => console.warn('Atlas user update error:', err.message));
  }

  return store.users[index];
};

// ----------------------------------------------------
// ROOM METHODS
// ----------------------------------------------------
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

  if (getDBStatus().isMongoConnected) {
    Room.create(newRoom).catch(err => console.warn('Atlas room save error:', err.message));
  }

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

  if (getDBStatus().isMongoConnected) {
    Room.updateOne({ id }, { $set: updates }).catch(err => console.warn('Atlas room update error:', err.message));
  }

  return store.rooms[index];
};

export const deleteRoom = (id) => {
  const store = readStore();
  store.rooms = store.rooms.filter(r => r.id !== id);
  writeStore(store);

  if (getDBStatus().isMongoConnected) {
    Room.deleteOne({ id }).catch(err => console.warn('Atlas room delete error:', err.message));
  }

  return true;
};

// ----------------------------------------------------
// MOVIE METHODS
// IMPORTANT: Only movie metadata is stored here or in MongoDB Atlas!
// Binary video files are NEVER stored in MongoDB.
// ----------------------------------------------------
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

  // Store metadata ONLY in MongoDB Atlas
  if (getDBStatus().isMongoConnected) {
    Movie.create(newMovie).catch(err => console.warn('Atlas movie save error:', err.message));
  }

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

  if (getDBStatus().isMongoConnected) {
    Movie.deleteOne({ id }).catch(err => console.warn('Atlas movie delete error:', err.message));
  }

  return true;
};

// ----------------------------------------------------
// CHAT MESSAGE METHODS
// ----------------------------------------------------
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
  if (store.messages.length > 1000) {
    store.messages = store.messages.slice(-500);
  }
  writeStore(store);

  if (getDBStatus().isMongoConnected) {
    ChatMessage.create(newMsg).catch(err => console.warn('Atlas chat save error:', err.message));
  }

  return newMsg;
};
