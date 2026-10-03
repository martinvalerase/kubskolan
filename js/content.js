// Allt lektionsinnehåll. En "värld" = ett steg i metoden.
// Steg: { title, text, cube?: { setup, alg, mask, pad } }
// Fall (cases): algoritmer som tränas i Träningen och i quizet.
// Om ett fall saknar setup visas det som "omvänd algoritm", så att algoritmen alltid löser det som visas.

const DAISY = 'L2 U R2 F2 U B2';
const DAISY_SIMPLE = 'F2 R2 B2 L2';
const DANCE = "R U R' U'";

export const WORLDS = [
  {
    id: 'w0', emoji: '🧊', badge: '🔍', color: '#7c4dff',
    title: 'Lär känna kuben',
    short: 'Bitar, färger och kubens språk',
    steps: [
      {
        title: 'Hej kubare! 👋',
        text: 'Här lär du dig lösa Rubiks kub med <b>CFOP</b> – samma metod som världens snabbaste kubare använder. Vi tar det ett litet steg i taget.<br><br>Dra med fingret på kuben för att snurra den. Tryck två gånger snabbt för att ställa tillbaka den.',
        cube: { mask: 'full' },
      },
      {
        title: 'Mittbitarna flyttar aldrig',
        text: 'Mitten på varje sida sitter fast. Den bestämmer vilken färg sidan ska ha.<br><br>🟡 Gul är mittemot ⚪ vit.<br>🟢 Grön är mittemot 🔵 blå.<br>🔴 Röd är mittemot 🟠 orange.',
        cube: { mask: 'centers' },
      },
      {
        title: 'Kanter har två färger',
        text: 'En <b>kant</b> sitter mellan två mittbitar. Den har <b>två</b> färger. Det finns 12 kanter.',
        cube: { mask: 'edges' },
      },
      {
        title: 'Hörn har tre färger',
        text: 'Ett <b>hörn</b> har <b>tre</b> färger. Det finns 8 hörn. En bit flyttar alltid som en hel bit – ett hörn blir aldrig en kant!',
        cube: { mask: 'corners' },
      },
      {
        title: 'Gul upp, vit ner',
        text: 'Håll alltid kuben med <b>gul mitt uppåt</b> och <b>grön mitt mot dig</b>. Då ser din kub ut precis som kuben här.<br><br>Vi bygger kuben nerifrån och upp: först den vita botten, sist den gula toppen.',
        cube: { mask: 'full' },
      },
      {
        title: 'Kubens språk',
        text: 'Varje vridning har en bokstav:<br><b>R</b> = höger, <b>L</b> = vänster, <b>U</b> = toppen, <b>D</b> = botten, <b>F</b> = framsidan.<br><br>En bokstav utan tecken vrider <b>medurs</b> (som klockan, när du tittar rakt på den sidan). Med <b>\'</b> (säg "prim") vrider du åt andra hållet. En <b>2</b> betyder två gånger.<br><br>Tryck på knapparna och titta!',
        cube: { mask: 'full', pad: true },
      },
      {
        title: 'Dansen 💃',
        text: `Det viktigaste draget i hela metoden är <b>Dansen</b>: <b>${DANCE}</b><br><br>Höger upp, toppen åt vänster, höger ner, toppen åt höger. Gör den med högerhanden tills den går av sig själv.<br><br>Kul grej: gör Dansen 6 gånger så är kuben tillbaka där den började!`,
        cube: { mask: 'full', alg: `${DANCE} ${DANCE} ${DANCE} ${DANCE} ${DANCE} ${DANCE}` },
      },
    ],
  },
  {
    id: 'w1', emoji: '🌼', badge: '🌼', color: '#ff9800',
    title: 'Prästkragen',
    short: 'Fyra vita kanter runt den gula mitten',
    steps: [
      {
        title: 'Målet: en blomma',
        text: 'Först bygger vi en <b>prästkrage</b>: den gula mitten är blomman och de fyra vita kanterna är kronbladen.<br><br>Det spelar ingen roll vilka färger kronbladen har på sidan – bara att det vita pekar uppåt.',
        cube: { setup: DAISY, mask: 'daisy' },
      },
      {
        title: 'Vit kant i mitten-våningen',
        text: 'Hittar du en vit kant i mitten-våningen? Vrid den sidan så att kanten åker upp, med vitt uppåt.<br><br>⚠️ Akta så att du inte knuffar ner ett kronblad du redan satt dit. Vrid toppen först så att platsen ovanför är tom.',
        cube: { setup: `${DAISY_SIMPLE} R'`, alg: 'R', mask: 'daisy' },
      },
      {
        title: 'Vit kant på botten',
        text: 'Pekar det vita nedåt på botten? Vrid toppen så att platsen ovanför är tom. Vrid sedan den sidan <b>två gånger</b>.',
        cube: { setup: `${DAISY_SIMPLE} F2`, alg: 'F2', mask: 'daisy' },
      },
      {
        title: 'Vitt pekar åt fel håll',
        text: 'Sitter en vit kant i toppen men det vita pekar åt sidan? Då gör vi en liten kullerbytta: <b>F U\' R</b>.',
        cube: { setup: `${DAISY_SIMPLE} R' U F'`, alg: "F U' R", mask: 'daisy' },
      },
      {
        title: 'Din tur! 🌼',
        text: 'Blanda din riktiga kub och bygg en prästkrage. Det får ta tid – du klurar ut det!',
        practice: true,
      },
    ],
  },
  {
    id: 'w2', emoji: '➕', badge: '⚪', color: '#00bcd4',
    title: 'Vita korset',
    short: 'Steg C i CFOP: Cross',
    steps: [
      {
        title: 'Från blomma till kors',
        text: 'Nu flyttar vi ner kronbladen ett i taget till botten. Då blir det ett <b>vitt kors</b> under kuben.',
        cube: { setup: DAISY, mask: 'cross' },
      },
      {
        title: 'Matcha och vrid två gånger',
        text: '1. Titta på kronbladets andra färg (inte den vita).<br>2. Vrid <b>toppen</b> tills den färgen står ovanför mitten med samma färg.<br>3. Vrid den sidan <b>två gånger</b>. Klart!<br><br>Gör likadant med alla fyra.',
        cube: { setup: DAISY, alg: "B2 U' F2 R2 U' L2", mask: 'cross' },
      },
      {
        title: 'Titta under',
        text: 'Vänd på kuben och titta: ett vitt kors! Och sidorna på korset matchar mittbitarna. Det är <b>C</b> i CFOP. 🎉',
        cube: { mask: 'cross', pitch: 35, yaw: -38 },
      },
      {
        title: 'Din tur! ➕',
        text: 'Blanda, gör prästkrage, och gör sedan det vita korset på din kub.',
        practice: true,
      },
    ],
  },
  {
    id: 'w3', emoji: '🔺', badge: '🏁', color: '#e91e63',
    title: 'Vita hörnen',
    short: 'Den första våningen blir klar',
    steps: [
      {
        title: 'Fyra vita hörn',
        text: 'Nu ska de fyra vita hörnen ner i botten, mellan korsets armar. Då är hela första våningen klar.',
        cube: { setup: "U R U' R' U R U' R' U R U' R' U", mask: 'firstLayer' },
      },
      {
        title: 'Hitta rätt plats',
        text: 'Leta upp ett vitt hörn i toppen. Titta på dess två andra färger. Vrid <b>toppen</b> tills hörnet står ovanför platsen mellan de två mittbitarna med samma färger.<br><br>Håll kuben så att hörnet är <b>uppe till höger, framme</b>.',
        cube: { setup: "U R U' R' U R U' R' U R U' R' U", alg: "U'", mask: 'firstLayer' },
      },
      {
        title: 'Dansa tills det sitter!',
        text: 'Gör <b>Dansen</b> (R U R\' U\') igen och igen tills hörnet sitter rätt med vitt nedåt. Ibland räcker en gång, ibland behövs tre eller fem.',
        cube: { setup: "U R U' R' U R U' R' U R U' R'", alg: `${DANCE} ${DANCE} ${DANCE}`, mask: 'firstLayer' },
      },
      {
        title: 'En gång räcker ibland',
        text: 'Här behövs bara en Dans. Titta var det vita pekar före – så lär du dig känna igen det.',
        cube: { setup: "U R U' R'", alg: DANCE, mask: 'firstLayer' },
      },
      {
        title: 'Fast i botten?',
        text: 'Sitter ett vitt hörn i botten på fel plats eller vridet fel? Håll det nere till höger fram och gör Dansen <b>en gång</b>. Då hoppar det upp i toppen, och du kan börja om med det.',
      },
      {
        title: 'Din tur! 🔺',
        text: 'Gör kors och alla fyra vita hörn på din kub. Kolla att varje sida har ett litet "T" av samma färg.',
        practice: true,
      },
    ],
  },
  {
    id: 'w4', emoji: '🧱', badge: '🧱', color: '#4caf50',
    title: 'Mittenvåningen',
    short: 'Två våningar klara (F2L, nybörjarstil)',
    caseIntro: 'Vilket håll ska kanten?',
    steps: [
      {
        title: 'Fyra kanter i mitten',
        text: 'Nu sätter vi de fyra kanterna i mittenvåningen. Då är <b>två våningar</b> klara – det är F2L i CFOP!',
        cube: { mask: 'f2l' },
      },
      {
        title: 'Gör ett upp-och-ner-T',
        text: 'Hitta en kant i toppen som <b>inte</b> har gult. Vrid toppen tills kantens framfärg står ovanför samma mittfärg. Nu ser det ut som ett upp-och-ner-<b>T</b>.<br><br>Titta på kantens toppfärg: ska den till <b>höger</b> eller <b>vänster</b>?',
      },
      {
        title: 'Till höger ➡️',
        text: 'Ska kanten till höger: <b>U R U\' R\' U\' F\' U F</b>',
        cube: { caseRef: 'mid_right' },
      },
      {
        title: 'Till vänster ⬅️',
        text: 'Ska kanten till vänster: <b>U\' L\' U L U F U\' F\'</b><br><br>Det är spegelbilden av höger.',
        cube: { caseRef: 'mid_left' },
      },
      {
        title: 'Fast på fel plats?',
        text: 'Sitter en kant i mitten men vänd fel? Håll den framme till höger och gör "Till höger" en gång med vilken toppkant som helst. Då hoppar den upp, och du kan sätta in den rätt.',
      },
      {
        title: 'Din tur! 🧱',
        text: 'Lös de två första våningarna på din kub.',
        practice: true,
      },
    ],
    cases: [
      { id: 'mid_right', name: 'Till höger', alg: "U R U' R' U' F' U F", mask: 'f2l' },
      { id: 'mid_left', name: 'Till vänster', alg: "U' L' U L U F U' F'", mask: 'f2l' },
    ],
  },
  {
    id: 'w5', emoji: '⭐', badge: '➕', color: '#ffc107', auf: true,
    title: 'Gula korset',
    short: 'Steg O del 1: kanterna gula',
    caseIntro: 'Vilket gult mönster är det?',
    steps: [
      {
        title: 'Ett gult kors på toppen',
        text: 'Nu börjar <b>O</b> i CFOP: hela toppen ska bli gul. Först gör vi ett <b>gult kors</b>. Hörnen bryr vi oss inte om än.<br><br>Titta på toppen. Du ser en av tre bilder: en <b>prick</b>, ett <b>L</b> eller en <b>linje</b>.',
      },
      {
        title: 'Linje ➖',
        text: 'Håll linjen <b>vågrätt</b> (från vänster till höger) och gör:<br><b>F R U R\' U\' F\'</b><br><br>Fram – Dansen – Fram tillbaka!',
        cube: { caseRef: 'oll_line' },
      },
      {
        title: 'L 📐',
        text: 'Håll L:et så att det pekar <b>bakåt och åt vänster</b> (som klockan 9 och 12). Gör:<br><b>F U R U\' R\' F\'</b><br><br>Det är nästan som Linje, men Dansen går baklänges.',
        cube: { caseRef: 'oll_l' },
      },
      {
        title: 'Prick ⚫',
        text: 'Bara en gul prick i mitten? Gör <b>Linje</b>-algoritmen. Nu får du ett L! Vrid toppen så att L:et pekar bakåt och åt vänster, och gör <b>L</b>-algoritmen.',
        cube: { caseRef: 'oll_dot' },
      },
      {
        title: 'Din tur! ⭐',
        text: 'Gör det gula korset på din kub.',
        practice: true,
      },
    ],
    cases: [
      { id: 'oll_line', name: 'Linje', alg: "F R U R' U' F'", mask: 'oll' },
      { id: 'oll_l', name: 'L', alg: "F U R U' R' F'", mask: 'oll' },
      { id: 'oll_dot', name: 'Prick', alg: "F R U R' U' F' U2 F U R U' R' F'", mask: 'oll' },
    ],
  },
  {
    id: 'w6', emoji: '🌞', badge: '🌞', color: '#ff5722', auf: true,
    title: 'Gula toppen',
    short: 'Steg O del 2: hela toppen gul',
    caseIntro: 'Vilket fall är det?',
    steps: [
      {
        title: 'Hela toppen gul',
        text: 'Nu ska hörnen också bli gula på toppen. Vi använder en superalgoritm som heter <b>Sune</b>.',
      },
      {
        title: 'Fisken 🐟 – Sune',
        text: 'Ser du en <b>fisk</b>? (Ett gult hörn på toppen och korset.) Håll fiskens huvud <b>nere till vänster</b>. Pekar det gula på hörnet framme till höger mot dig? Gör <b>Sune</b>:<br><b>R U R\' U R U2 R\'</b>',
        cube: { caseRef: 'sune' },
      },
      {
        title: 'Andra fisken – Anti-Sune',
        text: 'Om fisken simmar åt andra hållet: håll det gula hörnet uppe <b>bak till höger</b> och gör <b>Anti-Sune</b>:<br><b>R U2 R\' U\' R U\' R\'</b>',
        cube: { caseRef: 'antisune' },
      },
      {
        title: 'Ingen fisk? Gör Sune ändå!',
        text: '<b>Inga</b> gula hörn på toppen? Vrid toppen tills hörnet framme till vänster har gult på <b>vänster</b> sida. Gör Sune.<br><br><b>Två</b> gula hörn på toppen? Vrid toppen tills hörnet framme till vänster har gult <b>framåt</b>, mot dig. Gör Sune.<br><br>Nu har du en fisk! 🐟<br>(Det finns snabbare knep för varje fall – de finns som bonus i Träningen.)',
        cube: { setupInv: "R U R' U R U' R' U R U2 R'", alg: "R U R' U R U2 R'", mask: 'oll' },
      },
      {
        title: 'Din tur! 🌞',
        text: 'Gör hela toppen gul på din kub.',
        practice: true,
      },
    ],
    cases: [
      { id: 'sune', name: 'Sune', alg: "R U R' U R U2 R'", mask: 'oll' },
      { id: 'antisune', name: 'Anti-Sune', alg: "R U2 R' U' R U' R'", mask: 'oll' },
      { id: 'oll_h', name: 'H (bonus)', alg: "R U R' U R U' R' U R U2 R'", mask: 'oll', bonus: true },
      { id: 'oll_pi', name: 'Pi (bonus)', alg: "R U2 R2 U' R2 U' R2 U2 R", mask: 'oll', bonus: true },
      { id: 'oll_u', name: 'Strålkastare (bonus)', alg: "R2 D R' U2 R D' R' U2 R'", mask: 'oll', bonus: true },
      { id: 'oll_t', name: 'T (bonus)', alg: "r U R' U' r' F R F'", mask: 'oll', bonus: true },
      { id: 'oll_bowtie', name: 'Fluga (bonus)', alg: "F' r U R' U' r' F R", mask: 'oll', bonus: true },
    ],
  },
  {
    id: 'w7', emoji: '🚦', badge: '🚦', color: '#3f51b5', auf: true,
    title: 'Hörnen på plats',
    short: 'Steg P del 1: T-perm',
    steps: [
      {
        title: 'Sista steget: P',
        text: 'Toppen är gul – nu ska bitarna på toppen flytta till rätt plats. Det är <b>P</b> i CFOP. Först hörnen!',
      },
      {
        title: 'Strålkastare 🔦',
        text: 'Titta på sidorna av toppvåningen. Har två hörn på samma sida samma färg? Det kallas <b>strålkastare</b>.<br><br>Håll strålkastarna på <b>vänster</b> sida och gör <b>T-perm</b>:<br><b>R U R\' U\' R\' F R2 U\' R\' U\' R U R\' F\'</b><br><br>Den börjar med Dansen!',
        cube: { caseRef: 'tperm' },
      },
      {
        title: 'Inga strålkastare?',
        text: 'Gör T-perm från vilken sida som helst. Nu får du strålkastare! Gör sedan som vanligt.',
        // setupInv: kuben visas som om denna algoritm (Y-perm) skulle lösa den
        cube: { setupInv: "F R U' R' U' R U R' F' R U R' U' R' F R F'", alg: "R U R' U' R' F R2 U' R' U' R U R' F'", mask: 'full' },
      },
      {
        title: 'Vrid toppen på plats',
        text: 'När alla fyra hörnen har strålkastare: vrid toppen tills hörnen matchar sidorna.',
      },
      {
        title: 'Din tur! 🚦',
        text: 'Sätt hörnen på plats på din kub.',
        practice: true,
      },
    ],
    cases: [
      { id: 'tperm', name: 'T-perm', alg: "R U R' U' R' F R2 U' R' U' R U R' F'", mask: 'full' },
    ],
  },
  {
    id: 'w8', emoji: '🏆', badge: '🏆', color: '#9c27b0', auf: true,
    title: 'Kanterna på plats',
    short: 'Steg P del 2: kuben löst!',
    caseIntro: 'Vilken algoritm behövs?',
    steps: [
      {
        title: 'Sista biten!',
        text: 'Nu är hörnen rätt. Hitta en sida som är <b>helt klar</b> (tre i rad av samma färg). Håll den sidan <b>bakåt</b>.',
      },
      {
        title: 'Ua – åt ena hållet',
        text: '<b>R U\' R U R U R U\' R\' U\' R2</b>',
        cube: { caseRef: 'ua' },
      },
      {
        title: 'Ub – åt andra hållet',
        text: '<b>R2 U R U R\' U\' R\' U\' R\' U R\'</b><br><br>Gissa fel? Ingen fara – gör samma igen så blir det rätt!',
        cube: { caseRef: 'ub' },
      },
      {
        title: 'Ingen sida klar?',
        text: 'Gör Ua från vilken sida som helst. Då blir en sida klar.<br><br>Det finns också två snabbknep med mittenskivan <b>M</b> (vrid mitten som L): <b>H</b> och <b>Z</b>. De finns i Träningen.',
        cube: { caseRef: 'h' },
      },
      {
        title: 'Du kan lösa kuben! 🏆',
        text: 'Blanda din kub och lös den från början till slut: prästkrage, kors, hörn, mitten, gult kors, gul topp, hörn och kanter.<br><br>Du har lärt dig CFOP!',
        practice: true,
      },
    ],
    cases: [
      { id: 'ua', name: 'Ua', alg: "R U' R U R U R U' R' U' R2", mask: 'full' },
      { id: 'ub', name: 'Ub', alg: "R2 U R U R' U' R' U' R' U R'", mask: 'full' },
      { id: 'h', name: 'H', alg: 'M2 U M2 U2 M2 U M2', mask: 'full' },
      { id: 'z', name: 'Z', alg: "M' U M2 U M2 U M' U2 M2", mask: 'full' },
    ],
  },
  {
    id: 'w9', emoji: '🚀', badge: '🚀', color: '#009688',
    title: 'Bonus: Riktig F2L',
    short: 'Hörn och kant samtidigt – som proffsen',
    caseIntro: 'Vilken insättning passar?',
    steps: [
      {
        title: 'Snabbare: par!',
        text: 'Proffsen gör inte hörnen och mittenkanterna var för sig. De sätter ihop ett vitt hörn och dess kant till ett <b>par</b> och stoppar in båda samtidigt.<br><br>Här är de fyra enklaste fallen. Hörnet står alltid uppe till höger fram. Lös korset som vanligt först.',
        cube: { mask: 'f2l' },
      },
      {
        title: 'Vitt åt höger, kanten bak',
        text: 'Hörnet har vitt åt <b>höger</b>. Kanten ligger längst <b>bak</b> på toppen. Gör <b>R U R\'</b> – hörnet hämtar kanten på vägen ner!',
        cube: { caseRef: 'f2l_1' },
      },
      {
        title: 'Vitt framåt, kanten till vänster',
        text: 'Spegelbilden: hörnet har vitt <b>framåt</b> och kanten ligger till <b>vänster</b>. Gör <b>F\' U\' F</b>.',
        cube: { caseRef: 'f2l_2' },
      },
      {
        title: 'Vitt framåt, kanten till höger',
        text: 'Hörnet har vitt framåt och kanten ligger bredvid till <b>höger</b>. Gör <b>U R U\' R\'</b>.',
        cube: { caseRef: 'f2l_3' },
      },
      {
        title: 'Vitt åt höger, kanten fram',
        text: 'Hörnet har vitt åt höger och kanten ligger <b>framför</b>. Gör <b>U\' F\' U F</b>.',
        cube: { caseRef: 'f2l_4' },
      },
      {
        title: 'Din tur! 🚀',
        text: 'Prova att lösa två våningar med par i stället för steg för steg. Det känns svårt först – men blir snabbt!',
        practice: true,
      },
    ],
    cases: [
      { id: 'f2l_1', name: "R U R'", alg: "R U R'", mask: 'f2l' },
      { id: 'f2l_2', name: "F' U' F", alg: "F' U' F", mask: 'f2l' },
      { id: 'f2l_3', name: "U R U' R'", alg: "U R U' R'", mask: 'f2l' },
      { id: 'f2l_4', name: "U' F' U F", alg: "U' F' U F", mask: 'f2l' },
    ],
  },
];

export const ALL_CASES = WORLDS.flatMap(w => (w.cases || []).map(c => ({ ...c, world: w.id })));
export const caseById = id => ALL_CASES.find(c => c.id === id);

export const AVATARS = ['🦊', '🐼', '🐸', '🦄', '🐯', '🐙', '🦖', '🐧', '🐝', '🐬', '🦁', '🐨'];
