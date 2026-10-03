// Exempelartiklar, skrivna som den automatiska artikelmotorn skulle göra:
// utifrån WCA-data (hämtad 3 okt 2026), inte utifrån andras texter.

export const ARTICLES = [
  {
    slug: 'svenskt-rekord-enhand',
    kind: 'Rekord',
    date: '2026-09-27',
    title: 'Nytt svenskt rekord i 3×3 enhand',
    lead: 'Emanuel Schelin satte svenskt rekord i medeltid i 3×3 med en hand på Kublördag Jönköping XIII: 10,41 sekunder.',
    source: 'WCA-resultat: Kublördag Jönköping XIII - 2026',
    body: `
      <p>Lördagen den 26 september samlades 41 kubare i Jönköping för <b>Kublördag Jönköping XIII</b>. I grenen 3×3 enhand, där kuben bara får vridas med en hand, fick Emanuel Schelin ett medelvärde på <b>10,41 sekunder</b>. Det är nytt svenskt rekord.</p>
      <p>Hans bästa enskilda lösning i finalen tog 8,98 sekunder. Tvåa i grenen blev Theo Skoog (medel 14,16) och trea Eskil Munthe (15,83).</p>
      <h3>Så räknas medelvärdet</h3>
      <p>I de flesta grenar gör man fem lösningar. Den snabbaste och den långsammaste stryks, och medelvärdet räknas på de tre i mitten. Det gör att en enstaka tur- eller otursrunda inte avgör.</p>
      <h3>Övriga vinnare på tävlingen</h3>
      <table>
        <thead><tr><th>Gren</th><th>Vinnare</th><th>Medel</th></tr></thead>
        <tbody>
          <tr><td>3×3</td><td>Ludwig Ivarsson</td><td>6,51</td></tr>
          <tr><td>2×2</td><td>Emanuel Schelin</td><td>1,59</td></tr>
          <tr><td>Pyraminx</td><td>Eskil Munthe</td><td>3,06</td></tr>
          <tr><td>Square-1</td><td>Theo Skoog</td><td>9,13</td></tr>
          <tr><td>Megaminx</td><td>Kasper Eriksson</td><td>38,95</td></tr>
        </tbody>
      </table>`,
  },
  {
    slug: 'kublordag-jonkoping-xiii',
    kind: 'Tävlingsrapport',
    date: '2026-09-27',
    title: 'Kublördag Jönköping XIII: 41 kubare och sju grenar',
    lead: 'Ludwig Ivarsson vann 3×3 med medeltiden 6,51 sekunder. Emanuel Schelin tog tre grenar och ett svenskt rekord.',
    source: 'WCA-resultat: Kublördag Jönköping XIII - 2026',
    body: `
      <p>Kublördag Jönköping XIII hölls den 26 september med 41 deltagare och sju grenar: 2×2, 3×3, 3×3 enhand, Megaminx, Pyraminx, Square-1 och multiblind.</p>
      <h3>3×3</h3>
      <p>Finalen i huvudgrenen vann <b>Ludwig Ivarsson</b> med medeltiden 6,51. Emanuel Schelin hade finalens snabbaste enskilda lösning, 5,17, och blev tvåa med medel 7,18. Theo Skoog blev trea med 7,37.</p>
      <h3>Flest grenar</h3>
      <p><b>Emanuel Schelin</b> vann 2×2 (medel 1,59) och 3×3 enhand, där han också satte svenskt rekord (10,41). Han kom dessutom på pallen i Megaminx, Pyraminx och Square-1.</p>
      <h3>Multiblind</h3>
      <p>I multiblind memorerar man flera kuber och löser dem sedan med förbundna ögon. Eskil Munthe vann grenen.</p>`,
  },
  {
    slug: 'hostens-tavlingar-2026',
    kind: 'Tävlingar',
    date: '2026-10-03',
    title: 'Elva tävlingar i Sverige fram till januari',
    lead: 'Från Helsingborg till Umeå: här är höstens WCA-tävlingar, med Götalands- och Norrlandsmästerskapen som höjdpunkter.',
    source: 'WCA:s tävlingskalender, 3 oktober 2026',
    body: `
      <p>Fram till början av januari finns elva officiella WCA-tävlingar inlagda i Sverige. Uppsala har flest, med fyra tävlingar.</p>
      <h3>Två regionala mästerskap</h3>
      <p><b>Götalandsmästerskapet</b> går i Jönköping 6–8 november och <b>Norrlandsmästerskapet</b> i Umeå 21–22 november. Båda har alla 17 grenar, från 2×2 till multiblind.</p>
      <h3>Bra för nybörjare</h3>
      <p>Ligatävlingarna i Stockholm (Sollentuna) och Uppsala är endagars och har färre grenar, vilket gör dem lagom som första tävling. Alla har 3×3 och 2×2.</p>
      <h3>Anmälan</h3>
      <p>Anmälan görs på WCA:s webbplats. Många tävlingar har ett deltagartak, så det lönar sig att anmäla sig tidigt.</p>`,
  },
];
