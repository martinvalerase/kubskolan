// Kubmotorn och ikonerna delas med barnappen (Kubskolan Junior) i mappen ovanför.
import { CubeView, parseAlg, invertAlg, moveHint, randomScramble, COLORS } from '../../js/cube.js';
import { icon, glyph } from '../../js/icons.js';
import { PLL, TWO_LOOK } from './data/pll.js';
import { EVENTS, UPCOMING_SNAPSHOT, SNAPSHOT_DATE, LIVE_URL, ATTRIBUTION } from './data/wca.js';
import { ARTICLES } from './data/articles.js';

const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');
let views = [];

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* lagring blockerad */ } },
};

// ---------- Datum ----------

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const MONTHS_LONG = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
const ymd = s => { const [y, m, d] = s.split('-').map(Number); return { y, m: m - 1, d }; };
const longDate = s => { const { y, m, d } = ymd(s); return `${d} ${MONTHS_LONG[m]} ${y}`; };
function dateRange(a, b) {
  const s = ymd(a), e = ymd(b);
  if (a === b) return `${s.d} ${MONTHS_LONG[s.m]}`;
  if (s.m === e.m) return `${s.d}–${e.d} ${MONTHS_LONG[s.m]}`;
  return `${s.d} ${MONTHS_LONG[s.m]} – ${e.d} ${MONTHS_LONG[e.m]}`;
}

// ---------- Kubspelare ----------

function player(host, { setup = '', setupInv = '', alg = '', mask = 'full', pitch, height }) {
  const tokens = parseAlg(alg);
  const setupTokens = setupInv ? invertAlg(parseAlg(setupInv)) : parseAlg(setup);
  host.innerHTML = `
    <div class="player">
      <div class="cube-box" ${height ? `style="height:${height}px"` : ''}></div>
      ${tokens.length ? `<div class="chips"></div>
      <div class="controls">
        <button class="ctl" data-a="reset" aria-label="Börja om">${icon('restart')}</button>
        <button class="ctl" data-a="back" aria-label="Ett drag bakåt">${icon('stepB')}</button>
        <button class="ctl play" data-a="play" aria-label="Spela">${icon('play')}</button>
        <button class="ctl" data-a="fwd" aria-label="Ett drag framåt">${icon('stepF')}</button>
        <button class="ctl speed" data-a="speed" aria-label="Långsamt">½×</button>
      </div>` : ''}
    </div>`;
  const view = new CubeView(host.querySelector('.cube-box'), { mask, pitch: pitch ?? (mask === 'oll' ? -45 : undefined) });
  views.push(view);
  view.applyTokens(setupTokens);
  view.applyCamera();

  let i = 0, playing = false;
  const chips = host.querySelector('.chips');
  const playBtn = host.querySelector('[data-a=play]');
  const update = () => {
    if (chips) chips.innerHTML = tokens.map((t, k) => `<span class="chip ${k < i ? 'done' : k === i ? 'cur' : ''}"><b>${esc(t.text)}</b><i>${moveHint(t).arrow}</i></span>`).join('');
    if (playBtn) playBtn.innerHTML = icon(playing ? 'pause' : 'play');
  };
  const fwd = () => {
    if (i >= tokens.length) return Promise.resolve();
    const t = tokens[i++];
    update();
    return view.animate(t);
  };
  const back = () => i > 0 ? view.animate(invertAlg([tokens[--i]])[0]).then(update) : Promise.resolve();
  const reset = async () => { playing = false; await view.clearQueue(); view.reset(); view.applyTokens(setupTokens); i = 0; update(); };
  const play = async () => {
    if (playing) { playing = false; update(); return; }
    if (i >= tokens.length) await reset();
    playing = true; update();
    while (playing && i < tokens.length && !view.dead) { const t = tokens[i++]; update(); await view.animate(t); }
    playing = false; update();
  };
  host.querySelectorAll('.ctl').forEach(b => b.onclick = () => {
    const a = b.dataset.a;
    if (a === 'play') play();
    else if (a === 'reset') reset();
    else if (a === 'fwd') { playing = false; fwd(); }
    else if (a === 'back') { playing = false; back(); }
    else { b.classList.toggle('on'); view.speed = b.classList.contains('on') ? 900 : 380; }
  });
  update();
  return view;
}

// ---------- PLL-diagram (räknas fram ur kubmodellen) ----------

let diagramView = null;
const DIRS = { R: [1, 0, 0], L: [-1, 0, 0], U: [0, 1, 0], D: [0, -1, 0], F: [0, 0, 1], B: [0, 0, -1] };
const same = (a, b) => a.every((x, k) => x === b[k]);
function stickerAt(v, pos, dir) {
  const c = v.cubies.find(q => same(q.pos, pos));
  for (const [face, d] of Object.entries(DIRS)) {
    const w = [0, 1, 2].map(k => c.cols[0][k] * d[0] + c.cols[1][k] * d[1] + c.cols[2][k] * d[2]);
    if (same(w, dir)) return COLORS[face];
  }
}
function pllDiagram(alg) {
  if (!diagramView) {
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-9999px;top:0;width:10px;height:10px';
    document.body.appendChild(host);
    diagramView = new CubeView(host);
  }
  const v = diagramView;
  v.reset();
  v.applyTokens(invertAlg(parseAlg(alg)));
  const S = 26, G = 3, O = 14; // rutstorlek, mellanrum, kantremsa
  let svg = '';
  for (let z = -1; z <= 1; z++) for (let x = -1; x <= 1; x++) {
    const px = O + G + (x + 1) * (S + G), py = O + G + (z + 1) * (S + G);
    svg += `<rect x="${px}" y="${py}" width="${S}" height="${S}" rx="4" fill="${stickerAt(v, [x, 1, z], [0, 1, 0])}"/>`;
  }
  const full = O * 2 + G * 4 + S * 3;
  for (let k = -1; k <= 1; k++) {
    const t = O + G + (k + 1) * (S + G);
    svg += `<rect x="${t}" y="2" width="${S}" height="${O - 5}" rx="2.5" fill="${stickerAt(v, [k, 1, -1], [0, 0, -1])}"/>`;
    svg += `<rect x="${t}" y="${full - O + 3}" width="${S}" height="${O - 5}" rx="2.5" fill="${stickerAt(v, [k, 1, 1], [0, 0, 1])}"/>`;
    svg += `<rect x="2" y="${t}" width="${O - 5}" height="${S}" rx="2.5" fill="${stickerAt(v, [-1, 1, k], [-1, 0, 0])}"/>`;
    svg += `<rect x="${full - O + 3}" y="${t}" width="${O - 5}" height="${S}" rx="2.5" fill="${stickerAt(v, [1, 1, k], [1, 0, 0])}"/>`;
  }
  return `<svg class="diagram" viewBox="0 0 ${full} ${full}" role="img" aria-label="Fallbild"><rect x="${O}" y="${O}" width="${full - 2 * O}" height="${full - 2 * O}" rx="6" fill="#121613"/>${svg}</svg>`;
}

