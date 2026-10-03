import { CubeView, parseAlg, invertAlg, moveHint, randomScramble } from './cube.js';
import { WORLDS, ALL_CASES, caseById, AVATARS } from './content.js';

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

function newProfile(name, avatar) {
  return { id: Date.now().toString(36), name, avatar, lessons: {}, quiz: {}, boxes: {}, times: [], stepAt: {} };
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

const starText = n => '★'.repeat(n) + '☆'.repeat(3 - n);

// ---------- Hjälpfunktioner ----------

const app = document.getElementById('app');
let views = [];

function clearViews() {
  views.forEach(v => v.destroy());
  views = [];
  if (window.speechSynthesis) speechSynthesis.cancel();
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
  const colors = ['#FFD500', '#00A651', '#1565D8', '#FF7A00', '#E3172B', '#ffffff'];
  for (let i = 0; i < 90; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + '%';
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = Math.random() * 0.6 + 's';
    s.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
    s.style.transform = `rotate(${Math.random() * 360}deg)`;
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3500);
}

function modal(html, buttons) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-wrap';
  wrap.innerHTML = `<div class="modal">${html}<div class="modal-buttons"></div></div>`;
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
    const cls = i < done ? 'done' : i === done ? 'next' : '';
    return `<span class="chip ${cls}" title="${esc(h.name)}"><b>${esc(t.text)}</b><i>${h.arrow}</i></span>`;
  }).join('');
}

// ---------- Kubspelare ----------

const PAD = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'"];

