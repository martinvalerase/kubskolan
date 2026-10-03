import { CubeView, parseAlg, invertAlg, moveHint, randomScramble } from './cube.js';
import { WORLDS, ALL_CASES, caseById } from './content.js';
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
const hasQuiz = w => coreCases(w).length >= 2;

function isUnlocked(p, i) {
  return i === 0 || db.unlockAll || !!p.lessons[WORLDS[i - 1].id];
}

function stars(p, w) {
  if (!p.lessons[w.id]) return 0;
  let s = 1;
  if (!hasQuiz(w) || (p.quiz[w.id] || 0) >= 0.8) s++;
  if (coreCases(w).every(c => (p.boxes[c.id] || 0) >= 3)) s++;
  return s;
}

const starsHtml = n => `<span class="stars" aria-label="${n} av 3 stjärnor">${[0, 1, 2].map(i => icon(i < n ? 'star' : 'starO', i < n ? 'on' : '')).join('')}</span>`;
const pAvatar = (p, cls) => avatar(p.avatar, p.name, p.id, cls);

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

function chipsHtml(tokens, done = -1) {
  return tokens.map((t, i) => {
    const h = moveHint(t);
    const cls = i < done ? 'done' : i === done ? 'cur' : '';
    return `<span class="chip ${cls}" title="${esc(h.name)}"><b>${esc(t.text)}</b><i>${h.arrow}</i></span>`;
  }).join('');
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

const PAD = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'"];

// cfg: { setup, setupInv, setupTokens, alg, mask, pad, pitch, yaw, caseRef }
function createPlayer(host, cfg) {
  if (cfg.caseRef) {
    const c = caseById(cfg.caseRef);
    cfg = { ...cfg, setupInv: c.alg, alg: c.alg, mask: c.mask };
  }
  const tokens = parseAlg(cfg.alg || '');
  const setup = cfg.setupTokens || (cfg.setupInv ? invertAlg(parseAlg(cfg.setupInv)) : parseAlg(cfg.setup || ''));

  host.innerHTML = `
    <div class="player">
      <div class="cube-box"></div>
      ${tokens.length ? `
        <div class="chips"></div>
        <div class="controls">
          <button class="ctl" data-a="reset" aria-label="Börja om">${icon('restart')}</button>
          <button class="ctl" data-a="back" aria-label="Ett drag bakåt">${icon('stepB')}</button>
          <button class="ctl play" data-a="play" aria-label="Spela">${icon('play')}</button>
          <button class="ctl" data-a="fwd" aria-label="Ett drag framåt">${icon('stepF')}</button>
          <button class="ctl speed" data-a="speed" aria-label="Långsamt">½×</button>
        </div>` : ''}
      ${cfg.pad ? `<div class="pad">${PAD.map(m => `<button class="padbtn" data-m="${m}"><b>${m}</b><i>${moveHint(parseAlg(m)[0]).arrow}</i></button>`).join('')}
        <button class="padbtn wide" data-m="reset">${icon('restart')} Nollställ</button></div>` : ''}
    </div>`;

  // Brantare vinkel när det är toppen man ska titta på
  const pitch = cfg.pitch ?? (cfg.mask === 'oll' ? -45 : undefined);
  const view = new CubeView(host.querySelector('.cube-box'), { mask: cfg.mask || 'full', pitch, yaw: cfg.yaw });
  views.push(view);
  view.applyTokens(setup);
  view.applyCamera();

  let i = 0, playing = false, slow = false;
  const chipsEl = host.querySelector('.chips');
  const playBtn = host.querySelector('[data-a=play]');
  const update = () => {
    if (chipsEl) chipsEl.innerHTML = chipsHtml(tokens, i);
    if (playBtn) {
      playBtn.innerHTML = icon(playing ? 'pause' : 'play');
      playBtn.setAttribute('aria-label', playing ? 'Pausa' : 'Spela');
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
    while (playing && i < tokens.length && !view.dead) await forward();
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
  if (name === 'train') return renderTrainer();
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
  const w = modal(`
    <h2>Ny kubare</h2>
    <div class="av-preview"></div>
    <input class="field" maxlength="16" placeholder="Vad heter du?" autocomplete="off">
    <p class="pick-label">Form</p>
    <div class="pick shapes">${Array.from({ length: AV_SHAPES }, (_, i) => `<button class="pick-btn" data-s="${i}" aria-label="Form ${i + 1}"></button>`).join('')}</div>
    <p class="pick-label">Färg</p>
    <div class="pick colors">${AV_COLORS.map((col, i) => `<button class="pick-btn dot" data-c="${i}" style="--c:${col}" aria-label="Färg ${i + 1}"></button>`).join('')}</div>`,
  [['Avbryt', null, 'ghost'], [`${icon('check')} Klar`, () => {
    const name = w.querySelector('.field').value.trim() || 'Kubare';
    const p = newProfile(name, `s${s}c${c}`);
    db.profiles.push(p); db.current = p.id; save();
    location.hash = '#/map';
  }, 'primary']]);
  const input = w.querySelector('.field');
  const draw = () => {
    const name = input.value || '?';
    w.querySelector('.av-preview').innerHTML = avatar(`s${s}c${c}`, name, '', 'xl');
    w.querySelectorAll('[data-s]').forEach(b => {
      b.innerHTML = avatar(`s${b.dataset.s}c${c}`, name, '', 'sm');
      b.classList.toggle('sel', +b.dataset.s === s);
    });
    w.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('sel', +b.dataset.c === c));
  };
  w.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { s = +b.dataset.s; draw(); });
  w.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { c = +b.dataset.c; draw(); });
  input.oninput = draw;
  draw();
  setTimeout(() => input.focus(), 50);
}