// ---------- Tävlingar ----------

let comps = null;
async function loadComps() {
  if (comps) return comps;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(LIVE_URL(), { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(res.status);
    const list = await res.json();
    if (!Array.isArray(list)) throw new Error('format');
    comps = { live: true, list: list.map(c => ({ ...c, url: c.url || `https://www.worldcubeassociation.org/competitions/${c.id}` })) };
  } catch {
    const today = new Date().toISOString().slice(0, 10);
    comps = { live: false, list: UPCOMING_SNAPSHOT.filter(c => c.end_date >= today || today > '2027-01-02') };
  }
  return comps;
}

const isChamp = c => /mästerskap|championship/i.test(c.name);
function compRow(c) {
  const s = ymd(c.start_date);
  return `
    <a class="comp" href="${esc(c.url)}" target="_blank" rel="noopener">
      <div class="comp-date"><b>${s.d}</b><span>${MONTHS[s.m]}</span></div>
      <div class="comp-main">
        <span class="comp-name">${isChamp(c) ? `<span class="champ">${icon('medal')}</span> ` : ''}${esc(c.name)}</span>
        <span class="comp-city">${esc(c.city)} · ${dateRange(c.start_date, c.end_date)} · ${c.event_ids.length} grenar</span>
        <span class="events">${c.event_ids.map(e => `<span class="ev">${esc(EVENTS[e] || e)}</span>`).join('')}</span>
      </div>
      <span class="comp-go">${icon('next')}</span>
    </a>`;
}
function compNotice(data) {
  return data.live
    ? `<p class="notice live">Live från WCA:s tävlingskalender.</p>`
    : `<p class="notice">Visar sparad lista från ${longDate(SNAPSHOT_DATE)}. Live-hämtning från WCA gick inte här. I den riktiga sajten hämtas listan vid varje bygge och uppdateras i webbläsaren.</p>`;
}

// ---------- Sidor ----------

function pageStart() {
  app.innerHTML = `
    <section class="hero">
      <div class="hero-text">
        <span class="eyebrow">Rubiks kub på svenska</span>
        <h1>Lär dig lösa kuben. <em>Sen snabbare.</em></h1>
        <p>Metoder från nybörjare till CFOP och Roux, notation du kan prova direkt, alla PLL-algoritmer och kalendern över svenska tävlingar.</p>
        <div class="row">
          <a class="btn primary" href="#lar-dig">Börja lära dig ${icon('next')}</a>
          <a class="btn ghost" href="#junior">Kubskolan Junior för barn</a>
        </div>
      </div>
      <div class="hero-cube"><div class="cube-box"></div><span class="hero-caption"></span></div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Var börjar jag?</h2></div>
      <div class="start-picker">
        <a class="pick" href="#junior"><span class="q">Mitt barn vill lära sig</span><span class="muted">Steg för steg med 3D-kub, quiz och stjärnor. För 7–12 år.</span><span class="a">Kubskolan Junior ${icon('next')}</span></a>
        <a class="pick" href="#lar-dig"><span class="q">Jag har aldrig löst kuben</span><span class="muted">Nybörjarmetoden lager för lager, med bara ett fåtal algoritmer.</span><span class="a">Nybörjarmetoden ${icon('next')}</span></a>
        <a class="pick" href="#cfop"><span class="q">Jag kan lösa den</span><span class="muted">Ta steget till CFOP, metoden de flesta speedcubers använder.</span><span class="a">CFOP ${icon('next')}</span></a>
        <a class="pick" href="#algoritmer"><span class="q">Jag vill bli snabbare</span><span class="muted">Lär dig alla 21 PLL och bocka av dem du kan.</span><span class="a">Algoritmer ${icon('next')}</span></a>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Senaste artiklarna</h2><a class="link-more" href="#artiklar">Alla artiklar ${icon('next')}</a></div>
      <div class="grid cols-3">${ARTICLES.map(articleCard).join('')}</div>
    </section>

    <section class="section split">
      <div>
        <div class="section-head"><h2>Kommande tävlingar</h2><a class="link-more" href="#tavlingar">Hela kalendern ${icon('next')}</a></div>
        <div class="comp-list" id="start-comps"><p class="muted" style="padding:16px 0">Hämtar tävlingar…</p></div>
      </div>
      <div class="card">
        <span class="eyebrow">Senaste svenska rekordet</span>
        <h3>3×3 enhand, medel 10,41</h3>
        <p class="muted">Emanuel Schelin på Kublördag Jönköping XIII, 26 september 2026.</p>
        <a class="link-more" href="#artikel-svenskt-rekord-enhand">Läs artikeln ${icon('next')}</a>
      </div>
    </section>

    <section class="section junior-band">
      <div class="junior-glyphs">${['w1', 'w2', 'w3', 'w5', 'w6', 'w8', 'w4', 'w7', 'w9'].map(w => glyph(w)).join('')}</div>
      <div>
        <h2>Kubskolan Junior</h2>
        <p>En egen skola för barn: tio steg från första vridningen till löst kub, med animerad 3D-kub, uppläsning på svenska, quiz och tidtagning. Fungerar på iPad och mobil, även utan internet.</p>
      </div>
      <a class="btn" href="#junior">Till Junior ${icon('next')}</a>
    </section>`;

  // Kuben på startsidan blandar och löser sig själv i en loop
  const view = new CubeView(app.querySelector('.hero-cube .cube-box'), { pitch: -26, yaw: -36 });
  views.push(view);
  view.applyCamera();
  const caption = app.querySelector('.hero-caption');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) (async () => {
    await new Promise(r => setTimeout(r, 600));
    while (!view.dead) {
      const s = randomScramble(8);
      caption.textContent = 'blandar: ' + s.map(t => t.text).join(' ');
      for (const t of s) { if (view.dead) return; await view.animate(t, 260); }
      await new Promise(r => setTimeout(r, 700));
      caption.textContent = 'löser: ' + invertAlg(s).map(t => t.text).join(' ');
      for (const t of invertAlg(s)) { if (view.dead) return; await view.animate(t, 260); }
      await new Promise(r => setTimeout(r, 1600));
    }
  })();

  loadComps().then(data => {
    const el = document.getElementById('start-comps');
    if (el) el.innerHTML = data.list.slice(0, 4).map(compRow).join('');
  });
}