// cfg: { setup, setupInv, setupTokens, alg, mask, pad, pitch, yaw, caseRef, noControls }
function createPlayer(host, cfg) {
  if (cfg.caseRef) {
    const c = caseById(cfg.caseRef);
    cfg = { ...cfg, setupInv: c.alg, alg: c.alg, mask: c.mask };
  }
  const tokens = parseAlg(cfg.alg || '');
  const setup = cfg.setupTokens || (cfg.setupInv ? invertAlg(parseAlg(cfg.setupInv)) : parseAlg(cfg.setup || ''));
  const showControls = tokens.length && !cfg.noControls;

  host.innerHTML = `
    <div class="player">
      <div class="cube-box"></div>
      ${showControls ? `
        <div class="chips"></div>
        <div class="controls">
          <button class="ctl" data-a="reset" aria-label="Börja om">⏮</button>
          <button class="ctl" data-a="back" aria-label="Ett steg bakåt">◀</button>
          <button class="ctl play" data-a="play" aria-label="Spela">▶</button>
          <button class="ctl" data-a="fwd" aria-label="Ett steg framåt">▶|</button>
          <button class="ctl" data-a="speed" aria-label="Långsamt">🐢</button>
        </div>` : ''}
      ${cfg.pad ? `<div class="pad">${PAD.map(m => `<button class="padbtn" data-m="${m}">${m}<i>${moveHint(parseAlg(m)[0]).arrow}</i></button>`).join('')}
        <button class="padbtn wide" data-m="reset">↺ Nollställ</button></div>` : ''}
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
    if (playBtn) playBtn.textContent = playing ? '⏸' : '▶';
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
  clearViews();
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

function renderProfiles() {
  app.innerHTML = `
    <div class="screen profiles">
      <h1 class="logo"><span class="logo-cube">🧊</span> Kubskolan</h1>
      <p class="lead">Vem ska kuba idag?</p>
      <div class="profile-grid">
        ${db.profiles.map(p => `
          <button class="profile-card" data-id="${p.id}">
            <span class="avatar">${p.avatar}</span>
            <span class="pname">${esc(p.name)}</span>
            <span class="pbadges">${WORLDS.filter(w => p.lessons[w.id]).map(w => w.badge).join('') || '&nbsp;'}</span>
          </button>`).join('')}
        <button class="profile-card add" data-id="new"><span class="avatar">➕</span><span class="pname">Ny kubare</span></button>
      </div>
      <a class="parent-link" href="#/parent">👪 För föräldrar</a>
    </div>`;
  app.querySelectorAll('.profile-card').forEach(b => b.onclick = () => {
    if (b.dataset.id === 'new') return newProfileDialog();
    db.current = b.dataset.id; save();
    location.hash = '#/map';
  });
}

function newProfileDialog() {
  let avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const w = modal(`
    <h2>Ny kubare</h2>
    <input class="name-input" maxlength="16" placeholder="Vad heter du?" autocomplete="off">
    <div class="avatar-pick">${AVATARS.map(a => `<button class="av ${a === avatar ? 'sel' : ''}">${a}</button>`).join('')}</div>`,
  [['Avbryt', null, 'ghost'], ['Klar! ✔', () => {
    const name = w.querySelector('.name-input').value.trim() || 'Kubare';
    const p = newProfile(name, avatar);
    db.profiles.push(p); db.current = p.id; save();
    location.hash = '#/map';
  }, 'primary']]);
  w.querySelectorAll('.av').forEach(b => b.onclick = () => {
    avatar = b.textContent;
    w.querySelectorAll('.av').forEach(x => x.classList.toggle('sel', x === b));
  });
  setTimeout(() => w.querySelector('.name-input').focus(), 50);
}

// ---------- Karta ----------

function renderMap() {
  const p = me();
  const badges = WORLDS.filter(w => p.lessons[w.id]);
  app.innerHTML = `
    <div class="screen map">
      <header class="topbar">
        <a class="who" href="#/"><span class="avatar sm">${p.avatar}</span>${esc(p.name)}</a>
        <div class="shelf" title="Dina märken">${badges.map(w => `<span>${w.badge}</span>`).join('') || '<em>Inga märken än</em>'}</div>
      </header>
      <div class="quick">
        <a class="big-btn train" href="#/train">🎯 Träna</a>
        <a class="big-btn timer" href="#/timer">⏱️ Tidtagning</a>
      </div>
      <ol class="path">
        ${WORLDS.map((w, i) => {
          const open = isUnlocked(p, i);
          const s = stars(p, w);
          return `
          <li class="world ${open ? '' : 'locked'} ${p.lessons[w.id] ? 'done' : ''}" style="--wc:${w.color}">
            <button class="world-btn" data-i="${i}" ${open ? '' : 'disabled'}>
              <span class="world-emoji">${open ? w.emoji : '🔒'}</span>
              <span class="world-text">
                <b>${i}. ${esc(w.title)}</b>
                <small>${esc(w.short)}</small>
              </span>
              <span class="stars">${starText(s)}</span>
            </button>
            ${open && hasQuiz(w) && p.lessons[w.id] ? `<a class="quiz-link" href="#/quiz/${w.id}">❓ Quiz</a>` : ''}
          </li>`;
        }).join('')}
      </ol>
    </div>`;
  app.querySelectorAll('.world-btn').forEach(b => b.onclick = () => {
    const w = WORLDS[+b.dataset.i];
    const at = p.lessons[w.id] ? 0 : (p.stepAt[w.id] || 0);
    location.hash = `#/lesson/${w.id}/${at}`;
  });
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
    <div class="screen lesson" style="--wc:${w.color}">
      <header class="topbar">
        <a class="back" href="#/map">✕</a>
        <div class="dots">${w.steps.map((_, i) => `<span class="${i < n ? 'done' : i === n ? 'cur' : ''}"></span>`).join('')}</div>
        <span class="wtag">${w.emoji}</span>
      </header>
      <div class="lesson-body ${step.cube ? 'has-cube' : 'no-cube'}">
        ${step.cube ? '<div class="lesson-cube"></div>' : `<div class="lesson-art">${step.practice ? '🙌' : w.emoji}</div>`}
        <div class="lesson-text">
          <h2>${step.title} <button class="say" aria-label="Läs upp">🔊</button></h2>
          <p>${step.text}</p>
          ${step.practice ? '<button class="btn primary huge done-btn">Jag klarade det! 🎉</button>' : ''}
        </div>
      </div>
      <footer class="navbar">
        <button class="btn ghost prev" ${n === 0 ? 'disabled' : ''}>◀ Tillbaka</button>
        ${last && step.practice ? '' : `<button class="btn primary next">${last ? 'Klar! 🎉' : 'Nästa ▶'}</button>`}
      </footer>
    </div>`;

  if (step.cube) createPlayer(app.querySelector('.lesson-cube'), step.cube);
  app.querySelector('.say').onclick = () => speak(step.title + '. ' + step.text);
  app.querySelector('.prev').onclick = () => { location.hash = `#/lesson/${w.id}/${n - 1}`; };
  const next = app.querySelector('.next');
  if (next) next.onclick = () => last ? completeWorld(w) : (location.hash = `#/lesson/${w.id}/${n + 1}`);
  const done = app.querySelector('.done-btn');
  if (done) done.onclick = () => last ? completeWorld(w) : (location.hash = `#/lesson/${w.id}/${n + 1}`);
}

