import path from 'path';
import fs from 'fs';
import { getMovies, findMovieById, createMovie, deleteMovie } from '../utils/dataStore.js';
import { streamVideoFile } from '../utils/videoStreamer.js';

export const handleGetMovies = (req, res) => {
  try {
    const { search } = req.query;
    let movies = getMovies();
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      movies = movies.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
      );
    }
    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

export const handleGetMovieById = (req, res) => {
  try {
    const { id } = req.params;
    const movie = findMovieById(id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json({ movie });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
};

export const handleUploadMovie = (req, res) => {
  try {
    const movieFile = req.files && req.files['movie'] ? req.files['movie'][0] : null;
    const thumbFile = req.files && req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    if (!movieFile) {
      return res.status(400).json({ error: 'Movie video file (MP4 or WebM) is required' });
    }

    const { title, description, duration } = req.body;
    const movieTitle = title ? title.trim() : path.parse(movieFile.originalname).name;

    // Format file size
    const sizeInMB = (movieFile.size / (1024 * 1024)).toFixed(1);
    const sizeStr = movieFile.size > 1024 * 1024 * 1024
      ? `${(movieFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
      : `${sizeInMB} MB`;

    // Construct streaming URL: points to our local HTTP 206 streaming endpoint
    const filename = movieFile.filename;
    const localPath = movieFile.path;

    const thumbnail = thumbFile
      ? `/uploads/thumbnails/${thumbFile.filename}`
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';

    const newMovie = createMovie({
      title: movieTitle,
      description: description || 'Uploaded movie ready for private streaming.',
      duration: duration || 'Custom Feature',
      durationSeconds: 0,
      size: sizeStr,
      filename,
      localPath,
      // The stream endpoint handles Range headers
      streamUrl: `/api/movies/stream/file/${filename}`,
      thumbnail,
      isSample: false,
      uploadedBy: req.user ? req.user.id : 'user',
      uploadedByName: req.user ? req.user.name : 'Partner'
    });

    res.status(201).json({
      message: 'Movie uploaded and added to Shared Library successfully!',
      movie: newMovie
    });
  } catch (err) {
    console.error('Upload movie error:', err);
    res.status(500).json({ error: 'Failed to upload movie' });
  }
};

export const handleStreamMovie = (req, res) => {
  try {
    const { filename } = req.params;
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const baseUploadDir = process.env.UPLOAD_DIR
      ? path.resolve(process.env.UPLOAD_DIR)
      : path.resolve('./uploads');
    const filePath = path.join(baseUploadDir, 'movies', safeFilename);

    streamVideoFile(req, res, filePath);
  } catch (err) {
    console.error('Streaming error:', err);
    res.status(500).json({ error: 'Failed to stream video' });
  }
};

export const handleDeleteMovie = (req, res) => {
  try {
    const { id } = req.params;
    const movie = findMovieById(id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    if (movie.isSample) {
      return res.status(400).json({ error: 'Sample library movies cannot be deleted' });
    }

    deleteMovie(id);
    res.json({ message: 'Movie deleted from library successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete movie' });
  }
};