function articleCard(a) {
  return `
    <a class="card article-card" href="#artikel-${a.slug}">
      <div class="meta"><span class="tag ${a.kind === 'Rekord' ? 'lime' : 'mint'}">${esc(a.kind)}</span><span>${longDate(a.date)}</span></div>
      <h3>${esc(a.title)}</h3>
      <p class="muted">${esc(a.lead)}</p>
    </a>`;
}

const METHODS = [
  { id: 'nyborjare', name: 'Nybörjarmetoden', level: 'Nybörjare', puzzle: '3×3', text: 'Lager för lager: vitt kors, vita hörn, mittenlagret och sist den gula toppen. Cirka 7 algoritmer.', status: 'I Junior', href: '#junior' },
  { id: 'cfop', name: 'CFOP', level: 'Medel till avancerad', puzzle: '3×3', text: 'Kors, F2L, OLL och PLL. Börja med 2-look (16 algoritmer), gå vidare till full OLL och PLL (78).', status: 'Prototyp', href: '#cfop' },
  { id: 'roux', name: 'Roux', level: 'Medel till avancerad', puzzle: '3×3', text: 'Bygg två block på sidorna, lös hörnen (CMLL) och avsluta med mittskivan. Få drag och mycket intuition.', status: 'Planerad' },
  { id: 'zz', name: 'ZZ', level: 'Avancerad', puzzle: '3×3', text: 'Orientera alla kanter först (EOLine). Sedan löses resten utan att vrida fram- och baksidan.', status: 'Planerad' },
  { id: 'ortega', name: 'Ortega', level: 'Medel', puzzle: '2×2', text: 'En sida, orientera sista lagret och lös båda lagren samtidigt. En snabb väg in i 2×2.', status: 'Planerad' },
  { id: '4x4', name: 'Reduktion', level: 'Medel', puzzle: '4×4', text: 'Lös mitten och para ihop kanterna, så blir resten en 3×3. Med paritetsfallen som bara finns på 4×4.', status: 'Planerad' },
  { id: 'pyra', name: 'Pyraminx och Skewb', level: 'Nybörjare', puzzle: 'Andra pussel', text: 'Två pussel som är snabba att lära sig och vanliga på tävlingar.', status: 'Planerad' },
  { id: 'bld', name: 'Blindlösning', level: 'Avancerad', puzzle: '3×3', text: 'Memorera kuben och lös den med förbundna ögon. Börja med Old Pochmann och gå vidare till M2.', status: 'Planerad' },
];

function pageLearn() {
  app.innerHTML = `
    <header class="page-head">
      <span class="eyebrow">Lär dig</span>
      <h1>Metoder</h1>
      <p>Varje metod delas upp i steg med en 3D-kub du kan snurra på och spela upp drag för drag. Välj efter nivå, eller börja med nybörjarmetoden om du är ny.</p>
    </header>
    <div class="grid cols-3">
      ${METHODS.map(m => `
        <${m.href ? `a href="${m.href}"` : 'div'} class="card">
          <div class="meta"><span class="tag ${m.status === 'Planerad' ? '' : 'mint'}">${m.status}</span><span>${m.puzzle} · ${m.level}</span></div>
          <h3>${m.name}</h3>
          <p class="muted">${m.text}</p>
        </${m.href ? 'a' : 'div'}>`).join('')}
    </div>`;
}

