// Ikoner (egna linjeikoner, 24×24, färg = currentColor), stegsymboler och avatarer.

const P = {
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  flag: '<path d="M5 21V4M5 4.5c4-2.5 7 2.5 14 0v9c-7 2.5-10-2.5-14 0"/>',
  chart: '<path d="M5 20v-8M12 20V5M19 20v-9M3 20.5h18"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
  pause: '<path d="M8 5.5v13M16 5.5v13"/>',
  stepF: '<path d="M6 6.5v11l8-5.5z" fill="currentColor"/><path d="M18 6v12"/>',
  stepB: '<path d="M18 6.5v11l-8-5.5z" fill="currentColor"/><path d="M6 6v12"/>',
  restart: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
  sound: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a8 8 0 0 1 0 11"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 2.5h4M18.5 6l1.3-1.3"/>',
  shuffle: '<path d="M3 7h3.5c4 0 6.5 10 11 10H21M3 17h3.5c1.6 0 2.8-1.6 3.9-3.6M13.6 9.6C14.7 8 15.9 7 17.5 7H21M18.5 4.5 21 7l-2.5 2.5M18.5 14.5 21 17l-2.5 2.5"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M4 4l16 16M9.9 6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.7 3.4M6.3 7.6A16 16 0 0 0 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.3-1.1"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20c0-2.7-1.4-4.7-3.6-5.6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  image: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17.5l5-4.5 4 3.5 3-2.5 4.5 3.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="3"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  star: '<path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 3 1.1-6.1-4.5-4.3 6.1-.8z" fill="currentColor" stroke-width="1.5"/>',
  starO: '<path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 3 1.1-6.1-4.5-4.3 6.1-.8z" stroke-width="1.6"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"/>',
  medal: '<circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 3l2.6 6M15.5 3l-2.6 6"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.7.4-1.2 1-1.2 1.8v.5"/><circle cx="12" cy="17" r=".9" fill="currentColor"/>',
  cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  hand: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11M11 10V5a1.5 1.5 0 0 1 3 0v5M14 10V6.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-.6a5.5 5.5 0 0 1-4.2-2l-3-3.6a1.5 1.5 0 0 1 2.2-2L8 15"/>',
  spark: '<path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5z" fill="currentColor" stroke-width="1.5"/>',
};

export function icon(name, cls = '') {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;
}

// ---------- Stegsymboler: kubens mål sett uppifrån ----------
// Tecken: f = vit/ljus, l = gul (lime), a = mint, r = rund (kronblad), . = tom

const GLYPHS = {
  w1: '.r.rlr.r.',
  w2: '.f.fff.f.',
  w3: 'fffffffff',
  w4: '...ffffff',
  w5: '.l.lll.l.',
  w6: 'lllllllll',
  w7: 'a.a.l.a.a',
  w8: 'aaaaaaaaa',
};

export function glyph(id, cls = '') {
  if (id === 'w0') return icon('cube', 'glyph ' + cls);
  let cells = '';
  if (id === 'w9') {
    // ett par: hörn + kant ihop
    for (let i = 0; i < 9; i++) {
      const x = 2 + (i % 3) * 7, y = 2 + Math.floor(i / 3) * 7;
      if (i !== 7 && i !== 8) cells += `<rect x="${x}" y="${y}" width="6" height="6" rx="1.6" class="g-dim"/>`;
    }
    cells += '<rect x="9" y="16" width="13" height="6" rx="2" class="g-a"/>';
  } else {
    [...GLYPHS[id]].forEach((c, i) => {
      const x = 2 + (i % 3) * 7, y = 2 + Math.floor(i / 3) * 7;
      if (c === 'r') cells += `<circle cx="${x + 3}" cy="${y + 3}" r="3" class="g-f"/>`;
      else cells += `<rect x="${x}" y="${y}" width="6" height="6" rx="1.6" class="${{ f: 'g-f', l: 'g-l', a: 'g-a', '.': 'g-dim' }[c]}"/>`;
    });
  }
  return `<svg class="glyph ${cls}" viewBox="0 0 24 24" aria-hidden="true">${cells}</svg>`;
}

// ---------- Avatarer: form + färg + figur (eller initial) ----------

export const AV_COLORS = ['#8EE3B1', '#C9E86B', '#5FC4A8', '#E9F2DC', '#A8D27F', '#E8D9A6'];
const SHAPES = [
  '<circle cx="24" cy="24" r="21"/>',
  '<rect x="4" y="4" width="40" height="40" rx="13"/>',
  '<path d="M24 2.5l18.6 10.75v21.5L24 45.5 5.4 34.75v-21.5z" stroke-linejoin="round" stroke-width="4" stroke="currentColor"/>',
  '<path d="M24 3c4 0 6.5 3.5 8 6.5 3-1.5 7.5-1.5 9.5 2s.5 7.5-2 9.5c2.5 2 4 6 2 9.5s-6.5 3.5-9.5 2c-1.5 3-4 6.5-8 6.5s-6.5-3.5-8-6.5c-3 1.5-7.5 1.5-9.5-2s-.5-7.5 2-9.5c-2.5-2-4-6-2-9.5s6.5-3.5 9.5-2C17.5 6.5 20 3 24 3z"/>',
  '<path d="M24 4l5.5 10.5L41 17l-8 8.5 1.8 11.7L24 32l-10.8 5.2L15 25.5 7 17l11.5-2.5z" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>',
  '<rect x="6" y="6" width="36" height="36" rx="9" transform="rotate(45 24 24)"/>',
];
export const AV_SHAPES = SHAPES.length;

