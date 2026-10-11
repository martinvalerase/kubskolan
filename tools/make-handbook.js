// Gör handboken som PDF på svenska och engelska, från tools/handbook/index.html.
// Kubbilderna ritas av appens egen kubmotor, så de stämmer alltid med algoritmerna.
//
//   npm install -g playwright && npx playwright install chromium   (en gång)
//   NODE_PATH=$(npm root -g) node tools/make-handbook.js
//
// Resultat: handbok/kubskolan-handbok.pdf och handbok/cube-school-handbook.pdf

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const OUT = [
  ['sv', 'handbok/kubskolan-handbok.pdf'],
  ['en', 'handbok/cube-school-handbook.pdf'],
];

const server = http.createServer((req, res) => {
  let file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (file.endsWith(path.sep)) file += 'index.html';
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(0, async () => {
  const port = server.address().port;
  const browser = await chromium.launch();
  try {
    for (const [lang, out] of OUT) {
      const page = await (await browser.newContext()).newPage();
      page.on('pageerror', e => { throw e; });
      await page.goto(`http://localhost:${port}/tools/handbook/?lang=${lang}`);
      await page.waitForSelector('body[data-ready]', { timeout: 20000 });
      fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
      await page.pdf({ path: path.join(ROOT, out), preferCSSPageSize: true, printBackground: true });
      console.log('Klar:', out);
    }
  } finally {
    await browser.close();
    server.close();
  }
});
