// Inloggning mot Supabase (e-post + engångskod), utan bibliotek. Bara fetch mot Supabases REST-gränssnitt.
// Nyckeln nedan är den publika (publishable) nyckeln. Den är gjord för att ligga i webbläsaren;
// det som skyddar datan är radnivåsäkerheten i databasen (supabase/schema.sql).

const API = 'https://njpfvgzzmmkabksyzcjy.supabase.co';
const KEY = 'sb_publishable_JJVI5W5Y2mt0gBwmGggLjA_k6uNX_6R';
const STORE = 'kubskolan.auth';
export const CONSENT_VERSION = '1';

let session = read();

function read() {
  try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; }
}
function write(s) {
  session = s;
  try { s ? localStorage.setItem(STORE, JSON.stringify(s)) : localStorage.removeItem(STORE); } catch { /* ignoreras */ }
}

// Fel med status = svar från servern. Fel utan status = ingen uppkoppling.
async function call(path, { method = 'POST', body, token, headers = {} } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { apikey: KEY, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* inte JSON */ }
  if (!res.ok) {
    const e = new Error((data && (data.msg || data.error_description || data.message)) || res.statusText);
    e.status = res.status;
    e.code = data && (data.error_code || data.code);
    throw e;
  }
  return data;
}

const store = d => write({
  access_token: d.access_token,
  refresh_token: d.refresh_token,
  expires_at: Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
  id: d.user.id,
  email: d.user.email,
});

// E-postadressen för den som är inloggad (utan nätverksanrop), annars null.
export const accountEmail = () => (session && session.email) || null;

// create = true skapar ett konto om det saknas (registrera dig); false kräver att kontot finns (logga in).
export const sendCode = (email, create = true) => call('/auth/v1/otp', { body: { email, create_user: create } });

export async function verifyCode(email, code) {
  store(await call('/auth/v1/verify', { body: { type: 'email', email, token: code } }));
  return session;
}

export async function signInWithPassword(email, password) {
  store(await call('/auth/v1/token?grant_type=password', { body: { email, password } }));
  return session;
}

// Sätter eller byter lösenord för den som är inloggad (man kan alltid logga in med kod i stället).
export async function setPassword(password) {
  const s = await getSession();
  if (!s) throw Object.assign(new Error('Inte inloggad'), { status: 401 });
  await call('/auth/v1/user', { method: 'PUT', token: s.access_token, body: { password } });
}

// Sparar att vårdnadshavaren godkänt integritetstexten. Skriver inte över ett äldre samtycke.
export async function recordConsent() {
  const s = await getSession();
  if (!s) throw new Error('Inte inloggad');
  await call('/rest/v1/accounts', {
    token: s.access_token,
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: { id: s.id, consent_ver: CONSENT_VERSION },
  });
}

// Ger en giltig session, förnyar den vid behov. Utan nät behålls sessionen tills vidare.
export async function getSession() {
  if (!session) return null;
  if (session.expires_at - 60 > Date.now() / 1000) return session;
  try {
    store(await call('/auth/v1/token?grant_type=refresh_token', { body: { refresh_token: session.refresh_token } }));
  } catch (e) {
    if (e.status >= 400 && e.status < 500) write(null); // sessionen gäller inte längre
  }
  return session;
}

export async function signOut() {
  const s = session;
  write(null);
  if (s) { try { await call('/auth/v1/logout', { token: s.access_token }); } catch { /* ignoreras */ } }
}

// Raderar kontot och allt under det (profiler, framsteg, tider) och loggar ut.
export async function deleteAccount() {
  const s = await getSession();
  if (!s) throw new Error('Inte inloggad');
  await call('/rest/v1/rpc/delete_my_account', { token: s.access_token, body: {} });
  write(null);
}

// Anrop mot databasens REST-gränssnitt som den inloggade (radnivåsäkerheten styr vad som syns).
// method: GET, POST, PATCH eller DELETE. Fel med status 401 betyder att man inte är inloggad längre.
export async function api(method, path, { body, headers } = {}) {
  let s = await getSession();
  if (!s) throw Object.assign(new Error('Inte inloggad'), { status: 401 });
  try {
    return await call(path, { method, body, token: s.access_token, headers });
  } catch (e) {
    if (e.status !== 401) throw e;
    // Nyckeln gäller inte längre: försök förnya en gång. Avvisas även det är man utloggad (getSession rensar då sessionen).
    session.expires_at = 0;
    s = await getSession();
    if (!s) throw e;
    return call(path, { method, body, token: s.access_token, headers });
  }
}
