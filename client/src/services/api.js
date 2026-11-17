const API_BASE = '/api';

export const getAuthToken = () => {
  return localStorage.getItem('together_cinema_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('together_cinema_token', token);
  } else {
    localStorage.removeItem('together_cinema_token');
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    throw new Error('Cannot connect to server. Make sure the backend service is running.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = data.error || data.message || `Error ${response.status}`;
    const error = new Error(msg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const authApi = {
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (payload) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  demoLogin: (role) => apiRequest(`/auth/demo?role=${role}`),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (payload) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
};

export const roomApi = {
  create: (name, activeMovieId) => apiRequest('/rooms/create', {
    method: 'POST',
    body: JSON.stringify({ name, activeMovieId }),
  }),
  join: (code) => apiRequest('/rooms/join', {
    method: 'POST',
    body: JSON.stringify({ code }),
  }),
  get: (id) => apiRequest(`/rooms/${id}`),
  leave: (id) => apiRequest(`/rooms/${id}/leave`, {
    method: 'POST',
  }),
  setMovie: (id, movieId) => apiRequest(`/rooms/${id}/movie`, {
    method: 'PUT',
    body: JSON.stringify({ movieId }),
  }),
  getMyRooms: () => apiRequest('/rooms/my-rooms'),
};

export const movieApi = {
  getAll: (search = '') => apiRequest(`/movies${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getById: (id) => apiRequest(`/movies/${id}`),
  getSignedPlaybackUrl: (id) => apiRequest(`/movies/${id}/signed-url`),
  deleteMovie: (id) => apiRequest(`/movies/${id}`, {
    method: 'DELETE',
  }),

  // Cloud presigned upload helpers (Cloudflare R2 / AWS S3)
  getUploadUrl: (payload) => apiRequest('/movies/upload-url', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  confirmUpload: (payload) => apiRequest('/movies/confirm-upload', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Multipart upload helpers
  initiateMultipart: (payload) => apiRequest('/movies/multipart/initiate', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getPartUploadUrl: (payload) => apiRequest('/movies/multipart/part-url', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  completeMultipart: (payload) => apiRequest('/movies/multipart/complete', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  abortMultipart: (payload) => apiRequest('/movies/multipart/abort', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Direct client-to-cloud upload via presigned PUT URL
  uploadDirectToCloud: async (uploadUrl, file, contentType, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', contentType || file.type || 'video/mp4');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(true);
        } else {
          reject(new Error(`Cloud upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during cloud storage upload'));
      xhr.send(file);
    });
  },

  // Fallback server multipart upload
  uploadMovie: async (formData, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/movies/upload`);

      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(res);
          } else {
            reject(new Error(res.error || 'Upload failed'));
          }
        } catch (err) {
          reject(new Error('Invalid server response'));
        }
      };

      xhr.onerror = () => reject(new Error('Network upload failed'));
      xhr.send(formData);
    });
  },
};