function pageCfop() {
  const stages = [
    { l: 'C', name: 'Cross – korset', text: 'Lös fyra vita kanter på botten så att de matchar mittbitarna. Proffsen planerar hela korset under de 15 sekunders inspektion som tävlingsreglerna tillåter, och löser det på högst åtta drag.', facts: [['Algoritmer', 'inga'], ['Drag', '≤ 8']], cube: { setup: "F R' D L2 B D'", alg: "D B' L2 D' R F'", mask: 'cross' } },
    { l: 'F', name: 'F2L – två lager', text: 'Para ihop ett vitt hörn med rätt mittenkant och sätt in dem samtidigt. Fyra par, så är två lager klara. De flesta lär sig F2L intuitivt innan de lär sig de 41 fallen.', facts: [['Fall', '41'], ['Lärs', 'intuitivt']], cube: { setupInv: "U R U' R'", alg: "U R U' R'", mask: 'f2l' } },
    { l: 'O', name: 'OLL – gul topp', text: 'Gör hela toppen gul. Med 2-look gör du först ett gult kors och sedan hörnen: 10 algoritmer. Full OLL klarar allt i ett steg med 57.', facts: [['2-look', '10'], ['Full', '57']], cube: { setupInv: "R U R' U R U2 R'", alg: "R U R' U R U2 R'", mask: 'oll' } },
    { l: 'P', name: 'PLL – sista lagret på plats', text: 'Flytta bitarna i toppen till rätt plats. 2-look tar hörnen och sedan kanterna med 6 algoritmer. Full PLL har 21.', facts: [['2-look', '6'], ['Full', '21']], cube: { setupInv: "R U R' U' R' F R2 U' R' U' R U R' F'", alg: "R U R' U' R' F R2 U' R' U' R U R' F'", mask: 'full' } },
  ];
  app.innerHTML = `
    <header class="page-head">
      <span class="eyebrow">Lär dig · 3×3</span>
      <h1>CFOP</h1>
      <p>Den vanligaste speedcubing-metoden: fyra steg som heter Cross, F2L, OLL och PLL. Här är vad varje steg går ut på, med ett exempel du kan spela upp.</p>
    </header>
    <div class="stages">
      ${stages.map((s, k) => `
        <article class="stage">
          <div class="stage-text">
            <span class="stage-letter">${s.l}</span>
            <h2>${s.name}</h2>
            <p class="muted">${s.text}</p>
            <div class="facts">${s.facts.map(([a, b]) => `<span class="fact">${a}: <b>${b}</b></span>`).join('')}</div>
          </div>
          <div class="cube-panel" data-stage="${k}"></div>
        </article>`).join('')}
    </div>
    <section class="section">
      <div class="section-head"><h2>Lärväg</h2><p class="muted">Du behöver inte lära dig allt på en gång. Så här bygger de flesta upp CFOP.</p></div>
      <div class="path-steps">
        <div class="path-step"><span class="n">1</span><b>Nybörjarmetoden</b><p class="muted">Lös kuben lager för lager. Barn kan börja i Kubskolan Junior.</p></div>
        <div class="path-step"><span class="n">2</span><b>2-look CFOP</b><p class="muted">Intuitiv F2L och 16 algoritmer för sista lagret.</p></div>
        <div class="path-step"><span class="n">3</span><b>Full PLL</b><p class="muted">Alla 21 PLL. Sparar en hel titt på kuben.</p></div>
        <div class="path-step"><span class="n">4</span><b>Full OLL</b><p class="muted">57 fall. Sista lagret löses i två steg.</p></div>
      </div>
    </section>`;
  app.querySelectorAll('[data-stage]').forEach(el => player(el, { ...stages[+el.dataset.stage].cube, height: 260 }));
}

