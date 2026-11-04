import { useEffect, useRef } from 'react';

/**
 * A quiet, slowly drifting network of nodes drawn behind the Home page header.
 * Nearby nodes are linked; a few links are directed (purple arrows), a light nod
 * to causal graphs. Deliberately faint and slow so it reads as texture.
 * Pauses when off screen or in a background tab; static if reduced motion is on.
 */
interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  directed: boolean;
}

const LINK = 110;

export default function NetworkBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let nodes: Node[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;

    const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

    function fit() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas!.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      fit();
      const count = Math.round(Math.min(40, Math.max(14, (w * h) / 16000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: 1.1 + Math.random() * 1.1,
        directed: Math.random() < 0.15,
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      const acc = css('--accent');
      const muted = css('--muted');
      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
        }
      }
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const p = nodes[a];
          const q = nodes[b];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > LINK) continue;
          const fade = 1 - d / LINK;
          const directed = p.directed && !q.directed;
          ctx!.strokeStyle = directed ? acc : muted;
          ctx!.globalAlpha = fade * (directed ? 0.32 : 0.12);
          ctx!.lineWidth = directed ? 1 : 0.7;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(q.x, q.y);
          ctx!.stroke();
          if (directed && d > 24) {
            const ux = (q.x - p.x) / d;
            const uy = (q.y - p.y) / d;
            const hx = q.x - ux * 6;
            const hy = q.y - uy * 6;
            ctx!.fillStyle = acc;
            ctx!.globalAlpha = fade * 0.4;
            ctx!.beginPath();
            ctx!.moveTo(hx, hy);
            ctx!.lineTo(hx - ux * 5 - uy * 3, hy - uy * 5 + ux * 3);
            ctx!.lineTo(hx - ux * 5 + uy * 3, hy - uy * 5 - ux * 3);
            ctx!.closePath();
            ctx!.fill();
          }
        }
      }
      for (const n of nodes) {
        ctx!.globalAlpha = n.directed ? 0.5 : 0.25;
        ctx!.fillStyle = n.directed ? acc : muted;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    function loop() {
      if (visible && !document.hidden) draw();
      raf = requestAnimationFrame(loop);
    }

    init();
    draw();
    if (!reduce) raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);
    const onResize = () => {
      init();
      draw();
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={ref} className="hero-bg" aria-hidden="true" />;
}
