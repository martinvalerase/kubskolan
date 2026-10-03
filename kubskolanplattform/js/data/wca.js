// WCA-data. Tävlingslistan hämtas live; detta är en sparad kopia (3 okt 2026) som visas
// om live-hämtningen inte fungerar (t.ex. när sidan visas som Artifact, där externa anrop blockeras).

export const SNAPSHOT_DATE = '2026-10-03';

export const EVENTS = {
  '333': '3×3', '222': '2×2', '444': '4×4', '555': '5×5', '666': '6×6', '777': '7×7',
  '333bf': '3×3 blind', '333fm': 'Minst drag', '333oh': '3×3 enhand', clock: 'Clock',
  minx: 'Megaminx', pyram: 'Pyraminx', skewb: 'Skewb', sq1: 'Square-1',
  '444bf': '4×4 blind', '555bf': '5×5 blind', '333mbf': 'Multiblind', fto: 'FTO',
};

const c = (id, start, end, name, city, events) => ({ id, start_date: start, end_date: end, name, city, event_ids: events.split(','), url: `https://www.worldcubeassociation.org/competitions/${id}` });

export const UPCOMING_SNAPSHOT = [
  c('KarnanOpen2026', '2026-10-03', '2026-10-04', 'Kärnan Open 2026', 'Helsingborg', '333,222,444,555,333bf,333fm,333oh,clock,minx,pyram,skewb,333mbf'),
  c('PopularnBlindUppsala2026', '2026-10-04', '2026-10-04', "Popular 'n Blind Uppsala 2026", 'Uppsala', '333,222,444,555,666,777,333bf,pyram,skewb,444bf,555bf,333mbf'),
  c('Stockholmsligan4Smash2026', '2026-10-08', '2026-10-08', 'Stockholmsligan 4: Smash - 2026', 'Sollentuna', '333,222,777,skewb,sq1,555bf'),
  c('Uppsalaligan3Pen2026', '2026-10-15', '2026-10-15', 'Uppsalaligan 3: Pen - 2026', 'Uppsala', '333,222,777,333oh,clock,sq1,444bf'),
  c('NuntorpOpen2026', '2026-10-17', '2026-10-18', 'Nuntorp Open 2026', 'Nuntorp', '333,222,444,555,333bf,333oh,clock,minx,pyram,skewb,sq1,444bf,555bf'),
  c('CubossOpenUppsala2026', '2026-10-24', '2026-10-25', 'Cuboss Open - Uppsala 2026', 'Uppsala', '333,222,444,333oh,clock,pyram,skewb'),
  c('Gotalandsmasterskapet2026', '2026-11-06', '2026-11-08', 'Götalandsmästerskapet 2026', 'Jönköping', '333,222,444,555,666,777,333bf,333fm,333oh,clock,minx,pyram,skewb,sq1,444bf,555bf,333mbf'),
  c('Norrlandsmasterskapet2026', '2026-11-21', '2026-11-22', 'Norrlandsmästerskapet 2026', 'Umeå', '333,222,444,555,666,777,333bf,333fm,333oh,clock,minx,pyram,skewb,sq1,444bf,555bf,333mbf'),
  c('OrebroOpen2026', '2026-11-28', '2026-11-28', 'Örebro Open 2026', 'Örebro', '333,222,444,333oh,clock,pyram,skewb,sq1'),
  c('KublordagJonkopingXIV2027', '2027-01-02', '2027-01-02', 'Kublördag Jönköping XIV - 2027', 'Jönköping', '333,222,444,555,666,777,skewb,fto'),
  c('UppsalaFTOpen2027', '2027-01-02', '2027-01-02', 'Uppsala FTOpen 2027', 'Uppsala', '333,222,333bf,clock,pyram,skewb,fto'),
];

export const LIVE_URL = () =>
  `https://www.worldcubeassociation.org/api/v0/competitions?country_iso2=SE&start=${new Date().toISOString().slice(0, 10)}&sort=start_date&per_page=25`;

export const ATTRIBUTION = 'Resultat och tävlingar kommer från World Cube Association (worldcubeassociation.org), som äger och förvaltar uppgifterna.';
