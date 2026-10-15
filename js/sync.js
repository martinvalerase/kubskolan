// Synk mellan enheten och Supabase. Lokalt först: appen fungerar som förut och det här lägger bara en kopia i molnet.
//
// Sammanslagningen bara lägger till, så ingen enhet kan skriva över en annans framsteg:
//   klarade steg = union, quizresultat och algoritmnivåer = högsta värdet, tidtagningar = union.
// Undantag: "Nollställ" (p.replaceCloud) ersätter molnets kopia, och en raderad profil köas i db.pendingDeletes.
// Profiler utan p.cloudId har aldrig laddats upp. Foton (p.photo) lämnar aldrig enheten.

import { api as realApi, getSession } from './auth.js';

const MAX_TIMES = 200;
const UUID = /^[0-9a-f-]{36}$/i;
const validMs = ms => Number.isFinite(ms) && ms >= 2000 && ms <= 3600000; // samma gräns som i databasen

const canon = o => JSON.stringify(o, Object.keys(o || {}).sort());
const maxMap = (a, b) => {
  const o = { ...(a || {}) };
  for (const [k, v] of Object.entries(b || {})) o[k] = Math.max(o[k] || 0, v || 0);
  return o;
};

export function mergeProgress(local, remote) {
  const lessons = { ...(remote.lessons || {}), ...(local.lessons || {}) };
  const stepAt = {};
  for (const k of new Set([...Object.keys(local.stepAt || {}), ...Object.keys(remote.stepAt || {})])) {
    stepAt[k] = lessons[k] ? 0 : Math.max((local.stepAt || {})[k] || 0, (remote.stepAt || {})[k] || 0);
  }
  return { lessons, quiz: maxMap(local.quiz, remote.quiz), boxes: maxMap(local.boxes, remote.boxes), stepAt };
}

export function mergeTimes(a, b) {
  const byAt = new Map();
  for (const t of [...(a || []), ...(b || [])]) if (!byAt.has(t.at)) byAt.set(t.at, t);
  return [...byAt.values()].sort((x, y) => x.at - y.at).slice(-MAX_TIMES);
}

