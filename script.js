const welcome = document.querySelector('#welcome');
const portal = document.querySelector('#portal');
const form = document.querySelector('#guest-form');
const nameInput = document.querySelector('#guest-name');
const guestDisplay = document.querySelector('#guest-display');
const error = document.querySelector('#form-error');
const toast = document.querySelector('#toast');
const journey = document.querySelector('#journey');
const journeyScene = document.querySelector('.journey-scene');
const journeySagar = document.querySelector('.journey-sagar');
const journeyNidhi = document.querySelector('.journey-nidhi');
const journeyTogether = document.querySelector('.journey-together');
const journeyWords = [...document.querySelectorAll('.journey-word')];
const invitationMusic = document.querySelector('#invitation-music');
const musicToggle = document.querySelector('#music-toggle');
const isSagarFamilyEdition = new URL(window.location.href).searchParams.get('family') === 'sagar';

function applyFamilyEdition() {
  if (!isSagarFamilyEdition) return;

  document.documentElement.classList.add('sagar-family-edition');
  document.title = 'Sagar & Nidhi — Wedding Invitation';
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'A personalized wedding invitation from Sagar and Nidhi.');
  document.querySelector('[data-couple-heading]').innerHTML = 'SAGAR &amp; NIDHI · 13 DECEMBER 2026';
  document.querySelectorAll('[data-couple-name]').forEach(element => { element.innerHTML = 'Sagar &amp; Nidhi'; });
  document.querySelector('[data-first-initial]').textContent = 'S';
  document.querySelector('[data-second-initial]').textContent = 'N';
  document.querySelector('[data-couple-name-group]').innerHTML = '<span>Sagar</span><i>&amp;</i><span>Nidhi</span>';
  document.querySelector('[data-closing-couple]').innerHTML = 'With love, Sagar &amp; Nidhi';
  document.querySelector('[data-footer-couple]').innerHTML = 'Sagar &amp; Nidhi • 13 December 2026';

  const familyIntroduction = document.querySelector('.family-introduction');
  const nidhiFamily = familyIntroduction.querySelector('[data-family="nidhi"]');
  const sagarFamily = familyIntroduction.querySelector('[data-family="sagar"]');
  const divider = familyIntroduction.querySelector('.family-divider');
  familyIntroduction.insertBefore(sagarFamily, divider);
  familyIntroduction.append(nidhiFamily);

  const brand = document.querySelector('.brand');
  brand.setAttribute('aria-label', 'Sagar and Nidhi invitation');
  document.querySelector('.header-story').setAttribute('aria-label', 'Sagar and Nidhi grow from babies to a couple as you scroll');
}

applyFamilyEdition();
invitationMusic.volume = 0.3;
let musicPausedByGuest = false;
function updateMusicControl() {
  const playing = !invitationMusic.paused;
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicToggle.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
  musicToggle.title = playing ? 'Pause background music' : 'Play background music';
  musicToggle.classList.toggle('is-playing', playing);
}
function playInvitationMusic() {
  musicPausedByGuest = false;
  invitationMusic.play().catch(() => {
    updateMusicControl();
  });
}
invitationMusic.addEventListener('play', () => {
  updateMusicControl();
});
invitationMusic.addEventListener('pause', updateMusicControl);
// Pause while the invitation is in the background, then resume when it
// becomes visible again. A pause chosen by the guest always takes priority.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (!musicPausedByGuest) invitationMusic.pause();
  } else if (!musicPausedByGuest && !portal.hidden) {
    invitationMusic.play().catch(updateMusicControl);
  }
});
window.addEventListener('pagehide', () => {
  if (!musicPausedByGuest) invitationMusic.pause();
});
window.addEventListener('pageshow', () => {
  if (!musicPausedByGuest && !portal.hidden) {
    invitationMusic.play().catch(updateMusicControl);
  }
});
musicToggle.addEventListener('click', () => {
  if (invitationMusic.paused) {
    musicPausedByGuest = false;
    invitationMusic.play().catch(() => showToast('Tap the music button again to start the song.'));
  } else {
    musicPausedByGuest = true;
    invitationMusic.pause();
  }
});

const cleanName = (value) => value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ease = (value) => 1 - Math.pow(1 - clamp(value), 3);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
}

