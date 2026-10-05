import { CubeView, parseAlg, invertAlg, moveHint, moveInstruction } from './cube.js';
import { topView } from './diagram.js';
import { WORLDS, ALL_CASES, caseById, TRAIN_METHODS } from './content.js';
import { icon, glyph, avatar, parseAvatar, AV_COLORS, AV_SHAPES } from './icons.js';

// ---------- Lagring ----------

const KEY = 'kubskolan.v1';
let db = load();

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.profiles)) return d;
  } catch { /* tom eller blockerad lagring */ }
  return { profiles: [], current: null, unlockAll: false };
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* ignoreras */ }
}
const me = () => db.profiles.find(p => p.id === db.current);

function newProfile(name, av) {
  return { id: Date.now().toString(36), name, avatar: av, lessons: {}, quiz: {}, boxes: {}, times: [], stepAt: {} };
}

// ---------- Progress ----------

const worldIndex = id => WORLDS.findIndex(w => w.id === id);
const coreCases = w => (w.cases || []).filter(c => !c.bonus);

function isUnlocked(p, i) {
  return i === 0 || db.unlockAll || !!p.lessons[WORLDS[i - 1].id];
}

function stars(p, w) {
  if (!p.lessons[w.id]) return 0;
  let s = 1;
  if ((p.quiz[w.id] || 0) >= 0.8) s++;
  if (coreCases(w).every(c => (p.boxes[c.id] || 0) >= 3)) s++;
  return s;
}

const starsHtml = n => `<span class="stars" aria-label="${n} av 3 stjärnor">${[0, 1, 2].map(i => icon(i < n ? 'star' : 'starO', i < n ? 'on' : '')).join('')}</span>`;
const photoImg = (src, cls) => `<img class="avatar photo ${cls || ''}" src="${src}" alt="">`;
const pAvatar = (p, cls) => p.photo ? photoImg(p.photo, cls) : avatar(p.avatar, p.name, p.id, cls);

// Läser en bild från bildgalleriet, beskär den till en kvadrat och krymper den så att den ryms i lagringen.
function loadPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = 192, side = Math.min(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      canvas.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
    img.src = url;
  });
}

// ---------- Hjälpfunktioner ----------

const app = document.getElementById('app');
let views = [];
let cleanups = [];

function clearViews() {
  views.forEach(v => v.destroy());
  views = [];
  if (window.speechSynthesis) speechSynthesis.cancel();
}
function clearScreen() {
  clearViews();
  cleanups.forEach(fn => fn());
  cleanups = [];
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

function speak(html) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const text = html.replace(/<br\s*\/?>/g, '. ').replace(/<[^>]+>/g, '')
    .replace(/(\b[RLUDFBMfr])'/g, '$1 prim').replace(/\b([RLUDFBMfr])2\b/g, '$1 två');
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'sv-SE';
  const voice = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith('sv'));
  if (voice) u.voice = voice;
  u.rate = 0.95;
  speechSynthesis.speak(u);
}

function confetti() {
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#8EE3B1', '#C9E86B', '#E9F2DC', '#5FC4A8', '#FFD500', '#FF7A00'];
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + '%';
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = Math.random() * 0.5 + 's';
    s.style.animationDuration = 1.8 + Math.random() * 1.2 + 's';
    if (i % 3 === 0) s.style.borderRadius = '50%';
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3500);
}

function modal(html, buttons) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-wrap';
  wrap.innerHTML = `<div class="modal" role="dialog">${html}<div class="modal-buttons"></div></div>`;
  const row = wrap.querySelector('.modal-buttons');
  for (const [label, fn, cls] of buttons) {
    const b = document.createElement('button');
    b.className = 'btn ' + (cls || '');
    b.innerHTML = label;
    b.onclick = () => { wrap.remove(); fn && fn(); };
    row.appendChild(b);
  }
  document.body.appendChild(wrap);
  return wrap;
}

function topbar({ back = '#/map', middle = '', right = '' } = {}) {
  return `<header class="topbar">
    <a class="icon-btn" href="${back}" aria-label="Stäng">${icon('close')}</a>
    <div class="topbar-mid">${middle}</div>
    <div class="topbar-right">${right}</div>
  </header>`;
}

const progressBar = (done, total) =>
  `<div class="progress" role="progressbar" aria-valuenow="${done}" aria-valuemax="${total}"><span style="width:${(done / total) * 100}%"></span></div>
   <span class="progress-num">${Math.min(done + 1, total)}/${total}</span>`;

// ---------- Kubspelare ----------

const PAD = ['R', "R'", 'U', "U'", 'F', "F'"];
const sleep = ms => new Promise(r => setTimeout(r, ms));

function chip(t, k, done) {
  const h = moveHint(t);
  return `<span class="chip ${k < done ? 'done' : k === done ? 'cur' : ''}" title="${esc(h.name)}"><b>${esc(t.text)}</b><i>${h.arrow}</i></span>`;
}