// ---------- Karta ----------

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
                ${open && done && hasQuiz(w) ? `<a class="mini-btn" href="#/quiz/${w.id}">${icon('question')} Quiz</a>` : ''}
              </div>
            </li>`;
          }).join('')}
        </ol>
      </div>
    </div>`;

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

function renderLesson(wid, n) {
  const p = me();
  const wi = worldIndex(wid);
  const w = WORLDS[wi];
  if (!w || !isUnlocked(p, wi)) { location.hash = '#/map'; return; }
  n = Math.max(0, Math.min(n, w.steps.length - 1));
  const step = w.steps[n];
  p.stepAt[w.id] = n; save();
  const last = n === w.steps.length - 1;

  app.innerHTML = `
    <div class="screen lesson">
      ${topbar({ middle: progressBar(n, w.steps.length), right: `<span class="world-chip">${glyph(w.id)}</span>` })}
      <div class="lesson-body ${step.cube ? 'has-cube' : 'no-cube'}">
        ${step.cube
          ? '<div class="panel cube-panel"></div>'
          : `<div class="panel art-panel ${step.practice ? 'practice' : ''}">${step.practice ? icon('hand', 'art') : glyph(w.id, 'art')}</div>`}
        <div class="panel text-panel">
          <p class="eyebrow">Steg ${wi} · ${esc(w.title)}</p>
          <h2>${step.title}</h2>
          <div class="lesson-text">${step.text}</div>
          <button class="say" aria-label="Läs upp">${icon('sound')} Läs upp</button>
          ${step.practice ? `<button class="btn primary huge done-btn">${icon('check')} Jag klarade det!</button>` : ''}
        </div>
      </div>
      <footer class="navbar">
        <button class="icon-btn big prev" ${n === 0 ? 'disabled' : ''} aria-label="Tillbaka">${icon('back')}</button>
        ${last && step.practice ? '' : `<button class="btn primary next">${last ? 'Klar' : 'Nästa'} ${icon(last ? 'check' : 'next')}</button>`}
      </footer>
    </div>`;

  if (step.cube) createPlayer(app.querySelector('.cube-panel'), step.cube);
  app.querySelector('.say').onclick = () => speak(step.title + '. ' + step.text);
  app.querySelector('.navbar .prev').onclick = () => { location.hash = `#/lesson/${w.id}/${n - 1}`; };
  const go = () => last ? completeWorld(w) : (location.hash = `#/lesson/${w.id}/${n + 1}`);
  const next = app.querySelector('.navbar .next');
  if (next) next.onclick = go;
  const done = app.querySelector('.text-panel .done-btn');
  if (done) done.onclick = go;
}

