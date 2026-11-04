import { useEffect, useRef } from 'react';

/**
 * A slowly drifting network of nodes drawn behind the Home page header.
 * Nearby nodes are linked; a few links are directed (purple arrows), a nod to
 * causal graphs. Nodes drift gently away from the mouse.
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

const LINK = 120;

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
    const mouse = { x: -9999, y: -9999 };

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
      const count = Math.round(Math.min(70, Math.max(26, (w * h) / 9000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1.4 + Math.random() * 1.4,
        directed: Math.random() < 0.18,
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      const acc = css('--accent');
      const muted = css('--muted');
      for (const n of nodes) {
        if (!reduce) {
          const mx = n.x - mouse.x;
          const my = n.y - mouse.y;
          const m2 = mx * mx + my * my;
          if (m2 < 9000) {
            const f = 0.6 / Math.sqrt(m2 + 1);
            n.vx += mx * f * 0.02;
            n.vy += my * f * 0.02;
          }
          n.vx *= 0.995;
          n.vy *= 0.995;
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
          ctx!.globalAlpha = fade * (directed ? 0.55 : 0.22);
          ctx!.lineWidth = directed ? 1.2 : 0.8;
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
            ctx!.globalAlpha = fade * 0.7;
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
        ctx!.globalAlpha = n.directed ? 0.85 : 0.45;
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
    // The canvas ignores the pointer so links stay clickable; listen on the header instead.
    const host = canvas.parentElement;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    host?.addEventListener('pointermove', onMove);
    host?.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      host?.removeEventListener('pointermove', onMove);
      host?.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={ref} className="hero-bg" aria-hidden="true" />;
}