// Coola figurer i mitten av avataren (i stället för en bokstav). Ritade i en 48×48-ruta.
const INK = '#0B2219', FACE = '#FFF8E7';
const SHADES = (y, x1 = 14.5, x2 = 25.5) => `
  <path d="M${x1 - 1} ${y}h${x2 - x1 + 10}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
  <rect x="${x1}" y="${y - 1}" width="8" height="5.5" rx="2.4" fill="${INK}"/>
  <rect x="${x2}" y="${y - 1}" width="8" height="5.5" rx="2.4" fill="${INK}"/>
  <path d="M${x1 + 1.8} ${y + .6}l2.2 0M${x2 + 1.8} ${y + .6}l2.2 0" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>`;
const FIGURES = [
  null, // bokstav
  // Cool katt
  `<g stroke="${INK}" stroke-width="2" stroke-linejoin="round">
    <path d="M13 22l1-10 7 6M35 22l-1-10-7 6" fill="${FACE}"/>
    <ellipse cx="24" cy="27" rx="12" ry="10.5" fill="${FACE}"/>
    <path d="M10 29l7 .5M10 33l7-1.5M38 29l-7 .5M38 33l-7-1.5" fill="none" stroke-linecap="round" stroke-width="1.5"/>
    <path d="M22.5 30.5h3L24 32z" fill="#F28AA0" stroke-width="1.2"/>
    <path d="M21 34.5c1.5 1.3 4.5 1.3 6.5-.5" fill="none" stroke-linecap="round" stroke-width="1.6"/>
  </g>${SHADES(24.5)}`,
  // Cool häst
  `<g stroke="${INK}" stroke-width="2" stroke-linejoin="round">
    <path d="M17 15l1.5-7 4.5 6M31 15l-1.5-7-4.5 6" fill="${FACE}"/>
    <path d="M14.5 21c0-6 4.5-9 9.5-9s9.5 3 9.5 9l-1 13c-.4 5-4 8-8.5 8s-8.1-3-8.5-8z" fill="#C98B5A"/>
    <path d="M24 12c-2 2-6 2.5-7 6 3-1 6-1 8-3 0 2 2 3 4 3-1-3-2-5-5-6z" fill="${INK}"/>
    <ellipse cx="24" cy="37" rx="7.5" ry="5" fill="#E8B48A"/>
    <path d="M21 36.5v.5M27 36.5v.5" stroke-linecap="round" stroke-width="2.4"/>
  </g>${SHADES(25)}`,
  // Cool snubbe
  `<g stroke="${INK}" stroke-width="2" stroke-linejoin="round">
    <circle cx="24" cy="27" r="11.5" fill="#F2C9A0"/>
    <path d="M12.5 24c-.5-8 4.5-12.5 11.5-12.5 6 0 9.5 2.5 11 5.5-4-1-6 1-11 1-4 0-7.5 1.5-8 6z" fill="${INK}"/>
    <path d="M30 13c3-3 7-3 9-1-2 0-4 1-5.5 3z" fill="${INK}"/>
    <path d="M19.5 33c2.5 2.5 7 2.5 9-.5" fill="none" stroke-linecap="round" stroke-width="1.8"/>
  </g>${SHADES(25)}`,
  // Cool sol
  `<g stroke="${INK}" stroke-width="2" stroke-linejoin="round">
    <path d="M24 5.5l2.6 5.5h-5.2zM24 42.5l2.6-5.5h-5.2zM5.5 24l5.5 2.6v-5.2zM42.5 24L37 26.6v-5.2zM10.9 10.9l5.7 2-3.7 3.7zM37.1 37.1l-5.7-2 3.7-3.7zM37.1 10.9l-2 5.7-3.7-3.7zM10.9 37.1l2-5.7 3.7 3.7z" fill="#FFD500"/>
    <circle cx="24" cy="24" r="11.5" fill="#FFD500"/>
    <path d="M19 29.5c2.5 2.5 7.5 2.5 10 0" fill="none" stroke-linecap="round" stroke-width="1.8"/>
  </g>${SHADES(22)}`,
];
export const AV_FIGURES = ['Bokstav', 'Katt', 'Häst', 'Snubbe', 'Sol'];

export function parseAvatar(av, id = '') {
  const m = /^s(\d)c(\d)(?:f(\d))?$/.exec(av || '');
  if (m) return { s: +m[1] % SHAPES.length, c: +m[2] % AV_COLORS.length, f: +(m[3] || 0) % FIGURES.length };
  // äldre profiler (emoji) får en form utifrån sitt id
  let h = 0;
  for (const ch of String(id) + String(av)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { s: h % SHAPES.length, c: (h >> 3) % AV_COLORS.length, f: 0 };
}

export function avatar(av, name = '', id = '', cls = '') {
  const { s, c, f } = parseAvatar(av, id);
  const letter = (name.trim()[0] || '?').toUpperCase();
  const inner = FIGURES[f] || `<text x="24" y="25" text-anchor="middle" dominant-baseline="central">${letter.replace(/[<&>]/g, '')}</text>`;
  return `<svg class="avatar ${cls}" viewBox="0 0 48 48" aria-hidden="true" style="color:${AV_COLORS[c]}">
    <g fill="currentColor">${SHAPES[s]}</g>
    ${inner}
  </svg>`;
}