// cfg: { setup, setupInv, setupTokens, alg, parts: [{name, alg}], mask, pad,
//        highlight: ['DFR', …], pitch, yaw, caseRef }
function createPlayer(host, cfg) {
  if (cfg.caseRef) {
    const c = caseById(cfg.caseRef);
    cfg = { setupInv: c.alg, alg: c.alg, mask: c.mask, ...cfg };
  }
  // En algoritm kan delas i namngivna delar; delarna tillsammans är hela algoritmen.
  const parts = cfg.parts || (cfg.alg ? [{ name: '', alg: cfg.alg }] : []);
  const tokens = parts.flatMap((p, pi) => parseAlg(p.alg).map(t => ({ ...t, part: pi })));
  const named = parts.some(p => p.name);
  const setup = cfg.setupTokens || (cfg.setupInv ? invertAlg(parseAlg(cfg.setupInv)) : parseAlg(cfg.setup || ''));
  const padMoves = Array.isArray(cfg.pad) ? cfg.pad : PAD;

  host.innerHTML = `
    <div class="player">
      <div class="cube-box"></div>
      ${tokens.length ? `
        <div class="chips-wrap"></div>
        <div class="follow hidden" aria-live="polite"></div>
        <div class="controls">
          <button class="ctl" data-a="reset" aria-label="Börja om">${icon('restart')}</button>
          <button class="ctl" data-a="back" aria-label="Ett drag bakåt">${icon('stepB')}</button>
          <button class="ctl play" data-a="play" aria-label="Spela">${icon('play')}</button>
          <button class="ctl" data-a="fwd" aria-label="Ett drag framåt">${icon('stepF')}</button>
          <button class="ctl speed" data-a="speed" aria-label="Långsamt">½×</button>
          <button class="ctl follow-btn" data-a="follow" aria-label="Följ med på din kub">${icon('hand')}<span>Följ med</span></button>
        </div>` : ''}
      ${cfg.pad ? `
        <div class="pad">${padMoves.map(m => `<button class="padbtn" data-m="${m}"><b>${m}</b><i>${moveHint(parseAlg(m)[0]).arrow}</i></button>`).join('')}
        <button class="padbtn wide" data-m="reset">${icon('restart')} Nollställ</button></div>` : ''}
    </div>`;

  // Brantare vinkel när det är toppen man ska titta på
  const pitch = cfg.pitch ?? (cfg.mask === 'oll' || cfg.mask === 'ollCross' ? -45 : undefined);
  const view = new CubeView(host.querySelector('.cube-box'), { mask: cfg.mask || 'full', pitch, yaw: cfg.yaw });
  views.push(view);
  view.applyTokens(setup);
  view.setHighlight(cfg.highlight || []);
  view.applyCamera();

  let i = 0, playing = false, slow = false, following = false;
  const chipsEl = host.querySelector('.chips-wrap');
  const followEl = host.querySelector('.follow');
  const playBtn = host.querySelector('[data-a=play]');
  const update = () => {
    if (chipsEl) {
      const cur = i < tokens.length ? tokens[i].part : -1;
      chipsEl.innerHTML = named
        ? parts.map((p, pi) => `<div class="chip-group ${pi === cur ? 'on' : ''}"><span class="chip-label">${esc(p.name)}</span>
            <div class="chips">${tokens.map((t, k) => t.part === pi ? chip(t, k, i) : '').join('')}</div></div>`).join('')
        : `<div class="chips">${tokens.map((t, k) => chip(t, k, i)).join('')}</div>`;
    }
    if (playBtn) {
      playBtn.innerHTML = icon(playing ? 'pause' : 'play');
      playBtn.setAttribute('aria-label', playing ? 'Pausa' : 'Spela');
    }
    if (followEl && following) {
      if (i < tokens.length) {
        const t = tokens[i], h = moveHint(t);
        followEl.innerHTML = `
          <p class="follow-part">${named && parts[t.part].name ? `${esc(parts[t.part].name)} · ` : ''}drag ${i + 1} av ${tokens.length}</p>
          <div class="follow-move"><b>${esc(t.text)}</b><span>${h.arrow}</span></div>
          <p class="follow-text">${moveInstruction(t)}</p>
          <div class="follow-nav">
            <button class="icon-btn big" data-f="back" aria-label="Ett drag bakåt" ${i === 0 ? 'disabled' : ''}>${icon('back')}</button>
            <button class="btn primary" data-f="next">Gjort! Nästa ${icon('next')}</button>
          </div>`;
      } else {
        followEl.innerHTML = `
          <p class="follow-text">Klart! Ser din kub ut som den här?</p>
          <div class="follow-nav"><button class="btn ghost" data-f="reset">${icon('restart')} Börja om</button></div>`;
      }
      followEl.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
        if (b.dataset.f === 'next') forward();
        else if (b.dataset.f === 'back') back();
        else reset();
      });
    }
  };
  update();

  const forward = () => {
    if (i >= tokens.length) return Promise.resolve();
    const t = tokens[i++];
    update();
    return view.animate(t);
  };
  const back = () => {
    if (i <= 0) return Promise.resolve();
    const t = tokens[--i];
    update();
    return view.animate(invertAlg([t])[0]);
  };
  const reset = async () => {
    playing = false;
    await view.clearQueue();
    view.reset();
    view.applyTokens(setup);
    i = 0;
    update();
  };
  const play = async () => {
    if (playing) { playing = false; update(); return; }
    if (i >= tokens.length) await reset();
    playing = true;
    update();
    while (playing && i < tokens.length && !view.dead) {
      // kort paus mellan delarna så att man hinner se var en del slutar
      if (i > 0 && tokens[i - 1].part !== tokens[i].part) { await sleep(slow ? 900 : 550); if (!playing) break; }
      await forward();
    }
    playing = false;
    update();
  };

  host.querySelectorAll('.ctl').forEach(b => b.onclick = () => {
    const a = b.dataset.a;
    if (a === 'play') play();
    else if (a === 'reset') reset();
    else if (a === 'fwd') { playing = false; forward(); }
    else if (a === 'back') { playing = false; back(); }
    else if (a === 'speed') {
      slow = !slow;
      view.speed = slow ? 900 : 380;
      b.classList.toggle('on', slow);
    } else if (a === 'follow') {
      following = !following;
      playing = false;
      b.classList.toggle('on', following);
      followEl.classList.toggle('hidden', !following);
      update();
    }
  });

  host.querySelectorAll('.padbtn').forEach(b => b.onclick = () => {
    if (b.dataset.m === 'reset') { view.clearQueue().then(() => view.reset()); return; }
    view.animate(parseAlg(b.dataset.m)[0], 260);
  });

  return { view, play, reset };
}

// ---------- Router ----------

