import { useEffect, useRef } from 'react';

/**
 * Interactive demo: under data sparsity and regime shift, correlation breaks and causality holds.
 *
 * Mechanism (never changes):  Y_t = 0.9 * X_{t-3} + noise
 * Regime A:  Z_t = X_t + noise   (Z is a proxy: correlated with Y, not a cause)
 * Regime B:  Z_t decouples from X
 * Sparse:    Y is only reported every SPARSE_EVERY steps
 * Both models are re-fit every step on the reported points in a sliding window:
 *   Causal model:      Y ~ X_{t-3}                    (1 coefficient)
 *   Correlation model: Y ~ Z_{t-1..t-10} + intercept  (11 coefficients)
 *
 * Everything is drawn imperatively on a canvas; React only renders the static frame.
 * The animation runs only while the demo is on screen, and not at all with reduced motion.
 */

interface Scenario {
  x: string;
  z: string;
  y: string;
  a: string;
  b: string;
  sp: string;
  before: string;
  after: string;
  sparse: string;
  lc: string;
  lr: string;
  la: string;
}

const C = (t: string) => `<span style="color:var(--accent)">${t}</span>`;
const O = (t: string) => `<span style="color:var(--accent-2)">${t}</span>`;

const SCEN: Record<string, Scenario> = {
  health: {
    x: 'Mobility', z: 'Reported tests', y: 'Cases',
    a: 'tests track mobility', b: 'testing policy changed', sp: 'cases reported weekly',
    before: 'Before the shift, reported tests and cases are strongly correlated, because both follow mobility, even though tests do not drive cases. So both forecasts track cases closely. Try <em>Trigger regime shift</em> or <em>Make data sparse</em>.',
    after: `Reported tests no longer follow mobility, so their correlation with cases disappears. The ${O('correlation forecast')} drifts, while the ${C('causal forecast')} still follows the mechanism: mobility three steps earlier drives cases.`,
    sparse: `Cases are now only reported every few days (dots). The ${O('correlation model')} must learn eleven coefficients from a handful of reports and turns erratic; the ${C('causal model')} needs only one, the effect of mobility three steps earlier, and stays steady.`,
    lc: 'Causal forecast (mobility, lag 3)', lr: 'Correlation forecast (reported tests)', la: 'Actual cases',
  },
  water: {
    x: 'Upstream rainfall', z: 'Reservoir release', y: 'River flow',
    a: 'releases follow rainfall', b: 'drought operating rules', sp: 'flow gauged rarely',
    before: 'Before the shift, reservoir release and river flow are strongly correlated, because both follow upstream rainfall, even though releases do not drive the flow here. So both forecasts look right. Try <em>Trigger regime shift</em> or <em>Make data sparse</em>.',
    after: `Drought rules change how the reservoir is operated, so releases stop following rainfall and their correlation with river flow disappears. The ${O('correlation forecast')} drifts, while the ${C('causal forecast')} still follows the mechanism: upstream rainfall three steps earlier drives river flow.`,
    sparse: `River flow is now only measured every few steps (dots), as at a remote or data-poor gauge. The ${O('correlation model')} overfits the few measurements; the ${C('causal model')} needs one coefficient, the effect of rainfall three steps earlier, and stays steady.`,
    lc: 'Causal forecast (rainfall, lag 3)', lr: 'Correlation forecast (reservoir release)', la: 'Actual river flow',
  },
  finance: {
    x: 'Consumer spending', z: 'Stock index', y: 'Retail revenue',
    a: 'stocks track spending', b: 'market shock', sp: 'revenue reported quarterly',
    before: 'Before the shift, the stock index and retail revenue are strongly correlated, because both follow consumer spending, even though the index does not drive revenue. So both forecasts look right. Try <em>Trigger regime shift</em> or <em>Make data sparse</em>.',
    after: `A market shock moves the stock index for reasons unrelated to spending, so its correlation with retail revenue disappears. The ${O('correlation forecast')} drifts, while the ${C('causal forecast')} still follows the mechanism: consumer spending three steps earlier drives retail revenue.`,
    sparse: `Retail revenue is now only reported quarterly (dots). The ${O('correlation model')} must learn eleven coefficients from a handful of reports and turns erratic; the ${C('causal model')} needs only one, the effect of spending three steps earlier, and stays steady.`,
    lc: 'Causal forecast (spending, lag 3)', lr: 'Correlation forecast (stock index)', la: 'Actual retail revenue',
  },
  energy: {
    x: 'Temperature', z: 'Solar output', y: 'Power demand',
    a: 'solar tracks temperature', b: 'new solar capacity', sp: 'demand metered rarely',
    before: 'Before the shift, solar output and power demand are strongly correlated, because both follow temperature, even though solar output does not drive demand. So both forecasts look right. Try <em>Trigger regime shift</em> or <em>Make data sparse</em>.',
    after: `New solar panels come online, so solar output changes for reasons unrelated to temperature and its correlation with demand disappears. The ${O('correlation forecast')} drifts, while the ${C('causal forecast')} still follows the mechanism: temperature three hours earlier drives power demand (cooling and heating load).`,
    sparse: `Power demand is now only metered every few hours (dots). The ${O('correlation model')} must learn eleven coefficients from a handful of readings and turns erratic; the ${C('causal model')} needs only one, the effect of temperature three hours earlier, and stays steady.`,
    lc: 'Causal forecast (temperature, lag 3)', lr: 'Correlation forecast (solar output)', la: 'Actual power demand',
  },
  temporal: {
    x: 'Cause X', z: 'Proxy Z', y: 'Target Y',
    a: 'Z tracks X', b: 'Z decoupled', sp: 'Y observed sparsely',
    before: 'Before the shift, Z and Y are strongly correlated, because both are driven by X, even though Z does not affect Y. So a correlation model and a causal model forecast Y equally well. Try <em>Trigger regime shift</em> or <em>Make data sparse</em>.',
    after: `Z no longer moves with X, so its correlation with Y disappears. The ${O('correlation forecast')}, which relied on Z, drifts; the ${C('causal forecast')} uses the invariant mechanism X → Y (lag 3) and holds.`,
    sparse: `Y is now only observed every few steps (dots). Learning eleven correlational coefficients from so few points makes the ${O('correlation forecast')} erratic; the ${C('causal forecast')} estimates a single coefficient, X → Y at lag 3, and stays steady.`,
    lc: 'Causal forecast (X, lag 3)', lr: 'Correlation forecast (Z)', la: 'Actual Y',
  },
};

