import express from 'express';
import http from 'http';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, getDBStatus } from './config/db.js';
import { initDataStore } from './utils/dataStore.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { getStorageConfig } from './services/storageService.js';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import movieRoutes from './routes/movieRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const server = http.createServer(app);

// Initialize data persistence store
initDataStore();

// Normalize and collect allowed origins
const rawAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  process.env.CLIENT_URL,
  process.env.RENDER_EXTERNAL_URL
].filter(Boolean);

// Clean trailing slashes
const allowedOrigins = rawAllowedOrigins.map(url => url.replace(/\/+$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, or same-origin SPA)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }
    // Allow any localhost / 127.0.0.1 port in development
    if (cleanOrigin.startsWith('http://localhost:') || cleanOrigin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    // Allow *.onrender.com subdomains for convenience if deployed
    if (cleanOrigin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploaded files (thumbnails and fallback local movies)
const uploadsPath = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../uploads');

if (!fs.existsSync(uploadsPath)) {
  try { fs.mkdirSync(uploadsPath, { recursive: true }); } catch (e) {}
}
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const storageInfo = getStorageConfig();
  res.json({
    status: 'ok',
    app: 'Together Cinema ❤️',
    time: new Date().toISOString(),
    database: getDBStatus(),
    storage: {
      provider: storageInfo.provider,
      configured: storageInfo.isConfigured,
      bucket: storageInfo.bucket ? 'configured' : 'none'
    }
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/movies', movieRoutes);

// Serve frontend client build in production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving production frontend build from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  // Catch-all route to support client-side routing (React Router)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.log('ℹ️  Client dist folder not found. Frontend served via Vite dev server or npm run build.');
}

// Socket.IO setup with WebSocket & polling support for Render
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      // In production same-origin or allowed origins
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

await connectDB();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 Together Cinema Server running at http://0.0.0.0:${PORT}`);
  console.log(`❤️  Ready for synchronized movie dates!`);
});

export { app, server, io };