function route() {
  clearScreen();
  const [name, a, b] = location.hash.replace(/^#\/?/, '').split('/');
  if (!me() && !['parent', ''].includes(name || '')) { location.hash = '#/'; return; }
  window.scrollTo(0, 0);
  if (!name) return renderProfiles();
  if (name === 'map') return renderMap();
  if (name === 'lesson') return renderLesson(a, parseInt(b || '0', 10));
  if (name === 'quiz') return renderQuiz(a);
  if (name === 'train') return a ? renderMethod(a) : renderTrainMenu();
  if (name === 'algs') return renderAlgs(a, b);
  if (name === 'drill') return renderTrainer(a, b);
  if (name === 'timer') return renderTimer();
  if (name === 'parent') return renderParent();
  location.hash = '#/';
}
window.addEventListener('hashchange', route);

// ---------- Profiler ----------

const LOGO = `<svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M24 4 41 13.5v21L24 44 7 34.5v-21z" fill="#1B4A37"/>
  <path d="M24 4 41 13.5 24 23 7 13.5z" fill="#C9E86B"/>
  <path d="M7 13.5 24 23v21L7 34.5z" fill="#8EE3B1"/>
  <path d="M41 13.5 24 23v21l17-9.5z" fill="#5FC4A8"/>
  <path d="M24 4 41 13.5v21L24 44 7 34.5v-21zM7 13.5 24 23l17-9.5M24 23v21M15.5 8.75l17 9.5M32.5 8.75l-17 9.5M7 24l17 9.5 17-9.5M15.5 18.25v21M32.5 18.25v21" fill="none" stroke="#0B2219" stroke-width="2.2" stroke-linejoin="round"/>
</svg>`;

function renderProfiles() {
  app.innerHTML = `
    <div class="screen profiles">
      <div class="brand">${LOGO}<h1>Kubskolan</h1></div>
      <p class="lead">Vem ska kuba idag?</p>
      <div class="profile-grid">
        ${db.profiles.map(p => {
          const done = WORLDS.filter(w => p.lessons[w.id]).length;
          return `
          <button class="profile-card" data-id="${p.id}">
            ${pAvatar(p, 'lg')}
            <span class="pname">${esc(p.name)}</span>
            <span class="pmeta">${done} av ${WORLDS.length} steg</span>
          </button>`;
        }).join('')}
        <button class="profile-card add" data-id="new">
          <span class="add-circle">${icon('plus')}</span>
          <span class="pname">Ny kubare</span>
        </button>
      </div>
      <a class="parent-link" href="#/parent">${icon('users')} För föräldrar</a>
    </div>`;
  app.querySelectorAll('.profile-card').forEach(b => b.onclick = () => {
    if (b.dataset.id === 'new') return newProfileDialog();
    db.current = b.dataset.id; save();
    location.hash = '#/map';
  });
}

function newProfileDialog() {
  let s = Math.floor(Math.random() * AV_SHAPES), c = Math.floor(Math.random() * AV_COLORS.length);
  let photo = null;
  const w = modal(`
    <h2>Ny kubare</h2>
    <div class="av-preview"></div>
    <div class="photo-row">
      <label class="btn small ghost photo-pick">${icon('image')} Välj bild<input type="file" accept="image/*" hidden></label>
      <button class="btn small ghost photo-clear hidden">Ta bort bild</button>
    </div>
    <input class="field" maxlength="16" placeholder="Vad heter du?" autocomplete="off">
    <div class="av-pickers">
    <p class="pick-label">Form</p>
    <div class="pick shapes">${Array.from({ length: AV_SHAPES }, (_, i) => `<button class="pick-btn" data-s="${i}" aria-label="Form ${i + 1}"></button>`).join('')}</div>
    <p class="pick-label">Färg</p>
    <div class="pick colors">${AV_COLORS.map((col, i) => `<button class="pick-btn dot" data-c="${i}" style="--c:${col}" aria-label="Färg ${i + 1}"></button>`).join('')}</div>
    </div>`,
  [['Avbryt', null, 'ghost'], [`${icon('check')} Klar`, () => {
    const name = w.querySelector('.field').value.trim() || 'Kubare';
    const p = newProfile(name, `s${s}c${c}`);
    if (photo) p.photo = photo;
    db.profiles.push(p); db.current = p.id; save();
    location.hash = '#/map';
  }, 'primary']]);
  const input = w.querySelector('.field');
  const draw = () => {
    const name = input.value || '?';
    w.querySelector('.av-preview').innerHTML = photo ? photoImg(photo, 'xl') : avatar(`s${s}c${c}`, name, '', 'xl');
    w.querySelector('.photo-clear').classList.toggle('hidden', !photo);
    w.querySelector('.av-pickers').classList.toggle('hidden', !!photo);
    w.querySelectorAll('[data-s]').forEach(b => {
      b.innerHTML = avatar(`s${b.dataset.s}c${c}`, name, '', 'sm');
      b.classList.toggle('sel', +b.dataset.s === s);
    });
    w.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('sel', +b.dataset.c === c));
  };
  w.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { s = +b.dataset.s; draw(); });
  w.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { c = +b.dataset.c; draw(); });
  input.oninput = draw;
  w.querySelector('.photo-pick input').onchange = async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try { photo = await loadPhoto(file); } catch { photo = null; }
    draw();
  };
  w.querySelector('.photo-clear').onclick = () => { photo = null; draw(); };
  draw();
  setTimeout(() => input.focus(), 50);
}

// ---------- Karta ----------

// Låset på kartan: rätt kod låser upp alla steg (samma som föräldrasidans reglage)
const UNLOCK_CODE = '00000';

function askUnlockCode(msg) {
  const wrap = modal(`<h2>Lås upp alla steg</h2>
    <p class="muted">${msg || 'Skriv koden.'}</p>
    <input class="field gate" inputmode="numeric" autocomplete="off">`, [
    ['Avbryt', null, 'ghost'],
    ['Lås upp', () => check(), 'primary'],
  ]);
  const input = wrap.querySelector('.gate');
  const check = () => {
    wrap.remove();
    if (input.value.trim() === UNLOCK_CODE) { db.unlockAll = true; save(); renderMap(); }
    else askUnlockCode('Fel kod. Försök igen.');
  };
  input.onkeydown = e => { if (e.key === 'Enter') check(); };
  input.focus();
}

