import React, { useState, useEffect, useRef } from 'react';
import { Settings, Video, Mic, Sparkles, Check, Volume2, Shield } from 'lucide-react';

export const SettingsPage = () => {
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState('');
  const [selectedAudio, setSelectedAudio] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [streamQuality, setStreamQuality] = useState('1080p');
  const [enableSoundEffects, setEnableSoundEffects] = useState(true);
  const [enableHeartBursts, setEnableHeartBursts] = useState(true);

  const previewVideoRef = useRef(null);
  const streamRef = useRef(null);

  // Enumerate devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const vList = devices.filter((d) => d.kind === 'videoinput');
        const aList = devices.filter((d) => d.kind === 'audioinput');

        setVideoDevices(vList);
        setAudioDevices(aList);
        if (vList.length > 0) setSelectedVideo(vList[0].deviceId);
        if (aList.length > 0) setSelectedAudio(aList[0].deviceId);
      } catch (e) {
        console.warn('Device enumeration error:', e);
      }
    };
    getDevices();
  }, []);

  const testCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setCameraActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedVideo ? { deviceId: { exact: selectedVideo } } : true,
        audio: false,
      });
      streamRef.current = stream;
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      alert('Camera test failed: ' + err.message);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem(
      'together_cinema_settings',
      JSON.stringify({ streamQuality, enableSoundEffects, enableHeartBursts })
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-cinema-darkest text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-pink/15 text-romantic-pink text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5" /> Hardware & Experience
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Cinema Settings</h1>
          <p className="text-xs text-cinema-muted mt-1">
            Test your webcam and microphone, tune streaming quality, and configure romantic effects.
          </p>
        </div>

        {/* Camera & Microphone Diagnostic Panel */}
        <div className="glass-card rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-netflix-red" />
            <span>Webcam & Microphone Live Test</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Live Camera Preview Box */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={previewVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="text-center p-4">
                  <Video className="w-10 h-10 text-cinema-muted mx-auto mb-2 opacity-40" />
                  <p className="text-xs text-cinema-muted">Camera preview inactive</p>
                </div>
              )}

              <button
                type="button"
                onClick={testCamera}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-colors"
              >
                {cameraActive ? 'Turn Off Test' : 'Test Webcam'}
              </button>
            </div>

            {/* Device selection dropdowns */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
                  Camera Device
                </label>
                <select
                  value={selectedVideo}
                  onChange={(e) => setSelectedVideo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-cinema-darker border border-white/10 text-xs text-white focus:outline-none focus:border-romantic-pink"
                >
                  {videoDevices.length === 0 ? (
                    <option value="">Default System Camera</option>
                  ) : (
                    videoDevices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Camera ${i + 1}`}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
                  Microphone Device
                </label>
                <select
                  value={selectedAudio}
                  onChange={(e) => setSelectedAudio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-cinema-darker border border-white/10 text-xs text-white focus:outline-none focus:border-romantic-pink"
                >
                  {audioDevices.length === 0 ? (
                    <option value="">Default System Microphone</option>
                  ) : (
                    audioDevices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Microphone ${i + 1}`}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>WebRTC streams are peer-to-peer encrypted directly between both devices.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Playback & Experience Preferences */}
        <div className="glass-card rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-romantic-pink" />
            <span>Streaming & Romantic Preferences</span>
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-2">
                Preferred Streaming Quality
              </label>
              <div className="flex flex-wrap gap-3">
                {['720p HD', '1080p Full HD', 'Auto Adaptation'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setStreamQuality(q)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      streamQuality === q
                        ? 'bg-gradient-to-r from-netflix-red to-romantic-pink text-white shadow-md'
                        : 'bg-cinema-darker border border-white/10 text-cinema-muted hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableHeartBursts}
                  onChange={(e) => setEnableHeartBursts(e.target.checked)}
                  className="w-4 h-4 accent-romantic-pink rounded"
                />
                <span className="text-xs text-white">Enable floating heart animations on date reactions</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSoundEffects}
                  onChange={(e) => setEnableSoundEffects(e.target.checked)}
                  className="w-4 h-4 accent-romantic-pink rounded"
                />
                <span className="text-xs text-white">Enable romantic date start celebration alert</span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all flex items-center gap-2"
              >
                {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : null}
                <span>{savedSuccess ? 'Preferences Saved!' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
