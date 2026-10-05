// Allt lektionsinnehåll. En "värld" = ett steg i metoden.
// Steg: { title, text, rule?, recap?, practice?, help?: [[text, stegIndex|null]],
//         cube?: { setup | setupInv | caseRef, alg | parts: [{name, alg}], mask, highlight: ['DFR'], pad },
//         diagram? | diagrams?: [{ caseRef | setupInv | setup, mask, arrows, label }] }
// quiz: tre snabbfrågor i slutet av steget { q, options: [rätt, fel, fel], cube?, diagram? }.
//       Första svaret är alltid det rätta; ordningen blandas när frågan visas.
// Fall (cases): algoritmer som tränas i Träningen.
// setupInv: kuben visas som om algoritmen skulle lösa den, så att bild och algoritm alltid stämmer.
// highlight: bitar angivna med sin hemposition (t.ex. "DFR" = vit-grön-orange hörnet).

const DAISY = 'L2 U R2 F2 U B2';
const DAISY_SIMPLE = 'F2 R2 B2 L2';
const DANCE = "R U R' U'";
const MID_R = "U R U' R' U' F' U F";
const SUNE = "R U R' U R U2 R'";
const SUNE_PARTS = [{ name: 'Första halvan', alg: "R U R'" }, { name: 'Andra halvan', alg: "U R U2 R'" }];
const TPERM_PARTS = [{ name: 'Dansen', alg: "R U R' U'" }, { name: 'Mitten', alg: "R' F R2 U' R'" }, { name: 'Slutet', alg: "U' R U R' F'" }];
const YPERM = "F R U' R' U' R U R' F' R U R' U' R' F R F'";
const YPERM_PARTS = [{ name: 'Start', alg: "F R U' R' U' R U R' F'" }, { name: 'Dansen', alg: "R U R' U'" }, { name: 'Slutet', alg: "R' F R F'" }];
const UA = "R U' R U R U R U' R' U' R2";
const UA_PARTS = [{ name: 'Start', alg: "R U'" }, { name: 'Snurra', alg: "R U R U R U'" }, { name: 'Slut', alg: "R' U' R2" }];
const UB_PARTS = [{ name: 'Start', alg: 'R2 U' }, { name: 'Snurra', alg: "R U R' U' R' U'" }, { name: 'Slut', alg: "R' U R'" }];
const sw = face => `<i class="sw sw-${face}"></i>`; // liten färgruta i texten
const dances = n => Array.from({ length: n }, (_, k) => ({ name: `Dans ${k + 1}`, alg: DANCE }));