function renderMap() {
  const p = me();
  const doneCount = WORLDS.filter(w => p.lessons[w.id]).length;
  const current = WORLDS.findIndex((w, i) => isUnlocked(p, i) && !p.lessons[w.id]);

  app.innerHTML = `
    <div class="screen map">
      <header class="map-head">
        <a class="who" href="#/" aria-label="Byt kubare">${pAvatar(p, 'md')}</a>
        <div>
          <h1>Hej ${esc(p.name)}!</h1>
          <p class="sub">${doneCount === WORLDS.length ? 'Du har klarat alla steg.' : `${doneCount} av ${WORLDS.length} steg klara`}</p>
        </div>
        ${db.unlockAll ? '' : `<button class="icon-btn unlock-btn" aria-label="Lås upp alla steg">${icon('lock')}</button>`}
      </header>
      <div class="tiles">
        <a class="tile" href="#/train"><span class="tile-ic">${icon('target')}</span><b>Träna</b><small>Algoritmer</small></a>
        <a class="tile alt" href="#/timer"><span class="tile-ic">${icon('timer')}</span><b>Tidtagning</b><small>Hur snabb är du?</small></a>
      </div>
      <div class="path-wrap">
        <svg class="path-line" aria-hidden="true"><path class="track"/><path class="trail"/></svg>
        <ol class="path">
          ${WORLDS.map((w, i) => {
            const open = isUnlocked(p, i);
            const done = !!p.lessons[w.id];
            const x = 0.5 + 0.38 * Math.sin(i * 1.15);
            return `
            <li class="stop ${open ? '' : 'locked'} ${done ? 'done' : ''} ${i === current ? 'current' : ''}" style="--x:${x.toFixed(3)}">
              <button class="node" data-i="${i}" ${open ? '' : 'disabled'} aria-label="${esc(w.title)}">
                ${open ? glyph(w.id) : icon('lock')}
                ${i === current ? '<span class="node-tag">Start</span>' : ''}
              </button>
              <div class="stop-label">
                <span class="stop-num">Steg ${i}</span>
                <b>${esc(w.title)}</b>
                ${done ? starsHtml(stars(p, w)) : `<small>${esc(w.short)}</small>`}
                ${open && done ? `<a class="mini-btn" href="#/quiz/${w.id}">${icon('question')} Frågor</a>` : ''}
              </div>
            </li>`;
          }).join('')}
        </ol>
      </div>
    </div>`;

  const unlockBtn = app.querySelector('.unlock-btn');
  if (unlockBtn) unlockBtn.onclick = () => askUnlockCode('');

  app.querySelectorAll('.node').forEach(b => b.onclick = () => {
    const w = WORLDS[+b.dataset.i];
    const at = p.lessons[w.id] ? 0 : (p.stepAt[w.id] || 0);
    location.hash = `#/lesson/${w.id}/${at}`;
  });

  // Rita den slingrande stigen mellan stegen
  const wrap = app.querySelector('.path-wrap');
  const drawPath = () => {
    const box = wrap.getBoundingClientRect();
    const pts = [...wrap.querySelectorAll('.node')].map(n => {
      const r = n.getBoundingClientRect();
      return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
    });
    const d = pts.map((q, i) => {
      if (!i) return `M${q[0]},${q[1]}`;
      const p0 = pts[i - 1], dy = (q[1] - p0[1]) / 2;
      return `C${p0[0]},${p0[1] + dy} ${q[0]},${q[1] - dy} ${q[0]},${q[1]}`;
    });
    const svg = wrap.querySelector('.path-line');
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.querySelector('.track').setAttribute('d', d.join(' '));
    svg.querySelector('.trail').setAttribute('d', d.slice(0, Math.max(1, doneCount + 1)).join(' '));
  };
  const ro = new ResizeObserver(drawPath);
  ro.observe(wrap);
  cleanups.push(() => ro.disconnect());
}

// ---------- Lektion ----------

// Bild ovanifrån som pekar på ett fall får fallets algoritm och mask.
function caseFig(d) {
  if (!d.caseRef) return d;
  const c = caseById(d.caseRef);
  return { setupInv: c.alg, mask: c.mask, ...d };
}