const NOTATION = [
  ['R', 'Höger sida medurs, sett från höger. Framkanten går uppåt.'],
  ['L', 'Vänster sida medurs, sett från vänster. Framkanten går nedåt.'],
  ['U', 'Toppen medurs, sett uppifrån. Framkanten går åt vänster.'],
  ['D', 'Botten medurs, sett underifrån. Framkanten går åt höger.'],
  ['F', 'Framsidan medurs, sett framifrån.'],
  ['B', 'Baksidan medurs, sett bakifrån.'],
  ["R'", 'Prim: samma sida åt andra hållet.'],
  ['R2', 'Två kvartsvarv, ett halvt varv. Riktningen spelar ingen roll.'],
  ['r / Rw', 'Två lager samtidigt: höger sida plus mittskivan.'],
  ['M E S', 'Mittskivorna. M följer L, E följer D och S följer F.'],
  ['x y z', 'Vrid hela kuben. x följer R, y följer U och z följer F.'],
];
const PAD_GROUPS = [
  ['Sidor', ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'"]],
  ['Två lager', ['r', "r'", 'u', "u'", 'f', "f'"]],
  ['Mittskivor', ['M', "M'", 'E', "E'", 'S', "S'"]],
  ['Hela kuben', ['x', "x'", 'y', "y'", 'z', "z'"]],
];

function pageNotation() {
  app.innerHTML = `
    <header class="page-head">
      <span class="eyebrow">Grunden</span>
      <h1>Notation</h1>
      <p>Alla guider och algoritmer skrivs med samma bokstäver, enligt WCA:s standard. Prova varje drag på kuben här bredvid.</p>
    </header>
    <div class="notation-grid">
      <div class="grid">
        <div class="table-wrap"><table class="move-table">${NOTATION.map(([a, b]) => `<tr><td>${a}</td><td class="muted">${b}</td></tr>`).join('')}</table></div>
        <div class="card">
          <h3>Skriv en algoritm</h3>
          <label class="muted" for="alg-input">Skriv drag med mellanslag, till exempel en algoritm från biblioteket.</label>
          <input id="alg-input" class="field" value="R U R' U' R' F R2 U' R' U' R U R' F'" autocomplete="off" spellcheck="false">
          <div class="row"><button class="btn primary small" id="alg-play">${icon('play')} Spela upp</button><button class="btn ghost small" id="alg-reset">${icon('restart')} Nollställ kuben</button></div>
        </div>
      </div>
      <div class="grid">
        <div class="cube-panel"><div class="cube-box" id="nota-cube" style="height:320px"></div></div>
        ${PAD_GROUPS.map(([name, moves]) => `
          <div class="pad-group"><span>${name}</span>
            <div class="pad">${moves.map(m => `<button class="padbtn" data-m="${m}">${m}<i>${moveHint(parseAlg(m)[0]).arrow}</i></button>`).join('')}</div>
          </div>`).join('')}
      </div>
    </div>
    <section class="section card">
      <div class="section-head" style="margin:0"><h2>Vilket drag var det?</h2><span class="score" id="q-score">0 rätt av 0</span></div>
      <p class="muted">Kuben gör ett drag. Välj vilket det var.</p>
      <div class="grid cols-2" style="align-items:center">
        <div class="cube-panel"><div class="cube-box" id="quiz-cube" style="height:240px"></div></div>
        <div class="grid">
          <div class="quiz-opts" id="q-opts"></div>
          <div class="row"><button class="btn primary" id="q-new">${icon('play')} Nytt drag</button><button class="btn ghost small" id="q-again">${icon('restart')} Visa igen</button></div>
        </div>
      </div>
    </section>`;

  const view = new CubeView(document.getElementById('nota-cube'));
  views.push(view);
  view.applyCamera();
  app.querySelectorAll('.padbtn').forEach(b => b.onclick = () => view.animate(parseAlg(b.dataset.m)[0], 300));
  document.getElementById('alg-play').onclick = async () => {
    await view.clearQueue(); view.reset();
    parseAlg(document.getElementById('alg-input').value).forEach(t => view.animate(t, 340));
  };
  document.getElementById('alg-reset').onclick = async () => { await view.clearQueue(); view.reset(); };

  // Quiz
  const qv = new CubeView(document.getElementById('quiz-cube'));
  views.push(qv);
  qv.applyCamera();
  const pool = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'R2', 'U2'];
  let answer = null, right = 0, total = 0, answered = false;
  const show = async () => { await qv.clearQueue(); qv.reset(); qv.moveEl.style.visibility = 'hidden'; await qv.animate(parseAlg(answer)[0], 700); };
  const ask = () => {
    answer = pool[Math.floor(Math.random() * pool.length)];
    answered = false;
    const opts = [answer];
    while (opts.length < 4) { const o = pool[Math.floor(Math.random() * pool.length)]; if (!opts.includes(o)) opts.push(o); }
    opts.sort(() => Math.random() - 0.5);
    document.getElementById('q-opts').innerHTML = opts.map(o => `<button class="btn" data-o="${o}">${o}</button>`).join('');
    document.querySelectorAll('#q-opts .btn').forEach(b => b.onclick = () => {
      if (answered) return;
      answered = true; total++;
      if (b.dataset.o === answer) right++;
      document.querySelectorAll('#q-opts .btn').forEach(x => x.classList.add(x.dataset.o === answer ? 'right' : x === b ? 'wrong' : 'x'));
      document.getElementById('q-score').textContent = `${right} rätt av ${total}`;
    });
    show();
  };
  document.getElementById('q-new').onclick = ask;
  document.getElementById('q-again').onclick = () => answer && show();
  ask();
}

function pageAlgs() {
  let filter = 'alla';
  const learned = new Set(store.get('kp.learned', []));
  app.innerHTML = `
    <header class="page-head">
      <span class="eyebrow">Algoritmbibliotek</span>
      <h1>PLL</h1>
      <p>Alla 21 sätt som det sista lagret kan behöva flyttas på. Bilden visar toppen och kanterna runt den. Tryck på ett fall för att se det på 3D-kuben, och bocka av de du kan.</p>
    </header>
    <div class="tabs" role="tablist">
      <button class="tab" disabled>F2L · 41 (fas 2)</button>
      <button class="tab" disabled>OLL · 57 (fas 2)</button>
      <button class="tab on">PLL · 21</button>
    </div>
    <div class="tabs" id="alg-filter">
      ${['alla', '2-look', 'Hörn', 'Kanter', 'Byte bredvid', 'Byte diagonalt', 'G-perm'].map(f => `<button class="tab ${f === filter ? 'on' : ''}" data-f="${f}">${f === 'alla' ? 'Alla' : f}</button>`).join('')}
      <span class="meta" id="learned-count" style="margin-left:auto"></span>
    </div>
    <div class="alg-grid" id="alg-grid"></div>`;
  const diagrams = Object.fromEntries(PLL.map(p => [p.id, pllDiagram(p.alg)]));
  const draw = () => {
    const list = PLL.filter(p => filter === 'alla' || (filter === '2-look' ? TWO_LOOK.includes(p.id) : p.group === filter));
    document.getElementById('alg-grid').innerHTML = list.map(p => `
      <div class="alg-card ${learned.has(p.id) ? 'learned' : ''}">
        <div class="alg-top">
          <span class="alg-name">${p.id}</span>
          <button class="learn-btn ${learned.has(p.id) ? 'on' : ''}" data-l="${p.id}" aria-pressed="${learned.has(p.id)}">${icon('check')} ${learned.has(p.id) ? 'Kan' : 'Lär mig'}</button>
        </div>
        <button class="open" data-p="${p.id}" style="all:unset;cursor:pointer;display:grid;gap:10px" aria-label="Visa ${p.id} på 3D-kuben">
          ${diagrams[p.id]}
          <span class="alg">${esc(p.alg)}</span>
        </button>
      </div>`).join('');
    document.getElementById('learned-count').textContent = `Du kan ${learned.size} av 21`;
    document.querySelectorAll('[data-l]').forEach(b => b.onclick = () => {
      learned.has(b.dataset.l) ? learned.delete(b.dataset.l) : learned.add(b.dataset.l);
      store.set('kp.learned', [...learned]);
      draw();
    });
    document.querySelectorAll('[data-p]').forEach(b => b.onclick = () => openPll(PLL.find(p => p.id === b.dataset.p)));
  };
  document.querySelectorAll('#alg-filter [data-f]').forEach(b => b.onclick = () => {
    filter = b.dataset.f;
    document.querySelectorAll('#alg-filter [data-f]').forEach(x => x.classList.toggle('on', x === b));
    draw();
  });
  draw();
}