let opening = false;
let openingTimer;
let leafTimer;
const seal = document.querySelector('.wax-seal');
const shower = document.querySelector('#bodhi-shower');
const status = document.querySelector('#opening-status');
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function scatterBodhiLeaves() {
  shower.replaceChildren();
  if (reduceMotion()) return;
  for (let i = 0; i < 26; i++) {
    const leaf = document.createElement('img');
    leaf.src = './assets/bodhi-leaf.png';
    leaf.alt = '';
    leaf.style.setProperty('--x', `${Math.random() * 100}%`);
    leaf.style.setProperty('--size', `${24 + Math.random() * 37}px`);
    leaf.style.setProperty('--drift', `${-110 + Math.random() * 220}px`);
    leaf.style.setProperty('--spin', `${-240 + Math.random() * 480}deg`);
    leaf.style.setProperty('--delay', `${Math.random() * 1.5}s`);
    leaf.style.setProperty('--duration', `${4 + Math.random() * 2.5}s`);
    shower.append(leaf);
  }
  clearTimeout(leafTimer);
  leafTimer = window.setTimeout(() => shower.replaceChildren(), 8500);
}

function openInvitation(name) {
  if (opening) return;
  const safeName = cleanName(name);
  if (!safeName) {
    error.textContent = 'Please enter your name to open the seal.';
    nameInput.setAttribute('aria-invalid', 'true');
    nameInput.focus();
    return;
  }
  opening = true;
  playInvitationMusic();
  seal.disabled = true;
  nameInput.readOnly = true;
  nameInput.removeAttribute('aria-invalid');
  guestDisplay.textContent = safeName;
  document.querySelector('#slip-name').textContent = `${safeName} & Family`;
  error.textContent = '';
  status.textContent = 'Opening your invitation…';
  welcome.classList.add('is-opening');
  try { sessionStorage.setItem('weddingGuest', safeName); } catch {}
  const url = new URL(window.location.href);
  url.searchParams.set('guest', safeName);
  history.replaceState({}, '', url);
  document.title = `${safeName} & Family — ${isSagarFamilyEdition ? 'Sagar & Nidhi' : 'Nidhi & Sagar'}`;
  scatterBodhiLeaves();
  openingTimer = window.setTimeout(() => {
    welcome.hidden = true;
    portal.hidden = false;
    portal.classList.add('reveal');
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('#guest-greeting').focus({ preventScroll: true });
    requestJourneyUpdate();
    opening = false;
  }, reduceMotion() ? 0 : 2100);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  openInvitation(nameInput.value);
});
nameInput.addEventListener('input', () => {
  error.textContent = '';
  nameInput.removeAttribute('aria-invalid');
});

document.querySelector('#change-name')?.addEventListener('click', () => {
  clearTimeout(openingTimer);
  clearTimeout(leafTimer);
  shower.replaceChildren();
  opening = false;
  seal.disabled = false;
  nameInput.readOnly = false;
  welcome.classList.remove('is-opening');
  status.textContent = '';
  portal.hidden = true;
  portal.classList.remove('reveal');
  welcome.hidden = false;
  nameInput.value = guestDisplay.textContent;
  window.scrollTo({ top: 0, behavior: 'instant' });
  nameInput.focus({ preventScroll: true });
  document.title = `${isSagarFamilyEdition ? 'Sagar & Nidhi' : 'Nidhi & Sagar'} — Wedding Invitation`;
  const url = new URL(window.location.href);
  url.searchParams.delete('guest');
  url.hash = '';
  history.replaceState({}, '', url);
});

document.querySelector('#share-link')?.addEventListener('click', async () => {
  const url = new URL(window.location.href);
  url.searchParams.set('guest', guestDisplay.textContent);
  try {
    await navigator.clipboard.writeText(url.toString());
    showToast('Personalized invitation link copied');
  } catch {
    window.prompt('Copy this personalized invitation link:', url.toString());
  }
});

