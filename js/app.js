import { CubeView, parseAlg, invertAlg, moveHint, moveInstruction } from './cube.js';
import { topView } from './diagram.js';
import { WORLDS, TRACKS, ALL_CASES, caseById, TRAIN_METHODS } from './content.js';
import { icon, glyph, avatar, parseAvatar, AV_COLORS, AV_SHAPES, AV_FIGURES } from './icons.js';
import { renderGames, renderSnake, renderBlocks } from './games.js';
import { accountEmail, sendCode, verifyCode, signInWithPassword, setPassword, recordConsent, signOut, deleteAccount } from './auth.js';
import { createSync } from './sync.js';
import { lang, setLang, onLang } from './i18n.js';

// ---------- Texter ----------

// Alla texter i gränssnittet, på svenska och engelska. Lektionsinnehållet ligger i content.js och content.en.js.
const UI = {
  sv: {
    appName: 'Kubskolan', language: 'Språk',
    handbook: 'Handbok att skriva ut', handbookSub: 'PDF, 16 sidor. Fin att ge bort med en kub!', handbookFile: 'handbok/kubskolan-handbok.pdf',
    starsOf: n => `${n} av 3 stjärnor`,
    close: 'Stäng', startOver: 'Börja om', moveBack: 'Ett drag bakåt', moveFwd: 'Ett drag framåt',
    play: 'Spela', pause: 'Pausa', slow: 'Långsamt', followLabel: 'Följ med på din kub',
    follow: 'Följ med', stopFollow: 'Sluta följa', resetCube: 'Nollställ',
    moveOf: (i, n) => `drag ${i} av ${n}`, doneNext: 'Gjort! Nästa', followDone: 'Klart! Ser din kub ut som den här?',
    whoToday: 'Vem ska kuba idag?', stepsOf: (d, n) => `${d} av ${n} steg`, newCuber: 'Ny kubare',
    pickPhoto: 'Välj bild', removePhoto: 'Ta bort bild', yourName: 'Vad heter du?',
    figure: 'Figur', shape: 'Form', colour: 'Färg', shapeN: i => `Form ${i}`, colourN: i => `Färg ${i}`,
    figures: ['Bokstav', 'Katt', 'Häst', 'Snubbe', 'Sol'],
    cancel: 'Avbryt', done: 'Klar', defaultName: 'Kubare',
        switchCuber: 'Byt kubare', hi: name => `Hej ${name}!`, allDone: 'Du har klarat alla steg.',
    stepsDone: (d, n) => `${d} av ${n} steg klara`, overview: 'Översikt',
    train: 'Träna', algorithms: 'Algoritmer', timer: 'Tidtagning', howFast: 'Hur snabb är du?', adventure: 'Äventyret',
    start: 'Start', step: i => `Steg ${i}`, quiz: 'Frågor', back: 'Bak', towardYou: 'Mot dig',
    remember: 'Kommer du ihåg?', readAloud: 'Läs upp', stuck: 'Fastnade du?', iDidIt: 'Jag klarade det!',
    prev: 'Tillbaka', next: 'Nästa', pickMatch: 'Välj det som stämmer, så hoppar du till rätt ställe.',
    quickQuiz: 'Snabbfrågor', right: 'Rätt!', almost: ans => `Nästan! Rätt svar: <b>${ans}</b>`,
    stepDone: 'Steget klart!', rightOf: (r, n) => `${r} av ${n} rätt`, gotStar: 'Superbra! Du fick en stjärna.',
    allForStar: n => `Svara rätt på alla ${n} för att få en stjärna.`,
    practiceForStars: 'Öva algoritmerna under Träna för att få alla stjärnor.',
    again: 'Igen', toMap: 'Till kartan', allIn: title => `Alla i ${title}`, level: b => `Nivå ${b} av 5`,
    algs: n => `${n} ${n === 1 ? 'algoritm' : 'algoritmer'}`, known: n => `${n} sitter`,
    whichMethod: 'Vilken metod vill du öva på?', lastTime: 'Senast', whatPractice: 'Vad vill du öva på?',
    mixedAll: 'Blandat från alla steg', showOnCube: 'Visa på kuben', practiseThese: 'Öva på de här',
    whatHere: 'Vad gör du här?', whichSolves: 'Vilken algoritm löser det?',
    tapPlay: 'Tryck på spela för att se lösningen på kuben.', almostGreen: 'Nästan! Det gröna är rätt.',
    timerHelp: 'Håll fingret här tills det blir grönt. Släpp för att starta. Tryck för att stoppa.',
    best: 'Bästa', avg5: 'Snitt av 5', solves: 'Lösningar', removeLast: 'Ta bort senaste',
    mastered: 'Algoritmer som sitter', bestTime: 'Bästa tid', week: 'Lösningar, 7 dagar', quizPct: n => `Frågor ${n} %`,
    resetProgress: 'Nollställ framsteg', deleteProfile: 'Ta bort profil', deviceOnly: 'Sparas bara i den här enheten/webbläsaren.',
    resetQ: name => `Nollställa ${name}?`, resetWarn: 'Alla stjärnor och tider försvinner.', resetBtn: 'Nollställ',
    deleteQ: name => `Ta bort ${name}?`, deleteWarn: 'Profilen och alla framsteg försvinner.', deleteBtn: 'Ta bort',
  },
  en: {
    appName: 'Cube School', language: 'Language',
    handbook: 'Printable handbook', handbookSub: 'PDF, 16 pages. A lovely gift to go with a cube!', handbookFile: 'handbok/cube-school-handbook.pdf',
    starsOf: n => `${n} of 3 stars`,
    close: 'Close', startOver: 'Start over', moveBack: 'One move back', moveFwd: 'One move forward',
    play: 'Play', pause: 'Pause', slow: 'Slow', followLabel: 'Follow along on your cube',
    follow: 'Follow along', stopFollow: 'Stop following', resetCube: 'Reset',
    moveOf: (i, n) => `move ${i} of ${n}`, doneNext: 'Done! Next', followDone: 'All done! Does your cube look like this one?',
    whoToday: 'Who’s cubing today?', stepsOf: (d, n) => `${d} of ${n} steps`, newCuber: 'New cuber',
    pickPhoto: 'Choose a photo', removePhoto: 'Remove photo', yourName: 'What’s your name?',
    figure: 'Figure', shape: 'Shape', colour: 'Colour', shapeN: i => `Shape ${i}`, colourN: i => `Colour ${i}`,
    figures: ['Letter', 'Cat', 'Horse', 'Dude', 'Sun'],
    cancel: 'Cancel', done: 'Done', defaultName: 'Cuber',
        switchCuber: 'Switch cuber', hi: name => `Hi ${name}!`, allDone: 'You’ve finished every step.',
    stepsDone: (d, n) => `${d} of ${n} steps done`, overview: 'Overview',
    train: 'Practice', algorithms: 'Algorithms', timer: 'Timer', howFast: 'How fast are you?', adventure: 'The Adventure',
    start: 'Start', step: i => `Step ${i}`, quiz: 'Quiz', back: 'Back', towardYou: 'Facing you',
    remember: 'Remember this?', readAloud: 'Read aloud', stuck: 'Stuck?', iDidIt: 'I did it!',
    prev: 'Back', next: 'Next', pickMatch: 'Pick the one that fits, and we’ll jump to the right place.',
    quickQuiz: 'Quick quiz', right: 'Correct!', almost: ans => `So close! The right answer is <b>${ans}</b>`,
    stepDone: 'Step complete!', rightOf: (r, n) => `${r} of ${n} right`, gotStar: 'Brilliant! You earned a star.',
    allForStar: n => `Get all ${n} right to earn a star.`,
    practiceForStars: 'Practise the algorithms under Practice to earn every star.',
    again: 'Try again', toMap: 'Back to the map', allIn: title => `All of ${title}`, level: b => `Level ${b} of 5`,
    algs: n => `${n} ${n === 1 ? 'algorithm' : 'algorithms'}`, known: n => `${n} learned`,
    whichMethod: 'Which method do you want to practise?', lastTime: 'Last time', whatPractice: 'What do you want to practise?',
    mixedAll: 'A mix from every step', showOnCube: 'Show on the cube', practiseThese: 'Practise these',
    whatHere: 'What do you do here?', whichSolves: 'Which algorithm solves it?',
    tapPlay: 'Tap play to see the solution on the cube.', almostGreen: 'So close! The green one is right.',
    timerHelp: 'Hold your finger here until it turns green. Let go to start. Tap to stop.',
    best: 'Best', avg5: 'Average of 5', solves: 'Solves', removeLast: 'Remove the last one',
    mastered: 'Algorithms learned', bestTime: 'Best time', week: 'Solves, last 7 days', quizPct: n => `Quiz ${n}%`,
    resetProgress: 'Reset progress', deleteProfile: 'Delete profile', deviceOnly: 'Only saved on this device and browser.',
    resetQ: name => `Reset ${name}?`, resetWarn: 'All stars and times will be gone.', resetBtn: 'Reset',
    deleteQ: name => `Delete ${name}?`, deleteWarn: 'The profile and all its progress will be gone.', deleteBtn: 'Delete',
  },
};
// Konto, gäst och startsida (språkstöd för det som lades till efter översättningen)
Object.assign(UI.sv, {
  lessons: 'Lektioner', pickLesson: 'Välj lektion', games: 'Spel', gamesSub: 'Kubormen och Kubfall', 
  tagline: 'Lär dig lösa Rubiks kub, steg för steg.', logIn: 'Logga in', signUp: 'Registrera dig', asGuest: 'Fortsätt som gäst',
  guestNote: 'Som gäst fungerar allt, men dina framsteg sparas bara på den här enheten. Med ett konto följer de med dig.', privacy: 'Integritet',
    guest: 'Gäst', noProfile: 'Utan profil', account: 'Konto',
  guestBanner: '<b>Du är gäst.</b> Registrera dig för att spara dina framsteg i ett konto.',
  guestMapBanner: '<b>Du är gäst.</b> Dina framsteg sparas bara på den här enheten. Registrera dig så följer de med dig.',
  saveProgress: 'Spara dina framsteg?', saveProgressText: 'Du har redan kommit en bit på vägen som gäst. Vill du spara det i kontot?',
  cuberName: 'Vad heter kubaren?', skip: 'Hoppa över', save: 'Spara',
  loggedIn: 'Inloggad', syncText: 'Profiler och framsteg sparas i ditt konto och följer med mellan enheter. Appen fungerar även utan nät.',
  syncNow: 'Synka nu', syncing: 'Synkar …', lastSynced: t => `Senast synkad ${t}`,
  syncFailed: 'Synken misslyckades. Försök igen strax.', syncOffline: 'Ingen uppkoppling just nu.',
  password: 'Lösenord', logOut: 'Logga ut', deleteAccount: 'Ta bort konto', readPrivacy: 'Läs integritetstexten',
  acctDeleteQ: 'Ta bort kontot?', acctDeleteText: 'Kontot, alla profiler och allt som sparats hos oss raderas för alltid. Det som finns på den här enheten påverkas inte.',
  acctDeleteFail: 'Det gick inte att ta bort kontot. Försök igen.', remove: 'Ta bort',
  enterCodeTitle: 'Skriv koden', codeSentTo: e => `Vi har skickat en kod till <b>${e}</b>. Titta i skräpposten om den inte kommer.`,
  codePlaceholder: 'Kod', sendNewCode: 'Skicka ny kod', wrongEmail: 'Fel e-post?', fullCode: 'Skriv hela koden från mejlet.',
  badCode: 'Koden stämde inte eller har gått ut. Be om en ny.', consentFail: 'Något gick fel när vi sparade ditt godkännande. Försök igen.',
  newCodeSent: 'En ny kod är skickad.', newCodeFail: 'Det gick inte att skicka en ny kod.',
  pwMake: 'Skapa ett lösenord?', pwAfter: 'Då loggar du in snabbare nästa gång. Du kan alltid använda en kod i stället.',
  pwPick: 'Välj ett lösenord på minst 8 tecken.', pwNew: 'Nytt lösenord', pwSave: 'Spara lösenord',
  pwShort: 'Lösenordet behöver vara minst 8 tecken.', pwRejected: 'Lösenordet godtogs inte. Välj ett annat, minst 8 tecken.',
  pwFail: 'Det gick inte att spara lösenordet. Försök igen.', pwSaved: 'Lösenordet är sparat.', showPw: 'Visa lösenord', hidePw: 'Dölj lösenord',
  tabPassword: 'Lösenord', tabCode: 'Kod', loginPwText: 'Logga in med e-post och lösenord.',
  loginCodeText: 'Vi skickar en kod till din e-post. Inget lösenord behövs.',
  registerText: 'För vårdnadshavare. Vi skickar en kod till din e-post, så behövs inget lösenord.',
  emailPlaceholder: 'din@epost.se', pwPlaceholder: 'Lösenord', sendCode: 'Skicka kod',
  forgot: 'Glömt lösenordet, eller har inget än? Logga in med kod',
  newHere: 'Ny här?', haveAccount: 'Har du redan ett konto?',
  agree: link => `Jag är vuxen och vårdnadshavare och godkänner ${link}.`, privacyLink: 'integritetstexten',
  badEmail: 'Skriv en giltig e-postadress.', needConsent: 'Du behöver godkänna integritetstexten för att fortsätta.',
  enterPw: 'Skriv ditt lösenord.', wrongLogin: 'Fel e-post eller lösenord. Du kan också logga in med kod.',
  noAccount: 'Vi hittar inget konto med den adressen. Är du ny? Tryck på Registrera dig nedan.',
  sendFail: 'Det gick inte att skicka koden. Kontrollera adressen och försök igen.',
  noNet: 'Ingen uppkoppling. Försök igen när du är online.', waitAWhile: 'Vänta en stund innan du försöker igen.',
  trackPick: 'Välj metod', trackBeg: 'Nybörjarmetoden', trackCfop: 'Avancerad (CFOP)',
  trackBegSub: n => `${n} lektioner. Lager för lager, enklast att börja med.`,
  trackCfopSub: n => `${n} lektioner. Den snabbare metoden som tävlingskubare använder.`,
  lessonsDone: (d, n) => `${d} av ${n} lektioner klara`, continue: 'Fortsätt', begin: 'Börja',
});
Object.assign(UI.en, {
  lessons: 'Lessons', pickLesson: 'Pick a lesson', games: 'Games', gamesSub: 'Two cube games',
  tagline: "Learn to solve the Rubik's Cube, step by step.", logIn: 'Log in', signUp: 'Sign up', asGuest: 'Continue as guest',
  guestNote: 'Everything works as a guest, but your progress is only saved on this device. With an account it follows you.', privacy: 'Privacy',
    guest: 'Guest', noProfile: 'No profile', account: 'Account',
  guestBanner: "<b>You're a guest.</b> Sign up to save your progress in an account.",
  guestMapBanner: "<b>You're a guest.</b> Your progress is only saved on this device. Sign up and it follows you.",
  saveProgress: 'Save your progress?', saveProgressText: "You've already made progress as a guest. Do you want to save it in your account?",
  cuberName: "What's the cuber's name?", skip: 'Skip', save: 'Save',
  loggedIn: 'Logged in', syncText: 'Profiles and progress are saved in your account and follow you between devices. The app also works offline.',
  syncNow: 'Sync now', syncing: 'Syncing …', lastSynced: t => `Last synced ${t}`,
  syncFailed: 'Sync failed. Please try again shortly.', syncOffline: 'No connection right now.',
  password: 'Password', logOut: 'Log out', deleteAccount: 'Delete account', readPrivacy: 'Read the privacy text',
  acctDeleteQ: 'Delete the account?', acctDeleteText: 'The account, all profiles and everything saved with us will be deleted for good. What is on this device is not affected.',
  acctDeleteFail: "Couldn't delete the account. Please try again.", remove: 'Delete',
  enterCodeTitle: 'Enter the code', codeSentTo: e => `We sent a code to <b>${e}</b>. Check your spam folder if it does not arrive.`,
  codePlaceholder: 'Code', sendNewCode: 'Send a new code', wrongEmail: 'Wrong email?', fullCode: 'Enter the whole code from the email.',
  badCode: 'The code was wrong or has expired. Ask for a new one.', consentFail: 'Something went wrong when saving your consent. Please try again.',
  newCodeSent: 'A new code has been sent.', newCodeFail: "Couldn't send a new code.",
  pwMake: 'Create a password?', pwAfter: 'Then you can log in faster next time. You can always use a code instead.',
  pwPick: 'Choose a password with at least 8 characters.', pwNew: 'New password', pwSave: 'Save password',
  pwShort: 'The password needs at least 8 characters.', pwRejected: 'The password was not accepted. Choose another one, at least 8 characters.',
  pwFail: "Couldn't save the password. Please try again.", pwSaved: 'The password is saved.', showPw: 'Show password', hidePw: 'Hide password',
  tabPassword: 'Password', tabCode: 'Code', loginPwText: 'Log in with email and password.',
  loginCodeText: "We'll email you a code. No password needed.",
  registerText: "For parents and guardians. We'll email you a code, so no password is needed.",
  emailPlaceholder: 'you@example.com', pwPlaceholder: 'Password', sendCode: 'Send code',
  forgot: 'Forgot the password, or have none yet? Log in with a code',
  newHere: 'New here?', haveAccount: 'Already have an account?',
  agree: link => `I am an adult and a parent or guardian, and I accept ${link}.`, privacyLink: 'the privacy text',
  badEmail: 'Enter a valid email address.', needConsent: 'You need to accept the privacy text to continue.',
  enterPw: 'Enter your password.', wrongLogin: 'Wrong email or password. You can also log in with a code.',
  noAccount: "We can't find an account with that address. New here? Tap Sign up below.",
  sendFail: "Couldn't send the code. Check the address and try again.",
  noNet: 'No connection. Try again when you are online.', waitAWhile: 'Wait a moment before trying again.',
  trackPick: 'Choose a method', trackBeg: 'Beginner method', trackCfop: 'Advanced (CFOP)',
  trackBegSub: n => `${n} lessons. Layer by layer, the easiest way to start.`,
  trackCfopSub: n => `${n} lessons. The faster method competition cubers use.`,
  lessonsDone: (d, n) => `${d} of ${n} lessons done`, continue: 'Continue', begin: 'Start',
});