function openPll(p) {
  modalRoot.innerHTML = `
    <div class="modal-wrap">
      <div class="modal" role="dialog" aria-label="${p.id}-perm">
        <div class="modal-head"><h2>${p.id}-perm</h2><button class="icon-btn" aria-label="Stäng">${icon('close')}</button></div>
        <div class="cube-panel" id="pll-player"></div>
      </div>
    </div>`;
  const v = player(document.getElementById('pll-player'), { setupInv: p.alg, alg: p.alg, height: 280 });
  const close = () => { v.destroy(); views = views.filter(x => x !== v); modalRoot.innerHTML = ''; };
  modalRoot.querySelector('.icon-btn').onclick = close;
  modalRoot.querySelector('.modal-wrap').onclick = e => { if (e.target.classList.contains('modal-wrap')) close(); };
}

function pageComps() {
  app.innerHTML = `
    <header class="page-head">
      <span class="eyebrow">Tävlingar och mästerskap</span>
      <h1>Tävla i Sverige</h1>
      <p>Officiella tävlingar följer WCA:s regler och resultaten räknas i världsrankningen. Här är alla kommande tävlingar i Sverige.</p>
    </header>
    <div class="stat-row" id="comp-stats"></div>
    <div class="split">
      <div><div id="comp-notice"></div><div class="comp-list" id="comp-list"><p class="muted" style="padding:16px 0">Hämtar tävlingar…</p></div></div>
      <div class="grid">
        <div class="card">
          <span class="eyebrow">Mästerskap</span>
          <h3>SM, NM, EM och VM</h3>
          <p class="muted">Svenska mästerskapen hålls varje år, och den bästa svenska deltagaren i varje gren blir svensk mästare. Europamästerskapen och världsmästerskapen hålls vartannat år. Datum publiceras i WCA:s kalender och listas här så fort de finns.</p>
        </div>
        <div class="card">
          <span class="eyebrow">Guide</span>
          <h3>Min första tävling</h3>
          <ul class="checklist">
            <li>${icon('check')}<span>Anmäl dig på WCA:s webbplats. Du får ett WCA-id efter din första tävling.</span></li>
            <li>${icon('check')}<span>Inför varje lösning får du titta på kuben i 15 sekunder.</span></li>
            <li>${icon('check')}<span>I de flesta grenar gör du fem lösningar. Bästa och sämsta stryks, och medel av de tre andra räknas.</span></li>
            <li>${icon('check')}<span>Tiden tas med en timer som du startar och stoppar med båda händerna.</span></li>
            <li>${icon('check')}<span>Ligatävlingar på en dag med få grenar passar bra som första tävling.</span></li>
          </ul>
        </div>
        <div class="card">
          <span class="eyebrow">Svenska rekord</span>
          <h3>Senast: 3×3 enhand</h3>
          <p class="muted">Medel 10,41 av Emanuel Schelin, 26 september 2026. I den riktiga sajten listas alla svenska rekord automatiskt från WCA:s resultat.</p>
        </div>
      </div>
    </div>
    <p class="muted" style="margin-top:24px;font-size:.85rem">${ATTRIBUTION}</p>`;
  loadComps().then(data => {
    if (!document.getElementById('comp-list')) return;
    const champs = data.list.filter(isChamp).length;
    const cities = new Set(data.list.map(c => c.city)).size;
    document.getElementById('comp-stats').innerHTML = `
      <div class="stat"><b>${data.list.length}</b><span>kommande tävlingar</span></div>
      <div class="stat"><b>${cities}</b><span>orter</span></div>
      <div class="stat"><b>${champs}</b><span>mästerskap</span></div>`;
    document.getElementById('comp-notice').innerHTML = compNotice(data);
    document.getElementById('comp-list').innerHTML = data.list.length ? data.list.map(compRow).join('') : '<p class="muted" style="padding:16px 0">Inga kommande tävlingar hittades.</p>';
  });
}

function pageArticles() {
  app.innerHTML = `
    <header class="page-head">
      <span class="eyebrow">Artiklar</span>
      <h1>Nyheter och rapporter</h1>
      <p>Artiklarna skrivs automatiskt utifrån WCA:s data om tävlingar, resultat och rekord. De tre nedan är exempel, byggda på riktig data från september och oktober 2026.</p>
    </header>
    <div class="grid cols-3">${ARTICLES.map(articleCard).join('')}</div>
    <div class="auto-note" style="margin-top:28px">${icon('spark')}<p>Så skapas artiklarna: varje natt hämtas ny data från WCA, och förändringar som nya rekord och avslutade tävlingar blir utkast som granskas innan de publiceras. <a href="#koncept-artiklar">Läs mer i konceptet</a>.</p></div>`;
}

