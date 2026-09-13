/**
 * A tiny, dependency-free confetti burst for the quick quiz's right answers.
 *
 * Deliberately self-contained: the celebration is a handful of seconds of
 * canvas, not worth a package. It draws one full-screen overlay, lets the
 * particles fall, and removes itself the moment the last one fades — no
 * lingering listeners or DOM. Users who ask for reduced motion get nothing,
 * which is the correct amount of confetti for them.
 */
const COLORS = [
  '#2563eb', // brand blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // rose
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
];

const GRAVITY = 0.22;
const DRAG = 0.995;

export function burstConfetti({ particleCount = 120, origin = { x: 0.5, y: 0.38 } } = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Celebrate nothing if the user has asked the OS to calm animations down.
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const spawnX = origin.x * window.innerWidth;
  const spawnY = origin.y * window.innerHeight;

  const particles = Array.from({ length: particleCount }, () => {
    // Fire mostly upward in a fan, then let gravity do the rest.
    const angle = (-90 + (Math.random() * 130 - 65)) * (Math.PI / 180);
    const speed = 6 + Math.random() * 9;
    return {
      x: spawnX,
      y: spawnY,
      vx: Math.cos(angle) * speed * (0.6 + Math.random() * 0.8),
      vy: Math.sin(angle) * speed,
      size: 6 + Math.random() * 6,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.32,
      life: 1,
      decay: 0.008 + Math.random() * 0.006,
      round: Math.random() < 0.5,
    };
  });

  let raf;
  let last = performance.now();

  const cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    canvas.remove();
  };

  const tick = (now) => {
    const dt = Math.min(2.5, (now - last) / 16.67);
    last = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = 0;
    for (const p of particles) {
      if (p.life <= 0) continue;

      p.vy += GRAVITY * dt;
      p.vx *= DRAG;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= p.decay * dt;

      // Gone off the bottom is as good as faded.
      if (p.life <= 0 || p.y - p.size > window.innerHeight) {
        p.life = 0;
        continue;
      }

      alive += 1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }

    if (alive > 0) raf = requestAnimationFrame(tick);
    else cleanup();
  };

  raf = requestAnimationFrame(tick);
}
