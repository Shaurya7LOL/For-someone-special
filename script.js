const sky = document.querySelector('#starfield');
const skyContext = sky?.getContext('2d');
const cursorGlow = document.querySelector('#cursor-glow');
const starPicks = document.querySelectorAll('.star-pick');
const songLibrary = Array.isArray(window.MISTHI_SONGS) ? window.MISTHI_SONGS : [];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let stars = [];
let shootingStar = null;
let nextShootingStar = 0;
let animationFrame = 0;
let lastCompliment = -1;

// EDIT THESE TAREEFS OR ADD YOUR OWN. The star buttons and the final button
// pick from this list, so adding a line here adds another possible surprise.
const compliments = [
  'Tumhari smile dekh ke stars bhi sochte honge: okay, competition tough hai. ✨',
  'Official notice: Misthi is 100% adorable, 1000% loved, and objectively the best Bacchi. ♡',
  'Tum itni lovely ho ki compliment dene ke liye dictionary ko update karna padega. 📚',
  'Tum ho toh boring din bhi thode magical lagte hain. 🌙',
  'Tumhara dil itna pyaara hai, uske liye alag galaxy reserve honi chahiye. 💗',
  'Cutie alert! Misthi ne global standards for being wonderful raise kar diye hain. ✨',
  'Tumhari smile meri favourite constellation hai. 💫',
  'Itni kind ho tum, dil ko hug jaisa feel hota hai. 💗',
  'Tum funny, sweet, smart—matlab full combo offer ho, Bacchi. 😌',
  'Tum room mein aao toh vibe automatically 10/10 ho jaati hai. ♡',
  'Tumhari cuteness ka koi scientific explanation nahi. 🪐',
  'Best-friend lottery jeeti hai maine. Prize: YOU. 🏆',
  'Tum jaise ho, bilkul waise hi bohot hi kamaal ho. 💫',
  'Agar kindness ka crown hota, tumhara naam already engraved hota. 👑',
  'Universe ne tumhe banaya, phir bola: nailed it. ✨',
  'Misthi, tum genuinely one of one ho. No copy, no replacement. 💞',
  'Tum meri favourite notification, favourite laugh, favourite person ho. Bas. 💌',
  'Tumhara dil softest hai, aur tumhari himmat usse bhi zyada strong. 💖',
  'Tumhari presence se har jagah thodi zyada cozy lagti hai. ☁️',
  'You are the human version of a warm hug and a perfect playlist. 🎶',
  'Tumhari energy itni pyaari hai, moon bhi tumse tips leta hoga. 🌙',
  'Smart, kind, hilarious, adorable. Misthi, save some main-character qualities for baaki log. 😭',
  'Tumse baat karna is my favourite little serotonin subscription. 💫',
  'The universe really showed off when it made you, Bacchi. ✨',
  'Tumhara naam Misthi hai, par tum toh poori mithaas ka premium pack ho. 🍬',
  'Your heart has five-star reviews from everyone lucky enough to know you. ⭐',
  'Agar best friend ka trophy hota, tum already lifetime champion hoti. 🏆',
  'Tumhari silly side is a national treasure. Please protect it at all costs. 😌',
  'Tumhari kindness quietly makes people feel seen. That is a superpower. 💗',
  'Tumhari aankhon mein starlight, baaton mein magic, aur dil mein pure gold hai. ✨',
  'If being lovable was an Olympic sport, tum gold leke bhi cute sa wave karti. 🥇',
  'Tum itni special ho, “special” word ko bhi tumse compliment milta hai. 💞',
  'Meri life ke best people list mein tumhara naam bold, italic, highlighted hai. 📝',
  'Tumhari laugh sunke lagta hai, haan, universe thoda theek chal raha hai. 💫',
  'Tum ek walking reminder ho ki good people and good vibes really exist. 🌷',
  'Tumhare jaisa best friend milna pure luck nahi—meri life ka jackpot hai. 🎉',
  'You deserve a standing ovation for simply being your lovely self. 👏',
  'Tumhari kindness ka Wi-Fi hota toh duniya ka signal full bars hota. 📶',
  'Bacchi, tumhari cuteness ke against koi fair competition hi nahi. ♡',
  'Tumhari imagination, tumhara humour, tumhara heart—sab kuch top tier. 💫',
  'Tumhare liye tareef likhne baithi, abhi tak end hi nahi aaya. Very on brand. 😭',
  'Bestie ho ya secret superpower? Because you make everything better. 🦸‍♀️',
  'Tumhari vibe: rare, lovely, unforgettable. Bilkul tumhari tarah. 💎',
  'Aaj ka official star report: Misthi is the brightest cutie in this whole sky. 🌟',
  'Tum meri favourite ho. Is fact pe koi debate, poll, ya recount allowed nahi. 😌',
  'Tum pyaari bhi, thoughtful bhi, funny bhi. Universe ne ek hi baar mein sab daal diya. 💝',
  'You make friendship feel easy, safe, warm, and full of laughs. Lucky me. 💗',
  'Tumhari smile ke saamne moon bhi thoda dim ho jaata hai. 🌙',
  'Agar tum ek star hoti, toh baaki saare stars tumhe follow karte. ✨',
  'Misthi, tum simply wonderful ho. No reason needed. No edits needed. ♡'
];

