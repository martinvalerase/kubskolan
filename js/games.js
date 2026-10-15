// Arkadspel med kubtema: Kubormen (Snake) och Kubfall (Tetris).
// Ritas på canvas utan beroenden. Bästa poäng sparas på profilen i p.games.
import { COLORS } from './cube.js';
import { icon } from './icons.js';

const PALETTE = [COLORS.U, COLORS.D, COLORS.F, COLORS.B, COLORS.R, COLORS.L];
const rnd = n => Math.floor(Math.random() * n);
const COLOR_NAMES = ['gult', 'vitt', 'grönt', 'blått', 'orange', 'rött'];

// ---------- Delat ----------

const svg = p => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ARROW = {
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  up: '<path d="M5 15l7-7 7 7"/>',
  down: '<path d="M5 9l7 7 7-7"/>',
  rotate: '<path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5"/>',
  drop: '<path d="M6 5l6 6 6-6M6 13l6 6 6-6"/>',
};

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// En kubsticker: rundad ruta med mörkare kant.
function sticker(g, x, y, s, color, alpha = 1) {
  const pad = Math.max(1.5, s * 0.07);
  g.globalAlpha = alpha;
  roundRect(g, x + pad, y + pad, s - pad * 2, s - pad * 2, s * 0.2);
  g.fillStyle = color;
  g.fill();
  g.lineWidth = Math.max(1.5, s * 0.06);
  g.strokeStyle = shade(color, 0.55);
  g.stroke();
  g.globalAlpha = 1;
}

function record(ctx, key, score) {
  const p = ctx.me();
  p.games ||= {};
  const g = p.games[key] ||= { best: 0, plays: 0 };
  g.plays++;
  const isRecord = score > g.best;
  const prev = g.best;
  if (isRecord) g.best = score;
  ctx.save();
  return { best: g.best, isRecord, firstTime: prev === 0 };
}

const bestOf = (p, key) => (p.games && p.games[key] && p.games[key].best) || 0;

