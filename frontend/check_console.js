const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE_ERROR] ${err.message}`));
  page.on('response', res => { if (!res.ok()) console.log(`[NETWORK_ERROR] ${res.status()} ${res.url()}`); });

  try {
    await page.goto('http://localhost:3000/login');
    await page.type('input[type="email"]', 'admin@alpha.dev');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.goto('http://localhost:3000/leads', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
  } catch (err) { }
  
  await browser.close();
})();