const WINDOW = 90;
const LAG = 3;
const ERR_WIN = 20;
const TRAIN = 70;
const SPARSE_EVERY = 6;
const ZLAGS = 10;

function gauss() {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Ridge regression: solve (A'A + lam I) w = A'y by Gaussian elimination. */
function ridge(rows: number[][], ys: number[], lam: number): number[] {
  const p = rows[0].length;
  const M: number[][] = [];
  for (let i = 0; i < p; i++) {
    M.push(new Array(p + 1).fill(0));
    M[i][i] = lam;
  }
  rows.forEach((r, k) => {
    for (let i = 0; i < p; i++) {
      for (let j = 0; j < p; j++) M[i][j] += r[i] * r[j];
      M[i][p] += r[i] * ys[k];
    }
  });
  for (let i = 0; i < p; i++) {
    let piv = i;
    for (let j = i + 1; j < p; j++) if (Math.abs(M[j][i]) > Math.abs(M[piv][i])) piv = j;
    [M[i], M[piv]] = [M[piv], M[i]];
    const d = M[i][i] || 1e-9;
    for (let j = i; j <= p; j++) M[i][j] /= d;
    for (let k = 0; k < p; k++) {
      if (k === i) continue;
      const f = M[k][i];
      for (let j = i; j <= p; j++) M[k][j] -= f * M[i][j];
    }
  }
  return M.map((row) => row[p]);
}

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);

export default function RegimeDemo() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = <T extends Element>(sel: string) => root.querySelector(sel) as T;
    const canvas = q<HTMLCanvasElement>('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const statusEl = q<HTMLElement>('.toy-status');
    const capEl = q<HTMLElement>('.toy-caption');
    const shiftBtn = q<HTMLButtonElement>('[data-act="shift"]');
    const sparseBtn = q<HTMLButtonElement>('[data-act="sparse"]');
    const resetBtn = q<HTMLButtonElement>('[data-act="reset"]');
    const mC = q<HTMLElement>('[data-m="c"]');
    const mR = q<HTMLElement>('[data-m="r"]');
    const nC = q<HTMLElement>('[data-n="c"]');
    const nR = q<HTMLElement>('[data-n="r"]');
    const lgA = q<HTMLElement>('[data-lg="a"]');
    const lgC = q<HTMLElement>('[data-lg="c"]');
    const lgR = q<HTMLElement>('[data-lg="r"]');
    const chips = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-scen]'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

    let sc = SCEN.health;
    let X: number[] = [], Z: number[] = [], Y: number[] = [], G: number[] = [];
    let OBS: boolean[] = [], PC: (number | null)[] = [], PR: (number | null)[] = [];
    let shifted = false, sparse = false, shiftStep = -1, step = 0, zState = 0;
    let w = 0, h = 0;

    const stepX = (prev: number, i: number) => 0.85 * prev + 0.35 * Math.sin(i / 9) + 0.18 * gauss();
    const featC = (j: number) => [X[j - LAG]];
    const featR = (j: number) => {
      const f: number[] = [];
      for (let l = 1; l <= ZLAGS; l++) f.push(Z[j - l]);
      f.push(1);
      return f;
    };

    function predictLatest() {
      const n = X.length;
      const j = n - 1;
      if (n <= ZLAGS + 1) {
        PC.push(null);
        PR.push(null);
        return;
      }
      const rc: number[][] = [], yc: number[] = [], rr: number[][] = [], yr: number[] = [];
      for (let i = Math.max(ZLAGS, n - 1 - TRAIN); i < n - 1; i++) {
        if (!OBS[i]) continue;
        rc.push(featC(i));
        yc.push(Y[i]);
        rr.push(featR(i));
        yr.push(Y[i]);
      }
      if (rc.length < 2) {
        PC.push(null);
        PR.push(null);
        return;
      }
      PC.push(dot(ridge(rc, yc, 0.05), featC(j)));
      PR.push(dot(ridge(rr, yr, 0.0001), featR(j)));
    }

    function push(x: number) {
      X.push(x);
      zState = shifted ? 0.92 * zState - 0.06 + 0.22 * gauss() : x + 0.15 * gauss();
      Z.push(zState);
      const n = X.length;
      Y.push(n > LAG ? 0.9 * X[n - 1 - LAG] + 0.18 * gauss() : 0);
      G.push(step);
      OBS.push(!sparse || step % SPARSE_EVERY === 0);
      predictLatest();
      step++;
      if (X.length > WINDOW + TRAIN) {
        X.shift(); Z.shift(); Y.shift(); G.shift(); OBS.shift(); PC.shift(); PR.shift();
      }
    }

    function setText() {
      const parts = [shifted ? `Regime B · ${sc.b}` : `Regime A · ${sc.a}`];
      if (sparse) parts.push(sc.sp);
      statusEl.textContent = parts.join(' · ');
      statusEl.classList.toggle('changed', shifted || sparse);
      if (shifted && sparse)
        capEl.innerHTML = `${sc.after} With sparse reports on top, the correlation model also has too few points to learn its many coefficients, while the causal model, with its single coefficient, stays steady.`;
      else if (shifted) capEl.innerHTML = sc.after;
      else if (sparse) capEl.innerHTML = sc.sparse;
      else capEl.innerHTML = sc.before;
    }

    function err(pred: (number | null)[]) {
      let s = 0, k = 0;
      for (let i = Y.length - ERR_WIN; i < Y.length; i++) {
        const p = pred[i];
        if (p == null) continue;
        s += Math.abs(p - Y[i]);
        k++;
      }
      return k ? s / k : 0;
    }
    function meters() {
      const c = err(PC), r = err(PR), max = 1.2;
      mC.style.width = `${Math.min(100, (c / max) * 100)}%`;
      mR.style.width = `${Math.min(100, (r / max) * 100)}%`;
      nC.textContent = c.toFixed(2);
      nR.textContent = r.toFixed(2);
    }

    function fit() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      const g = ctx!;
      g.clearRect(0, 0, w, h);
      const ink = css('--ink'), muted = css('--muted'), acc = css('--accent'), acc2 = css('--accent-2');
      const lane = css('--border');
      const narrow = w < 520;
      const L = narrow ? 64 : 112, R = 8, gap = 8;
      const rowH = [(h - 2 * gap) * 0.27, (h - 2 * gap) * 0.27, (h - 2 * gap) * 0.46];
      const rows: { top: number; h: number }[] = [];
      let y0 = 0;
      for (const rh of rowH) {
        rows.push({ top: y0, h: rh });
        y0 += rh + gap;
      }
      const off = X.length - WINDOW;
      const xs = (i: number) => L + ((w - L - R) * (i - off)) / (WINDOW - 1);
      const vy = (row: { top: number; h: number }, v: number) => {
        const t = Math.max(0, Math.min(1, (v + 2.4) / 4.8));
        return row.top + row.h - t * row.h;
      };

      if (shiftStep >= 0) {
        const i = G.indexOf(shiftStep);
        if (i >= off) {
          const sx = xs(i);
          g.save();
          g.strokeStyle = acc2;
          g.globalAlpha = 0.55;
          g.setLineDash([3, 4]);
          g.beginPath();
          g.moveTo(sx, 0);
          g.lineTo(sx, h);
          g.stroke();
          g.restore();
          g.fillStyle = acc2;
          g.font = '9.5px "JetBrains Mono", monospace';
          g.textAlign = 'left';
          g.textBaseline = 'alphabetic';
          g.fillText('REGIME SHIFT', Math.min(sx + 6, w - 90), 11);
        }
      }

      const drawLane = (row: { top: number; h: number }, label: string, color: string) => {
        g.save();
        g.fillStyle = lane;
        g.globalAlpha = 0.35;
        g.fillRect(L, row.top, w - L - R, row.h);
        g.restore();
        g.fillStyle = color;
        g.font = `500 ${narrow ? 10 : 11.5}px Inter, sans-serif`;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        const words = label.split(' ');
        if (narrow && words.length > 1) {
          g.fillText(words[0], 0, row.top + row.h / 2 - 6);
          g.fillText(words.slice(1).join(' '), 0, row.top + row.h / 2 + 6);
        } else g.fillText(label, 0, row.top + row.h / 2);
      };
      const series = (
        row: { top: number; h: number },
        data: (number | null)[],
        color: string,
        width: number,
        dash?: number[],
        alpha = 1,
      ) => {
        g.save();
        g.strokeStyle = color;
        g.lineWidth = width;
        g.lineJoin = 'round';
        g.globalAlpha = alpha;
        if (dash) g.setLineDash(dash);
        g.beginPath();
        let started = false;
        for (let i = off; i < data.length; i++) {
          const v = data[i];
          if (v == null) {
            started = false;
            continue;
          }
          if (!started) {
            g.moveTo(xs(i), vy(row, v));
            started = true;
          } else g.lineTo(xs(i), vy(row, v));
        }
        g.stroke();
        g.restore();
      };

      drawLane(rows[0], sc.x, muted);
      drawLane(rows[1], sc.z, muted);
      drawLane(rows[2], sc.y, ink);
      series(rows[0], X, muted, 1.3);
      series(rows[1], Z, shifted ? acc2 : muted, 1.3);
      const anySparse = OBS.slice(off).some((o) => !o);
      series(rows[2], Y, ink, 1.8, undefined, anySparse ? 0.28 : 1);
      if (anySparse) {
        g.fillStyle = ink;
        for (let i = off; i < Y.length; i++) {
          if (!OBS[i]) continue;
          g.beginPath();
          g.arc(xs(i), vy(rows[2], Y[i]), 2.6, 0, Math.PI * 2);
          g.fill();
        }
      }
      series(rows[2], PR, acc2, 1.7, [5, 4]);
      series(rows[2], PC, acc, 1.7);

      // Causal edge, drawn as the lag itself: from the cause at t-3, a straight
      // line runs right along the time axis for three steps (with a tick per step),
      // then drops straight down to the target at t. A halo keeps it readable
      // where it crosses the proxy lane.
      const i1 = X.length - 1 - 10;
      const i0 = i1 - LAG;
      const x0 = xs(i0), y0p = vy(rows[0], X[i0]);
      const x1 = xs(i1), y1p = vy(rows[2], Y[i1]);
      const surface = css('--surface');
      const path = () => {
        g.beginPath();
        g.moveTo(x0, y0p);
        g.lineTo(x1, y0p);
        g.lineTo(x1, y1p - 6);
      };
      g.save();
      g.lineJoin = 'round';
      g.lineCap = 'round';
      g.strokeStyle = surface;
      g.lineWidth = 5;
      path();
      g.stroke();
      g.strokeStyle = acc;
      g.lineWidth = 1.8;
      path();
      g.stroke();
      // one tick per time step along the lag
      g.lineWidth = 1.4;
      for (let k = 1; k < LAG; k++) {
        const tx = xs(i0 + k);
        g.beginPath();
        g.moveTo(tx, y0p - 3.5);
        g.lineTo(tx, y0p + 3.5);
        g.stroke();
      }
      // arrowhead pointing down at the target
      g.fillStyle = acc;
      g.beginPath();
      g.moveTo(x1, y1p - 3);
      g.lineTo(x1 - 4.5, y1p - 11);
      g.lineTo(x1 + 4.5, y1p - 11);
      g.closePath();
      g.fill();
      // endpoints: hollow at the cause, filled at the target
      g.lineWidth = 2;
      g.strokeStyle = acc;
      g.fillStyle = surface;
      g.beginPath();
      g.arc(x0, y0p, 4, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.fillStyle = acc;
      g.beginPath();
      g.arc(x1, y1p, 3.5, 0, Math.PI * 2);
      g.fill();
      // "lag 3" label centred over the horizontal run
      const label = 'lag 3';
      g.font = `600 ${narrow ? 9.5 : 10.5}px Inter, sans-serif`;
      const lw = g.measureText(label).width + 10;
      const lx = (x0 + x1) / 2 - lw / 2;
      const ly = Math.max(rows[0].top + 1, y0p - 22);
      g.fillStyle = surface;
      g.globalAlpha = 0.92;
      g.beginPath();
      g.roundRect(lx, ly, lw, 15, 7.5);
      g.fill();
      g.globalAlpha = 1;
      g.strokeStyle = acc;
      g.lineWidth = 1;
      g.stroke();
      g.fillStyle = acc;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(label, lx + lw / 2, ly + 8);
      g.restore();
    }

    function reset() {
      X = []; Z = []; Y = []; G = []; OBS = []; PC = []; PR = [];
      shifted = false; sparse = false; shiftStep = -1; step = 0; zState = 0;
      let x = 0;
      for (let i = 0; i < WINDOW + TRAIN; i++) {
        x = stepX(x, step);
        push(x);
      }
      lgA.textContent = sc.la;
      lgC.textContent = sc.lc;
      lgR.textContent = sc.lr;
      shiftBtn.disabled = false;
      shiftBtn.textContent = 'Trigger regime shift';
      sparseBtn.setAttribute('aria-pressed', 'false');
      sparseBtn.textContent = 'Make data sparse';
      setText();
      fit();
      draw();
      meters();
    }

    function tick() {
      push(stepX(X[X.length - 1], step));
      draw();
      meters();
    }
    const fastForward = () => {
      if (reduce) for (let k = 0; k < 30; k++) tick();
    };

    const onShift = () => {
      if (shifted) return;
      shifted = true;
      shiftStep = step - 1;
      shiftBtn.disabled = true;
      shiftBtn.textContent = 'Shift triggered';
      setText();
      fastForward();
    };
    const onSparse = () => {
      sparse = !sparse;
      for (let i = 0; i < OBS.length; i++) OBS[i] = !sparse || G[i] % SPARSE_EVERY === 0;
      sparseBtn.setAttribute('aria-pressed', sparse ? 'true' : 'false');
      sparseBtn.textContent = sparse ? 'Make data dense' : 'Make data sparse';
      setText();
      fastForward();
      if (reduce) draw();
    };
    const onChip = (e: Event) => {
      const b = e.currentTarget as HTMLButtonElement;
      chips.forEach((o) => {
        o.classList.toggle('active', o === b);
        o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
      });
      sc = SCEN[b.dataset.scen || 'health'];
      reset();
    };
    const onResize = () => {
      fit();
      draw();
    };

    shiftBtn.addEventListener('click', onShift);
    sparseBtn.addEventListener('click', onSparse);
    resetBtn.addEventListener('click', reset);
    chips.forEach((c) => c.addEventListener('click', onChip));
    window.addEventListener('resize', onResize);

    // Redraw when the light/dark theme changes.
    const mo = new MutationObserver(() => draw());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    reset();

    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      if (reduce) return;
      if (e.isIntersecting && !timer) timer = window.setInterval(tick, 140);
      if (!e.isIntersecting && timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    });
    io.observe(canvas);

    return () => {
      window.clearInterval(timer);
      io.disconnect();
      mo.disconnect();
      shiftBtn.removeEventListener('click', onShift);
      sparseBtn.removeEventListener('click', onSparse);
      resetBtn.removeEventListener('click', reset);
      chips.forEach((c) => c.removeEventListener('click', onChip));
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="section" id="demo" ref={rootRef}>
      <div className="container">
        <p className="eyebrow">Research in a nutshell</p>
        <figure className="toy">
          <div className="toy-scen" role="group" aria-label="Choose an example domain">
            <button className="toy-chip active" type="button" data-scen="health" aria-pressed="true">Public health</button>
            <button className="toy-chip" type="button" data-scen="water" aria-pressed="false">Hydrology and sustainability</button>
            <button className="toy-chip" type="button" data-scen="finance" aria-pressed="false">Finance</button>
            <button className="toy-chip" type="button" data-scen="energy" aria-pressed="false">Energy</button>
            <button className="toy-chip" type="button" data-scen="temporal" aria-pressed="false">Temporal data</button>
          </div>
          <div className="toy-head">
            <h2>Under data sparsity and regime shift, correlation breaks and causality holds</h2>
            <span className="toy-status" />
          </div>
          <canvas
            className="toy-canvas"
            role="img"
            aria-label="Three streaming time series: a cause, a proxy and a target. One-step forecasts of the target from a causal model and a correlation model are drawn over the actual values. Under a regime shift or sparse data, the correlation forecast drifts or becomes erratic while the causal forecast stays close."
          />
          <div className="toy-foot">
            <div className="toy-legend">
              <span><i className="toy-sw actual" /><span data-lg="a" /></span>
              <span><i className="toy-sw causal" /><span data-lg="c" /></span>
              <span><i className="toy-sw corr" /><span data-lg="r" /></span>
            </div>
            <div className="toy-actions">
              <button className="chip primary" type="button" data-act="shift">Trigger regime shift</button>
              <button className="chip primary" type="button" data-act="sparse" aria-pressed="false">Make data sparse</button>
              <button className="chip" type="button" data-act="reset">Reset</button>
            </div>
          </div>
          <div className="toy-meters" aria-live="polite">
            <span>Causal error</span>
            <span className="toy-bar c"><i data-m="c" /></span>
            <span className="toy-num" data-n="c">0.00</span>
            <span>Correlation error</span>
            <span className="toy-bar r"><i data-m="r" /></span>
            <span className="toy-num" data-n="r">0.00</span>
          </div>
          <p className="toy-caption" />
        </figure>
      </div>
    </section>
  );
}