function completeWorld(w) {
  const p = me();
  const first = !p.lessons[w.id];
  p.lessons[w.id] = true;
  p.stepAt[w.id] = 0;
  save();
  confetti();
  const buttons = [['Till kartan', () => { location.hash = '#/map'; }, hasQuiz(w) ? 'ghost' : 'primary']];
  if (hasQuiz(w)) buttons.push(['Gör quizet ❓', () => { location.hash = `#/quiz/${w.id}`; }, 'primary']);
  modal(`
    <div class="badge-big">${w.badge}</div>
    <h2>${first ? 'Nytt märke!' : 'Bra jobbat!'}</h2>
    <p>Du klarade <b>${esc(w.title)}</b>.</p>
    ${coreCases(w).length ? '<p>Öva algoritmerna i <b>🎯 Träna</b> för att få alla stjärnor.</p>' : ''}`,
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
      <div class="screen quiz" style="--wc:${w.color}">
        <header class="topbar">
          <a class="back" href="#/map">✕</a>
          <div class="dots">${Array.from({ length: total }, (_, i) => `<span class="${i < q ? 'done' : i === q ? 'cur' : ''}"></span>`).join('')}</div>
          <span class="wtag">❓</span>
        </header>
        <div class="quiz-body">
          <h2>${esc(w.caseIntro || 'Vilket fall är det?')}</h2>
          <div class="quiz-cube"></div>
          <div class="answers">${shuffle(cases).map(o => `<button class="btn answer" data-id="${o.id}">${esc(o.name)}</button>`).join('')}</div>
          <p class="feedback"></p>
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
      fb.innerHTML = (ok ? 'Rätt! 🎉' : `Nästan! Det var <b>${esc(c.name)}</b>.`) +
        `<br><span class="alg">${esc(c.alg)}</span><br><button class="btn primary nextq">Nästa ▶</button>`;
      fb.querySelector('.nextq').onclick = () => { q++; ask(); };
    });
  };

  const finish = () => {
    const score = right / total;
    if (score > (p.quiz[w.id] || 0)) { p.quiz[w.id] = score; save(); }
    if (score >= 0.8) confetti();
    app.innerHTML = `
      <div class="screen quiz-done">
        <div class="badge-big">${score >= 0.8 ? '🌟' : '💪'}</div>
        <h2>${right} av ${total} rätt</h2>
        <p>${score >= 0.8 ? 'Superbra! Du fick en stjärna till.' : 'Bra försök! Klarar du 4 av 5 får du en stjärna.'}</p>
        <div class="row">
          <a class="btn ghost" href="#/map">Till kartan</a>
          <button class="btn primary again">Igen! 🔁</button>
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
      <div class="screen empty">
        <div class="badge-big">🎯</div>
        <h2>Träningen är låst</h2>
        <p>Klara världen <b>Mittenvåningen</b> först – då finns det algoritmer att träna på.</p>
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
      <div class="screen trainer" style="--wc:${w.color}">
        <header class="topbar">
          <a class="back" href="#/map">✕</a>
          <span class="title">🎯 Träna</span>
          <span class="wtag">${w.emoji}</span>
        </header>
        <div class="trainer-body">
          <div class="trainer-cube"></div>
          <div class="trainer-side">
            <p class="world-name">${esc(w.title)}</p>
            <h2 class="case-name">Vad gör du här?</h2>
            <div class="level">${[1, 2, 3, 4, 5].map(i => `<span class="${i <= box ? 'on' : ''}"></span>`).join('')}</div>
            <p class="hint">Gör det på din kub, eller tänk efter. Tryck sedan på knappen.</p>
            <button class="btn primary huge reveal">Visa lösningen 👀</button>
            <div class="rate hidden">
              <p>Hur gick det?</p>
              <div class="row">
                <button class="btn r0">😅 Svårt</button>
                <button class="btn r1">🙂 Okej</button>
                <button class="btn r2">😎 Lätt</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    const cubeHost = app.querySelector('.trainer-cube');
    createPlayer(cubeHost, { setupInv: c.alg, mask: c.mask });
    app.querySelector('.reveal').onclick = e => {
      e.target.remove();
      app.querySelector('.case-name').innerHTML = `${esc(c.name)}<br><span class="alg">${esc(c.alg)}</span>`;
      app.querySelector('.hint').textContent = 'Tryck ▶ för att se den på kuben.';
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
      <header class="topbar">
        <a class="back" href="#/map">✕</a>
        <span class="title">⏱️ Tidtagning</span>
        <span class="wtag">${p.avatar}</span>
      </header>
      <div class="scramble-box">
        <p class="small">Blanda din kub (gul upp, grön fram):</p>
        <div class="chips scramble"></div>
        <div class="row">
          <button class="btn ghost newscr">🔀 Ny blandning</button>
          <button class="btn ghost showcube">🧊 Visa på kuben</button>
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
      <ol class="time-list">${times.map(t => `<li class="${t.ms === best ? 'best' : ''}">${fmt(t.ms)}${t.ms === best ? ' ⭐' : ''}</li>`).join('')}</ol>
      ${times.length ? '<button class="btn ghost small del">Ta bort senaste</button>' : ''}`;
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
    if (e.code !== 'Space' || location.hash !== '#/timer') return;
    e.preventDefault();
    if (e.type === 'keydown' && !e.repeat) press();
    if (e.type === 'keyup') release();
  };
  document.onkeydown = key;
  document.onkeyup = key;

  app.querySelector('.newscr').onclick = () => { scramble = randomScramble(20); drawScramble(); };
  app.querySelector('.showcube').onclick = e => {
    showCube = !showCube;
    cubeHost.classList.toggle('hidden', !showCube);
    e.target.textContent = showCube ? '🙈 Dölj kuben' : '🧊 Visa på kuben';
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
      <div class="screen empty">
        <div class="badge-big">👪</div>
        <h2>För föräldrar</h2>
        <p>Vad är ${a} × ${b}?</p>
        <input class="name-input gate" inputmode="numeric" autocomplete="off">
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
      <header class="topbar">
        <a class="back" href="#/">✕</a>
        <span class="title">👪 Föräldraöversikt</span>
        <span></span>
      </header>
      ${db.profiles.length ? '' : '<p>Inga profiler än.</p>'}
      ${db.profiles.map(p => {
        const best = p.times.length ? fmt(Math.min(...p.times.map(t => t.ms))) : '–';
        const week = p.times.filter(t => t.at > Date.now() - 7 * 864e5).length;
        const mastered = ALL_CASES.filter(c => (p.boxes[c.id] || 0) >= 3).length;
        return `
        <section class="pcard">
          <h3>${p.avatar} ${esc(p.name)}</h3>
          <table>
            ${WORLDS.map(w => `<tr><td>${w.emoji} ${esc(w.title)}</td><td>${starText(stars(p, w))}</td>
              <td>${hasQuiz(w) && p.quiz[w.id] != null ? `Quiz ${Math.round(p.quiz[w.id] * 100)}%` : ''}</td></tr>`).join('')}
          </table>
          <p>Algoritmer som sitter: <b>${mastered} / ${ALL_CASES.length}</b> · Bästa tid: <b>${best}</b> · Lösningar senaste veckan: <b>${week}</b></p>
          <div class="row">
            <button class="btn ghost small reset" data-id="${p.id}">Nollställ framsteg</button>
            <button class="btn ghost small delete" data-id="${p.id}">Ta bort profil</button>
          </div>
        </section>`;
      }).join('')}
      <section class="pcard">
        <label class="toggle"><input type="checkbox" class="unlock" ${db.unlockAll ? 'checked' : ''}> Lås upp alla världar</label>
        <p class="small">Sparas bara i den här enheten/webbläsaren.</p>
      </section>
    </div>`;
  app.querySelector('.unlock').onchange = e => { db.unlockAll = e.target.checked; save(); };
  app.querySelectorAll('.reset').forEach(b => b.onclick = () => {
    const p = db.profiles.find(x => x.id === b.dataset.id);
    modal(`<h2>Nollställa ${esc(p.name)}?</h2><p>Alla stjärnor, märken och tider försvinner.</p>`,
      [['Avbryt', null, 'ghost'], ['Nollställ', () => {
        Object.assign(p, newProfile(p.name, p.avatar), { id: p.id });
        save(); renderParent();
      }, 'danger']]);
  });
  app.querySelectorAll('.delete').forEach(b => b.onclick = () => {
    const p = db.profiles.find(x => x.id === b.dataset.id);
    modal(`<h2>Ta bort ${esc(p.name)}?</h2><p>Profilen och alla framsteg försvinner.</p>`,
      [['Avbryt', null, 'ghost'], ['Ta bort', () => {
        db.profiles = db.profiles.filter(x => x.id !== p.id);
        if (db.current === p.id) db.current = null;
        save(); renderParent();
      }, 'danger']]);
  });
}

// ---------- Start ----------

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
if (window.speechSynthesis) speechSynthesis.getVoices();
route();