const T = (k, ...a) => {
  const v = UI[lang][k] ?? UI.sv[k];
  return typeof v === 'function' ? v(...a) : v;
};

// Språkväljaren i sidhuvudet
const langSwitch = () => `<div class="lang-switch" role="group" aria-label="${T('language')}">${['sv', 'en'].map(l =>
  `<button data-lang="${l}" aria-pressed="${l === lang}" lang="${l}">${l.toUpperCase()}</button>`).join('')}</div>`;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-lang]');
  if (b) setLang(b.dataset.lang);
});

// ---------- Lagring ----------

const KEY = 'kubskolan.v1';
let db = load();

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.profiles)) return d;
  } catch { /* tom eller blockerad lagring */ }
  return { profiles: [], current: null, guest: false };
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* ignoreras */ }
}
// Varje ändring sparas lokalt direkt och synkas till kontot en stund senare, om man är inloggad.
let sync = null;
function save() {
  persist();
  if (sync && accountEmail()) sync.schedule();
}
const me = () => db.profiles.find(p => p.id === db.current);

function newProfile(name, av) {
  return { id: Date.now().toString(36), name, avatar: av, lessons: {}, quiz: {}, boxes: {}, times: [], stepAt: {} };
}

// ---------- Gäst ----------

// En gäst har ingen egen profil att skapa. Appen håller en dold profil med guest: true, som aldrig synkas
// och som inloggade aldrig ser. Äldre profiler på enheten är inte gästprofilen.
const hasProgress = p => !!(Object.keys(p.lessons).length || Object.keys(p.quiz).length || Object.keys(p.boxes).length || p.times.length);
const realProfiles = () => db.profiles.filter(p => !p.guest);