function renderLesson(wid, n) {
  const p = me();
  const wi = worldIndex(wid);
  const w = WORLDS[wi];
  if (!w || !isUnlocked(p, wi)) { location.hash = '#/map'; return; }
  n = Math.max(0, Math.min(n, w.steps.length - 1));
  const step = w.steps[n];
  p.stepAt[w.id] = n; save();
  const last = n === w.steps.length - 1;

  // Bilder ovanifrån: { caseRef | setupInv | setup, mask, arrows, label }
  const diagrams = (step.diagrams || (step.diagram ? [step.diagram] : [])).map(caseFig);
  const figs = diagrams.length ? `<div class="topviews">${diagrams.map(d => `
    <figure class="tv">
      <span class="tv-side">Bak</span>${topView(d)}<span class="tv-side">Mot dig</span>
      ${d.label ? `<figcaption>${esc(d.label)}</figcaption>` : ''}
    </figure>`).join('')}</div>` : '';

  app.innerHTML = `
    <div class="screen lesson">
      ${topbar({ middle: progressBar(n, w.steps.length), right: `<span class="world-chip">${glyph(w.id)}</span>` })}
      <div class="lesson-body ${step.cube || figs ? 'has-cube' : 'no-cube'}">
        ${step.cube
          ? '<div class="panel cube-panel"></div>'
          : figs
            ? `<div class="panel art-panel diagrams">${figs}</div>`
            : `<div class="panel art-panel ${step.practice ? 'practice' : ''}">${step.practice ? icon('hand', 'art') : glyph(w.id, 'art')}</div>`}
        <div class="panel text-panel">
          <p class="eyebrow">${step.recap ? 'Kommer du ihåg?' : `Steg ${wi} · ${esc(w.title)}`}</p>
          <h2>${step.title}</h2>
          ${step.cube && figs ? figs : ''}
          <div class="lesson-text">${step.text}</div>
          ${step.rule ? `<p class="rule">${icon('spark')}<span>${step.rule}</span></p>` : ''}
          <div class="text-actions">
            <button class="say" aria-label="Läs upp">${icon('sound')} Läs upp</button>
            ${step.help ? `<button class="say help-btn">${icon('question')} Fastnade du?</button>` : ''}
          </div>
          ${step.practice ? `<button class="btn primary huge done-btn">${icon('check')} Jag klarade det!</button>` : ''}
        </div>
      </div>
      <footer class="navbar">
        <button class="icon-btn big prev" ${n === 0 ? 'disabled' : ''} aria-label="Tillbaka">${icon('back')}</button>
        ${last && step.practice ? '' : `<button class="btn primary next">${last ? 'Klar' : 'Nästa'} ${icon(last ? 'check' : 'next')}</button>`}
      </footer>
    </div>`;

  if (step.cube) createPlayer(app.querySelector('.cube-panel'), step.cube);
  app.querySelector('.say').onclick = () => speak(step.title + '. ' + step.text + (step.rule ? '. ' + step.rule : ''));
  const helpBtn = app.querySelector('.help-btn');
  if (helpBtn) helpBtn.onclick = () => {
    const wrap = modal(`
      <h2>Fastnade du?</h2>
      <p class="muted">Välj det som stämmer, så hoppar du till rätt ställe.</p>
      <div class="help-list">${step.help.map(([text, to], k) => to == null
        ? `<p class="help-tip">${icon('spark')}<span>${esc(text)}</span></p>`
        : `<button class="btn ghost help-item" data-k="${k}">${esc(text)} ${icon('next')}</button>`).join('')}</div>`,
    [['Stäng', null, 'ghost']]);
    wrap.querySelectorAll('.help-item').forEach(b => b.onclick = () => {
      const to = step.help[+b.dataset.k][1];
      wrap.remove();
      location.hash = `#/lesson/${w.id}/${to}`;
    });
  };
  app.querySelector('.navbar .prev').onclick = () => { location.hash = `#/lesson/${w.id}/${n - 1}`; };
  const go = () => { location.hash = last ? `#/quiz/${w.id}` : `#/lesson/${w.id}/${n + 1}`; };
  const next = app.querySelector('.navbar .next');
  if (next) next.onclick = go;
  const done = app.querySelector('.text-panel .done-btn');
  if (done) done.onclick = go;
}

// ---------- Snabbfrågor ----------

// Tre frågor i slutet av varje steg. Första svaret i content.js är det rätta.
function renderQuiz(wid) {
  const p = me();
  const wi = worldIndex(wid);
  const w = WORLDS[wi];
  if (!w || !w.quiz || !isUnlocked(p, wi)) { location.hash = '#/map'; return; }
  const total = w.quiz.length;
  let q = 0, right = 0;

  const ask = () => {
    clearViews();
    if (q >= total) return finish();
    const item = w.quiz[q];
    const fig = item.diagram && caseFig(item.diagram);
    app.innerHTML = `
      <div class="screen quiz">
        ${topbar({ middle: progressBar(q, total), right: `<span class="world-chip">${icon('question')}</span>` })}
        <div class="quiz-body">
          <p class="eyebrow">Snabbfrågor · ${esc(w.title)}</p>
          <h2>${esc(item.q)}</h2>
          ${item.cube ? '<div class="panel cube-panel quiz-cube"></div>' : ''}
          ${fig ? `<div class="topviews"><figure class="tv"><span class="tv-side">Bak</span>${topView(fig)}<span class="tv-side">Mot dig</span></figure></div>` : ''}
          <div class="answers">${shuffle(item.options.map((o, k) => [o, k])).map(([o, k]) => `<button class="btn answer" data-k="${k}">${esc(o)}</button>`).join('')}</div>
          <div class="feedback"></div>
        </div>
      </div>`;
    if (item.cube) createPlayer(app.querySelector('.quiz-cube'), { ...item.cube, alg: '' }); // visa inte lösningen
    app.querySelectorAll('.answer').forEach(b => b.onclick = () => {
      const ok = b.dataset.k === '0';
      if (ok) right++;
      app.querySelectorAll('.answer').forEach(x => {
        x.disabled = true;
        if (x.dataset.k === '0') x.classList.add('right');
        else if (x === b) x.classList.add('wrong');
      });
      const fb = app.querySelector('.feedback');
      fb.innerHTML = `<p class="fb-title ${ok ? 'ok' : ''}">${ok ? `${icon('check')} Rätt!` : `Nästan! Rätt svar: <b>${esc(item.options[0])}</b>`}</p>
        <button class="btn primary nextq">${q + 1 < total ? 'Nästa' : 'Klar'} ${icon(q + 1 < total ? 'next' : 'check')}</button>`;
      fb.querySelector('.nextq').onclick = () => { q++; ask(); };
    });
  };

  const finish = () => {
    const first = !p.lessons[w.id];
    p.lessons[w.id] = true;
    p.stepAt[w.id] = 0;
    const score = right / total;
    if (score > (p.quiz[w.id] || 0)) p.quiz[w.id] = score;
    save();
    if (first || score >= 0.8) confetti();
    app.innerHTML = `
      <div class="screen center-screen">
        <div class="medal big">${score >= 0.8 ? icon('star') : glyph(w.id)}</div>
        <h2>${first ? 'Steget klart!' : `${right} av ${total} rätt`}</h2>
        <p class="muted">${first ? `${right} av ${total} rätt. ` : ''}${score >= 0.8 ? 'Superbra! Du fick en stjärna.' : `Svara rätt på alla ${total} för att få en stjärna.`}</p>
        ${coreCases(w).length ? '<p class="muted">Öva algoritmerna under Träna för att få alla stjärnor.</p>' : ''}
        <div class="row">
          ${score < 0.8 ? `<button class="btn ghost again">${icon('restart')} Igen</button>` : ''}
          <a class="btn primary" href="#/map">Till kartan</a>
        </div>
      </div>`;
    const again = app.querySelector('.again');
    if (again) again.onclick = () => { q = 0; right = 0; ask(); };
  };

  ask();
}