function pageArticle(slug) {
  const a = ARTICLES.find(x => x.slug === slug);
  if (!a) return pageArticles();
  app.innerHTML = `
    <article class="article">
      <a class="link-more" href="#artiklar">${icon('back')} Alla artiklar</a>
      <div class="meta"><span class="tag ${a.kind === 'Rekord' ? 'lime' : 'mint'}">${esc(a.kind)}</span><span>${longDate(a.date)}</span></div>
      <h1 style="font-size:clamp(2rem,5vw,3rem)">${esc(a.title)}</h1>
      <p class="lead">${esc(a.lead)}</p>
      <div class="auto-note">${icon('spark')}<p><b>Exempel på automatiskt skriven artikel.</b> Källa: ${esc(a.source)}. ${ATTRIBUTION}</p></div>
      <div class="article-body">${a.body.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>')}</div>
    </article>`;
}

function pageJunior() {
  app.innerHTML = `
    <section class="hero">
      <div class="hero-text">
        <span class="eyebrow">För barn 7–12 år</span>
        <h1>Kubskolan Junior</h1>
        <p>Barnen lär sig lösa kuben i tio steg, från att känna igen bitarna till att sätta sista kanten. Varje steg har en animerad 3D-kub, texter som kan läsas upp på svenska, ett quiz och stjärnor att samla.</p>
        <div class="row"><a class="btn primary" href="../">Öppna Junior ${icon('next')}</a></div>
        <p class="muted" style="font-size:.92rem">Lägg till på hemskärmen på iPad eller mobil, så fungerar den som en app, även utan internet.</p>
      </div>
      <div class="grid cols-2" style="gap:12px">
        ${[['w1', 'Prästkragen'], ['w2', 'Vita korset'], ['w5', 'Gula korset'], ['w8', 'Kanterna på plats']].map(([w, t]) => `<div class="card" style="justify-items:start">${glyph(w)}<b>${t}</b></div>`).join('')}
      </div>
    </section>
    <section class="section grid cols-3">
      <div class="card"><h3>Egna profiler</h3><p class="muted">Varje barn får en egen profil med form och färg. Framstegen sparas på enheten. Inga konton och ingen spårning.</p></div>
      <div class="card"><h3>Träning och tidtagning</h3><p class="muted">Algoritmtränare som tar fram svåra fall oftare, och en tidtagare med bästa tid och snitt av fem.</p></div>
      <div class="card"><h3>Föräldravy</h3><p class="muted">Se vilka steg barnen klarat, quizresultat och hur mycket de övat senaste veckan.</p></div>
    </section>`;
}

