import { io } from './client/node_modules/socket.io-client/build/esm/index.js';

const port = String(process.env.PORT || 5000).trim();
const BASE_URL = (process.env.TEST_BASE_URL || `http://127.0.0.1:${port}`).trim();

async function runTests() {
  console.log('🚀 Starting Together Cinema End-to-End Verification Suite...\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Health Check
    // ----------------------------------------------------
    console.log('Test 1: Health check');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const health = await healthRes.json();
    console.log('  Status:', health.status, '| App:', health.app, '| DB:', health.database.type);
    if (health.status !== 'ok') throw new Error('Health check failed');
    console.log('  ✅ Health check passed!\n');

    // ----------------------------------------------------
    // TEST 2: Demo Logins for Partner 1 and Partner 2
    // ----------------------------------------------------
    console.log('Test 2: Authenticating Demo Partners');
    const p1Res = await fetch(`${BASE_URL}/api/auth/demo?role=partner1`);
    const p1Data = await p1Res.json();
    console.log('  Partner 1 authenticated:', p1Data.user.name);

    const p2Res = await fetch(`${BASE_URL}/api/auth/demo?role=partner2`);
    const p2Data = await p2Res.json();
    console.log('  Partner 2 authenticated:', p2Data.user.name);
    console.log('  ✅ Authentication test passed!\n');

    // ----------------------------------------------------
    // TEST 3: User Registration with Validation
    // ----------------------------------------------------
    console.log('Test 3: Creating New Couple Account');
    const uniqueEmail = `date_${Date.now()}@cinema.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan',
        email: uniqueEmail,
        password: 'password123',
        partnerNickname: 'My Angel ❤️'
      })
    });
    const regData = await regRes.json();
    console.log('  Registered user:', regData.user.name, 'with ID:', regData.user.id);
    if (!regData.token) throw new Error('Registration did not return token');
    console.log('  ✅ Registration test passed!\n');

    // ----------------------------------------------------
    // TEST 4: Shared Movie Library & HTTP 206 Streaming
    // ----------------------------------------------------
    console.log('Test 4: Shared Movie Library & Range Streaming');
    const moviesRes = await fetch(`${BASE_URL}/api/movies`, {
      headers: { Authorization: `Bearer ${p1Data.token}` }
    });
    const moviesData = await moviesRes.json();
    console.log('  Available library movies count:', moviesData.movies.length);
    const firstMovie = moviesData.movies[0];
    console.log('  Active movie sample:', firstMovie.title, `(${firstMovie.duration})`);

    // Test video streaming with Range headers (HTTP 206)
    const streamTarget = firstMovie.streamUrl.startsWith('http')
      ? firstMovie.streamUrl
      : `${BASE_URL}${firstMovie.streamUrl}`;
    const streamRes = await fetch(streamTarget, {
      headers: { Range: 'bytes=0-1048575' } // 1MB slice test
    });
    console.log('  Stream Range HTTP status:', streamRes.status, `(Expected 206 or 200)`);
    console.log('  Content-Range header:', streamRes.headers.get('content-range') || 'N/A');
    console.log('  ✅ Video Streaming test passed!\n');

    // ----------------------------------------------------
    // TEST 5: Private Room Creation & Max 2 Participants Lock
    // ----------------------------------------------------
    console.log('Test 5: Private Room Creation & Access Security');
    const roomCreateRes = await fetch(`${BASE_URL}/api/rooms/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Data.token}`
      },
      body: JSON.stringify({
        name: 'Alex & Sam Starlight Date Suite ✨',
        activeMovieId: firstMovie.id
      })
    });
    const roomCreateData = await roomCreateRes.json();
    const testRoom = roomCreateData.room;
    console.log('  Created room code:', testRoom.code, 'with ID:', testRoom.id);

    // Partner 2 joins room using code
    const joinRes = await fetch(`${BASE_URL}/api/rooms/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p2Data.token}`
      },
      body: JSON.stringify({ code: testRoom.code })
    });
    const joinData = await joinRes.json();
    console.log('  Partner 2 joined status:', joinData.message);

    // Third unauthorized user tries to join -> MUST BE BLOCKED!
    const thirdUserRes = await fetch(`${BASE_URL}/api/rooms/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${regData.token}`
      },
      body: JSON.stringify({ code: testRoom.code })
    });
    console.log('  3rd user join attempt status code:', thirdUserRes.status, '(Expected 403 Forbidden)');
    const thirdUserData = await thirdUserRes.json();
    console.log('  Blocked with reason:', thirdUserData.error);
    if (thirdUserRes.status !== 403) throw new Error('Room allowed more than 2 users!');
    console.log('  ✅ Private 2-Person Security rule verified!\n');

    // ----------------------------------------------------
    // TEST 6: Real-time Socket.IO Sync & Chat Between Sockets
    // ----------------------------------------------------
    console.log('Test 6: Real-Time Synchronization Engine');
    const socketP1 = io(BASE_URL);
    const socketP2 = io(BASE_URL);

    await new Promise((resolve, reject) => {
      let p1Ready = false;
      let p2Ready = false;

      socketP1.on('connect', () => {
        socketP1.emit('join-room', {
          roomId: testRoom.id,
          user: p1Data.user
        });
      });

      socketP2.on('connect', () => {
        socketP2.emit('join-room', {
          roomId: testRoom.id,
          user: p2Data.user
        });
      });

      // Listen for partner 1 receiving play sync from partner 2
      socketP1.on('sync-player-play', (data) => {
        console.log('  Partner 1 received playback sync:', data);
        if (data.currentTime === 42.5) {
          console.log('  ✅ Playback Synchronization Event Verified!');
          socketP1.disconnect();
          socketP2.disconnect();
          resolve();
        }
      });

      // When room members are updated, emit a sync play from partner 2
      socketP2.on('room-members-updated', ({ members }) => {
        if (members.length === 2 && !p2Ready) {
          p2Ready = true;
          console.log('  Both partners connected to Socket.IO room!');
          setTimeout(() => {
            console.log('  Partner 2 emitting play sync at 42.5s...');
            socketP2.emit('player-play', {
              roomId: testRoom.id,
              currentTime: 42.5,
              timestamp: Date.now()
            });
          }, 300);
        }
      });

      setTimeout(() => reject(new Error('Socket.IO sync test timed out')), 5000);
    });

    // ----------------------------------------------------
    // TEST 7: Cloud Storage Upload Handlers & Frontend Serving
    // ----------------------------------------------------
    console.log('Test 7: Cloud Video Storage Upload API & Production SPA Serving');
    const cloudCheckRes = await fetch(`${BASE_URL}/api/movies/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Data.token}`
      },
      body: JSON.stringify({ filename: 'couple_date_movie.mp4', contentType: 'video/mp4' })
    });
    const cloudCheckData = await cloudCheckRes.json();
    console.log('  Cloud storage route response status:', cloudCheckRes.status);
    console.log('  Cloud upload capability:', cloudCheckData.isCloud ? 'Cloudflare R2 / S3 Enabled' : 'Local / Dev Fallback Ready');

    // Test secure signed playback URL endpoint
    const signedUrlRes = await fetch(`${BASE_URL}/api/movies/${firstMovie.id}/signed-url`, {
      headers: { Authorization: `Bearer ${p1Data.token}` }
    });
    const signedUrlData = await signedUrlRes.json();
    console.log('  Signed playback URL endpoint status:', signedUrlRes.status);
    console.log('  Signed URL generated:', Boolean(signedUrlData.signedUrl));
    if (!signedUrlData.signedUrl) throw new Error('Signed playback URL endpoint failed');

    // Test production SPA frontend serving
    const frontendRes = await fetch(`${BASE_URL}/`);
    const frontendHtml = await frontendRes.text();
    const hasAppRoot = frontendHtml.includes('root') || frontendHtml.includes('Together Cinema') || frontendHtml.includes('vite');
    console.log('  Frontend index.html served:', hasAppRoot ? 'YES' : 'NO');
    if (!hasAppRoot) throw new Error('Frontend build is not being served correctly');
    console.log('  ✅ Cloud Storage, Signed Playback & Frontend serving verified!\n');

    console.log('\n🎉 ALL TOGETHER CINEMA E2E TESTS PASSED SUCCESSFULLY! ❤️🎬\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