// Knapp som upprepar sin åtgärd medan man håller den nere.
function holdButton(el, fn, first = 190, every = 75) {
  let t1 = 0, t2 = 0;
  const stop = () => { clearTimeout(t1); clearInterval(t2); };
  el.addEventListener('pointerdown', e => {
    e.preventDefault();
    stop();
    fn();
    t1 = setTimeout(() => { t2 = setInterval(fn, every); }, first);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => el.addEventListener(ev, stop));
  return stop;
}

function shell(ctx, { title, ic, hud, stage, controls, back = '#/games' }) {
  const p = ctx.me();
  ctx.app.innerHTML = `
    <div class="screen game-screen">
      ${ctx.topbar({ back, middle: `<span class="topbar-title">${icon(ic)} ${title}</span>`, right: ctx.pAvatar(p, 'sm') })}
      <div class="game-hud">${hud}</div>
      <div class="game-stage">
        ${stage}
        <div class="game-overlay hidden"><div class="game-overlay-box">
          <h2></h2><p></p><button class="btn primary huge"></button>
        </div></div>
      </div>
      <div class="game-actions"><button class="btn ghost small pause">Paus</button></div>
      ${controls || ''}
    </div>`;
  const root = ctx.app.querySelector('.game-screen');
  const ov = root.querySelector('.game-overlay');
  const overlay = (head, text, label, fn) => {
    ov.querySelector('h2').textContent = head;
    ov.querySelector('p').innerHTML = text;
    const b = ov.querySelector('button');
    b.textContent = label;
    b.onclick = () => { ov.classList.add('hidden'); fn(); };
    ov.classList.remove('hidden');
  };
  return { root, overlay, hideOverlay: () => ov.classList.add('hidden') };
}

// ---------- Spelhubb ----------

export function renderGames(ctx) {
  const p = ctx.me();
  const dots = PALETTE.map(c => `<span style="background:${c}"></span>`).join('');
  ctx.app.innerHTML = `
    <div class="screen games-screen">
      ${ctx.topbar({ back: '#/map', middle: `<span class="topbar-title">${icon('gamepad')} Spel</span>`, right: ctx.pAvatar(p, 'sm') })}
      <p class="games-intro">Korta spel med kubens färger. Slå ditt eget rekord!</p>
      <div class="game-cards">
        <a class="game-card" href="#/snake">
          <div class="game-art snake-art">${dots}</div>
          <b>Kubormen</b>
          <small>Ät rätt färg så växer du. Fel färg gör dig kortare.</small>
          <span class="game-best">${icon('star', 'on')} Rekord ${bestOf(p, 'snake')}</span>
        </a>
        <a class="game-card" href="#/blocks">
          <div class="game-art blocks-art"><i style="background:${COLORS.R}"></i><i style="background:${COLORS.R}"></i><i style="background:${COLORS.F}"></i><i style="background:${COLORS.U}"></i><i style="background:${COLORS.B}"></i><i style="background:${COLORS.B}"></i></div>
          <b>Kubfall</b>
          <small>Fyll rader. En rad i en enda färg ger extra poäng.</small>
          <span class="game-best">${icon('star', 'on')} Rekord ${bestOf(p, 'blocks')}</span>
        </a>
      </div>
    </div>`;
}

// ---------- Kubormen (Snake) ----------

export function renderSnake(ctx) {
  const N = 11, CELL = 40, FOODS = 4;
  const p = ctx.me();
  const best0 = bestOf(p, 'snake');

  const ui = shell(ctx, {
    title: 'Kubormen', ic: 'gamepad',
    hud: `
      <div><small>Poäng</small><b class="h-score">0</b></div>
      <div><small>Rekord</small><b class="h-best">${best0}</b></div>
      <div class="h-target"><small>Ät</small><b><i class="chip"></i><span class="h-tname">–</span></b></div>
      <div><small>Kombo</small><b class="h-combo">x1</b></div>`,
    stage: `<canvas class="game-canvas snake-canvas" width="${N * CELL}" height="${N * CELL}"></canvas>`,
    controls: `
      <div class="dpad">
        <button class="pad up" data-d="up" aria-label="Upp">${svg(ARROW.up)}</button>
        <button class="pad left" data-d="left" aria-label="Vänster">${svg(ARROW.left)}</button>
        <button class="pad down" data-d="down" aria-label="Ner">${svg(ARROW.down)}</button>
        <button class="pad right" data-d="right" aria-label="Höger">${svg(ARROW.right)}</button>
      </div>`,
  });
  const cv = ui.root.querySelector('canvas');
  const g = cv.getContext('2d');
  const el = c => ui.root.querySelector(c);

  const DIRS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
  let snake, cols, dir, queue, foods, target, score, combo, eaten, state, acc, last, raf;

  const cellFree = (x, y) => !snake.some(s => s.x === x && s.y === y) && !foods.some(f => f.x === x && f.y === y);
  const spawnFood = () => {
    for (let tries = 0; tries < 200; tries++) {
      const x = rnd(N), y = rnd(N);
      if (!cellFree(x, y)) continue;
      const used = foods.map(f => f.c);
      const free = PALETTE.map((_, i) => i).filter(i => !used.includes(i));
      foods.push({ x, y, c: (free.length ? free : PALETTE.map((_, i) => i))[rnd(free.length || 6)] });
      return;
    }
  };
  const pickTarget = () => { target = foods[rnd(foods.length)].c; };

  const hud = () => {
    el('.h-score').textContent = score;
    el('.h-combo').textContent = 'x' + Math.min(combo + 1, 5);
    el('.h-tname').textContent = COLOR_NAMES[target];
    el('.h-target .chip').style.background = PALETTE[target];
  };

  const reset = () => {
    snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    cols = ['#C9E86B', '#8EE3B1', '#8EE3B1'];
    dir = DIRS.right; queue = [];
    foods = []; score = 0; combo = 0; eaten = 0; acc = 0;
    for (let i = 0; i < FOODS; i++) spawnFood();
    pickTarget();
    hud();
  };

  const interval = () => Math.max(85, 190 - eaten * 3);

  const step = () => {
    if (queue.length) dir = queue.shift();
    const h = snake[0];
    const nx = (h.x + dir.x + N) % N, ny = (h.y + dir.y + N) % N;
    const fi = foods.findIndex(f => f.x === nx && f.y === ny);
    const food = fi >= 0 ? foods[fi] : null;
    const grows = !!food && food.c === target;
    const body = grows ? snake : snake.slice(0, -1);
    if (body.some(s => s.x === nx && s.y === ny)) return gameOver();
    snake.unshift({ x: nx, y: ny });
    if (!grows) snake.pop();
    if (food) {
      foods.splice(fi, 1);
      if (grows) {
        cols.push(PALETTE[food.c]);
        combo++; eaten++;
        score += 10 * Math.min(combo, 5);
        spawnFood();
        pickTarget();
      } else {
        combo = 0;
        if (snake.length > 3) { snake.pop(); cols.pop(); }
        spawnFood();
      }
      hud();
    }
  };

  const draw = () => {
    g.clearRect(0, 0, cv.width, cv.height);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      g.fillStyle = (x + y) % 2 ? '#133427' : '#17402F';
      g.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
    for (const f of foods) {
      sticker(g, f.x * CELL, f.y * CELL, CELL, PALETTE[f.c]);
      if (f.c === target) {
        g.lineWidth = 3; g.strokeStyle = '#EEF4E6';
        roundRect(g, f.x * CELL + 3, f.y * CELL + 3, CELL - 6, CELL - 6, 9);
        g.stroke();
      }
    }
    for (let i = snake.length - 1; i >= 0; i--) {
      const s = snake[i];
      sticker(g, s.x * CELL, s.y * CELL, CELL, i === 0 ? '#EEF4E6' : cols[i] || '#8EE3B1');
    }
    // ögon på huvudet
    const h = snake[0], cx = h.x * CELL + CELL / 2, cy = h.y * CELL + CELL / 2;
    g.fillStyle = '#0B2219';
    for (const side of [-1, 1]) {
      g.beginPath();
      g.arc(cx + dir.x * 7 + -dir.y * 7 * side, cy + dir.y * 7 + dir.x * 7 * side, 4, 0, Math.PI * 2);
      g.fill();
    }
  };

  const frame = t => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(100, t - last);
    last = t;
    if (state === 'playing') {
      acc += dt;
      while (acc >= interval() && state === 'playing') { acc -= interval(); step(); }
    }
    draw();
  };

  const turn = name => {
    const d = DIRS[name];
    const ref = queue.length ? queue[queue.length - 1] : dir;
    if (d.x === -ref.x && d.y === -ref.y) return; // ingen u-sväng
    if (d.x === ref.x && d.y === ref.y) return;
    if (queue.length < 2) queue.push(d);
  };

  const start = () => { reset(); state = 'playing'; ctx.track('/spel/kubormen', true); };
  function gameOver() {
    state = 'over';
    const r = record(ctx, 'snake', score);
    el('.h-best').textContent = r.best;
    if (r.isRecord && score > 0 && !r.firstTime) ctx.confetti();
    ui.overlay(r.isRecord && score > 0 ? 'Nytt rekord!' : 'Aj!', `Du fick <b>${score}</b> poäng.<br>Rekord: ${r.best}`, 'Spela igen', start);
  }
  const pause = () => {
    if (state !== 'playing') return;
    state = 'paused';
    ui.overlay('Paus', 'Tryck för att fortsätta.', 'Fortsätt', () => { state = 'playing'; });
  };

  // styrning: piltangenter/WASD, knappar och svep
  const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
  const onKey = e => {
    const k = KEYS[e.key];
    if (k) { e.preventDefault(); if (state === 'playing') turn(k); }
    else if (e.key === 'p' || e.key === 'Escape') pause();
  };
  document.addEventListener('keydown', onKey);
  ui.root.querySelectorAll('.pad').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); if (state === 'playing') turn(b.dataset.d); }));
  let sx = 0, sy = 0;
  cv.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  cv.addEventListener('pointermove', e => {
    if (!e.buttons && e.pointerType === 'mouse') return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    if (state === 'playing') turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    sx = e.clientX; sy = e.clientY;
  });
  ui.root.querySelector('.pause').onclick = pause;
  const onVis = () => { if (document.hidden) pause(); };
  document.addEventListener('visibilitychange', onVis);

  reset();
  state = 'ready';
  last = performance.now();
  raf = requestAnimationFrame(frame);
  ui.overlay('Kubormen', 'Ät den färg som visas högst upp. Fel färg gör dig kortare.<br>Svep eller använd pilarna.', 'Starta', start);

  ctx.onLeave(() => {
    cancelAnimationFrame(raf);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVis);
  });
}

