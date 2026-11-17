import React, { useState } from 'react';
import { X, Upload, Film, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { movieApi } from '../../services/api';

export const UploadMovieModal = ({ isOpen, onClose, onMovieUploaded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [movieFile, setMovieFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleMovieChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file extension
      const validTypes = ['video/mp4', 'video/webm', 'video/mkv'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mkv)$/i)) {
        setError('Please choose a valid MP4 or WebM video file.');
        return;
      }
      setError(null);
      setMovieFile(file);
      if (!title) {
        // Default title to filename without extension
        const rawName = file.name.replace(/\.[^/.]+$/, '');
        setTitle(rawName.replace(/[_-]/g, ' '));
      }
    }
  };

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Thumbnail must be an image file (JPG, PNG, WEBP).');
        return;
      }
      setError(null);
      setThumbFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movieFile) {
      setError('Please select an MP4 or WebM movie file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const sizeInMB = (movieFile.size / (1024 * 1024)).toFixed(1);
    const sizeStr = movieFile.size > 1024 * 1024 * 1024
      ? `${(movieFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
      : `${sizeInMB} MB`;

    try {
      // 1. Check if cloud storage (R2/S3) is configured for direct upload
      let cloudInfo = null;
      try {
        cloudInfo = await movieApi.getUploadUrl({
          filename: movieFile.name,
          contentType: movieFile.type || 'video/mp4',
        });
      } catch (checkErr) {
        // Fall back to server upload
        cloudInfo = { isCloud: false };
      }

      let createdMovie = null;

      if (cloudInfo && cloudInfo.isCloud && cloudInfo.uploadUrl) {
        // Direct-to-cloud upload (bypasses Render 100s proxy timeout & allows large files up to 5GB)
        await movieApi.uploadDirectToCloud(
          cloudInfo.uploadUrl,
          movieFile,
          movieFile.type || 'video/mp4',
          (progress) => setUploadProgress(progress)
        );

        // Confirm upload and save metadata to database
        const confirmRes = await movieApi.confirmUpload({
          title,
          description,
          duration: duration || 'Custom Feature',
          key: cloudInfo.key,
          streamUrl: cloudInfo.streamUrl,
          filename: movieFile.name,
          size: sizeStr,
        });
        createdMovie = confirmRes.movie;
      } else {
        // Fallback: standard server multipart upload
        const formData = new FormData();
        formData.append('movie', movieFile);
        if (thumbFile) formData.append('thumbnail', thumbFile);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('duration', duration || 'Custom Movie');

        const res = await movieApi.uploadMovie(formData, (progress) => {
          setUploadProgress(progress);
        });
        createdMovie = res.movie;
      }

      setSuccess(true);
      setTimeout(() => {
        if (onMovieUploaded && createdMovie) onMovieUploaded(createdMovie);
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setDuration('');
        setMovieFile(null);
        setThumbFile(null);
        setSuccess(false);
        setIsUploading(false);
        setUploadProgress(0);
      }, 1200);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload movie. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-card border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isUploading}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-cinema-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-netflix-red to-romantic-pink flex items-center justify-center text-white shadow-lg neon-red-glow">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Upload Movie to Library</h2>
            <p className="text-xs text-cinema-muted">Supports MP4 & WebM. Movies over 3 hours supported with instant seeking.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-netflix-red/20 border border-netflix-red/30 flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Movie Added Successfully!</h3>
            <p className="text-xs text-cinema-muted mt-1">Ready to stream with your partner ❤️</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Video File Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
                Movie File (MP4 or WebM) *
              </label>
              <div className="relative border-2 border-dashed border-white/20 hover:border-romantic-pink/50 rounded-2xl p-4 text-center bg-cinema-darker/50 transition-colors">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/mkv"
                  onChange={handleMovieChange}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-romantic-pink mb-2" />
                  <p className="text-xs font-semibold text-white">
                    {movieFile ? movieFile.name : 'Click to select or drag and drop movie file'}
                  </p>
                  <p className="text-[11px] text-cinema-muted mt-0.5">
                    {movieFile
                      ? `${(movieFile.size / (1024 * 1024)).toFixed(1)} MB selected`
                      : 'MP4, WebM (up to 4GB)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Movie Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
                Movie Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. La La Land, Inception, Titanic"
                disabled={isUploading}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-cinema-darker border border-white/10 text-white text-sm focus:outline-none focus:border-romantic-pink"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
                  Duration (Optional)
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 2h 15m or 135 min"
                  disabled={isUploading}
                  className="w-full px-4 py-2.5 rounded-xl bg-cinema-darker border border-white/10 text-white text-sm focus:outline-none focus:border-romantic-pink"
                />
              </div>

              {/* Poster / Thumbnail Image */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
                  Poster Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbChange}
                  disabled={isUploading}
                  className="w-full text-xs text-cinema-muted file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
                Description / Romantic Note
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Add a romantic note or what this movie is about..."
                disabled={isUploading}
                className="w-full px-4 py-2 rounded-xl bg-cinema-darker border border-white/10 text-white text-xs focus:outline-none focus:border-romantic-pink resize-none"
              />
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-cinema-muted">
                  <span>Uploading to cinema storage...</span>
                  <span className="font-semibold text-white">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-netflix-red to-romantic-pink transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-cinema-muted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !movieFile}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-netflix-red to-romantic-pink text-white text-xs font-semibold shadow-lg hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading ({uploadProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload to Cinema</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UploadMovieModal;