function pageConcept() {
  const rows = [
    ['/', 'Start', 'Var börjar jag?-väljare, senaste artiklar, kommande tävlingar, ingång till Junior.', 'Prototyp'],
    ['/lar-dig/', 'Metoder', 'Nybörjare, CFOP, Roux, ZZ, 2×2, 4×4, Pyraminx, Skewb, blindlösning. Varje steg med interaktiv kub.', 'Delvis'],
    ['/notation/', 'Notation', 'Alla drag förklarade och klickbara, fritt algoritmfält och ett gissa-draget-spel.', 'Prototyp'],
    ['/algoritmer/', 'Algoritmer', 'PLL 21, OLL 57, F2L 41. Fallbilder, 3D-uppspelning och "kan"-markering.', 'PLL klar'],
    ['/trana/', 'Träna', 'Tidtagare med statistik och algoritmtränare med repetition av svåra fall.', 'Finns i Junior'],
    ['/artiklar/', 'Artiklar', 'Automatgenererade nyheter, tävlingsrapporter, rekord och guider.', 'Exempel'],
    ['/tavlingar/', 'Tävlingar', 'Kalender live från WCA, mästerskap, svenska rekord, guiden Min första tävling.', 'Prototyp'],
    ['/junior/', 'Junior', 'Barnappen som egen modul med egen stil, profiler och föräldravy.', 'Klar'],
  ];
  app.innerHTML = `
    <header class="page-head">
      <span class="eyebrow">Koncept · version 1 · oktober 2026</span>
      <h1>Kubskolan som plattform</h1>
      <p>En svensk helhetsplats för Rubiks kub: lära sig från början, bli snabbare, följa tävlingar och läsa nyheter. Barnappen blir en egen modul, Kubskolan Junior.</p>
    </header>
    <div class="concept">
      <nav class="toc" aria-label="Innehåll">
        <a href="#koncept-vision">Vision</a><a href="#koncept-malgrupper">Målgrupper</a><a href="#koncept-struktur">Sidstruktur</a>
        <a href="#koncept-junior">Junior</a><a href="#koncept-artiklar">Automatiska artiklar</a><a href="#koncept-teknik">Teknik</a>
        <a href="#koncept-integritet">Integritet och barn</a><a href="#koncept-faser">Faser</a>
      </nav>
      <div class="doc">
        <section id="koncept-vision">
          <h2>Vision</h2>
          <p>Det finns bra kubguider på engelska, men inget samlat ställe på svenska som tar en hela vägen från första vridningen till tävlingsgolvet. Kubskolan ska vara det stället: tydliga guider med en kub man kan snurra på, allt som behövs för att bli snabbare, och ett levande flöde om svensk kubsport.</p>
        </section>
        <section id="koncept-malgrupper">
          <h2>Målgrupper</h2>
          <ul>
            <li><b>Barn 7–12 år</b> som vill lära sig: Kubskolan Junior.</li>
            <li><b>Nybörjare i alla åldrar</b> som aldrig löst kuben.</li>
            <li><b>Speedcubers på mellannivå</b> som vill lära sig CFOP, fler algoritmer och andra pussel.</li>
            <li><b>Tävlande</b> som vill hitta tävlingar och följa resultat och rekord.</li>
            <li><b>Föräldrar och lärare</b> som vill hjälpa barn eller använda kuben i undervisningen.</li>
          </ul>
        </section>
        <section id="koncept-struktur">
          <h2>Sidstruktur</h2>
          <div class="sitemap">${rows.map(([u, n, d, s]) => `<div class="sitemap-row"><code>${u}</code><p><b>${n}.</b> ${d}</p><span class="tag ${s === 'Klar' || s === 'Prototyp' || s === 'PLL klar' ? 'mint' : ''}">${s}</span></div>`).join('')}</div>
        </section>
        <section id="koncept-junior">
          <h2>Junior som egen modul</h2>
          <p>Junior behåller sin lekfulla stil och sin egen navigation, så att barnen inte hamnar i nyhetsflöden eller tävlingslistor. Plattformen och Junior delar kubmotor, färgvärld och typsnitt.</p>
          <div class="callout warn"><b>Vid flytten till kubskolan.se/junior:</b> framstegen sparas per webbadress. Barn som använder github.io-versionen tappar sina stjärnor när de byter adress. Innan flytten lägger vi till en export- och importkod i föräldravyn.</div>
        </section>
        <section id="koncept-artiklar">
          <h2>Automatiska artiklar</h2>
          <p>Artiklarna skrivs automatiskt, men utifrån <b>strukturerad, öppen data</b>. Resultat, rekord och tävlingsdatum är fakta som får användas fritt. Att samla in andras artiklar och skriva om dem riskerar upphovsrättsintrång och brott mot deras villkor, och tas därför inte med.</p>
          <div class="flow">
            <div>Schemalagd körning varje natt</div>
            <div>Hämta data från WCA</div>
            <div>Hitta händelser: rekord, avslutade tävlingar, nya tävlingar</div>
            <div>Skriv text med Claude API</div>
            <div>Utkast som pull request</div>
            <div>Granska och publicera</div>
          </div>
          <ul>
            <li><b>Artikeltyper:</b> nytt svenskt rekord, tävlingsrapport, veckans tävlingar, månadens rankningsrörelser.</li>
            <li><b>Märkning:</b> varje artikel visar att den är automatiskt skriven, vilken data den bygger på, och WCA:s attribuering.</li>
            <li><b>Granskning:</b> utkasten publiceras inte direkt. Eftersom barn använder sajten ska en människa godkänna texten.</li>
          </ul>
        </section>
        <section id="koncept-teknik">
          <h2>Teknik</h2>
          <ul>
            <li>Statisk sajt byggd med Eleventy i GitHub Actions. Snabb, billig att drifta och lätt att granska.</li>
            <li>Artiklar som Markdown-filer i repot. WCA-data hämtas vid bygget och uppdateras i webbläsaren.</li>
            <li>Kubmotorn från Junior blir en delad modul för alla guider och algoritmbilder.</li>
            <li>Driftsätts till VPS:en (kubskolan.se) med det befintliga deploy-flödet och Caddy.</li>
            <li>Typsnitten ligger på den egna servern, så att inga besök skickas vidare till Google.</li>
          </ul>
        </section>
        <section id="koncept-integritet">
          <h2>Integritet och barn</h2>
          <ul>
            <li>Inga konton i första fasen. Framsteg sparas bara i den egna webbläsaren.</li>
            <li>Ingen spårning eller annonsering.</li>
            <li>Tävlingsresultat är offentliga hos WCA, men många tävlande är barn. Artiklarna nämner därför bara namn i samband med rekord och pallplatser, inte i övrigt.</li>
            <li>Om konton införs senare krävs föräldrasamtycke för barn under 13 år, enligt GDPR i Sverige.</li>
          </ul>
        </section>
        <section id="koncept-faser">
          <h2>Faser</h2>
          <div class="phases">
            <div class="phase"><b>Fas 1</b><p>Skal och start, notation, nybörjarguide och 2-look CFOP, PLL- och OLL-bibliotek, tävlingskalender, Junior under /junior, export och import av framsteg.</p></div>
            <div class="phase"><b>Fas 2</b><p>Full CFOP, Roux och ZZ, andra pussel, algoritmtränare, rekordsidor, artikelmotorn med granskning.</p></div>
            <div class="phase"><b>Fas 3</b><p>Valfria konton och synk mellan enheter, nyhetsbrev, eventuellt community.</p></div>
          </div>
        </section>
      </div>
    </div>`;
}

// ---------- Router ----------

const PAGES = {
  start: pageStart, 'lar-dig': pageLearn, cfop: pageCfop, notation: pageNotation, algoritmer: pageAlgs,
  tavlingar: pageComps, artiklar: pageArticles, junior: pageJunior, koncept: pageConcept,
};
const NAV_OF = { cfop: 'lar-dig' };

function route() {
  const hash = location.hash.replace(/^#/, '') || 'start';
  // Ankare inne i konceptet (#koncept-xxx) visar konceptsidan och scrollar dit
  const anchor = hash.startsWith('koncept-') ? hash : null;
  const key = anchor ? 'koncept' : hash.startsWith('artikel-') ? 'artikel' : (PAGES[hash] ? hash : 'start');
  if (anchor && document.getElementById(anchor)) { document.getElementById(anchor).scrollIntoView(); return; }

  views.forEach(v => v.destroy());
  views = [];
  modalRoot.innerHTML = '';
  if (key === 'artikel') pageArticle(hash.slice('artikel-'.length));
  else PAGES[key]();
  const navKey = NAV_OF[key] || (key === 'artikel' ? 'artiklar' : key);
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === navKey));
  if (anchor) document.getElementById(anchor)?.scrollIntoView();
  else window.scrollTo(0, 0);
  const titles = { start: 'Kubskolan', artikel: 'Artikel' };
  document.title = key === 'start' ? 'Kubskolan' : `${titles[key] || document.querySelector('h1')?.textContent || ''} · Kubskolan`;
}

window.addEventListener('hashchange', route);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalRoot.firstChild) modalRoot.querySelector('.icon-btn')?.click(); });
route();