// ---------- Träning ----------

// Träna är ordnat efter metod -> grupp (ett steg i metoden) -> fall.
const methodById = m => TRAIN_METHODS.find(x => x.id === m);
function methodGroup(m, g) {
  const method = methodById(m);
  if (!method) return null;
  const toCases = grp => grp.cases.map(caseById);
  if (g === 'all') return { method, title: `Alla i ${method.title}`, groups: method.groups.map(grp => [grp, toCases(grp)]), cases: method.groups.flatMap(toCases) };
  const grp = method.groups.find(x => x.id === g);
  return grp ? { method, title: grp.title, groups: [[grp, toCases(grp)]], cases: toCases(grp) } : null;
}
const methodCases = method => [...new Set(method.groups.flatMap(grp => grp.cases))].map(caseById);
const groupIcon = grp => grp.world ? glyph(grp.world) : icon('cube');
const levelHtml = box => `<div class="level" aria-label="Nivå ${box} av 5">${[1, 2, 3, 4, 5].map(i => `<span class="${i <= box ? 'on' : ''}"></span>`).join('')}</div>`;

function trainCard(p, href, ic, title, sub, cases, extra = '') {
  const sits = cases.filter(c => (p.boxes[c.id] || 0) >= 3).length;
  return `
    <section class="panel train-card ${extra ? 'last' : ''}">
      <a class="train-main" href="${href}">
        <span class="train-ic">${ic}</span>
        <span class="train-txt"><b>${esc(title)}${extra}</b><small>${esc(sub)}</small>
          <span class="train-meta">${cases.length} ${cases.length === 1 ? 'algoritm' : 'algoritmer'} · ${sits} sitter</span></span>
        ${icon('next')}
      </a>
    </section>`;
}

function renderTrainMenu() {
  const p = me();
  const last = methodById(p.trainMethod) ? p.trainMethod : null;
  const methods = last ? [methodById(last), ...TRAIN_METHODS.filter(m => m.id !== last)] : TRAIN_METHODS;
  app.innerHTML = `
    <div class="screen train-menu">
      ${topbar({ middle: `<span class="topbar-title">${icon('target')} Träna</span>` })}
      <p class="lead">Vilken metod vill du öva på?</p>
      <div class="train-list">
        ${methods.map(m => trainCard(p, `#/train/${m.id}`, groupIcon(m), m.title, m.short, methodCases(m),
          m.id === last ? ' <span class="last-tag">Senast</span>' : '')).join('')}
      </div>
    </div>`;
}

function renderMethod(m) {
  const p = me();
  const method = methodById(m);
  if (!method) { location.hash = '#/train'; return; }
  if (p.trainMethod !== m) { p.trainMethod = m; save(); }
  app.innerHTML = `
    <div class="screen train-menu">
      ${topbar({ back: '#/train', middle: `<span class="topbar-title">${icon('target')} ${esc(method.title)}</span>` })}
      <p class="lead">Vad vill du öva på?</p>
      <div class="train-list">
        ${method.groups.map(grp => trainCard(p, `#/algs/${m}/${grp.id}`, groupIcon(grp), grp.title, grp.short, grp.cases.map(caseById))).join('')}
        ${trainCard(p, `#/algs/${m}/all`, icon('shuffle'), `Alla i ${method.title}`, 'Blandat från alla steg', methodCases(method))}
      </div>
    </div>`;
}

function renderAlgs(m, g) {
  const p = me();
  const sel = methodGroup(m, g);
  if (!sel) { location.hash = '#/train'; return; }
  app.innerHTML = `
    <div class="screen algs">
      ${topbar({ back: `#/train/${m}`, middle: `<span class="topbar-title">${icon('cube')} ${esc(sel.title)}</span>` })}
      ${sel.groups.map(([grp, cases]) => `
        ${g === 'all' ? `<h3 class="alg-group">${esc(grp.title)}</h3>` : `<p class="lead">${esc(grp.short)}</p>`}
        <div class="alg-list">${cases.map(c => `
          <article class="panel alg-card">
            <div class="alg-fig" data-id="${c.id}"></div>
            <div class="alg-info">
              <b>${esc(c.name)}</b>
              <code class="alg">${esc(c.alg)}</code>
              ${levelHtml(p.boxes[c.id] || 0)}
              <button class="btn small play-alg" data-id="${c.id}">${icon('play')} Visa på kuben</button>
            </div>
          </article>`).join('')}</div>`).join('')}
      <div class="row"><a class="btn primary huge" href="#/drill/${m}/${g}">${icon('target')} Öva på de här</a></div>
    </div>`;

  // Fall i toppen visas ovanifrån; F2L- och vita hörn-fallen som en liten kub, eftersom de syns från sidan.
  app.querySelectorAll('.alg-fig').forEach(el => {
    const c = caseById(el.dataset.id);
    if (c.mask === 'f2l' || c.mask === 'firstLayer') {
      const box = document.createElement('div');
      box.className = 'cube-box';
      el.appendChild(box);
      const v = new CubeView(box, { mask: c.mask });
      views.push(v);
      v.applyTokens(invertAlg(parseAlg(c.alg)));
      v.applyCamera();
    } else {
      el.innerHTML = topView({ setupInv: c.alg, mask: c.mask, arrows: c.mask === 'full' });
    }
  });
  app.querySelectorAll('.play-alg').forEach(b => b.onclick = () => {
    const c = caseById(b.dataset.id);
    let pl;
    const wrap = modal(`<h2>${esc(c.name)}</h2><div class="modal-player"></div>`, [['Stäng', () => {
      pl.view.destroy();
      views = views.filter(v => v !== pl.view);
    }, 'primary']]);
    pl = createPlayer(wrap.querySelector('.modal-player'), { setupInv: c.alg, alg: c.alg, mask: c.mask });
  });
}

function renderTrainer(m, g) {
  const p = me();
  const sel = methodGroup(m, g);
  if (!sel) { location.hash = '#/train'; return; }
  const pool = sel.cases;
  const groupOf = c => sel.groups.find(([, cases]) => cases.includes(c))[0];

  // Svåra fall (låg låda) kommer oftare
  const pick = () => {
    const weights = pool.map(c => 1 / Math.pow(1 + (p.boxes[c.id] || 0), 1.5) * (c.bonus ? 0.5 : 1));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
    return pool[0];
  };

  let prev = null;
  const show = () => {
    clearViews();
    let c = pick();
    if (pool.length > 1) while (c === prev) c = pick();
    prev = c;
    const box = p.boxes[c.id] || 0;
    app.innerHTML = `
      <div class="screen trainer">
        ${topbar({ back: `#/algs/${m}/${g}`, middle: `<span class="topbar-title">${icon('target')} ${esc(sel.title)}</span>`, right: `<a class="mini-btn" href="#/algs/${m}/${g}">${icon('cube')} Algoritmer</a>` })}
        <div class="split">
          <div class="panel cube-panel trainer-cube"></div>
          <div class="panel text-panel trainer-side">
            <p class="eyebrow">${esc(groupOf(c).title)}</p>
            <h2 class="case-name">Vad gör du här?</h2>
            ${levelHtml(box)}
            <p class="hint muted">Gör det på din kub, eller tänk efter. Tryck sedan på knappen.</p>
            <button class="btn primary huge reveal">${icon('eye')} Visa lösningen</button>
            <div class="rate hidden">
              <p class="rate-label">Hur gick det?</p>
              <div class="rate-row">
                <button class="btn rate-btn r0"><span class="dot hard"></span>Svårt</button>
                <button class="btn rate-btn r1"><span class="dot mid"></span>Okej</button>
                <button class="btn rate-btn r2"><span class="dot easy"></span>Lätt</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    const cubeHost = app.querySelector('.trainer-cube');
    createPlayer(cubeHost, { setupInv: c.alg, mask: c.mask });
    app.querySelector('.reveal').onclick = e => {
      e.currentTarget.remove();
      app.querySelector('.case-name').innerHTML = `${esc(c.name)}<code class="alg">${esc(c.alg)}</code>`;
      app.querySelector('.hint').textContent = 'Tryck på spela för att se den på kuben.';
      app.querySelector('.rate').classList.remove('hidden');
      clearViews();
      createPlayer(cubeHost, { setupInv: c.alg, alg: c.alg, mask: c.mask });
    };
    const rate = delta => {
      const b = p.boxes[c.id] || 0;
      p.boxes[c.id] = delta < 0 ? 0 : delta === 0 ? Math.max(1, b) : Math.min(5, b + 1);
      save();
      if (p.boxes[c.id] === 5 && b < 5) confetti();
      show();
    };
    app.querySelector('.r0').onclick = () => rate(-1);
    app.querySelector('.r1').onclick = () => rate(0);
    app.querySelector('.r2').onclick = () => rate(1);
  };
  show();
}