// ---------- Kubfall (Tetris) ----------

const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
];
const rotateCW = m => m[0].map((_, i) => m.map(r => r[i]).reverse());

export function renderBlocks(ctx) {
  const W = 10, H = 18, CELL = 28;
  const p = ctx.me();
  const best0 = bestOf(p, 'blocks');

  const ui = shell(ctx, {
    title: 'Kubfall', ic: 'gamepad',
    hud: `
      <div><small>Poäng</small><b class="h-score">0</b></div>
      <div><small>Rekord</small><b class="h-best">${best0}</b></div>
      <div><small>Nivå</small><b class="h-level">1</b></div>
      <div class="h-next"><small>Nästa</small><canvas class="next-canvas" width="64" height="40"></canvas></div>`,
    stage: `<canvas class="game-canvas blocks-canvas" width="${W * CELL}" height="${H * CELL}"></canvas><div class="game-msg"></div>`,
    controls: `
      <div class="bpad">
        <button class="pad b-left" aria-label="Vänster">${svg(ARROW.left)}</button>
        <button class="pad b-rot" aria-label="Vrid">${svg(ARROW.rotate)}</button>
        <button class="pad b-right" aria-label="Höger">${svg(ARROW.right)}</button>
        <button class="pad b-down" aria-label="Ner">${svg(ARROW.down)}</button>
        <button class="pad b-drop" aria-label="Släpp">${svg(ARROW.drop)}</button>
      </div>`,
  });
  const cv = ui.root.querySelector('.blocks-canvas');
  const g = cv.getContext('2d');
  const nv = ui.root.querySelector('.next-canvas');
  const ng = nv.getContext('2d');
  const el = c => ui.root.querySelector(c);

  let board, cur, nextP, bag, lastColor, score, lines, level, state, acc, last, raf, msgTimer;

  const level0 = () => 1 + Math.floor(lines / 10);
  const dropInterval = () => Math.max(90, 750 - (level - 1) * 65);

  const nextShape = () => {
    if (!bag.length) bag = [0, 1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
    // färgen upprepas ofta, så att en rad i en färg går att planera
    lastColor = Math.random() < 0.5 && lastColor !== undefined ? lastColor : rnd(6);
    const m = SHAPES[bag.pop()].map(r => r.slice());
    return { m, x: Math.floor((W - m[0].length) / 2), y: 0, c: lastColor };
  };

  const collides = (m, x, y) => m.some((row, j) => row.some((v, i) => {
    if (!v) return false;
    const bx = x + i, by = y + j;
    return bx < 0 || bx >= W || by >= H || (by >= 0 && board[by][bx] !== 0);
  }));

  const hud = () => {
    el('.h-score').textContent = score;
    el('.h-level').textContent = level;
  };

  const toast = text => {
    const m = el('.game-msg');
    m.textContent = text;
    m.classList.add('show');
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => m.classList.remove('show'), 1400);
  };

  const spawn = () => {
    cur = nextP;
    nextP = nextShape();
    drawNext();
    if (collides(cur.m, cur.x, cur.y)) gameOver();
  };

  const lock = () => {
    cur.m.forEach((row, j) => row.forEach((v, i) => {
      if (v && cur.y + j >= 0) board[cur.y + j][cur.x + i] = cur.c + 1;
    }));
    const full = [];
    board.forEach((row, y) => { if (row.every(v => v)) full.push(y); });
    if (full.length) {
      const mono = full.filter(y => board[y].every(v => v === board[y][0])).length;
      score += [0, 100, 300, 500, 800][full.length] * level + mono * 500 * level;
      lines += full.length;
      board = board.filter((_, y) => !full.includes(y));
      while (board.length < H) board.unshift(Array(W).fill(0));
      level = level0();
      if (mono) { ctx.confetti(); toast(`Färgrad! +${mono * 500 * level}`); }
      else if (full.length === 4) toast('Kubfall!');
    }
    hud();
    spawn();
  };

  const move = dx => { if (state === 'playing' && !collides(cur.m, cur.x + dx, cur.y)) cur.x += dx; };
  const rotate = () => {
    if (state !== 'playing') return;
    const m = rotateCW(cur.m);
    for (const k of [0, -1, 1, -2, 2]) {
      if (!collides(m, cur.x + k, cur.y)) { cur.m = m; cur.x += k; return; }
    }
  };
  const softDrop = (points = true) => {
    if (state !== 'playing') return;
    if (!collides(cur.m, cur.x, cur.y + 1)) { cur.y++; if (points) score++; acc = 0; hud(); }
    else lock();
  };
  const hardDrop = () => {
    if (state !== 'playing') return;
    let n = 0;
    while (!collides(cur.m, cur.x, cur.y + 1)) { cur.y++; n++; }
    score += n * 2;
    lock();
  };

  const ghostY = () => {
    let y = cur.y;
    while (!collides(cur.m, cur.x, y + 1)) y++;
    return y;
  };

  const drawNext = () => {
    ng.clearRect(0, 0, nv.width, nv.height);
    const s = 14, m = nextP.m;
    const ox = (nv.width - m[0].length * s) / 2, oy = (nv.height - m.length * s) / 2;
    m.forEach((row, j) => row.forEach((v, i) => { if (v) sticker(ng, ox + i * s, oy + j * s, s, PALETTE[nextP.c]); }));
  };

  const draw = () => {
    g.clearRect(0, 0, cv.width, cv.height);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      g.fillStyle = (x + y) % 2 ? '#133427' : '#17402F';
      g.fillRect(x * CELL, y * CELL, CELL, CELL);
      if (board[y][x]) sticker(g, x * CELL, y * CELL, CELL, PALETTE[board[y][x] - 1]);
    }
    if (state === 'playing' || state === 'paused') {
      const gy = ghostY();
      cur.m.forEach((row, j) => row.forEach((v, i) => { if (v) sticker(g, (cur.x + i) * CELL, (gy + j) * CELL, CELL, PALETTE[cur.c], 0.22); }));
      cur.m.forEach((row, j) => row.forEach((v, i) => { if (v && cur.y + j >= 0) sticker(g, (cur.x + i) * CELL, (cur.y + j) * CELL, CELL, PALETTE[cur.c]); }));
    }
  };

  const frame = t => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(100, t - last);
    last = t;
    if (state === 'playing') {
      acc += dt;
      if (acc >= dropInterval()) { acc = 0; softDrop(false); }
    }
    draw();
  };

  const reset = () => {
    board = Array.from({ length: H }, () => Array(W).fill(0));
    bag = []; lastColor = undefined;
    score = 0; lines = 0; level = 1; acc = 0;
    nextP = nextShape();
    state = 'ready';
    spawn();
    hud();
  };
  const start = () => { reset(); state = 'playing'; ctx.track('/spel/kubfall', true); };
  function gameOver() {
    state = 'over';
    const r = record(ctx, 'blocks', score);
    el('.h-best').textContent = r.best;
    if (r.isRecord && score > 0 && !r.firstTime) ctx.confetti();
    ui.overlay(r.isRecord && score > 0 ? 'Nytt rekord!' : 'Slut!', `Du fick <b>${score}</b> poäng och ${lines} rader.<br>Rekord: ${r.best}`, 'Spela igen', start);
  }
  const pause = () => {
    if (state !== 'playing') return;
    state = 'paused';
    ui.overlay('Paus', 'Tryck för att fortsätta.', 'Fortsätt', () => { state = 'playing'; });
  };

  // styrning
  const onKey = e => {
    const k = e.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(k)) e.preventDefault();
    if (k === 'ArrowLeft') move(-1);
    else if (k === 'ArrowRight') move(1);
    else if (k === 'ArrowDown') softDrop();
    else if (k === 'ArrowUp' || k === 'x') rotate();
    else if (k === ' ') hardDrop();
    else if (k === 'p' || k === 'Escape') pause();
  };
  document.addEventListener('keydown', onKey);
  const stops = [
    holdButton(el('.b-left'), () => move(-1)),
    holdButton(el('.b-right'), () => move(1)),
    holdButton(el('.b-down'), () => softDrop(), 120, 55),
  ];
  el('.b-rot').addEventListener('pointerdown', e => { e.preventDefault(); rotate(); });
  el('.b-drop').addEventListener('pointerdown', e => { e.preventDefault(); hardDrop(); });

  // svep på brädet: dra i sidled flyttar, dra nedåt sänker, tryck vrider, snabbt svep nedåt släpper
  let gx = 0, gy = 0, gt = 0, gMoved = false, gDown = 0, gActive = false;
  cv.addEventListener('pointerdown', e => {
    gActive = true; gx = e.clientX; gy = e.clientY; gt = performance.now(); gMoved = false; gDown = 0;
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', e => {
    if (!gActive) return;
    const cell = cv.clientWidth / W;
    const dx = e.clientX - gx, dy = e.clientY - gy;
    if (Math.abs(dx) >= cell * 0.9) {
      const n = Math.trunc(dx / (cell * 0.9));
      for (let i = 0; i < Math.abs(n); i++) move(Math.sign(n));
      gx += n * cell * 0.9; gMoved = true;
    } else if (dy >= cell * 0.9 && Math.abs(dy) > Math.abs(dx)) {
      const n = Math.trunc(dy / (cell * 0.9));
      for (let i = 0; i < n; i++) softDrop();
      gy += n * cell * 0.9; gDown += n; gMoved = true;
    }
  });
  const gEnd = e => {
    if (!gActive) return;
    gActive = false;
    const dt = performance.now() - gt;
    if (!gMoved && dt < 280) rotate();
    else if (e.type === 'pointerup' && gDown >= 3 && dt < 260) hardDrop();
  };
  cv.addEventListener('pointerup', gEnd);
  cv.addEventListener('pointercancel', gEnd);

  ui.root.querySelector('.pause').onclick = pause;
  const onVis = () => { if (document.hidden) pause(); };
  document.addEventListener('visibilitychange', onVis);

  reset();
  last = performance.now();
  raf = requestAnimationFrame(frame);
  ui.overlay('Kubfall', 'Fyll rader med stickers. En hel rad i samma färg ger +500!<br>Svep i sidled, tryck för att vrida, svep snabbt ner för att släppa.', 'Starta', start);

  ctx.onLeave(() => {
    cancelAnimationFrame(raf);
    clearTimeout(msgTimer);
    stops.forEach(s => s());
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVis);
  });
}
