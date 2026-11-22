(() => {
  const portal = document.getElementById('portal');
  const track = document.querySelector('.header-story');
  if (!portal || !track) return;
  const holder = track.querySelector('.story-frames');
  const names = ['Little strangers', 'Separate little worlds', 'Growing up', 'Our paths meet', 'A little mischief', 'Oops', 'Her turn', 'Forever together'];
  const frames = names.map((name, phase) => {
    const frame = document.createElement('div');
    frame.className = 'story-frame';
    frame.dataset.phase = phase;
    const parts = phase < 3 ? ['sagar', 'nidhi'] : ['couple'];
    parts.forEach(part => {
      const img = new Image();
      img.src = `./assets/header-story-${phase}-${part}.webp`;
      img.alt = ''; img.decoding = 'async';
      img.className = `story-${part}`;
      frame.append(img);
    });
    holder.append(frame);
    return frame;
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  let lastLabel = -1;
  const clamp = value => Math.min(1, Math.max(0, value));
  function draw() {
    queued = false;
    if (portal.hidden) return;
    const start = portal.getBoundingClientRect().top + scrollY;
    const range = Math.max(1, document.documentElement.scrollHeight - innerHeight - start);
    const progress = clamp((scrollY - start) / range);
    // Reach the wedding pose before the final note, so it stays visible at the end.
    const timeline = Math.min(7, progress * 7.8);
    const phase = Math.floor(timeline);
    const fraction = timeline - phase;
    const blend = reduced.matches ? 0 : clamp((fraction - .72) / .28);
    frames.forEach((frame, index) => {
      frame.style.opacity = index === phase ? String(1 - blend) : index === phase + 1 ? String(blend) : '0';
      if (index < 3) {
        const approach = clamp(timeline / 3);
        frame.children[0].style.left = `${12 + 19 * approach}%`;
        frame.children[1].style.left = `${88 - 19 * approach}%`;
      } else {
        const travel = clamp((timeline - 3) / 4);
        // Couple travels left to right; final embrace rests near the right end.
        frame.children[0].style.left = `${28 + 44 * travel}%`;
        const bob = !reduced.matches && (index === 4 || index === 6) ? Math.sin(progress * 120) * 1.2 : 0;
        frame.children[0].style.transform = `translate(-50%, ${bob}px)`;
      }
    });
    if (phase !== lastLabel) {
      track.setAttribute('aria-label', `Nidhi and Sagar: ${names[phase]}`);
      lastLabel = phase;
    }
  }
  function requestDraw() { if (!queued) { queued = true; requestAnimationFrame(draw); } }
  addEventListener('scroll', requestDraw, { passive: true });
  addEventListener('resize', requestDraw, { passive: true });
  addEventListener('pageshow', requestDraw);
  reduced.addEventListener('change', requestDraw);
  new MutationObserver(requestDraw).observe(portal, { attributes: true, attributeFilter: ['hidden'] });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(requestDraw).observe(portal);
  requestDraw();
})();