function ensureGuest() {
  let g = db.profiles.find(p => p.guest);
  if (!g) { g = { ...newProfile('Gäst', 's0c0'), guest: true }; db.profiles.push(g); }
  db.current = g.id;
  persist();
  return g;
}

// Efter inloggning: har gästen gjort något erbjuds den att bli en riktig kubare i kontot.
function offerGuestSave() {
  const g = db.profiles.find(p => p.guest);
  if (!g || g.offered || !hasProgress(g)) return Promise.resolve();
  return new Promise(resolve => {
    let input;
    const w = modal(`
      <h2>${T('saveProgress')}</h2>
      <p class="muted">${T('saveProgressText')}</p>
      <input class="field" maxlength="16" placeholder="${T('cuberName')}" autocomplete="off">`,
    [[T('skip'), () => { g.offered = true; persist(); resolve(); }, 'ghost'],
      [`${icon('check')} ${T('save')}`, () => {
        g.guest = false;
        g.name = input.value.trim() || T('defaultName');
        save();
        resolve();
      }, 'primary']]);
    input = w.querySelector('.field');
    setTimeout(() => input.focus(), 50);
  });
}

// ---------- Progress ----------

// Lektionsspåret: nybörjarmetoden eller CFOP. Valet sparas på enheten (db.track); nybörjarmetoden är förvald.
const trackId = () => (db.track === 'cfop' ? 'cfop' : 'beg');
const trackWorlds = () => TRACKS.find(t => t.id === trackId()).worlds.map(id => WORLDS.find(w => w.id === id));
// Stegets nummer i det valda spåret, annars i det andra
const stepNo = id => {
  const i = TRACKS.find(t => t.id === trackId()).worlds.indexOf(id);
  return i >= 0 ? i : TRACKS.find(t => t.id !== trackId()).worlds.indexOf(id);
};
const coreCases = w => (w.cases || []).filter(c => !c.bonus);

function stars(p, w) {
  if (!p.lessons[w.id]) return 0;
  let s = 1;
  if ((p.quiz[w.id] || 0) >= 0.8) s++;
  if (coreCases(w).every(c => (p.boxes[c.id] || 0) >= 3)) s++;
  return s;
}

// Det som visas på topplistan, räknat av appen och skickat med synken.
const summary = p => ({
  stars: WORLDS.reduce((n, w) => n + stars(p, w), 0),
  mastered: ALL_CASES.filter(c => (p.boxes[c.id] || 0) >= 3).length,
});