document.querySelector('#back-to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


let journeyTicking = false;

function updateJourney() {
  journeyTicking = false;
  if (!journey || portal.hidden) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rect = journey.getBoundingClientRect();
  const navHeight = document.querySelector('.portal-nav').getBoundingClientRect().height;
  document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
  const travel = Math.max(1, journey.offsetHeight - journeyScene.offsetHeight);
  const progress = reducedMotion ? 1 : clamp((navHeight - rect.top) / travel);
  const approach = ease(progress / .7);
  const finalReveal = ease((progress - .76) / .16);
  const stageWidth = journeyScene.clientWidth;
  const inset = window.innerWidth <= 700 ? 8 : 12;
  const offsets = [journeySagar, journeyNidhi].map((person, index) => {
    const width = person.getBoundingClientRect().width;
    // Align the visible silhouette, not the transparent image canvas, to
    // the outer screen edge while keeping both portraits fully visible.
    const outerTransparentMargin = [221, 53][index] / 1024 * width;
    const start = Math.max(0, (stageWidth - width) / 2 + outerTransparentMargin - inset);
    const finish = Math.min(start, width * .35);
    return start - (start - finish) * approach;
  });
  journeyScene.style.setProperty('--journey-progress', progress.toFixed(3));
  journeyScene.style.setProperty('--sagar-x', `${-offsets[0]}px`);
  journeyScene.style.setProperty('--nidhi-x', `${offsets[1]}px`);
  journeySagar.style.opacity = String(1 - finalReveal);
  journeyNidhi.style.opacity = String(1 - finalReveal);
  journeyTogether.style.opacity = String(finalReveal);
  journeyTogether.style.transform = 'translateX(-50%)';
  const stage = document.querySelector('.journey-stage');
  const mobile = window.innerWidth <= 700;
  const stageHeight = stage.clientHeight;
  // Match the courtyard floor in the original garden, accounting for desktop cover cropping.
  const imageHeight = Math.max(stage.clientWidth / 1672, stageHeight / 941) * 941;
  const floorY = mobile
    ? stageHeight * .73
    : stageHeight / 2 + imageHeight * .38;
  const baseline = mobile
    ? Math.max(96, stageHeight - floorY)
    : Math.max(82, stageHeight - floorY);
  stage.style.setProperty('--ground-bottom', `${baseline}px`);
  // Anchor the complete statue/lotus to the raised platform in the same
  // cover-scaled background, independently of the couple's foreground floor.
  const backdropWidth = mobile ? 936 : 1672;
  const backdropHeight = mobile ? 1664 : 941;
  const backdropScale = Math.max(stageWidth / backdropWidth, stageHeight / backdropHeight);
  const platformY = mobile ? 1000 : 678;
  const platformScreenY = (stageHeight - backdropHeight * backdropScale) / 2 + platformY * backdropScale;
  stage.style.setProperty('--buddha-bottom', `${stageHeight - platformScreenY}px`);
  [journeySagar, journeyNidhi, journeyTogether].forEach((person, i) => {
    const renderedHeight = Math.min(person.clientHeight, person.clientWidth * 1.5);
    // The joined portrait has a larger transparent margin below the feet.
    const transparentBottom = [31, 33, 47][i] / 1536 * renderedHeight;
    person.style.bottom = `${baseline - transparentBottom}px`;
  });
  document.querySelector('.shadow-sagar').style.opacity = String(1 - finalReveal);
  document.querySelector('.shadow-nidhi').style.opacity = String(1 - finalReveal);
  document.querySelector('.shadow-together').style.opacity = String(finalReveal);


  const wordIndex = progress < .34 ? 0 : progress < .72 ? 1 : 2;
  journeyWords.forEach((word, index) => word.classList.toggle('active', index === wordIndex));
}

function requestJourneyUpdate() {
  if (journeyTicking) return;
  journeyTicking = true;
  requestAnimationFrame(updateJourney);
}

window.addEventListener('scroll', requestJourneyUpdate, { passive: true });
window.addEventListener('resize', requestJourneyUpdate);

// Personalized links prefill the envelope, preserving the opening experience.
const urlGuest = cleanName(new URLSearchParams(window.location.search).get('guest') || '');
let rememberedGuest = '';
try { rememberedGuest = cleanName(sessionStorage.getItem('weddingGuest') || ''); } catch {}
nameInput.value = urlGuest || rememberedGuest;
requestJourneyUpdate();

[journeySagar, journeyNidhi, journeyTogether].forEach(image => image.addEventListener('load', requestJourneyUpdate));
if ('ResizeObserver' in window) new ResizeObserver(requestJourneyUpdate).observe(document.querySelector('.portal-nav'));

// Wedding time is fixed to India, wherever a guest opens the invitation.
const weddingMoment = Date.parse('2026-12-13T17:00:00+05:30');
function updateCountdown(now = Date.now()) {
  const remaining = Math.max(0, Math.floor((weddingMoment - now) / 1000));
  const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
  ['days', 'hours', 'minutes', 'seconds'].forEach((unit, index) => {
    document.getElementById(`countdown-${unit}`).textContent = String(values[index]).padStart(2, '0');
  });
  document.getElementById('countdown-celebrate').hidden = remaining > 0;
}
updateCountdown();
let countdownInterval = window.setInterval(updateCountdown, 1000);
document.addEventListener('visibilitychange', () => {
  window.clearInterval(countdownInterval);
  if (!document.hidden) {
    updateCountdown();
    countdownInterval = window.setInterval(updateCountdown, 1000);
  }
});