function completeWorld(w) {
  const p = me();
  const first = !p.lessons[w.id];
  p.lessons[w.id] = true;
  p.stepAt[w.id] = 0;
  save();
  confetti();
  const buttons = [['Till kartan', () => { location.hash = '#/map'; }, hasQuiz(w) ? 'ghost' : 'primary']];
  if (hasQuiz(w)) buttons.push([`${icon('question')} Gör quizet`, () => { location.hash = `#/quiz/${w.id}`; }, 'primary']);
  modal(`
    <div class="medal">${glyph(w.id)}</div>
    <h2>${first ? 'Steget klart!' : 'Bra jobbat!'}</h2>
    <p>Du klarade <b>${esc(w.title)}</b>.</p>
    ${coreCases(w).length ? '<p class="muted">Öva algoritmerna under Träna för att få alla stjärnor.</p>' : ''}`,
  buttons);
}

// ---------- Quiz ----------

function renderQuiz(wid) {
  const p = me();
  const w = WORLDS[worldIndex(wid)];
  if (!w || !hasQuiz(w)) { location.hash = '#/map'; return; }
  const cases = coreCases(w);
  const total = 5;
  let q = 0, right = 0;

  const ask = () => {
    clearViews();
    if (q >= total) return finish();
    const c = cases[Math.floor(Math.random() * cases.length)];
    const setup = invertAlg(parseAlg(c.alg));
    if (w.auf) setup.push(...parseAlg(['', 'U', 'U2', "U'"][Math.floor(Math.random() * 4)]));
    app.innerHTML = `
      <div class="screen quiz">
        ${topbar({ middle: progressBar(q, total), right: `<span class="world-chip">${icon('question')}</span>` })}
        <div class="quiz-body">
          <p class="eyebrow">Quiz · ${esc(w.title)}</p>
          <h2>${esc(w.caseIntro || 'Vilket fall är det?')}</h2>
          <div class="panel cube-panel quiz-cube"></div>
          <div class="answers">${shuffle(cases).map(o => `<button class="btn answer" data-id="${o.id}">${esc(o.name)}</button>`).join('')}</div>
          <div class="feedback"></div>
        </div>
      </div>`;
    createPlayer(app.querySelector('.quiz-cube'), { setupTokens: setup, mask: c.mask });
    app.querySelectorAll('.answer').forEach(b => b.onclick = () => {
      const ok = b.dataset.id === c.id;
      if (ok) right++;
      app.querySelectorAll('.answer').forEach(x => {
        x.disabled = true;
        if (x.dataset.id === c.id) x.classList.add('right');
        else if (x === b) x.classList.add('wrong');
      });
      const fb = app.querySelector('.feedback');
      fb.innerHTML = `<p class="fb-title ${ok ? 'ok' : ''}">${ok ? `${icon('check')} Rätt!` : `Nästan! Det var <b>${esc(c.name)}</b>.`}</p>
        <code class="alg">${esc(c.alg)}</code>
        <button class="btn primary nextq">Nästa ${icon('next')}</button>`;
      fb.querySelector('.nextq').onclick = () => { q++; ask(); };
    });
  };

  const finish = () => {
    const score = right / total;
    if (score > (p.quiz[w.id] || 0)) { p.quiz[w.id] = score; save(); }
    if (score >= 0.8) confetti();
    app.innerHTML = `
      <div class="screen center-screen">
        <div class="medal big">${score >= 0.8 ? icon('star') : glyph(w.id)}</div>
        <h2>${right} av ${total} rätt</h2>
        <p class="muted">${score >= 0.8 ? 'Superbra! Du fick en stjärna till.' : 'Bra försök! Klarar du 4 av 5 får du en stjärna.'}</p>
        <div class="row">
          <a class="btn ghost" href="#/map">Till kartan</a>
          <button class="btn primary again">${icon('restart')} Igen</button>
        </div>
      </div>`;
    app.querySelector('.again').onclick = () => { q = 0; right = 0; ask(); };
  };

  ask();
}