// Ritar om skärmar som visar framsteg när synken har hämtat något nytt. Aldrig mitt i en lektion, ett spel eller en tidtagning.
function refreshAfterSync() {
  const name = location.hash.replace(/^#\/?/, '').split('/')[0];
  if (['', 'map', 'lessons', 'overview', 'konto'].includes(name)) route();
}
sync = createSync({ getDb: () => db, persist, summary, onChange: refreshAfterSync });

const starsHtml = n => `<span class="stars" aria-label="${T('starsOf', n)}">${[0, 1, 2].map(i => icon(i < n ? 'star' : 'starO', i < n ? 'on' : '')).join('')}</span>`;
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

// ---------- Statistik (GoatCounter, utan cookies) ----------

// Skickar bara skärmvisningar och händelser med steg- och fallnamn. Aldrig namn, profiler eller tider.
// Skriptet laddas asynkront, så det som händer innan det är klart köas.
const trackQueue = [];
function track(path, event = false) {
  const gc = window.goatcounter;
  if (gc && gc.count) { try { gc.count({ path, title: path, event }); } catch { /* ignoreras */ } }
  else trackQueue.push([path, event]);
}
document.querySelector('script[data-goatcounter]')?.addEventListener('load', () => {
  while (trackQueue.length) track(...trackQueue.shift());
});

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
    .replace(/(\b[RLUDFBMfr])'/g, lang === 'en' ? '$1 prime' : '$1 prim').replace(/\b([RLUDFBMfr])2\b/g, lang === 'en' ? '$1 two' : '$1 två');
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'en' ? 'en-GB' : 'sv-SE';
  const voice = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith(lang));
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
    <a class="icon-btn" href="${back}" aria-label="${T('close')}">${icon('close')}</a>
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
          <button class="ctl" data-a="reset" aria-label="${T('startOver')}">${icon('restart')}</button>
          <button class="ctl" data-a="back" aria-label="${T('moveBack')}">${icon('stepB')}</button>
          <button class="ctl play" data-a="play" aria-label="${T('play')}">${icon('play')}</button>
          <button class="ctl" data-a="fwd" aria-label="${T('moveFwd')}">${icon('stepF')}</button>
          <button class="ctl speed" data-a="speed" aria-label="${T('slow')}">½×</button>
          <button class="ctl follow-btn" data-a="follow" aria-label="${T('followLabel')}">${icon('hand')}<span>${T('follow')}</span></button>
        </div>` : ''}
      ${cfg.pad ? `
        <div class="pad">${padMoves.map(m => `<button class="padbtn" data-m="${m}"><b>${m}</b><i>${moveHint(parseAlg(m)[0]).arrow}</i></button>`).join('')}
        <button class="padbtn wide" data-m="reset">${icon('restart')} ${T('resetCube')}</button></div>` : ''}
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
      playBtn.setAttribute('aria-label', T(playing ? 'pause' : 'play'));
    }
    if (followEl && following) {
      if (i < tokens.length) {
        const t = tokens[i], h = moveHint(t);
        followEl.innerHTML = `
          <p class="follow-part">${named && parts[t.part].name ? `${esc(parts[t.part].name)} · ` : ''}${T('moveOf', i + 1, tokens.length)}</p>
          <div class="follow-move"><b>${esc(t.text)}</b><span>${h.arrow}</span></div>
          <p class="follow-text">${moveInstruction(t)}</p>
          <div class="follow-nav">
            <button class="icon-btn big" data-f="back" aria-label="${T('moveBack')}" ${i === 0 ? 'disabled' : ''}>${icon('back')}</button>
            <button class="btn primary" data-f="next">${T('doneNext')} ${icon('next')}</button>
          </div>`;
      } else {
        followEl.innerHTML = `
          <p class="follow-text">${T('followDone')}</p>
          <div class="follow-nav"><button class="btn ghost" data-f="reset">${icon('restart')} ${T('startOver')}</button></div>`;
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
      b.querySelector('span').textContent = T(following ? 'stopFollow' : 'follow');
      followEl.classList.toggle('hidden', !following);
      // I följ med-läget göms dragraden och spelknapparna, så att allt ryms utan att man behöver scrolla
      const player = host.querySelector('.player');
      player.classList.toggle('following', following);
      update();
      if (following) requestAnimationFrame(() => player.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
    }
  });

  host.querySelectorAll('.padbtn').forEach(b => b.onclick = () => {
    if (b.dataset.m === 'reset') { view.clearQueue().then(() => view.reset()); return; }
    view.animate(parseAlg(b.dataset.m)[0], 260);
  });

  return { view, play, reset };
}

// ---------- Router ----------

// Det spelen i games.js behöver från appen. onLeave anropas när man lämnar skärmen.
const gameCtx = () => ({ app, me, save, topbar, pAvatar, confetti, track, onLeave: fn => cleanups.push(fn) });

function route() {
  clearScreen();
  const [name, a, b] = location.hash.replace(/^#\/?/, '').split('/');
  if (accountEmail() && me() && me().guest) db.current = null; // en inloggad ska välja en riktig kubare
  if (!me() && name && !['konto', 'integritet', 'start'].includes(name)) { location.hash = '#/'; return; }
  window.scrollTo(0, 0);
  track('/' + (name ? [name, a, b].filter(x => x != null).join('/') : ''));
  if (!name) {
    if (accountEmail()) return renderProfiles();
    if (!db.guest) return renderStart();
    // Gäst utan äldre profiler går direkt in. Med äldre profiler på enheten visas väljaren.
    if (!realProfiles().length) { ensureGuest(); location.hash = '#/map'; return; }
    return renderProfiles();
  }
  if (name === 'start') return renderStart();
  if (name === 'map') return renderMap();
  if (name === 'lessons') return renderLessons();
  if (name === 'lesson') return renderLesson(a, parseInt(b || '0', 10));
  if (name === 'quiz') return renderQuiz(a);
  if (name === 'train') return a ? renderMethod(a) : renderTrainMenu();
  if (name === 'algs') return renderAlgs(a, b);
  if (name === 'drill') return renderTrainer(a, b);
  if (name === 'timer') return renderTimer();
  if (name === 'games') return renderGames(gameCtx());
  if (name === 'snake') return renderSnake(gameCtx());
  if (name === 'blocks') return renderBlocks(gameCtx());
  if (name === 'overview') return renderOverview();
  if (name === 'konto') return renderAccount(a);
  if (name === 'integritet') return renderPrivacy();
  if (name === 'parent') { location.hash = '#/overview'; return; } // gamla länkar
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

function renderStart() {
  app.innerHTML = `
    <div class="screen start">
      <div class="profiles-top">${langSwitch()}</div>
      <div class="brand">${LOGO}<h1>${T('appName')}</h1></div>
      <p class="lead">${T('tagline')}</p>
      <div class="start-actions">
        <a class="btn primary huge" href="#/konto/login">${T('logIn')}</a>
        <a class="btn huge" href="#/konto/register">${T('signUp')}</a>
        <button class="btn ghost huge guest">${T('asGuest')}</button>
      </div>
      <p class="guest-note">${T('guestNote')}</p>
      <p class="guest-note"><a href="#/integritet">${T('privacy')}</a></p>
    </div>`;
  app.querySelector('.guest').onclick = () => {
    db.guest = true; save();
    if (location.hash === '#/' || location.hash === '') route(); else location.hash = '#/';
  };
}

function renderProfiles() {
  app.innerHTML = `
    <div class="screen profiles">
      <div class="profiles-top">${langSwitch()}</div>
      <div class="brand">${LOGO}<h1>${T('appName')}</h1></div>
      <p class="lead">${T('whoToday')}</p>
      <div class="profile-grid">
        ${realProfiles().map(p => {
          const done = trackWorlds().filter(w => p.lessons[w.id]).length;
          return `
          <button class="profile-card" data-id="${p.id}">
            ${pAvatar(p, 'lg')}
            <span class="pname">${esc(p.name)}</span>
            <span class="pmeta">${T('stepsOf', done, trackWorlds().length)}</span>
          </button>`;
        }).join('')}
        ${accountEmail() ? '' : `<button class="profile-card" data-id="guest">
          ${avatar('s0c0', T('guest'), '', 'lg')}
          <span class="pname">${T('guest')}</span>
          <span class="pmeta">${T('noProfile')}</span>
        </button>`}
        <button class="profile-card add" data-id="new">
          <span class="add-circle">${icon('plus')}</span>
          <span class="pname">${T('newCuber')}</span>
        </button>
      </div>
      ${accountEmail()
        ? `<a class="acct-link" href="#/konto">${icon('users')} ${T('account')}</a>`
        : `<div class="guest-banner">
            <p>${T('guestBanner')}</p>
            <div class="row">
              <a class="btn small ghost" href="#/konto/login">${T('logIn')}</a>
              <a class="btn small primary" href="#/konto/register">${T('signUp')}</a>
            </div>
          </div>`}
    </div>`;
  app.querySelectorAll('.profile-card').forEach(b => b.onclick = () => {
    if (b.dataset.id === 'new') return newProfileDialog();
    if (b.dataset.id === 'guest') { ensureGuest(); location.hash = '#/map'; return; }
    db.current = b.dataset.id; save();
    location.hash = '#/map';
  });
}

function newProfileDialog() {
  let s = Math.floor(Math.random() * AV_SHAPES), c = Math.floor(Math.random() * AV_COLORS.length);
  let f = 1 + Math.floor(Math.random() * (AV_FIGURES.length - 1)); // en figur från start, inte ett frågetecken
  let photo = null;
  const w = modal(`
    <h2>${T('newCuber')}</h2>
    <div class="av-preview"></div>
    <div class="photo-row">
      <label class="btn small ghost photo-pick">${icon('image')} ${T('pickPhoto')}<input type="file" accept="image/*" hidden></label>
      <button class="btn small ghost photo-clear hidden">${T('removePhoto')}</button>
    </div>
    <input class="field" maxlength="16" placeholder="${T('yourName')}" autocomplete="off">
    <div class="av-pickers">
    <p class="pick-label">${T('figure')}</p>
    <div class="pick figures">${AV_FIGURES.map((name, i) => i ? `<button class="pick-btn" data-f="${i}" aria-label="${T('figures')[i] || name}"></button>` : '').join('')}</div>
    <p class="pick-label">${T('shape')}</p>
    <div class="pick shapes">${Array.from({ length: AV_SHAPES }, (_, i) => `<button class="pick-btn" data-s="${i}" aria-label="${T('shapeN', i + 1)}"></button>`).join('')}</div>
    <p class="pick-label">${T('colour')}</p>
    <div class="pick colors">${AV_COLORS.map((col, i) => `<button class="pick-btn dot" data-c="${i}" style="--c:${col}" aria-label="${T('colourN', i + 1)}"></button>`).join('')}</div>
    </div>`,
  [[T('cancel'), null, 'ghost'], [`${icon('check')} ${T('done')}`, () => {
    const name = w.querySelector('.field').value.trim() || T('defaultName');
    const p = newProfile(name, `s${s}c${c}f${f}`);
    if (photo) p.photo = photo;
    db.profiles.push(p); db.current = p.id; save();
    location.hash = '#/map';
  }, 'primary']]);
  const input = w.querySelector('.field');
  const draw = () => {
    const name = input.value || '?';
    const av = (ss, cc, ff) => `s${ss}c${cc}f${ff}`;
    w.querySelector('.av-preview').innerHTML = photo ? photoImg(photo, 'xl') : avatar(av(s, c, f), name, '', 'xl');
    w.querySelectorAll('[data-f]').forEach(b => {
      b.innerHTML = avatar(av(s, c, b.dataset.f), name, '', 'sm');
      b.classList.toggle('sel', +b.dataset.f === f);
    });
    w.querySelector('.photo-clear').classList.toggle('hidden', !photo);
    w.querySelector('.av-pickers').classList.toggle('hidden', !!photo);
    w.querySelectorAll('[data-s]').forEach(b => {
      b.innerHTML = avatar(av(b.dataset.s, c, f), name, '', 'sm');
      b.classList.toggle('sel', +b.dataset.s === s);
    });
    w.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('sel', +b.dataset.c === c));
  };
  w.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { s = +b.dataset.s; draw(); });
  w.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { c = +b.dataset.c; draw(); });
  w.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { f = +b.dataset.f; draw(); });
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


// Klara lektioner startar om från början, påbörjade fortsätter där man var.
function openLesson(p, w) {
  const at = p.lessons[w.id] ? 0 : (p.stepAt[w.id] || 0);
  location.hash = `#/lesson/${w.id}/${at}`;
}

// Stegen på kartan ligger under knappen "Äventyret". Stängd från start; förblir öppen medan appen är igång.
let adventureOpen = false;

