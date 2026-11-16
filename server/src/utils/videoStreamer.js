import fs from 'fs';
import path from 'path';

/**
 * Handles HTTP 206 Partial Content streaming for videos.
 * Supports seeking across 3+ hour videos smoothly with Range headers.
 */
export const streamVideoFile = (req, res, filePath) => {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video file not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    // Standard chunk size: 2MB for ultra-smooth buffering and seeking
    const CHUNK_SIZE = 2 * 1024 * 1024;
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE - 1, fileSize - 1);

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': filePath.endsWith('.webm') ? 'video/webm' : 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // If no range header, stream with Accept-Ranges declared
    const head = {
      'Content-Length': fileSize,
      'Content-Type': filePath.endsWith('.webm') ? 'video/webm' : 'video/mp4',
      'Accept-Ranges': 'bytes'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
};