// ---------- Träning ----------

function renderTrainer() {
  const p = me();
  const pool = ALL_CASES.filter(c => db.unlockAll || p.lessons[c.world]);
  if (!pool.length) {
    app.innerHTML = `
      <div class="screen center-screen">
        <div class="medal big">${icon('lock')}</div>
        <h2>Träningen är låst</h2>
        <p class="muted">Klara steget <b>Mittenvåningen</b> först – då finns det algoritmer att träna på.</p>
        <a class="btn primary" href="#/map">Till kartan</a>
      </div>`;
    return;
  }

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
    const w = WORLDS[worldIndex(c.world)];
    const box = p.boxes[c.id] || 0;
    app.innerHTML = `
      <div class="screen trainer">
        ${topbar({ middle: `<span class="topbar-title">${icon('target')} Träna</span>`, right: `<span class="world-chip">${glyph(w.id)}</span>` })}
        <div class="split">
          <div class="panel cube-panel trainer-cube"></div>
          <div class="panel text-panel trainer-side">
            <p class="eyebrow">${esc(w.title)}</p>
            <h2 class="case-name">Vad gör du här?</h2>
            <div class="level" aria-label="Nivå ${box} av 5">${[1, 2, 3, 4, 5].map(i => `<span class="${i <= box ? 'on' : ''}"></span>`).join('')}</div>
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
  let scramble = randomScramble(20);
  let state = 'idle', t0 = 0, raf = 0, holdTimer = 0, showCube = false;

  app.innerHTML = `
    <div class="screen timer-screen">
      ${topbar({ middle: `<span class="topbar-title">${icon('timer')} Tidtagning</span>`, right: pAvatar(p, 'sm') })}
      <div class="panel scramble-box">
        <p class="eyebrow">Blanda din kub – gul upp, grön fram</p>
        <div class="chips scramble"></div>
        <div class="row">
          <button class="btn ghost small newscr">${icon('shuffle')} Ny blandning</button>
          <button class="btn ghost small showcube">${icon('eye')} Visa på kuben</button>
        </div>
        <div class="scramble-cube hidden"></div>
      </div>
      <div class="timer-pad" tabindex="0">
        <div class="time">0.00</div>
        <p class="timer-help">Håll fingret här tills det blir grönt. Släpp för att starta. Tryck för att stoppa.</p>
      </div>
      <div class="times"></div>
    </div>`;

  const timeEl = app.querySelector('.time');
  const pad = app.querySelector('.timer-pad');
  const cubeHost = app.querySelector('.scramble-cube');

  const drawScramble = () => {
    app.querySelector('.scramble').innerHTML = chipsHtml(scramble);
    if (showCube) {
      clearViews();
      createPlayer(cubeHost, { setupTokens: scramble, mask: 'full' });
    }
  };
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
      scramble = randomScramble(20);
      drawScramble();
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

  app.querySelector('.newscr').onclick = () => { scramble = randomScramble(20); drawScramble(); };
  app.querySelector('.showcube').onclick = e => {
    showCube = !showCube;
    cubeHost.classList.toggle('hidden', !showCube);
    e.currentTarget.innerHTML = showCube ? `${icon('eyeOff')} Dölj kuben` : `${icon('eye')} Visa på kuben`;
    if (showCube) drawScramble(); else clearViews();
  };
  drawScramble();
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
              <td>${hasQuiz(w) && p.quiz[w.id] != null ? `Quiz ${Math.round(p.quiz[w.id] * 100)} %` : ''}</td></tr>`).join('')}
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
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
if (window.speechSynthesis) speechSynthesis.getVoices();
route();
