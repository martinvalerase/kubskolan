// Bild av toppen sett ovanifrån (toppens 9 rutor + kantremsor runt om), räknad ur kubmodellen.
// Pilar visar vart bitarna i toppen ska flytta.
import { CubeView, parseAlg, invertAlg, COLORS, MASKS } from './cube.js';

const GRAY = '#4F5E57';
const DIRS = { R: [1, 0, 0], L: [-1, 0, 0], U: [0, 1, 0], D: [0, -1, 0], F: [0, 0, 1], B: [0, 0, -1] };
const same = (a, b) => a.every((x, k) => x === b[k]);
let view = null;

function sticker(pos, dir, maskFn) {
  const c = view.cubies.find(q => same(q.pos, pos));
  for (const [face, d] of Object.entries(DIRS)) {
    const w = [0, 1, 2].map(k => c.cols[0][k] * d[0] + c.cols[1][k] * d[1] + c.cols[2][k] * d[2]);
    if (same(w, dir)) return maskFn(c.home, face) ? COLORS[face] : GRAY;
  }
}

// cfg: { setup | setupInv, mask, arrows }
export function topView(cfg) {
  if (!view) {
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-9999px;top:0;width:10px;height:10px';
    document.body.appendChild(host);
    view = new CubeView(host);
  }
  view.reset();
  view.applyTokens(cfg.setupInv ? invertAlg(parseAlg(cfg.setupInv)) : parseAlg(cfg.setup || ''));
  const maskFn = MASKS[cfg.mask || 'full'] || MASKS.full;

  const S = 26, G = 3, O = 14;
  const full = O * 2 + G * 4 + S * 3;
  const cell = (x, z) => [O + G + (x + 1) * (S + G) + S / 2, O + G + (z + 1) * (S + G) + S / 2];
  let svg = `<rect x="${O}" y="${O}" width="${full - 2 * O}" height="${full - 2 * O}" rx="6" fill="#121613"/>`;
  for (let z = -1; z <= 1; z++) for (let x = -1; x <= 1; x++) {
    const [cx, cy] = cell(x, z);
    svg += `<rect x="${cx - S / 2}" y="${cy - S / 2}" width="${S}" height="${S}" rx="4" fill="${sticker([x, 1, z], [0, 1, 0], maskFn)}"/>`;
  }
  for (let k = -1; k <= 1; k++) {
    const t = O + G + (k + 1) * (S + G);
    svg += `<rect x="${t}" y="2" width="${S}" height="${O - 5}" rx="2.5" fill="${sticker([k, 1, -1], [0, 0, -1], maskFn)}"/>`;
    svg += `<rect x="${t}" y="${full - O + 3}" width="${S}" height="${O - 5}" rx="2.5" fill="${sticker([k, 1, 1], [0, 0, 1], maskFn)}"/>`;
    svg += `<rect x="2" y="${t}" width="${O - 5}" height="${S}" rx="2.5" fill="${sticker([-1, 1, k], [-1, 0, 0], maskFn)}"/>`;
    svg += `<rect x="${full - O + 3}" y="${t}" width="${O - 5}" height="${S}" rx="2.5" fill="${sticker([1, 1, k], [1, 0, 0], maskFn)}"/>`;
  }

  if (cfg.arrows) {
    // Pil från där biten står nu till där den hör hemma. Två bitar som byter plats får en dubbelpil.
    const moves = view.cubies
      .filter(c => c.home[1] === 1 && c.pos[1] === 1 && !same(c.pos, c.home) && c.home.filter(v => v).length > 1)
      .map(c => [c.pos, c.home]);
    const drawn = [];
    for (const [a, b] of moves) {
      if (drawn.some(([p, q]) => same(p, b) && same(q, a))) continue;
      const swap = moves.some(([p, q]) => same(p, b) && same(q, a));
      drawn.push([a, b]);
      const [x1, y1] = cell(a[0], a[2]), [x2, y2] = cell(b[0], b[2]);
      // Böj pilen utåt, bort från mitten, så att flera pilar inte möts i mittrutan
      const [mx, my] = cell(0, 0);
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
      let qx = cx + (cx - mx) * 0.55, qy = cy + (cy - my) * 0.55;
      if (!swap && Math.hypot(cx - mx, cy - my) < 1) {
        // Pil rakt över mitten i en trecykel: böj den bort från den tredje biten
        const others = moves.map(([p]) => cell(p[0], p[2]));
        const gx = others.reduce((s, q) => s + q[0], 0) / others.length, gy = others.reduce((s, q) => s + q[1], 0) / others.length;
        const l = Math.hypot(mx - gx, my - gy) || 1;
        qx = mx + (mx - gx) / l * 26; qy = my + (my - gy) / l * 26;
      }
      const trim = (px, py, tx, ty, d) => { const l = Math.hypot(tx - px, ty - py) || 1; return [px + (tx - px) / l * d, py + (ty - py) / l * d]; };
      const [sx, sy] = trim(x1, y1, qx, qy, 8), [ex, ey] = trim(x2, y2, qx, qy, 8);
      svg += `<path d="M${sx} ${sy} Q${qx} ${qy} ${ex} ${ey}" fill="none" stroke="#0B2219" stroke-width="3.2" stroke-linecap="round" marker-end="url(#ah)" ${swap ? 'marker-start="url(#ah)"' : ''}/>`;
    }
  }

  return `<svg class="topview" viewBox="0 0 ${full} ${full}" role="img" aria-label="Toppen sett ovanifrån">
    <defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#0B2219"/></marker></defs>
    ${svg}</svg>`;
}
