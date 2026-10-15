// Språk: svenska (Kubskolan) och engelska (Cube School).
// Valet sparas per enhet. Första gången används webbläsarens språk: svenska om det är svenska, annars engelska.

const KEY = 'kubskolan.lang';
export const LANGS = ['sv', 'en'];

function initial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (LANGS.includes(saved)) return saved;
  } catch { /* blockerad lagring */ }
  const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'sv';
  return /^(sv|nb|nn|no|da)\b/i.test(nav) ? 'sv' : 'en';
}

export let lang = initial();
const listeners = [];

export function setLang(l) {
  if (!LANGS.includes(l) || l === lang) return;
  lang = l;
  try { localStorage.setItem(KEY, l); } catch { /* ignoreras */ }
  document.documentElement.lang = l;
  listeners.forEach(fn => fn(l));
}
export const onLang = fn => listeners.push(fn);
document.documentElement.lang = lang;

// Väljer rätt text ur { sv, en }
export const tr = o => (o && typeof o === 'object' && !Array.isArray(o) ? (o[lang] ?? o.sv) : o);

// Lägger engelska överskrivningar ovanpå det svenska innehållet. Listor slås ihop plats för plats,
// så att överskrivningen bara behöver ha texterna; algoritmer, masker och stegnummer följer med.
export function merge(base, over) {
  if (over == null) return base;
  // Kortform: en sträng i stället för { name } eller { label }
  if (typeof over === 'string' && base && typeof base === 'object' && !Array.isArray(base)) {
    if ('name' in base) return { ...base, name: over };
    if ('label' in base) return { ...base, label: over };
  }
  if (Array.isArray(base) && Array.isArray(over)) return base.map((b, i) => merge(b, over[i]));
  if (base && typeof base === 'object' && !Array.isArray(base) && typeof over === 'object' && !Array.isArray(over)) {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = merge(base[k], over[k]);
    return out;
  }
  return over;
}