const moonMessages = [
  'Moon ka official verdict: Misthi is impossibly, astronomically adorable. 🌙',
  'Moon abhi bhi tumhe hi dekh raha hai, Bacchi. Bas keh raha hoon. ✨',
  'Chaand ne bola tumhari smile ko thoda kam glow karne bolo. Usko insecurity ho rahi hai. 😌'
];

function resizeSky() {
  if (!sky || !skyContext) return;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  sky.width = Math.floor(window.innerWidth * pixelRatio);
  sky.height = Math.floor(window.innerHeight * pixelRatio);
  skyContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  stars = Array.from({ length: Math.min(360, Math.floor(window.innerWidth * window.innerHeight / 5000)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.5 + 0.35,
    phase: Math.random() * Math.PI * 2,
    rate: Math.random() * 0.0009 + 0.00025,
    drift: Math.random() * 0.12 + 0.02,
    hue: Math.random() > 0.8 ? (Math.random() > 0.5 ? '#ffd3e2' : '#bfd7ff') : '#ffffff'
  }));
  if (reducedMotion) drawSky(0);
}

function drawSky(time) {
  if (!skyContext) return;
  skyContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  stars.forEach((star) => {
    const shimmer = reducedMotion ? 0.85 : 0.48 + (Math.sin(time * star.rate + star.phase) + 1) * 0.25;
    star.y -= reducedMotion ? 0 : star.drift;
    if (star.y < -2) star.y = window.innerHeight + 2;
    skyContext.globalAlpha = shimmer;
    skyContext.fillStyle = star.hue;
    skyContext.beginPath();
    skyContext.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    skyContext.fill();
    if (star.radius > 1.4 && shimmer > 0.82) {
      skyContext.globalAlpha = shimmer * 0.25;
      skyContext.beginPath();
      skyContext.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
      skyContext.fill();
    }
  });
  skyContext.globalAlpha = 1;

  if (shootingStar) {
    const progress = (time - shootingStar.start) / shootingStar.duration;
    if (progress >= 1) shootingStar = null;
    else {
      const x = shootingStar.x + progress * shootingStar.distance;
      const y = shootingStar.y + progress * shootingStar.distance * 0.38;
      const tail = skyContext.createLinearGradient(x - 110, y - 42, x, y);
      tail.addColorStop(0, 'rgba(202,218,255,0)');
      tail.addColorStop(1, `rgba(255,231,214,${Math.sin(progress * Math.PI) * 0.95})`);
      skyContext.strokeStyle = tail;
      skyContext.lineWidth = 1.7;
      skyContext.beginPath();
      skyContext.moveTo(x - 110, y - 42);
      skyContext.lineTo(x, y);
      skyContext.stroke();
    }
  } else if (!reducedMotion && time > nextShootingStar) {
    shootingStar = { x: Math.random() * window.innerWidth * 0.72, y: Math.random() * window.innerHeight * 0.35, distance: 250 + Math.random() * 220, duration: 750, start: time };
    nextShootingStar = time + 4300 + Math.random() * 5000;
  }
  if (!reducedMotion) animationFrame = window.requestAnimationFrame(drawSky);
}

function startSky() {
  if (!sky || !skyContext) return;
  window.cancelAnimationFrame(animationFrame);
  resizeSky();
  if (!reducedMotion) animationFrame = window.requestAnimationFrame(drawSky);
}

function launchComets() {
  const colors = ['#ffd7e6', '#ffe6aa', '#c4d9ff', '#e0caff', '#bbf0df'];
  const dx = window.innerWidth + 400;
  const dy = -window.innerHeight * 0.64;
  const angle = `${Math.atan2(dy, dx) * (180 / Math.PI)}deg`;
  for (let i = 0; i < 6; i += 1) {
    const comet = document.createElement('span');
    comet.className = 'comet';
    comet.setAttribute('aria-hidden', 'true');
    comet.style.setProperty('--comet-top', `${window.innerHeight * (0.66 + i * 0.045)}px`);
    comet.style.setProperty('--comet-delay', `${i * 85 + Math.random() * 140}ms`);
    comet.style.setProperty('--comet-duration', `${1.15 + Math.random() * 0.7}s`);
    comet.style.setProperty('--comet-dx', `${dx}px`);
    comet.style.setProperty('--comet-dy', `${dy}px`);
    comet.style.setProperty('--comet-angle', angle);
    comet.style.setProperty('--comet-color', colors[Math.floor(Math.random() * colors.length)]);
    comet.style.setProperty('--comet-length', '130px');
    document.body.append(comet);
    window.setTimeout(() => comet.remove(), 2500);
  }
}