// deps: { getDb, persist, summary(p) -> { stars, mastered }, onChange(), api? }
export function createSync({ getDb, persist, summary, onChange, api = realApi }) {
  const status = { last: null, error: null, busy: false };
  let running = false, again = false, timer = 0;

  async function syncProfile(p, ctx) {
    const { owner, progBy, timesBy } = ctx;
    if (!p.cloudId) {
      const rows = await api('POST', '/rest/v1/profiles', {
        body: { owner, nickname: (p.name || 'Kubare').slice(0, 16), avatar: p.avatar || 's0c0' },
        headers: { Prefer: 'return=representation' },
      });
      p.cloudId = rows[0].id;
      persist();
    }
    if (!UUID.test(p.cloudId)) return false;
    const remote = progBy[p.cloudId];
    const cloudTimes = (timesBy[p.cloudId] || []).map(t => ({ ms: t.ms, at: Date.parse(t.at) }));

    let changed = false, merged, mergedTimes, push;
    if (p.replaceCloud) {
      merged = { lessons: p.lessons, quiz: p.quiz, boxes: p.boxes, stepAt: p.stepAt };
      mergedTimes = p.times || [];
      await api('DELETE', `/rest/v1/times?profile_id=eq.${p.cloudId}`);
      cloudTimes.length = 0;
      push = true;
    } else {
      const r = remote || { lessons: {}, quiz: {}, boxes: {}, step_at: {} };
      merged = mergeProgress(p, { lessons: r.lessons, quiz: r.quiz, boxes: r.boxes, stepAt: r.step_at });
      mergedTimes = mergeTimes(p.times, cloudTimes);
      push = !remote
        || canon(merged.lessons) !== canon(r.lessons) || canon(merged.quiz) !== canon(r.quiz)
        || canon(merged.boxes) !== canon(r.boxes) || canon(merged.stepAt) !== canon(r.step_at);
      for (const k of ['lessons', 'quiz', 'boxes', 'stepAt']) {
        if (canon(merged[k]) !== canon(p[k])) { p[k] = merged[k]; changed = true; }
      }
      if (mergedTimes.length !== (p.times || []).length) { p.times = mergedTimes; changed = true; }
    }

    // Skickar bara när något faktiskt ändrats, så att "dagar i rad" räknar riktig aktivitet och inte bara att appen öppnats.
    if (push) {
      p.lessons = merged.lessons; p.quiz = merged.quiz; p.boxes = merged.boxes; p.stepAt = merged.stepAt;
      await api('POST', '/rest/v1/progress?on_conflict=profile_id', {
        body: { profile_id: p.cloudId, lessons: merged.lessons, quiz: merged.quiz, boxes: merged.boxes, step_at: merged.stepAt, ...summary(p) },
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      });
    }
    const have = new Set(cloudTimes.map(t => t.at));
    const up = mergedTimes.filter(t => validMs(t.ms) && !have.has(t.at))
      .map(t => ({ profile_id: p.cloudId, ms: t.ms, at: new Date(t.at).toISOString() }));
    if (up.length) await api('POST', '/rest/v1/times', { body: up, headers: { Prefer: 'return=minimal' } });
    if (p.replaceCloud) { delete p.replaceCloud; changed = true; }
    return changed;
  }

  async function run() {
    const s = await getSession();
    if (!s) return;
    const db = getDb();
    let changed = false;

    // En annan e-postadress än sist: gamla molnkopplingar gäller inte, profilerna laddas upp till det här kontot.
    if (db.accountId !== s.id) {
      for (const p of db.profiles) delete p.cloudId;
      db.pendingDeletes = [];
      db.accountId = s.id;
      persist();
    }
    for (const id of [...(db.pendingDeletes || [])]) {
      if (UUID.test(id)) await api('DELETE', `/rest/v1/profiles?id=eq.${id}`);
      db.pendingDeletes = db.pendingDeletes.filter(x => x !== id);
      persist();
    }

    const [cp, cg, ct] = await Promise.all([
      api('GET', '/rest/v1/profiles?select=id,nickname,avatar&order=created_at'),
      api('GET', '/rest/v1/progress?select=profile_id,lessons,quiz,boxes,step_at'),
      api('GET', '/rest/v1/times?select=profile_id,ms,at&order=at.desc&limit=2000'),
    ]);
    const progBy = Object.fromEntries(cg.map(x => [x.profile_id, x]));
    const timesBy = {};
    for (const t of ct) (timesBy[t.profile_id] ||= []).push(t);

    // Borttagen i molnet (t.ex. på en annan enhet): behåll lokalt och ladda upp igen, så att inget går förlorat.
    const inCloud = new Set(cp.map(x => x.id));
    for (const p of db.profiles) if (p.cloudId && !inCloud.has(p.cloudId)) delete p.cloudId;

    // Nya i molnet: skapa lokalt.
    let n = 0;
    for (const c of cp) {
      if (db.profiles.some(p => p.cloudId === c.id)) continue;
      db.profiles.push({ id: (Date.now() + n++).toString(36), name: c.nickname, avatar: c.avatar, lessons: {}, quiz: {}, boxes: {}, times: [], stepAt: {}, cloudId: c.id });
      changed = true;
    }

    const ctx = { owner: s.id, progBy, timesBy };
    let firstError = null;
    for (const p of [...db.profiles]) {
      if (p.guest) continue; // gästens framsteg stannar på enheten tills man väljer att spara dem i kontot
      try { if (await syncProfile(p, ctx)) changed = true; } catch (e) { firstError = firstError || e; }
    }
    persist();
    if (changed) onChange();
    if (firstError) throw firstError;
  }

  async function syncNow() {
    if (running) { again = true; return; }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    running = true; status.busy = true;
    try {
      do {
        again = false;
        await run();
      } while (again);
      status.last = Date.now(); status.error = null;
    } catch (e) {
      status.error = e && e.status ? 'Synken misslyckades. Försök igen strax.' : 'Ingen uppkoppling just nu.';
      if (!(await getSession())) onChange(); // inloggningen gäller inte längre: låt skärmen visa det
    } finally {
      running = false; status.busy = false;
    }
  }

  // Skjuter upp synken en stund så att många ändringar i rad blir en enda synk.
  const schedule = (delay = 4000) => {
    clearTimeout(timer);
    timer = setTimeout(syncNow, delay);
  };

  return { schedule, syncNow, status };
}