export const WORLDS = [
  {
    id: 'w0',
    title: 'Lär känna kuben',
    short: 'Bitar, färger och kubens språk',
    quiz: [
      { q: 'Vilken färg är mittemot gul?', options: ['Vit', 'Grön', 'Röd'] },
      { q: 'Hur många färger har ett hörn?', options: ['Tre', 'Två', 'En'] },
      { q: 'Vad gör R?', options: ['Vrider högra sidan upp', 'Vrider högra sidan ner', 'Vrider toppen åt vänster'] },
    ],
    steps: [
      {
        title: 'Hej kubare!',
        text: 'Här lär du dig lösa Rubiks kub, ett litet steg i taget. Det är inte bråttom.<br><br>Dra med fingret på kuben för att snurra den. Tryck två gånger snabbt för att ställa tillbaka den.',
        cube: { mask: 'full' },
      },
      {
        title: 'Mittbitarna flyttar aldrig',
        text: `Biten mitt på varje sida sitter fast. Den bestämmer vilken färg sidan ska ha.<br><br>${sw('U')} Gul är mittemot ${sw('D')} vit.<br>${sw('F')} Grön är mittemot ${sw('B')} blå.<br>${sw('L')} Röd är mittemot ${sw('R')} orange.`,
        rule: 'Kolla din egen kub: är gul mittemot vit och grön mittemot blå? Då är den likadan som kuben här.',
        cube: { mask: 'centers' },
      },
      {
        title: 'Kanter har två färger',
        text: 'En <b>kant</b> sitter mellan två mittbitar. Den har <b>två</b> färger. Det finns 12 kanter.',
        cube: { mask: 'edges' },
      },
      {
        title: 'Hörn har tre färger',
        text: 'Ett <b>hörn</b> har <b>tre</b> färger. Det finns 8 hörn. En bit flyttar alltid som en hel bit. Ett hörn blir aldrig en kant!',
        cube: { mask: 'corners' },
      },
      {
        title: 'Gul upp, grön mot dig',
        text: 'Håll alltid kuben med den <b>gula mitten uppåt</b> och den <b>gröna mitten mot dig</b>. Då ser din kub ut precis som kuben här.<br><br>Vi bygger kuben nerifrån och upp: först den vita botten, sist den gula toppen.',
        rule: 'Gul upp, grön mot dig. Hela tiden!',
        cube: { mask: 'full' },
      },
      {
        title: 'R betyder höger',
        text: 'Varje vridning har en bokstav. Bokstäverna kommer från engelska.<br><br><b>R</b> som i <i>Right</i> = höger. <b>R</b> vrider högra sidan <b>UPP</b>.<br><b>R\'</b> (säg "R prim") vrider den <b>NER</b>.<br><br>Prova med knapparna.',
        cube: { mask: 'full', pad: ['R', "R'"] },
      },
      {
        title: 'U betyder toppen',
        text: '<b>U</b> som i <i>Up</i> = upp, alltså toppen.<br><br><b>U</b> vrider toppen åt <b>VÄNSTER</b>.<br><b>U\'</b> vrider toppen åt <b>HÖGER</b>.',
        cube: { mask: 'full', pad: ['U', "U'"] },
      },
      {
        title: 'F betyder framsidan',
        text: '<b>F</b> som i <i>Front</i> = framsidan, den som är mot dig.<br><br><b>F</b> vrider framsidan <b>medurs</b>, åt samma håll som klockans visare.<br><b>F\'</b> vrider den baklänges.<br><br>En <b>2</b> efter bokstaven betyder: gör det två gånger. <b>F2</b> = F F.',
        cube: { mask: 'full', pad: ['F', "F'"] },
      },
      {
        title: 'Dansen',
        text: `Det viktigaste draget i hela metoden är <b>Dansen</b>: <b>${DANCE}</b><br><br>Höger upp, toppen åt vänster, höger ner, toppen åt höger. Gör den med högerhanden tills den går av sig själv.<br><br>Kul grej: gör Dansen 6 gånger så är kuben tillbaka där den började! Tryck på <b>Följ med</b> och gör den på din kub samtidigt.`,
        rule: 'Höger upp, toppen vänster, höger ner, toppen höger.',
        cube: { mask: 'full', parts: dances(6) },
      },
    ],
  },
  {
    id: 'w1',
    title: 'Prästkragen',
    short: 'Fyra vita kanter runt den gula mitten',
    quiz: [
      { q: 'Vilken mitt sitter i mitten av prästkragen?', options: ['Den gula', 'Den vita', 'Den gröna'] },
      { q: 'Åt vilket håll ska det vita på kronbladen peka?', options: ['Uppåt', 'Mot dig', 'Nedåt'] },
      { q: 'Vad gör du innan du vrider upp en vit kant?', options: ['Vrider toppen så att platsen är tom', 'Gör Dansen', 'Vänder på kuben'] },
    ],
    steps: [
      {
        recap: true,
        title: 'Gul upp, grön mot dig',
        text: 'Håll kuben med gul mitt uppåt och grön mitt mot dig.<br><br><b>R</b> = högra sidan upp. <b>U</b> = toppen åt vänster. <b>F</b> = framsidan som klockan.',
        cube: { mask: 'full' },
      },
      {
        title: 'Målet: en blomma',
        text: 'Först bygger vi en <b>prästkrage</b>. Den gula mitten är blomman och de fyra vita kanterna är kronbladen.',
        rule: 'Bara det vita behöver peka uppåt. Färgen på kronbladets andra sida spelar ingen roll än.',
        cube: { setup: DAISY, mask: 'daisy' },
      },
      {
        title: 'Vit kant i mitten, vitt mot dig',
        text: 'Den blinkande kanten sitter i mitten-våningen, fram till höger. Det vita pekar <b>mot dig</b>.<br><br>Vrid högra sidan <b>UPP</b> (R). Då åker kanten upp, med vitt uppåt.',
        rule: 'Gör plats först! Vrid toppen så att platsen ovanför kanten inte redan har ett vitt kronblad.',
        cube: { setup: `${DAISY_SIMPLE} R'`, alg: 'R', mask: 'daisy', highlight: ['DR'] },
      },
      {
        title: 'Vit kant i mitten, vitt åt sidan',
        text: 'Här pekar det vita <b>åt höger</b> i stället.<br><br>Vrid framsidan <b>baklänges</b> (F\'). Då åker kanten upp, med vitt uppåt.',
        rule: 'Gör plats först! Platsen ovanför ska vara tom.',
        cube: { setup: `${DAISY_SIMPLE} F`, alg: "F'", mask: 'daisy', highlight: ['DF'] },
      },
      {
        title: 'Vit kant på botten, vitt nedåt',
        text: 'Pekar det vita <b>nedåt</b> på botten?<br><br>Vrid toppen så att platsen ovanför är tom. Vrid sedan den sidan <b>två gånger</b> (F2).',
        cube: { setup: `${DAISY_SIMPLE} F2`, alg: 'F2', mask: 'daisy', highlight: ['DF'] },
      },
      {
        title: 'Vit kant på botten, vitt åt sidan',
        text: 'Sitter kanten på botten men det vita pekar <b>åt sidan</b>? Då gör vi tre små steg:<br><br>1. Vrid den sidan en gång. Nu sitter kanten i mitten-våningen.<br>2. Gör plats i toppen.<br>3. Vrid upp kanten, som i steget "Vit kant i mitten".',
        cube: { setup: `${DAISY_SIMPLE} L U' F'`, parts: [{ name: 'Upp till mitten', alg: 'F' }, { name: 'Gör plats', alg: 'U' }, { name: 'Upp i blomman', alg: "L'" }], mask: 'daisy', highlight: ['DL'] },
      },
      {
        title: 'Vitt pekar åt sidan i toppen',
        text: 'Sitter en vit kant redan i toppen men det vita pekar <b>åt sidan</b>? Då tar vi ner den och upp igen:<br><br>1. Vrid framsidan (F). Nu sitter kanten i mitten-våningen.<br>2. Gör plats i toppen.<br>3. Vrid upp den med högra sidan (R).',
        cube: { setup: `${DAISY_SIMPLE} R' U F'`, parts: [{ name: 'Ner till mitten', alg: 'F' }, { name: 'Gör plats', alg: "U'" }, { name: 'Upp igen', alg: 'R' }], mask: 'daisy', highlight: ['DR'] },
      },
      {
        title: 'Din tur!',
        text: 'Blanda din riktiga kub och bygg en prästkrage. Det får ta tid. Du klurar ut det!',
        practice: true,
        help: [
          ['Kanten sitter i mitten, vitt mot mig', 2],
          ['Kanten sitter i mitten, vitt åt sidan', 3],
          ['Kanten sitter på botten, vitt nedåt', 4],
          ['Kanten sitter på botten, vitt åt sidan', 5],
          ['Kanten sitter i toppen men vitt pekar åt sidan', 6],
          ['Knuffade du ner ett kronblad? Vrid alltid toppen först så att platsen är tom.', null],
        ],
      },
    ],
  },
  {
    id: 'w2',
    title: 'Vita korset',
    short: 'Steg C i CFOP: Cross',
    quiz: [
      { q: 'Vilken färg på kronbladet tittar du på när du matchar?', options: ['Den andra färgen, inte den vita', 'Den vita färgen', 'Hörnets färg'] },
      { q: 'Färgen matchar mitten. Hur många gånger vrider du sidan?', options: ['Två', 'En', 'Tre'] },
      { q: 'Var hamnar det vita korset?', options: ['Under kuben', 'På toppen', 'Mot dig'] },
    ],
    steps: [
      {
        recap: true,
        title: 'Prästkragen',
        text: 'Fyra vita kanter runt den gula mitten, med vitt uppåt. Har du en prästkrage på din kub? Då kör vi!',
        cube: { setup: DAISY, mask: 'daisy' },
      },
      {
        title: 'Från blomma till kors',
        text: 'Nu flyttar vi ner kronbladen ett i taget till botten. Då blir det ett <b>vitt kors</b> under kuben.',
        cube: { setup: DAISY, mask: 'cross' },
      },
      {
        title: 'Matcha och vrid två gånger',
        text: 'För varje kronblad:<br>1. Titta på kronbladets andra färg, inte den vita.<br>2. Vrid <b>toppen</b> tills den färgen står ovanför mitten med samma färg.<br>3. Vrid den sidan <b>två gånger</b>.<br><br>Tryck på spela och titta på ett kronblad i taget.',
        rule: 'Matcha färgen, vrid två gånger.',
        cube: {
          setup: DAISY, mask: 'cross',
          parts: [
            { name: 'Blått matchar redan', alg: 'B2' },
            { name: 'Matcha grönt och orange', alg: "U'" },
            { name: 'Grönt ner', alg: 'F2' },
            { name: 'Orange ner', alg: 'R2' },
            { name: 'Matcha rött', alg: "U'" },
            { name: 'Rött ner', alg: 'L2' },
          ],
        },
      },
      {
        title: 'Titta under',
        text: 'Vänd på kuben och titta: ett vitt kors! Och sidorna på korset matchar mittbitarna. Det är <b>C</b> i CFOP.',
        cube: { mask: 'cross', pitch: 35, yaw: -38 },
      },
      {
        title: 'Din tur!',
        text: 'Blanda, gör prästkrage, och gör sedan det vita korset på din kub.',
        practice: true,
        help: [
          ['Jag vet inte hur man matchar ett kronblad', 2],
          ['Har du ingen prästkrage? Gör den först, från steget innan.', null],
          ['Korset blev fel? Kolla att varje kronblads färg stod över rätt mitt innan du vred två gånger.', null],
        ],
      },
    ],
  },
  {
    id: 'w3',
    title: 'Vita hörnen',
    short: 'Den första våningen blir klar',
    quiz: [
      { q: 'Vad visar var ett vitt hörn ska bo?', options: ['Hörnets två andra färger', 'Den vita färgen', 'Den gula mitten'] },
      { q: 'Var håller du hörnet innan du dansar?', options: ['Uppe till höger, framme', 'Uppe till vänster, bak', 'Nere till vänster'] },
      { q: 'Hur många danser kan ett hörn behöva?', options: ['1, 3 eller 5', 'Alltid 6', 'Alltid 2'] },
    ],
    steps: [
      {
        recap: true,
        title: 'Det vita korset',
        text: 'Det vita korset ligger under kuben, och kanterna matchar mittbitarna. Har du det på din kub?',
        cube: { mask: 'cross', pitch: 35, yaw: -38 },
      },
      {
        title: 'Fyra vita hörn',
        text: 'Nu ska de fyra vita hörnen ner i botten, mellan korsets armar. Då är hela första våningen klar.<br><br>Det blinkande hörnet har färgerna <b>vit, grön och orange</b>.',
        cube: { setup: "U R U' R' U R U' R' U R U' R' U", mask: 'firstLayer', highlight: ['DFR'] },
      },
      {
        title: 'Hitta rätt plats',
        text: 'Hörnet med vitt, grönt och orange ska ner <b>mellan den gröna och den orange mitten</b>.<br><br>Vrid toppen tills hörnet står precis ovanför sin plats. Håll kuben så att hörnet är <b>uppe till höger, framme</b>.',
        rule: 'Hörnets två andra färger visar var det ska bo.',
        cube: { setup: "U R U' R' U R U' R' U R U' R' U", alg: "U'", mask: 'firstLayer', highlight: ['DFR'] },
      },
      {
        title: 'Dansa tills det sitter!',
        text: 'Gör <b>Dansen</b> igen och igen tills hörnet sitter rätt med vitt nedåt. Räkna! Ibland räcker en gång, ibland behövs tre eller fem.',
        rule: 'Dansa och räkna: 1, 3 eller 5 gånger.',
        cube: { setup: "U R U' R' U R U' R' U R U' R'", parts: dances(3), mask: 'firstLayer', highlight: ['DFR'] },
      },
      {
        title: 'En gång räcker ibland',
        text: 'Här behövs bara en Dans. Titta åt vilket håll det vita pekar innan du börjar, så lär du dig känna igen det.',
        cube: { setup: "U R U' R'", parts: dances(1), mask: 'firstLayer', highlight: ['DFR'] },
      },
      {
        title: 'Fast i botten?',
        text: 'Sitter ett vitt hörn i botten men vridet fel? Håll det <b>nere till höger, framme</b> och dansa en gång. Då hoppar det upp i toppen.<br><br>Sitter det redan ovanför rätt plats? Dansa vidare tills det sitter. Annars: vrid toppen och gör som i "Hitta rätt plats".',
        cube: { setup: "R U R' U' R U R' U' R U R' U' R U R' U'", parts: [{ name: 'Hörnet hoppar upp', alg: DANCE }, { name: 'Hörnet sitter rätt', alg: DANCE }], mask: 'firstLayer', highlight: ['DFR'] },
      },
      {
        title: 'Din tur!',
        text: 'Gör kors och alla fyra vita hörn på din kub. Kolla att varje sida har ett litet "T" av samma färg.',
        practice: true,
        help: [
          ['Jag vet inte var hörnet ska', 2],
          ['Hörnet står rätt men jag vet inte hur många danser', 3],
          ['Ett hörn sitter fast i botten', 5],
          ['Dansen gick fel? Börja om med Dansen: höger upp, toppen vänster, höger ner, toppen höger.', null],
        ],
      },
    ],
  },
  {
    id: 'w4',
    title: 'Mittenvåningen',
    short: 'Två våningar klara (F2L, nybörjarstil)',
    quiz: [
      { q: 'Vart ska den blinkande kanten?', options: ['Till höger', 'Till vänster'], cube: { caseRef: 'mid_right', highlight: ['FR'] } },
      { q: 'Vilka kanter i toppen ska ner i mitten?', options: ['Kanter utan gult', 'Kanter med gult', 'Alla kanter'] },
      { q: 'Vad gör du först?', options: ['Vrider toppen bort från där kanten ska', 'Vrider toppen mot där kanten ska', 'Gör Dansen sex gånger'] },
    ],
    steps: [
      {
        recap: true,
        title: 'Första våningen',
        text: 'Hela botten är vit, och varje sida har ett litet T av samma färg. Har du det på din kub?',
        cube: { mask: 'firstLayer', pitch: 30, yaw: -38 },
      },
      {
        title: 'Fyra kanter i mitten',
        text: 'Nu sätter vi de fyra kanterna i mittenvåningen. Då är <b>två våningar</b> klara. Det är F2L i CFOP!',
        cube: { mask: 'f2l' },
      },
      {
        title: 'Ny bokstav: L',
        text: '<b>L</b> som i <i>Left</i> = vänster.<br><br><b>L</b> vrider vänstra sidan <b>NER</b>. <b>L\'</b> vrider den <b>UPP</b>. Det är tvärtom mot R!',
        cube: { mask: 'full', pad: ['L', "L'", 'R', "R'"] },
      },
      {
        title: 'Gör ett upp-och-ner-T',
        text: 'Hitta en kant i toppen <b>utan gult</b>. Här är det den grön-orange kanten.<br><br>Vrid toppen tills kantens <b>framfärg</b> (grön) står ovanför den <b>gröna mitten</b>. Nu ser det ut som ett upp-och-ner-T.<br><br>Kantens <b>toppfärg</b> (orange) visar vart den ska: åt höger, där den orange mitten är.',
        cube: { setupInv: MID_R, mask: 'f2l', highlight: ['FR'] },
      },
      {
        title: 'Till höger',
        text: 'Ska kanten till <b>höger</b>? Gör två korta danser:<br><b>Bort-dansen</b>: U R U\' R\'<br><b>Fram-dansen</b>: U\' F\' U F',
        rule: 'Vrid först toppen BORT från där kanten ska.',
        cube: { caseRef: 'mid_right', parts: [{ name: 'Bort-dansen', alg: "U R U' R'" }, { name: 'Fram-dansen', alg: "U' F' U F" }], highlight: ['FR'] },
      },
      {
        title: 'Till vänster',
        text: 'Ska kanten till <b>vänster</b>? Samma sak, fast spegelvänt:<br><b>Bort-dansen</b>: U\' L\' U L<br><b>Fram-dansen</b>: U F U\' F\'',
        rule: 'Vrid först toppen BORT från där kanten ska.',
        cube: { caseRef: 'mid_left', parts: [{ name: 'Bort-dansen', alg: "U' L' U L" }, { name: 'Fram-dansen', alg: "U F U' F'" }], highlight: ['FL'] },
      },
      {
        title: 'Fast på fel plats?',
        text: 'Sitter en kant i mitten men vänd fel? Håll den fram till höger och gör <b>Till höger</b> en gång. Då hoppar den upp i toppen.<br><br>Gör sedan ett upp-och-ner-T och sätt in den som vanligt.',
        cube: { setupInv: `${MID_R} U2 ${MID_R}`, parts: [{ name: 'Kanten hoppar upp', alg: MID_R }, { name: 'Gör T', alg: 'U2' }, { name: 'Till höger', alg: MID_R }], mask: 'f2l', highlight: ['FR'] },
      },
      {
        title: 'Din tur!',
        text: 'Lös de två första våningarna på din kub.',
        practice: true,
        help: [
          ['Jag vet inte om kanten ska till höger eller vänster', 3],
          ['Kanten ska till höger', 4],
          ['Kanten ska till vänster', 5],
          ['En kant sitter i mitten men är vänd fel', 6],
          ['Har alla kanter i toppen gult? Då sitter någon kant fel i mitten. Se "Fast på fel plats".', null],
        ],
      },
    ],
    cases: [
      { id: 'mid_right', name: 'Till höger', alg: MID_R, mask: 'f2l' },
      { id: 'mid_left', name: 'Till vänster', alg: "U' L' U L U F U' F'", mask: 'f2l' },
    ],
  },
  {
    id: 'w5', auf: true,
    title: 'Gula korset',
    short: 'Steg O del 1: kanterna gula',
    quiz: [
      { q: 'Vilket mönster är det?', options: ['Linje', 'L', 'Prick'], diagram: { caseRef: 'oll_line' } },
      { q: 'Vilket mönster är det?', options: ['L', 'Linje', 'Prick'], diagram: { caseRef: 'oll_l' } },
      { q: 'Du har en prick. Vad gör du först?', options: ['Linje-algoritmen', 'L-algoritmen', 'Sune'] },
    ],
    steps: [
      {
        recap: true,
        title: 'Två våningar klara',
        text: 'De två nedersta våningarna är klara. Nu är det bara den gula toppen kvar!',
        cube: { mask: 'f2l' },
      },
      {
        title: 'Tre mönster',
        text: 'Nu ska toppen få ett <b>gult kors</b>. Titta bara på kanterna, plus-tecknet. Hörnen bryr vi oss inte om än.<br><br>Toppen ser ut som en av de här bilderna. Vilken har du?',
        diagrams: [{ caseRef: 'oll_dot', label: 'Prick' }, { caseRef: 'oll_l', label: 'L' }, { caseRef: 'oll_line', label: 'Linje' }],
      },
      {
        title: 'Linje',
        text: 'Håll linjen <b>vågrätt</b>, från vänster till höger, precis som på bilden. Gör sedan:<br><b>Fram – Dansen – Fram tillbaka</b>',
        diagram: { caseRef: 'oll_line' },
        cube: { caseRef: 'oll_line', parts: [{ name: 'Fram', alg: 'F' }, { name: 'Dansen', alg: DANCE }, { name: 'Fram tillbaka', alg: "F'" }] },
      },
      {
        title: 'L',
        text: 'Håll L:et som på bilden: ena armen pekar <b>bakåt</b> och den andra <b>åt vänster</b>. Gör sedan:<br><b>Fram – Baklänges-dansen – Fram tillbaka</b>',
        diagram: { caseRef: 'oll_l' },
        cube: { caseRef: 'oll_l', parts: [{ name: 'Fram', alg: 'F' }, { name: 'Baklänges-dansen', alg: "U R U' R'" }, { name: 'Fram tillbaka', alg: "F'" }] },
      },
      {
        title: 'Prick',
        text: 'Bara en gul prick i mitten? Gör <b>Linje</b>-algoritmen. Nu får du ett L! Vrid toppen så att L:et ligger som på L-bilden, och gör <b>L</b>-algoritmen.',
        diagram: { caseRef: 'oll_dot' },
        cube: { caseRef: 'oll_dot', parts: [{ name: 'Linje-algoritmen', alg: "F R U R' U' F'" }, { name: 'Vrid toppen', alg: 'U2' }, { name: 'L-algoritmen', alg: "F U R U' R' F'" }] },
      },
      {
        title: 'Din tur!',
        text: 'Gör det gula korset på din kub.',
        practice: true,
        help: [
          ['Jag har en prick', 4],
          ['Jag har ett L', 3],
          ['Jag har en linje', 2],
          ['Titta bara på plus-tecknet i mitten, inte på hörnen.', null],
        ],
      },
    ],
    cases: [
      { id: 'oll_line', name: 'Linje', alg: "F R U R' U' F'", mask: 'ollCross' },
      { id: 'oll_l', name: 'L', alg: "F U R U' R' F'", mask: 'ollCross' },
      { id: 'oll_dot', name: 'Prick', alg: "F R U R' U' F' U2 F U R U' R' F'", mask: 'ollCross' },
    ],
  },
  {
    id: 'w6', auf: true,
    title: 'Gula toppen',
    short: 'Steg O del 2: hela toppen gul',
    quiz: [
      { q: 'Var håller du fiskens huvud, det gula hörnet?', options: ['Nere till vänster', 'Uppe till höger', 'Nere till höger'] },
      { q: 'Vilken algoritm gör du här?', options: ['Sune', 'Anti-Sune', 'T-perm'], diagram: { caseRef: 'sune' } },
      { q: 'Inget hörn har gult uppåt. Vad gör du?', options: ['Sune, så att du får en fisk', 'T-perm', 'Börjar om från början'] },
    ],
    steps: [
      {
        recap: true,
        title: 'Det gula korset',
        text: 'Toppen har ett gult kors. Hörnen kan se ut hur som helst.',
        cube: { setupInv: SUNE, mask: 'ollCross' },
      },
      {
        title: 'Hela toppen gul',
        text: 'Nu ska hörnen också bli gula. Räkna hur många hörn som har gult <b>uppåt</b>. Toppen ser ut som en av de här bilderna.',
        diagrams: [{ caseRef: 'sune', label: 'Fisk' }, { setupInv: "R U R' U R U' R' U R U2 R'", mask: 'oll', label: 'Inga gula hörn' }, { setupInv: "r U R' U' r' F R F'", mask: 'oll', label: 'Två gula hörn' }],
      },
      {
        title: 'Fisken – Sune',
        text: 'Ser du en <b>fisk</b>? Ett hörn har gult uppåt, och korset är fiskens kropp.<br><br>Håll fiskens huvud, det gula hörnet, <b>nere till vänster</b>. Pekar det gula på hörnet fram till höger <b>mot dig</b>? Gör <b>Sune</b>.',
        diagram: { caseRef: 'sune' },
        cube: { caseRef: 'sune', parts: SUNE_PARTS },
      },
      {
        title: 'Andra fisken – Anti-Sune',
        text: 'Håll fiskens huvud nere till vänster, precis som förut. Pekar det gula på hörnet fram till höger <b>åt höger</b> i stället? Då simmar fisken åt andra hållet.<br><br>Vrid toppen ett halvt varv (U2) och gör <b>Anti-Sune</b>.',
        diagram: { setupInv: "U2 R U2 R' U' R U' R'", mask: 'oll' },
        cube: { setupInv: "U2 R U2 R' U' R U' R'", parts: [{ name: 'Halvt varv', alg: 'U2' }, { name: 'Anti-Sune', alg: "R U2 R' U' R U' R'" }], mask: 'oll' },
      },
      {
        title: 'Inga gula hörn?',
        text: 'Inget hörn har gult uppåt? Vrid toppen tills hörnet fram till vänster har gult på <b>vänster sida</b>, som på bilden. Gör Sune.<br><br>Nu har du en fisk!',
        diagram: { setupInv: "R U R' U R U' R' U R U2 R'", mask: 'oll' },
        cube: { setupInv: "R U R' U R U' R' U R U2 R'", parts: SUNE_PARTS, mask: 'oll' },
      },
      {
        title: 'Två gula hörn?',
        text: 'Två hörn har gult uppåt? Vrid toppen tills hörnet fram till vänster har gult <b>framåt, mot dig</b>, som på bilden. Gör Sune.<br><br>Nu har du en fisk!',
        diagram: { setupInv: "r U R' U' r' F R F'", mask: 'oll' },
        cube: { setupInv: "r U R' U' r' F R F'", parts: SUNE_PARTS, mask: 'oll' },
      },
      {
        title: 'Din tur!',
        text: 'Gör hela toppen gul på din kub.',
        practice: true,
        help: [
          ['Jag har en fisk', 2],
          ['Fisken simmar åt andra hållet', 3],
          ['Inga hörn har gult uppåt', 4],
          ['Två hörn har gult uppåt', 5],
          ['Osäker? Gör Sune och titta igen. Till slut blir toppen gul.', null],
        ],
      },
    ],
    cases: [
      { id: 'sune', name: 'Sune', alg: SUNE, mask: 'oll' },
      { id: 'antisune', name: 'Anti-Sune', alg: "R U2 R' U' R U' R'", mask: 'oll' },
      { id: 'oll_h', name: 'H (bonus)', alg: "R U R' U R U' R' U R U2 R'", mask: 'oll', bonus: true },
      { id: 'oll_pi', name: 'Pi (bonus)', alg: "R U2 R2 U' R2 U' R2 U2 R", mask: 'oll', bonus: true },
      { id: 'oll_u', name: 'Strålkastare (bonus)', alg: "R2 D R' U2 R D' R' U2 R'", mask: 'oll', bonus: true },
      { id: 'oll_t', name: 'T (bonus)', alg: "r U R' U' r' F R F'", mask: 'oll', bonus: true },
      { id: 'oll_bowtie', name: 'Fluga (bonus)', alg: "F' r U R' U' r' F R", mask: 'oll', bonus: true },
    ],
  },
  {
    id: 'w7', auf: true,
    title: 'Hörnen på plats',
    short: 'Steg P del 1: T-perm och Y-perm',
    quiz: [
      { q: 'Vad är strålkastare?', options: ['Två hörn på samma sida med samma färg', 'Två gula kanter', 'En gul prick'] },
      { q: 'Var håller du strålkastarna när du gör T-perm?', options: ['Till vänster', 'Till höger', 'Mot dig'] },
      { q: 'Hur börjar T-perm?', options: ['Med Dansen', 'Med Sune', 'Med F'] },
      { q: 'Inga strålkastare. Vad gör du?', options: ['Y-perm', 'T-perm från vänster', 'Ua'] },
    ],
    steps: [
      {
        recap: true,
        title: 'Hela toppen gul',
        text: 'Hela toppen är gul. Nu ska bitarna i toppen flytta till rätt plats. Det är <b>P</b> i CFOP. Först hörnen!',
        cube: { setupInv: "R U R' U' R' F R2 U' R' U' R U R' F'", mask: 'full' },
      },
      {
        title: 'Strålkastare',
        text: 'Titta på sidorna av översta våningen. Har två hörn på samma sida <b>samma färg</b>? De kallas <b>strålkastare</b>, som lamporna på en bil.<br><br>Här blinkar strålkastarna på vänster sida.',
        diagram: { caseRef: 'tperm', label: 'Strålkastare till vänster' },
        cube: { caseRef: 'tperm', alg: '', highlight: ['UFL', 'UBL'] },
      },
      {
        title: 'T-perm',
        text: 'Håll strålkastarna på <b>vänster</b> sida och gör <b>T-perm</b>. Den har tre delar, och den börjar med Dansen!<br><br>Pilarna på bilden visar vilka bitar som byter plats.',
        rule: 'Strålkastarna till vänster.',
        diagram: { caseRef: 'tperm', arrows: true },
        cube: { caseRef: 'tperm', parts: TPERM_PARTS },
      },
      {
        title: 'Inga strålkastare?',
        text: 'Hittar du inga strålkastare alls? Då ska två hörn byta plats <b>på snedden</b>. Gör <b>Y-perm</b> från vilken sida som helst. Den har också tre delar, och i mitten kommer Dansen!',
        rule: 'Kommer du inte ihåg Y-perm? Gör T-perm, så får du strålkastare.',
        diagram: { caseRef: 'yperm', arrows: true },
        cube: { caseRef: 'yperm', parts: YPERM_PARTS },
      },
      {
        title: 'Vrid toppen på plats',
        text: 'När alla fyra hörnen har strålkastare: vrid toppen tills hörnen matchar sidorna.',
        cube: { setup: 'U', alg: "U'", mask: 'full' },
      },
      {
        title: 'Din tur!',
        text: 'Sätt hörnen på plats på din kub.',
        practice: true,
        help: [
          ['Jag vet inte vad strålkastare är', 1],
          ['Jag har strålkastare', 2],
          ['Jag har inga strålkastare', 3],
          ['Alla hörn har strålkastare men matchar inte', 4],
        ],
      },
    ],
    cases: [
      { id: 'tperm', name: 'T-perm', alg: "R U R' U' R' F R2 U' R' U' R U R' F'", mask: 'full' },
      { id: 'yperm', name: 'Y-perm', alg: YPERM, mask: 'full' },
    ],
  },
  {
    id: 'w8', auf: true,
    title: 'Kanterna på plats',
    short: 'Steg P del 2: kuben löst!',
    quiz: [
      { q: 'Var håller du den klara sidan?', options: ['Bakåt', 'Mot dig', 'Till vänster'] },
      { q: 'Ingen sida är klar. Vad gör du?', options: ['Ua från vilken sida som helst', 'T-perm', 'Sune'] },
      { q: 'Du gjorde Ua men det skulle vara Ub. Vad gör du nu?', options: ['Ua en gång till', 'Börjar om från början', 'Vrider toppen'] },
    ],
    steps: [
      {
        recap: true,
        title: 'Hörnen sitter rätt',
        text: 'Alla hörn i toppen matchar sidorna. Nu är det bara kanterna kvar. Sista biten!',
        cube: { setupInv: UA, mask: 'full' },
      },
      {
        title: 'Hitta den klara sidan',
        text: 'Hitta en sida där <b>hela översta raden</b> har samma färg. Håll den sidan <b>bakåt</b>.<br><br>Pilarna visar åt vilket håll de andra kanterna ska snurra. Det avgör om du ska göra Ua eller Ub.',
        diagrams: [{ caseRef: 'ua', arrows: true, label: 'Ua' }, { caseRef: 'ub', arrows: true, label: 'Ub' }],
      },
      {
        title: 'Ua',
        text: 'Kanterna ska snurra som pilarna på bilden. Den klara sidan är bak.',
        rule: 'Den klara sidan bakåt.',
        diagram: { caseRef: 'ua', arrows: true },
        cube: { caseRef: 'ua', parts: UA_PARTS },
      },
      {
        title: 'Ub',
        text: 'Kanterna ska snurra åt <b>andra hållet</b>.',
        rule: 'Gissade du fel? Ingen fara! Ua två gånger blir Ub.',
        diagram: { caseRef: 'ub', arrows: true },
        cube: { caseRef: 'ub', parts: UB_PARTS },
      },
      {
        title: 'Ingen sida klar?',
        text: 'Är ingen sida klar? Gör <b>Ua</b> från vilken sida som helst. Då blir en sida klar, och du fortsätter som vanligt.<br><br>Det finns också två snabbknep för de här lägena, <b>H</b> och <b>Z</b>. De finns i Träna.',
        diagrams: [{ caseRef: 'h', arrows: true, label: 'H' }, { caseRef: 'z', arrows: true, label: 'Z' }],
        cube: { setupInv: 'M2 U M2 U2 M2 U M2', parts: [{ name: 'Ua från valfri sida', alg: UA }], mask: 'full' },
      },
      {
        title: 'Du kan lösa kuben!',
        text: 'Blanda din kub och lös den från början till slut: prästkrage, kors, hörn, mitten, gult kors, gul topp, hörn och kanter.<br><br>Du har lärt dig CFOP!',
        practice: true,
        help: [
          ['Jag hittar ingen klar sida', 4],
          ['Kanterna ska snurra som Ua', 2],
          ['Kanterna ska snurra som Ub', 3],
          ['Fel håll? Gör samma algoritm en gång till. Ua två gånger blir Ub.', null],
        ],
      },
    ],
    cases: [
      { id: 'ua', name: 'Ua', alg: UA, mask: 'full' },
      { id: 'ub', name: 'Ub', alg: "R2 U R U R' U' R' U' R' U R'", mask: 'full' },
      { id: 'h', name: 'H', alg: 'M2 U M2 U2 M2 U M2', mask: 'full' },
      { id: 'z', name: 'Z', alg: "M' U M2 U M2 U M' U2 M2 U'", mask: 'full' },
    ],
  },
  {
    id: 'w9',
    title: 'Bonus: Riktig F2L',
    short: 'Hörn och kant samtidigt – som proffsen',
    quiz: [
      { q: 'Vad är ett par?', options: ['Ett vitt hörn och dess kant', 'Två hörn', 'Två mittbitar'] },
      { q: 'Vilken algoritm passar här?', options: ["R U R'", "F' U' F", "U R U' R'"], cube: { caseRef: 'f2l_1', highlight: ['DFR', 'FR'] } },
      { q: 'Vitt framåt, kanten till vänster. Vilken algoritm?', options: ["F' U' F", "R U R'", "U' F' U F"] },
    ],
    steps: [
      {
        title: 'Snabbare: par!',
        text: 'Proffsen gör inte hörnen och mittenkanterna var för sig. De sätter ihop ett vitt hörn och dess kant till ett <b>par</b> och stoppar in båda samtidigt.<br><br>Här är de fyra enklaste fallen. Hörnet står alltid uppe till höger fram. Lös korset som vanligt först.',
        cube: { mask: 'f2l' },
      },
      {
        title: 'Vitt åt höger, kanten bak',
        text: 'Hörnet har vitt åt <b>höger</b>. Kanten ligger längst <b>bak</b> på toppen. Gör <b>R U R\'</b>. Hörnet hämtar kanten på vägen ner!',
        cube: { caseRef: 'f2l_1', highlight: ['DFR', 'FR'] },
      },
      {
        title: 'Vitt framåt, kanten till vänster',
        text: 'Spegelbilden: hörnet har vitt <b>framåt</b> och kanten ligger till <b>vänster</b>. Gör <b>F\' U\' F</b>.',
        cube: { caseRef: 'f2l_2', highlight: ['DFR', 'FR'] },
      },
      {
        title: 'Vitt framåt, kanten till höger',
        text: 'Hörnet har vitt framåt och kanten ligger bredvid till <b>höger</b>. Gör <b>U R U\' R\'</b>.',
        cube: { caseRef: 'f2l_3', highlight: ['DFR', 'FR'] },
      },
      {
        title: 'Vitt åt höger, kanten fram',
        text: 'Hörnet har vitt åt höger och kanten ligger <b>framför</b>. Gör <b>U\' F\' U F</b>.',
        cube: { caseRef: 'f2l_4', highlight: ['DFR', 'FR'] },
      },
      {
        title: 'Din tur!',
        text: 'Prova att lösa två våningar med par i stället för steg för steg. Det känns svårt först, men blir snabbt!',
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