function renderMap() {
  const p = me();
  const tw = trackWorlds();
  const doneCount = tw.filter(w => p.lessons[w.id]).length;
  const current = tw.findIndex(w => !p.lessons[w.id]); // nästa lektion att göra

  app.innerHTML = `
    <div class="screen map">
      <header class="map-head">
        ${p.guest && !realProfiles().length
          ? `<span class="who">${pAvatar(p, 'md')}</span>` // gästen har ingen annan kubare att byta till
          : `<a class="who" href="#/" aria-label="${T('switchCuber')}">${pAvatar(p, 'md')}</a>`}
        <div>
          <h1>${T('hi', esc(p.guest ? T('guest') : p.name))}</h1>
          <p class="sub">${doneCount === tw.length ? T('allDone') : T('stepsDone', doneCount, tw.length)}</p>
        </div>
        <div class="head-actions">
          ${langSwitch()}
          <a class="icon-btn" href="#/overview" aria-label="${T('overview')}">${icon('chart')}</a>
        </div>
      </header>
      ${accountEmail() ? '' : `<div class="guest-banner map-banner">
        <p>${T('guestMapBanner')}</p>
        <div class="row">
          <a class="btn small ghost" href="#/konto/login">${T('logIn')}</a>
          <a class="btn small primary" href="#/konto/register">${T('signUp')}</a>
        </div>
      </div>`}
      <div class="tiles">
        <a class="tile lessons" href="#/lessons"><span class="tile-ic">${icon('book')}</span><b>${T('lessons')}</b><small>${T('pickLesson')}</small></a>
        <a class="tile" href="#/train"><span class="tile-ic">${icon('target')}</span><b>${T('train')}</b><small>${T('algorithms')}</small></a>
        <a class="tile alt" href="#/timer"><span class="tile-ic">${icon('timer')}</span><b>${T('timer')}</b><small>${T('howFast')}</small></a>
        <a class="tile games" href="#/games"><span class="tile-ic">${icon('gamepad')}</span><b>${T('games')}</b><small>${T('gamesSub')}</small></a>
      </div>
      <button class="adventure-btn ${adventureOpen ? 'open' : ''}" aria-expanded="${adventureOpen}">
        <span class="tile-ic">${icon('flag')}</span>
        <span class="adv-txt"><b>${T('adventure')}</b><small>${T(trackId() === 'beg' ? 'trackBeg' : 'trackCfop')} · ${T('stepsDone', doneCount, tw.length)}</small></span>
        <span class="adv-chev">${icon('next')}</span>
      </button>
      <div class="path-wrap ${adventureOpen ? '' : 'hidden'}">
        <svg class="path-line" aria-hidden="true"><path class="track"/><path class="trail"/></svg>
        <ol class="path">
          ${tw.map((w, i) => {
            const done = !!p.lessons[w.id];
            const x = 0.5 + 0.38 * Math.sin(i * 1.15);
            return `
            <li class="stop ${done ? 'done' : ''} ${i === current ? 'current' : ''}" style="--x:${x.toFixed(3)}">
              <button class="node" data-i="${i}" aria-label="${esc(w.title)}">
                ${glyph(w.id)}
                ${i === current ? `<span class="node-tag">${T('start')}</span>` : ''}
              </button>
              <div class="stop-label">
                <span class="stop-num">${T('step', i)}</span>
                <b>${esc(w.title)}</b>
                ${done ? starsHtml(stars(p, w)) : `<small>${esc(w.short)}</small>`}
                ${done ? `<a class="mini-btn" href="#/quiz/${w.id}">${icon('question')} ${T('quiz')}</a>` : ''}
              </div>
            </li>`;
          }).join('')}
        </ol>
      </div>
      <a class="handbook-link" href="${T('handbookFile')}" download target="_blank" rel="noopener">
        <span class="tile-ic">${icon('download')}</span>
        <span class="adv-txt"><b>${T('handbook')}</b><small>${T('handbookSub')}</small></span>
      </a>
    </div>`;

  app.querySelector('.adventure-btn').onclick = e => {
    adventureOpen = !adventureOpen;
    e.currentTarget.classList.toggle('open', adventureOpen);
    e.currentTarget.setAttribute('aria-expanded', adventureOpen);
    app.querySelector('.path-wrap').classList.toggle('hidden', !adventureOpen);
  };


  app.querySelectorAll('.node').forEach(b => b.onclick = () => openLesson(p, tw[+b.dataset.i]));

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

// ---------- Lektioner (lista) ----------

function renderLessons() {
  const p = me();
  const tw = trackWorlds();
  const doneCount = tw.filter(w => p.lessons[w.id]).length;
  const current = tw.findIndex(w => !p.lessons[w.id]); // nästa lektion att göra

  const card = (w, i) => {
    const done = !!p.lessons[w.id];
    const resume = !done && (p.stepAt[w.id] || 0) > 0;
    const status = done ? starsHtml(stars(p, w))
      : `<span class="lc-status go">${resume ? T('continue') : T('begin')} ${icon('next')}</span>`;
    return `
      <li class="lesson-card ${done ? 'done' : ''} ${i === current ? 'current' : ''}">
        <button class="lc-main" data-i="${i}">
          <span class="lc-ic">${glyph(w.id)}</span>
          <span class="lc-txt">
            <span class="stop-num">${T('step', i)}</span>
            <b>${esc(w.title)}</b>
            <small>${esc(w.short)}</small>
          </span>
          ${status}
        </button>
        ${done ? `<a class="mini-btn" href="#/quiz/${w.id}">${icon('question')} ${T('quiz')}</a>` : ''}
      </li>`;
  };

  // De första sex lektionerna delas av båda metoderna, så framstegen följer med när man byter.
  const pick = TRACKS.map(t => {
    const on = t.id === trackId();
    return `<button class="track ${on ? 'on' : ''}" data-track="${t.id}" role="tab" aria-selected="${on}">
      <b>${T(t.id === 'beg' ? 'trackBeg' : 'trackCfop')}</b>
      <small>${T(t.id === 'beg' ? 'trackBegSub' : 'trackCfopSub', t.worlds.length)}</small>
    </button>`;
  }).join('');

  app.innerHTML = `
    <div class="screen lessons-screen">
      ${topbar({ back: '#/map', middle: `<span class="topbar-title">${icon('book')} ${T('lessons')}</span>`, right: pAvatar(p, 'sm') })}
      <div class="track-pick" role="tablist" aria-label="${T('trackPick')}">${pick}</div>
      <div class="lessons-sum">
        <span>${T('lessonsDone', doneCount, tw.length)}</span>
      </div>
      <div class="progress" role="progressbar" aria-valuenow="${doneCount}" aria-valuemax="${tw.length}"><span style="width:${(doneCount / tw.length) * 100}%"></span></div>
      <ol class="lesson-list">${tw.map(card).join('')}</ol>
    </div>`;

  app.querySelectorAll('.lc-main').forEach(b => b.onclick = () => openLesson(p, tw[+b.dataset.i]));
  app.querySelectorAll('.track').forEach(b => b.onclick = () => { db.track = b.dataset.track; save(); renderLessons(); });
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
  const w = WORLDS.find(x => x.id === wid);
  const wi = stepNo(wid);
  if (!w) { location.hash = '#/map'; return; }
  n = Math.max(0, Math.min(n, w.steps.length - 1));
  const step = w.steps[n];
  p.stepAt[w.id] = n; save();
  const last = n === w.steps.length - 1;

  // Bilder ovanifrån: { caseRef | setupInv | setup, mask, arrows, label }
  const diagrams = (step.diagrams || (step.diagram ? [step.diagram] : [])).map(caseFig);
  const figs = diagrams.length ? `<div class="topviews">${diagrams.map(d => `
    <figure class="tv">
      <span class="tv-side">${T('back')}</span>${topView(d)}<span class="tv-side">${T('towardYou')}</span>
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
          <p class="eyebrow">${step.recap ? T('remember') : `${T('step', wi)} · ${esc(w.title)}`}</p>
          <h2>${step.title}</h2>
          ${step.cube && figs ? figs : ''}
          <div class="lesson-text">${step.text}</div>
          ${step.rule ? `<p class="rule">${icon('spark')}<span>${step.rule}</span></p>` : ''}
          <div class="text-actions">
            <button class="say" aria-label="${T('readAloud')}">${icon('sound')} ${T('readAloud')}</button>
            ${step.help ? `<button class="say help-btn">${icon('question')} ${T('stuck')}</button>` : ''}
          </div>
          ${step.practice ? `<button class="btn primary huge done-btn">${icon('check')} ${T('iDidIt')}</button>` : ''}
        </div>
      </div>
      <footer class="navbar">
        <button class="icon-btn big prev" ${n === 0 ? 'disabled' : ''} aria-label="${T('prev')}">${icon('back')}</button>
        ${last && step.practice ? '' : `<button class="btn primary next">${T(last ? 'done' : 'next')} ${icon(last ? 'check' : 'next')}</button>`}
      </footer>
    </div>`;

  if (step.cube) createPlayer(app.querySelector('.cube-panel'), step.cube);
  app.querySelector('.say').onclick = () => speak(step.title + '. ' + step.text + (step.rule ? '. ' + step.rule : ''));
  const helpBtn = app.querySelector('.help-btn');
  if (helpBtn) helpBtn.onclick = () => {
    const wrap = modal(`
      <h2>${T('stuck')}</h2>
      <p class="muted">${T('pickMatch')}</p>
      <div class="help-list">${step.help.map(([text, to], k) => to == null
        ? `<p class="help-tip">${icon('spark')}<span>${esc(text)}</span></p>`
        : `<button class="btn ghost help-item" data-k="${k}">${esc(text)} ${icon('next')}</button>`).join('')}</div>`,
    [[T('close'), null, 'ghost']]);
    wrap.querySelectorAll('.help-item').forEach(b => b.onclick = () => {
      const to = step.help[+b.dataset.k][1];
      track(`hjalp/${w.id}/steg-${n}/till-${to}`, true);
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
  const w = WORLDS.find(x => x.id === wid);
  const wi = stepNo(wid);
  if (!w || !w.quiz) { location.hash = '#/map'; return; }
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
          <p class="eyebrow">${T('quickQuiz')} · ${esc(w.title)}</p>
          <h2>${esc(item.q)}</h2>
          ${item.cube ? '<div class="panel cube-panel quiz-cube"></div>' : ''}
          ${fig ? `<div class="topviews"><figure class="tv"><span class="tv-side">${T('back')}</span>${topView(fig)}<span class="tv-side">${T('towardYou')}</span></figure></div>` : ''}
          <div class="answers">${shuffle(item.options.map((o, k) => [o, k])).map(([o, k]) => `<button class="btn answer" data-k="${k}">${esc(o)}</button>`).join('')}</div>
          <div class="feedback"></div>
        </div>
      </div>`;
    if (item.cube) createPlayer(app.querySelector('.quiz-cube'), { ...item.cube, alg: '' }); // visa inte lösningen
    app.querySelectorAll('.answer').forEach(b => b.onclick = () => {
      const ok = b.dataset.k === '0';
      if (ok) right++;
      track(`fraga/${w.id}/${q + 1}/${ok ? 'ratt' : 'fel'}`, true);
      app.querySelectorAll('.answer').forEach(x => {
        x.disabled = true;
        if (x.dataset.k === '0') x.classList.add('right');
        else if (x === b) x.classList.add('wrong');
      });
      const fb = app.querySelector('.feedback');
      fb.innerHTML = `<p class="fb-title ${ok ? 'ok' : ''}">${ok ? `${icon('check')} ${T('right')}` : T('almost', esc(item.options[0]))}</p>
        <button class="btn primary nextq">${T(q + 1 < total ? 'next' : 'done')} ${icon(q + 1 < total ? 'next' : 'check')}</button>`;
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
    track(`${first ? 'steg-klart' : 'steg-igen'}/${w.id}/${right}-av-${total}`, true);
    if (first || score >= 0.8) confetti();
    app.innerHTML = `
      <div class="screen center-screen">
        <div class="medal big">${score >= 0.8 ? icon('star') : glyph(w.id)}</div>
        <h2>${first ? T('stepDone') : T('rightOf', right, total)}</h2>
        <p class="muted">${first ? `${T('rightOf', right, total)}. ` : ''}${score >= 0.8 ? T('gotStar') : T('allForStar', total)}</p>
        ${coreCases(w).length ? `<p class="muted">${T('practiceForStars')}</p>` : ''}
        <div class="row">
          ${score < 0.8 ? `<button class="btn ghost again">${icon('restart')} ${T('again')}</button>` : ''}
          <a class="btn primary" href="#/map">${T('toMap')}</a>
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
  if (g === 'all') return { method, title: T('allIn', method.title), groups: method.groups.map(grp => [grp, toCases(grp)]), cases: method.groups.flatMap(toCases) };
  const grp = method.groups.find(x => x.id === g);
  return grp ? { method, title: grp.title, groups: [[grp, toCases(grp)]], cases: toCases(grp) } : null;
}
const methodCases = method => [...new Set(method.groups.flatMap(grp => grp.cases))].map(caseById);
const groupIcon = grp => grp.world ? glyph(grp.world) : icon('cube');
const levelHtml = box => `<div class="level" aria-label="${T('level', box)}">${[1, 2, 3, 4, 5].map(i => `<span class="${i <= box ? 'on' : ''}"></span>`).join('')}</div>`;

function trainCard(p, href, ic, title, sub, cases, extra = '') {
  const sits = cases.filter(c => (p.boxes[c.id] || 0) >= 3).length;
  return `
    <section class="panel train-card ${extra ? 'last' : ''}">
      <a class="train-main" href="${href}">
        <span class="train-ic">${ic}</span>
        <span class="train-txt"><b>${esc(title)}${extra}</b><small>${esc(sub)}</small>
          <span class="train-meta">${T('algs', cases.length)} · ${T('known', sits)}</span></span>
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
      ${topbar({ middle: `<span class="topbar-title">${icon('target')} ${T('train')}</span>` })}
      <p class="lead">${T('whichMethod')}</p>
      <div class="train-list">
        ${methods.map(m => trainCard(p, `#/train/${m.id}`, groupIcon(m), m.title, m.short, methodCases(m),
          m.id === last ? ` <span class="last-tag">${T('lastTime')}</span>` : '')).join('')}
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
      <p class="lead">${T('whatPractice')}</p>
      <div class="train-list">
        ${method.groups.map(grp => trainCard(p, `#/algs/${m}/${grp.id}`, groupIcon(grp), grp.title, grp.short, grp.cases.map(caseById))).join('')}
        ${trainCard(p, `#/algs/${m}/all`, icon('shuffle'), T('allIn', method.title), T('mixedAll'), methodCases(method))}
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
              <button class="btn small play-alg" data-id="${c.id}">${icon('play')} ${T('showOnCube')}</button>
            </div>
          </article>`).join('')}</div>`).join('')}
      <div class="row"><a class="btn primary huge" href="#/drill/${m}/${g}">${icon('target')} ${T('practiseThese')}</a></div>
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
    const wrap = modal(`<h2>${esc(c.name)}</h2><div class="modal-player"></div>`, [[T('close'), () => {
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
    // Tre svar: det rätta och två andra algoritmer, helst från samma steg, sedan samma metod, sedan alla.
    const wrong = [];
    for (const tier of [groupOf(c).cases, methodCases(methodById(m)), ALL_CASES]) {
      for (const x of shuffle(tier.map(t => typeof t === 'string' ? caseById(t) : t))) {
        if (wrong.length < 2 && x.alg !== c.alg && !wrong.includes(x.alg)) wrong.push(x.alg);
      }
    }
    const options = shuffle([[c.alg, 0], [wrong[0], 1], [wrong[1], 2]]);
    app.innerHTML = `
      <div class="screen trainer">
        ${topbar({ back: `#/algs/${m}/${g}`, middle: `<span class="topbar-title">${icon('target')} ${esc(sel.title)}</span>`, right: `<a class="mini-btn" href="#/algs/${m}/${g}">${icon('cube')} ${T('algorithms')}</a>` })}
        <div class="split">
          <div class="panel cube-panel trainer-cube"></div>
          <div class="panel text-panel trainer-side">
            <p class="eyebrow">${esc(groupOf(c).title)}</p>
            <h2 class="case-name">${T('whatHere')}</h2>
            ${levelHtml(box)}
            <p class="hint muted">${T('whichSolves')}</p>
            <div class="answers alg-answers">${options.map(([a, k]) => `<button class="btn answer" data-k="${k}"><code>${esc(a)}</code></button>`).join('')}</div>
            <div class="feedback"></div>
          </div>
        </div>
      </div>`;
    const cubeHost = app.querySelector('.trainer-cube');
    createPlayer(cubeHost, { setupInv: c.alg, mask: c.mask });
    app.querySelectorAll('.answer').forEach(btn => btn.onclick = () => {
      const ok = btn.dataset.k === '0';
      app.querySelectorAll('.answer').forEach(x => {
        x.disabled = true;
        if (x.dataset.k === '0') x.classList.add('right');
        else if (x === btn) x.classList.add('wrong');
      });
      track(`trana/${c.id}/${ok ? 'ratt' : 'fel'}`, true);
      const b = p.boxes[c.id] || 0;
      p.boxes[c.id] = ok ? Math.min(5, b + 1) : Math.max(0, b - 1);
      save();
      if (p.boxes[c.id] === 5 && b < 5) confetti();
      app.querySelector('.case-name').textContent = c.name;
      app.querySelector('.level').outerHTML = levelHtml(p.boxes[c.id]);
      app.querySelector('.hint').textContent = T('tapPlay');
      const fb = app.querySelector('.feedback');
      fb.innerHTML = `<p class="fb-title ${ok ? 'ok' : ''}">${ok ? `${icon('check')} ${T('right')}` : T('almostGreen')}</p>
        <button class="btn primary nextq">${T('next')} ${icon('next')}</button>`;
      fb.querySelector('.nextq').onclick = show;
      clearViews();
      createPlayer(cubeHost, { setupInv: c.alg, alg: c.alg, mask: c.mask });
    });
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
      ${topbar({ middle: `<span class="topbar-title">${icon('timer')} ${T('timer')}</span>`, right: pAvatar(p, 'sm') })}
      <div class="timer-pad" tabindex="0">
        <div class="time">0.00</div>
        <p class="timer-help">${T('timerHelp')}</p>
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
        <div><small>${T('best')}</small><b>${best ? fmt(best) : '–'}</b></div>
        <div><small>${T('avg5')}</small><b>${avg ? fmt(avg) : '–'}</b></div>
        <div><small>${T('solves')}</small><b>${p.times.length}</b></div>
      </div>
      <ol class="time-list">${times.map(t => `<li class="${t.ms === best ? 'best' : ''}">${t.ms === best ? icon('star') : ''}${fmt(t.ms)}</li>`).join('')}</ol>
      ${times.length ? `<button class="btn ghost small del">${icon('trash')} ${T('removeLast')}</button>` : ''}`;
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

// ---------- Översikt ----------

// Den valda kubarens egen översikt
function renderOverview() {
  app.innerHTML = `
    <div class="screen parent">
      ${topbar({ back: '#/map', middle: `<span class="topbar-title">${icon('chart')} ${T('overview')}</span>` })}
      ${[me()].map(p => {
        const best = p.times.length ? fmt(Math.min(...p.times.map(t => t.ms))) : '–';
        const week = p.times.filter(t => t.at > Date.now() - 7 * 864e5).length;
        const mastered = ALL_CASES.filter(c => (p.boxes[c.id] || 0) >= 3).length;
        return `
        <section class="panel pcard">
          <h3>${pAvatar(p, 'sm')} ${esc(p.name)}</h3>
          <div class="pstats">
            <div><small>${T('mastered')}</small><b>${mastered} / ${ALL_CASES.length}</b></div>
            <div><small>${T('bestTime')}</small><b>${best}</b></div>
            <div><small>${T('week')}</small><b>${week}</b></div>
          </div>
          <table>
            ${trackWorlds().map((w, i) => `<tr><td><span class="tglyph">${glyph(w.id)}</span>${i}. ${esc(w.title)}</td><td>${starsHtml(stars(p, w))}</td>
              <td>${p.quiz[w.id] != null ? T('quizPct', Math.round(p.quiz[w.id] * 100)) : ''}</td></tr>`).join('')}
          </table>
          <div class="row start">
            <button class="btn ghost small reset" data-id="${p.id}">${icon('restart')} ${T('resetProgress')}</button>
            ${p.guest ? "" : `<button class="btn ghost small delete" data-id="${p.id}">${icon('trash')} ${T('deleteProfile')}</button>`}
          </div>
        </section>`;
      }).join('')}
      <section class="panel pcard">
        ${accountEmail() ? '' : `<p class="muted small">${T('deviceOnly')}</p>`}
      </section>
    </div>`;
  app.querySelectorAll('.reset').forEach(b => b.onclick = () => {
    const p = db.profiles.find(x => x.id === b.dataset.id);
    modal(`<h2>${T('resetQ', esc(p.name))}</h2><p class="muted">${T('resetWarn')}</p>`,
      [[T('cancel'), null, 'ghost'], [T('resetBtn'), () => {
        Object.assign(p, newProfile(p.name, p.avatar), { id: p.id });
        if (p.cloudId) p.replaceCloud = true; // molnets kopia ska också nollställas, inte slås ihop
        save(); renderOverview();
      }, 'danger']]);
  });
  app.querySelectorAll('.delete').forEach(b => b.onclick = () => {
    const p = db.profiles.find(x => x.id === b.dataset.id);
    modal(`<h2>${T('deleteQ', esc(p.name))}</h2><p class="muted">${T('deleteWarn')}</p>`,
      [[T('cancel'), null, 'ghost'], [T('deleteBtn'), () => {
        db.profiles = db.profiles.filter(x => x.id !== p.id);
        if (p.cloudId) (db.pendingDeletes = db.pendingDeletes || []).push(p.cloudId); // tas bort i molnet vid nästa synk
        if (db.current === p.id) db.current = null;
        save(); location.hash = '#/';
      }, 'danger']]);
  });
}

// ---------- Konto (vårdnadshavare) ----------

const PRIVACY_CONTACT = ''; // e-post för frågor om personuppgifter; raden döljs om den är tom

function privacyHtml() {
  if (lang === 'en') {
    return `<div class="legal">
    <h2>Privacy</h2>
    <p>Cube School is for learning to solve the Rubik's Cube. We save as little as possible.</p>
    <h3>Without an account</h3>
    <p>Everything (profiles, progress, times) is saved only on your own device. Nothing is sent to us.</p>
    <h3>With an account</h3>
    <ul>
      <li><b>The guardian's email</b>, so you can log in with a one-time code or a password.</li>
      <li><b>Profiles</b>: a nickname and a figure or colour. Children do not need an email. Photos you choose as a profile picture stay on the device and are never saved with us.</li>
      <li><b>Progress</b>: completed steps, quiz answers, algorithm levels and timed solves.</li>
      <li><b>Consent</b>: when the guardian accepted this text.</li>
    </ul>
    <h3>The leaderboard</h3>
    <p>A profile only appears on the leaderboard if the guardian turns it on. Then the nickname, figure and score are shown, nothing else. Choose a nickname that does not reveal who the child is.</p>
    <h3>Where and for how long</h3>
    <p>The data is stored with Supabase in the EU (Paris) and is only used to save progress and show the leaderboard. It is kept until you delete the account. Then the account, all profiles and everything belonging to them are erased. You do that under Account in the app.</p>
    <h3>Statistics</h3>
    <p>We count visits with GoatCounter. It uses no cookies and stores no personal data.</p>
    <h3>Your rights</h3>
    <p>You can ask what we store, have mistakes corrected and have everything deleted. You can also complain to the Swedish Authority for Privacy Protection (IMY).${PRIVACY_CONTACT ? ` Contact: ${esc(PRIVACY_CONTACT)}.` : ''}</p>
    <h3>Children</h3>
    <p>Accounts are for guardians. Children under 18 should not create an account themselves.</p>
  </div>`;
  }
  return `<div class="legal">
    <h2>Integritet</h2>
    <p>Kubskolan är till för att lära sig lösa Rubiks kub. Vi sparar så lite som möjligt.</p>
    <h3>Utan konto</h3>
    <p>Allt (profiler, framsteg, tider) sparas bara på din egen enhet. Inget skickas till oss.</p>
    <h3>Med konto</h3>
    <ul>
      <li><b>Vårdnadshavarens e-post</b>, för att kunna logga in med en engångskod eller ett lösenord.</li>
      <li><b>Profiler</b>: smeknamn och figur eller färg. Barn behöver ingen e-post. Foton du väljer som profilbild stannar på enheten och sparas aldrig hos oss.</li>
      <li><b>Framsteg</b>: klarade steg, svar på snabbfrågor, nivå på algoritmer och tidtagningar.</li>
      <li><b>Samtycke</b>: när vårdnadshavaren godkände den här texten.</li>
    </ul>
    <h3>Topplistan</h3>
    <p>En profil syns bara på topplistan om vårdnadshavaren slår på det. Då visas smeknamn, figur och poäng, inget annat. Välj smeknamn som inte avslöjar vem barnet är.</p>
    <h3>Var och hur länge</h3>
    <p>Uppgifterna lagras hos Supabase i EU (Paris) och används bara för att spara framsteg och visa topplistan. De sparas tills du tar bort kontot. Då raderas kontot, alla profiler och allt som hör till dem. Det gör du under Konto i appen.</p>
    <h3>Statistik</h3>
    <p>Vi räknar besök med GoatCounter. Det använder inga cookies och sparar inga personuppgifter.</p>
    <h3>Dina rättigheter</h3>
    <p>Du kan begära att få veta vad vi sparar, få fel rättade och få allt raderat. Du kan också klaga hos Integritetsskyddsmyndigheten (IMY).${PRIVACY_CONTACT ? ` Kontakt: ${esc(PRIVACY_CONTACT)}.` : ''}</p>
    <h3>Barn</h3>
    <p>Konton är till för vårdnadshavare. Barn under 18 ska inte skapa konto själva.</p>
  </div>`;
}

function renderPrivacy() {
  app.innerHTML = `
    <div class="screen account">
      ${topbar({ back: '#/', middle: `<span class="topbar-title">${icon('users')} ${T('privacy')}</span>` })}
      <div class="panel acct-card">${privacyHtml()}</div>
    </div>`;
}

// Ögonknapp som visar eller döljer ett lösenord.
function wireEye(input, eye) {
  eye.onclick = () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    eye.innerHTML = icon(show ? 'eyeOff' : 'eye');
    eye.setAttribute('aria-label', show ? 'Dölj lösenord' : 'Visa lösenord');
  };
}

function renderAccount(mode) {
  const register = mode === 'register'; // annars logga in
  let email = '';
  const shell = body => {
    app.innerHTML = `
      <div class="screen account">
        ${topbar({ back: '#/', middle: `<span class="topbar-title">${icon('users')} ${T('account')}</span>` })}
        <div class="panel acct-card">${body}<p class="msg" aria-live="polite"></p></div>
      </div>`;
  };
  const say = (text, bad = true) => {
    const m = app.querySelector('.msg');
    m.textContent = text;
    m.className = 'msg' + (bad ? ' err' : '');
  };
  // Fel utan status betyder att ingen kontakt fick till stånd med servern.
  const failText = (e, fallback) => !e.status ? T('noNet') : e.status === 429 ? T('waitAWhile') : fallback;
  const busy = (btn, on) => { btn.disabled = on; };
  let tab = 'password'; // logga in med lösenord (standard) eller kod

  // Gemensamt slut på alla inloggningar: erbjud gästens framsteg, starta synk och gå till kubarna.
  const finish = async () => {
    await offerGuestSave();
    if (sync) sync.schedule(500);
    location.hash = '#/';
  };

  // Frivilligt lösenord, efter registrering eller via Konto. Man kan alltid logga in med kod i stället.
  const drawPassword = afterRegister => {
    shell(`
      <h2>${afterRegister ? T('pwMake') : T('password')}</h2>
      <p class="muted">${afterRegister ? T('pwAfter') : T('pwPick')}</p>
      <div class="pw-row">
        <input class="field pw" type="password" autocomplete="new-password" placeholder="${T('pwNew')}">
        <button class="icon-btn pw-eye" aria-label="${T('showPw')}">${icon('eye')}</button>
      </div>
      <button class="btn primary save">${icon('check')} ${T('pwSave')}</button>
      <button class="btn ghost skip">${afterRegister ? T('skip') : T('cancel')}</button>`);
    const input = app.querySelector('.pw'), save = app.querySelector('.save');
    wireEye(input, app.querySelector('.pw-eye'));
    const submit = async () => {
      if (input.value.length < 8) return say(T('pwShort'));
      busy(save, true);
      try {
        await setPassword(input.value);
      } catch (e) {
        busy(save, false);
        return say(e.status === 422 ? T('pwRejected') : failText(e, T('pwFail')));
      }
      if (afterRegister) await finish(); else { drawIn(); say(T('pwSaved'), false); }
    };
    save.onclick = submit;
    input.onkeydown = e => { if (e.key === 'Enter') submit(); };
    app.querySelector('.skip').onclick = () => (afterRegister ? finish() : drawIn());
    setTimeout(() => input.focus(), 50);
  };

  const drawIn = () => {
    shell(`
      <h2>${T('loggedIn')}</h2>
      <p class="muted acct-mail">${esc(accountEmail())}</p>
      <p class="muted small">${T('syncText')}</p>
      <p class="sync-state small" aria-live="polite"></p>
      <div class="row">
        <button class="btn ghost small syncnow">${icon('restart')} ${T('syncNow')}</button>
        <button class="btn ghost small pwbtn">${icon('lock')} ${T('password')}</button>
        <button class="btn ghost small out">${T('logOut')}</button>
        <button class="btn ghost small del">${icon('trash')} ${T('deleteAccount')}</button>
      </div>
      <p class="small"><a href="#/integritet">${T('readPrivacy')}</a></p>`);
    const showSync = () => {
      const el = app.querySelector('.sync-state');
      if (!el) return; // man har lämnat skärmen
      const st = sync.status;
      const time = st.last ? new Date(st.last).toLocaleTimeString(lang === 'en' ? 'en-GB' : 'sv-SE', { hour: '2-digit', minute: '2-digit' }) : '';
      el.textContent = st.busy ? T('syncing') : st.error ? T(st.error === 'offline' ? 'syncOffline' : 'syncFailed') : time ? T('lastSynced', time) : '';
      el.className = 'sync-state small' + (st.error && !st.busy ? ' err' : '');
    };
    showSync();
    app.querySelector('.syncnow').onclick = async () => {
      const done = sync.syncNow();
      showSync();
      await done;
      showSync();
    };
    app.querySelector('.pwbtn').onclick = () => drawPassword(false);
    app.querySelector('.out').onclick = async () => { await signOut(); db.guest = false; save(); location.hash = '#/start'; };
    app.querySelector('.del').onclick = () => modal(
      `<h2>${T('acctDeleteQ')}</h2><p class="muted">${T('acctDeleteText')}</p>`,
      [[T('cancel'), null, 'ghost'], [T('remove'), async () => {
        try { await deleteAccount(); db.guest = false; save(); location.hash = '#/start'; }
        catch (e) { say(failText(e, T('acctDeleteFail'))); }
      }, 'danger']]);
  };

  const drawCode = () => {
    shell(`
      <h2>${T('enterCodeTitle')}</h2>
      <p class="muted">${T('codeSentTo', esc(email))}</p>
      <input class="field code" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="${T('codePlaceholder')}">
      <button class="btn primary go">${icon('check')} ${T('logIn')}</button>
      <div class="row">
        <button class="btn ghost small again">${T('sendNewCode')}</button>
        <button class="btn ghost small other">${T('wrongEmail')}</button>
      </div>`);
    const input = app.querySelector('.code'), go = app.querySelector('.go');
    const submit = async () => {
      const code = input.value.replace(/\D/g, '');
      if (code.length < 6) return say(T('fullCode'));
      busy(go, true);
      try {
        await verifyCode(email, code);
      } catch (e) {
        busy(go, false);
        return say(failText(e, T('badCode')));
      }
      if (register) {
        try {
          await recordConsent();
        } catch (e) {
          await signOut();
          busy(go, false);
          return say(failText(e, T('consentFail')));
        }
      }
      if (register) return drawPassword(true);
      await finish();
    };
    go.onclick = submit;
    input.onkeydown = e => { if (e.key === 'Enter') submit(); };
    app.querySelector('.again').onclick = async e => {
      busy(e.currentTarget, true);
      try { await sendCode(email, register); say(T('newCodeSent'), false); }
      catch (err) { say(failText(err, T('newCodeFail'))); }
      setTimeout(() => busy(e.currentTarget, false), 4000);
    };
    app.querySelector('.other').onclick = drawEmail;
    setTimeout(() => input.focus(), 50);
  };

  const drawEmail = () => {
    const usePw = !register && tab === 'password';
    shell(`
      <h2>${register ? T('signUp') : T('logIn')}</h2>
      ${register ? '' : `<div class="tabs" role="tablist">
        <button class="tab ${usePw ? 'on' : ''}" data-t="password" role="tab">${T('tabPassword')}</button>
        <button class="tab ${usePw ? '' : 'on'}" data-t="code" role="tab">${T('tabCode')}</button>
      </div>`}
      <p class="muted">${register ? T('registerText') : usePw ? T('loginPwText') : T('loginCodeText')}</p>
      <input class="field mail" type="email" inputmode="email" autocomplete="email" placeholder="${T('emailPlaceholder')}" value="${esc(email)}">
      ${usePw ? `<div class="pw-row">
        <input class="field pw" type="password" autocomplete="current-password" placeholder="${T('pwPlaceholder')}">
        <button class="icon-btn pw-eye" aria-label="${T('showPw')}">${icon('eye')}</button>
      </div>` : ''}
      ${register ? `<label class="check"><input type="checkbox" class="agree"><span>${T('agree', `<a href="#/integritet" class="legal-link">${T('privacyLink')}</a>`)}</span></label>` : ''}
      <button class="btn primary send">${usePw ? T('logIn') : T('sendCode')} ${icon('next')}</button>
      ${usePw ? `<p class="small switch-mode"><button class="linkbtn forgot">${T('forgot')}</button></p>` : ''}
      <p class="small switch-mode">${register ? `${T('haveAccount')} <a href="#/konto/login">${T('logIn')}</a>` : `${T('newHere')} <a href="#/konto/register">${T('signUp')}</a>`}</p>`);
    const input = app.querySelector('.mail'), agree = app.querySelector('.agree'), send = app.querySelector('.send');
    const pw = app.querySelector('.pw');
    if (pw) wireEye(pw, app.querySelector('.pw-eye'));
    // Byt flik utan att tappa det man skrivit
    const switchTab = t => { email = input.value.trim(); tab = t; drawEmail(); };
    app.querySelectorAll('.tab').forEach(b => b.onclick = () => switchTab(b.dataset.t));
    const forgot = app.querySelector('.forgot');
    if (forgot) forgot.onclick = () => switchTab('code');
    // Texten öppnas i en ruta så att det man skrivit inte försvinner
    const legal = app.querySelector('.legal-link');
    if (legal) legal.onclick = e => {
      e.preventDefault();
      modal(privacyHtml(), [[T('close'), null, 'primary']]);
    };
    const submit = async () => {
      const value = input.value.trim();
      if (!/^\S+@\S+\.\S+$/.test(value)) return say(T('badEmail'));
      if (register && !agree.checked) return say(T('needConsent'));
      if (usePw) {
        if (!pw.value) return say(T('enterPw'));
        busy(send, true);
        try { await signInWithPassword(value, pw.value); }
        catch (e) { busy(send, false); return say(failText(e, T('wrongLogin'))); }
        return finish();
      }
      busy(send, true);
      try { await sendCode(value, register); email = value; drawCode(); }
      catch (e) {
        busy(send, false);
        say(failText(e, register ? T('sendFail') : T('noAccount')));
      }
    };
    send.onclick = submit;
    input.onkeydown = e => { if (e.key === 'Enter') submit(); };
    if (pw) pw.onkeydown = e => { if (e.key === 'Enter') submit(); };
  };

  if (accountEmail()) drawIn(); else drawEmail();
}

// ---------- Start ----------

// Äldre profiler (emoji-avatarer) får en form istället – sparas så att den blir stabil.
let migrated = false;
for (const p of db.profiles) {
  if (!/^s\d+c\d+(f\d+)?$/.test(p.avatar || '')) {
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

// Byte av språk: rita om skärmen (innehållet i content.js har redan bytts ut)
const setTitle = () => { document.title = T('appName'); };
onLang(() => { setTitle(); document.querySelectorAll('.modal-wrap').forEach(m => m.remove()); route(); });
setTitle();
route();

// Synka när appen öppnas, kommer fram igen eller får nät.
const syncSoon = () => { if (accountEmail()) sync.schedule(1500); };
syncSoon();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncSoon(); });
window.addEventListener('online', syncSoon);