// ---------- Tidtagning ----------

function fmt(ms) {
  const s = ms / 1000;
  if (s < 60) return s.toFixed(2);
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`;
}

function renderTimer() {
  const p = me();
  let state = 'idle', t0 = 0, raf = 0, holdTimer = 0;

  app.innerHTML = `
    <div class="screen timer-screen">
      ${topbar({ middle: `<span class="topbar-title">${icon('timer')} Tidtagning</span>`, right: pAvatar(p, 'sm') })}
      <div class="timer-pad" tabindex="0">
        <div class="time">0.00</div>
        <p class="timer-help">Håll fingret här tills det blir grönt. Släpp för att starta. Tryck för att stoppa.</p>
      </div>
      <div class="times"></div>
    </div>`;

  const timeEl = app.querySelector('.time');
  const pad = app.querySelector('.timer-pad');
  const drawTimes = () => {
    const times = p.times.slice(-10).reverse();
    const best = p.times.length ? Math.min(...p.times.map(t => t.ms)) : null;
    const last5 = p.times.slice(-5);
    const avg = last5.length === 5 ? last5.reduce((a, t) => a + t.ms, 0) / 5 : null;
    app.querySelector('.times').innerHTML = `
      <div class="stats">
        <div><small>Bästa</small><b>${best ? fmt(best) : '–'}</b></div>
        <div><small>Snitt av 5</small><b>${avg ? fmt(avg) : '–'}</b></div>
        <div><small>Lösningar</small><b>${p.times.length}</b></div>
      </div>
      <ol class="time-list">${times.map(t => `<li class="${t.ms === best ? 'best' : ''}">${t.ms === best ? icon('star') : ''}${fmt(t.ms)}</li>`).join('')}</ol>
      ${times.length ? `<button class="btn ghost small del">${icon('trash')} Ta bort senaste</button>` : ''}`;
    const del = app.querySelector('.del');
    if (del) del.onclick = () => { p.times.pop(); save(); drawTimes(); };
  };

  const tick = () => {
    timeEl.textContent = fmt(performance.now() - t0);
    raf = requestAnimationFrame(tick);
  };
  const press = () => {
    if (state === 'running') {
      cancelAnimationFrame(raf);
      const ms = performance.now() - t0;
      timeEl.textContent = fmt(ms);
      const prevBest = p.times.length ? Math.min(...p.times.map(t => t.ms)) : Infinity;
      p.times.push({ ms, at: Date.now() });
      save();
      if (ms < prevBest && p.times.length > 1) confetti();
      state = 'stopped';
      pad.className = 'timer-pad';
      drawTimes();
      return;
    }
    state = 'holding';
    pad.className = 'timer-pad holding';
    holdTimer = setTimeout(() => { state = 'ready'; pad.className = 'timer-pad ready'; timeEl.textContent = '0.00'; }, 350);
  };
  const release = () => {
    clearTimeout(holdTimer);
    if (state === 'ready') {
      state = 'running';
      pad.className = 'timer-pad running';
      t0 = performance.now();
      tick();
    } else if (state === 'holding') {
      state = 'idle';
      pad.className = 'timer-pad';
    } else if (state === 'stopped') {
      state = 'idle';
    }
  };

  pad.addEventListener('pointerdown', e => { e.preventDefault(); press(); });
  pad.addEventListener('pointerup', release);
  pad.addEventListener('pointercancel', release);
  const key = e => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    if (e.type === 'keydown' && !e.repeat) press();
    if (e.type === 'keyup') release();
  };
  document.addEventListener('keydown', key);
  document.addEventListener('keyup', key);
  cleanups.push(() => {
    cancelAnimationFrame(raf);
    document.removeEventListener('keydown', key);
    document.removeEventListener('keyup', key);
  });

  drawTimes();
}

// ---------- Föräldrar ----------

let parentOk = false;

function renderParent() {
  if (!parentOk) {
    const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
    app.innerHTML = `
      <div class="screen center-screen">
        <div class="medal big">${icon('users')}</div>
        <h2>För föräldrar</h2>
        <p class="muted">Vad är ${a} × ${b}?</p>
        <input class="field gate" inputmode="numeric" autocomplete="off">
        <div class="row"><a class="btn ghost" href="#/">Tillbaka</a><button class="btn primary go">OK</button></div>
      </div>`;
    const go = () => {
      if (+app.querySelector('.gate').value === a * b) { parentOk = true; renderParent(); }
      else app.querySelector('.gate').value = '';
    };
    app.querySelector('.go').onclick = go;
    app.querySelector('.gate').onkeydown = e => { if (e.key === 'Enter') go(); };
    return;
  }

  app.innerHTML = `
    <div class="screen parent">
      ${topbar({ back: '#/', middle: `<span class="topbar-title">${icon('users')} Föräldraöversikt</span>` })}
      ${db.profiles.length ? '' : '<p class="muted">Inga profiler än.</p>'}
      ${db.profiles.map(p => {
        const best = p.times.length ? fmt(Math.min(...p.times.map(t => t.ms))) : '–';
        const week = p.times.filter(t => t.at > Date.now() - 7 * 864e5).length;
        const mastered = ALL_CASES.filter(c => (p.boxes[c.id] || 0) >= 3).length;
        return `
        <section class="panel pcard">
          <h3>${pAvatar(p, 'sm')} ${esc(p.name)}</h3>
          <div class="pstats">
            <div><small>Algoritmer som sitter</small><b>${mastered} / ${ALL_CASES.length}</b></div>
            <div><small>Bästa tid</small><b>${best}</b></div>
            <div><small>Lösningar, 7 dagar</small><b>${week}</b></div>
          </div>
          <table>
            ${WORLDS.map((w, i) => `<tr><td><span class="tglyph">${glyph(w.id)}</span>${i}. ${esc(w.title)}</td><td>${starsHtml(stars(p, w))}</td>
              <td>${p.quiz[w.id] != null ? `Frågor ${Math.round(p.quiz[w.id] * 100)} %` : ''}</td></tr>`).join('')}
          </table>
          <div class="row start">
            <button class="btn ghost small reset" data-id="${p.id}">${icon('restart')} Nollställ framsteg</button>
            <button class="btn ghost small delete" data-id="${p.id}">${icon('trash')} Ta bort profil</button>
          </div>
        </section>`;
      }).join('')}
      <section class="panel pcard">
        <label class="toggle"><input type="checkbox" class="unlock" ${db.unlockAll ? 'checked' : ''}><span class="switch"></span> Lås upp alla steg</label>
        <p class="muted small">Sparas bara i den här enheten/webbläsaren.</p>
      </section>
    </div>`;
  app.querySelector('.unlock').onchange = e => { db.unlockAll = e.target.checked; save(); };
  app.querySelectorAll('.reset').forEach(b => b.onclick = () => {
    const p = db.profiles.find(x => x.id === b.dataset.id);
    modal(`<h2>Nollställa ${esc(p.name)}?</h2><p class="muted">Alla stjärnor och tider försvinner.</p>`,
      [['Avbryt', null, 'ghost'], ['Nollställ', () => {
        Object.assign(p, newProfile(p.name, p.avatar), { id: p.id });
        save(); renderParent();
      }, 'danger']]);
  });
  app.querySelectorAll('.delete').forEach(b => b.onclick = () => {
    const p = db.profiles.find(x => x.id === b.dataset.id);
    modal(`<h2>Ta bort ${esc(p.name)}?</h2><p class="muted">Profilen och alla framsteg försvinner.</p>`,
      [['Avbryt', null, 'ghost'], ['Ta bort', () => {
        db.profiles = db.profiles.filter(x => x.id !== p.id);
        if (db.current === p.id) db.current = null;
        save(); renderParent();
      }, 'danger']]);
  });
}

// ---------- Start ----------

// Äldre profiler (emoji-avatarer) får en form istället – sparas så att den blir stabil.
let migrated = false;
for (const p of db.profiles) {
  if (!/^s\d+c\d+$/.test(p.avatar || '')) {
    const { s, c } = parseAvatar(p.avatar, p.id);
    p.avatar = `s${s}c${c}`;
    migrated = true;
  }
}
if (migrated) save();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  // Ny version: ladda om en gång när den nya service workern tar över (inte vid allra första besöket).
  let reloading = false;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js').then(reg => {
    // Hemskärmsappen laddas inte om när den öppnas igen – leta efter uppdateringar då.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(() => {});
    });
  }).catch(() => {});
}
if (window.speechSynthesis) speechSynthesis.getVoices();
route();