function showRandomCompliment(target) {
  if (!target) return;
  let next = Math.floor(Math.random() * compliments.length);
  if (compliments.length > 1 && next === lastCompliment) next = (next + 1) % compliments.length;
  lastCompliment = next;
  target.textContent = compliments[next];
}

// One click handler keeps all current and future buttons working consistently.
document.addEventListener('click', (event) => {
  const clicked = event.target instanceof Element ? event.target : event.target?.parentElement;
  const control = clicked?.closest('button, a.button');
  if (!control) return;

  if (control.id === 'open-letter') {
    const letterBody = document.querySelector('#letter-body');
    const isOpen = control.getAttribute('aria-expanded') === 'true';
    control.setAttribute('aria-expanded', String(!isOpen));
    if (letterBody) letterBody.hidden = isOpen;
    control.innerHTML = isOpen
      ? 'Open your little letter <span aria-hidden="true">↗</span>'
      : 'Fold the letter back up <span aria-hidden="true">♡</span>';
    if (!isOpen) letterBody?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else if (control.id === 'joy-button') {
    showRandomCompliment(document.querySelector('#joy-message'));
  } else if (control.classList.contains('star-pick')) {
    document.querySelectorAll('.star-pick').forEach((star) => {
      const selected = star === control;
      star.classList.toggle('is-picked', selected);
      star.setAttribute('aria-pressed', String(selected));
    });
    showRandomCompliment(document.querySelector('#compliment-message'));
  } else if (control.id === 'moon-button') {
    const glowing = control.getAttribute('aria-pressed') !== 'true';
    control.setAttribute('aria-pressed', String(glowing));
    control.classList.toggle('is-glowing', glowing);
    const moonMessage = document.querySelector('#moon-message');
    if (moonMessage) moonMessage.textContent = moonMessages[Math.floor(Math.random() * moonMessages.length)];
  } else if (control.id === 'wish-button') {
    const message = document.querySelector('#compliment-message');
    if (message) message.textContent = 'Wish maang li? Universe ne suna. Ab tumhari khushi ka full-time fan club bhi ready hai. 💫';
  } else if (control.id === 'choose-song') {
    const songMenu = document.querySelector('#song-menu');
    if (songMenu) {
      songMenu.hidden = !songMenu.hidden;
      control.setAttribute('aria-expanded', String(!songMenu.hidden));
    }
  } else if (control.classList.contains('song-option')) {
    const track = songLibrary[Number(control.dataset.songIndex)];
    if (track) selectSong(track);
  } else if (control.id === 'music-toggle') {
    toggleMusic();
  } else if (control.id === 'music-mute') {
    toggleMute();
  }

  // Motion is decorative; even if it fails, the clicked action above still works.
  try { launchComets(); } catch { /* Keep the page controls usable. */ }
});

const musicPlayer = document.querySelector('#music-player');
const songStatus = document.querySelector('#song-status');
const songMenu = document.querySelector('#song-menu');
const chooseSongButton = document.querySelector('#choose-song');
const songPlayer = document.querySelector('.song-player');
const musicToggle = document.querySelector('#music-toggle');
const musicSeek = document.querySelector('#music-seek');
const musicCurrent = document.querySelector('#music-current');
const musicDuration = document.querySelector('#music-duration');
const musicMute = document.querySelector('#music-mute');
const musicVolume = document.querySelector('#music-volume');
let previousVolume = 0.8;

function renderSongLibrary() {
  if (!songMenu) return;
  songMenu.replaceChildren();
  if (!songLibrary.length) {
    const empty = document.createElement('p');
    empty.className = 'song-empty';
    empty.textContent = 'No songs added yet. Add tracks to music/ and list them in song-library.js. ♡';
    songMenu.append(empty);
    return;
  }
  songLibrary.forEach((track, index) => {
    const option = document.createElement('button');
    option.className = 'song-option';
    option.type = 'button';
    option.dataset.songIndex = String(index);
    option.textContent = track.title || `Song ${index + 1}`;
    songMenu.append(option);
  });
}

function selectSong(track) {
  if (!musicPlayer || !track?.src) return;
  musicPlayer.pause();
  musicPlayer.src = track.src;
  musicPlayer.load();
  updateMusicTimeline();
  syncPlayButton();
  if (songStatus) songStatus.textContent = `Selected: ${track.title || 'your song'} — press play when you’re ready. ♫`;
  if (songMenu) songMenu.hidden = true;
  chooseSongButton?.setAttribute('aria-expanded', 'false');
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateMusicTimeline() {
  if (!musicPlayer || !musicSeek) return;
  const duration = Number.isFinite(musicPlayer.duration) ? musicPlayer.duration : 0;
  const progress = duration ? (musicPlayer.currentTime / duration) * 100 : 0;
  musicSeek.disabled = duration <= 0;
  musicSeek.value = String(progress);
  musicSeek.style.setProperty('--range-fill', `${progress}%`);
  if (musicCurrent) musicCurrent.textContent = formatTime(musicPlayer.currentTime);
  if (musicDuration) musicDuration.textContent = formatTime(duration);
}

function syncPlayButton() {
  if (!musicPlayer || !musicToggle) return;
  const playing = !musicPlayer.paused && !musicPlayer.ended;
  musicToggle.setAttribute('aria-label', playing ? 'Pause song' : 'Play song');
  musicToggle.title = playing ? 'Pause' : 'Play';
  songPlayer?.classList.toggle('is-playing', playing);
}

function toggleMusic() {
  if (!musicPlayer) return;
  if (musicPlayer.paused) {
    musicPlayer.play().catch(() => {
      if (songStatus) songStatus.textContent = 'Choose her song first, then press play. ♡';
    });
  } else {
    musicPlayer.pause();
  }
}

function toggleMute() {
  if (!musicPlayer || !musicMute) return;
  if (musicPlayer.muted || musicPlayer.volume === 0) {
    musicPlayer.muted = false;
    if (musicPlayer.volume === 0) musicPlayer.volume = previousVolume || 0.8;
    if (musicVolume) musicVolume.value = String(musicPlayer.volume);
    musicVolume?.style.setProperty('--range-fill', `${musicPlayer.volume * 100}%`);
  } else {
    previousVolume = musicPlayer.volume;
    musicPlayer.muted = true;
  }
  musicMute.setAttribute('aria-label', musicPlayer.muted ? 'Unmute' : 'Mute');
  musicMute.title = musicPlayer.muted ? 'Unmute' : 'Mute';
  songPlayer?.classList.toggle('is-muted', musicPlayer.muted);
}

musicPlayer?.addEventListener('play', syncPlayButton);
musicPlayer?.addEventListener('pause', syncPlayButton);
musicPlayer?.addEventListener('ended', syncPlayButton);
musicPlayer?.addEventListener('timeupdate', updateMusicTimeline);
musicPlayer?.addEventListener('loadedmetadata', updateMusicTimeline);
musicPlayer?.addEventListener('durationchange', updateMusicTimeline);

musicSeek?.addEventListener('input', () => {
  if (!musicPlayer || !Number.isFinite(musicPlayer.duration)) return;
  musicPlayer.currentTime = (Number(musicSeek.value) / 100) * musicPlayer.duration;
  updateMusicTimeline();
});

musicVolume?.addEventListener('input', () => {
  if (!musicPlayer || !musicVolume) return;
  musicPlayer.volume = Number(musicVolume.value);
  if (musicPlayer.volume > 0) previousVolume = musicPlayer.volume;
  musicPlayer.muted = musicPlayer.volume === 0;
  musicVolume.style.setProperty('--range-fill', `${musicVolume.value * 100}%`);
  songPlayer?.classList.toggle('is-muted', musicPlayer.muted);
  if (musicMute) {
    musicMute.setAttribute('aria-label', musicPlayer.muted ? 'Unmute' : 'Mute');
    musicMute.title = musicPlayer.muted ? 'Unmute' : 'Mute';
  }
});

musicPlayer.volume = musicVolume ? Number(musicVolume.value) : 0.8;
musicVolume?.style.setProperty('--range-fill', `${musicVolume.value * 100}%`);

musicPlayer?.addEventListener('error', () => {
  if (songStatus) songStatus.textContent = 'Couldn’t load this track. Check its path in song-library.js. ♡';
});

window.addEventListener('resize', startSky, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) window.cancelAnimationFrame(animationFrame);
  else if (!reducedMotion) animationFrame = window.requestAnimationFrame(drawSky);
});

window.addEventListener('pointermove', (event) => {
  if (!cursorGlow || event.pointerType === 'touch') return;
  cursorGlow.style.setProperty('--pointer-x', `${event.clientX}px`);
  cursorGlow.style.setProperty('--pointer-y', `${event.clientY}px`);
  cursorGlow.classList.add('is-visible');
}, { passive: true });

window.addEventListener('pointerout', (event) => {
  if (event.relatedTarget === null) cursorGlow?.classList.remove('is-visible');
});

document.querySelectorAll('.star-pick').forEach((star) => star.setAttribute('aria-pressed', 'false'));
renderSongLibrary();
startSky();
