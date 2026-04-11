const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });
  page.on('pageerror', error => {
    logs.push(`[PAGE ERROR] ${error.message}`);
  });
  page.on('response', response => {
    if (!response.ok()) {
      logs.push(`[NETWORK ERROR] ${response.status()} ${response.url()}`);
    }
  });

  try {
    await page.goto('http://localhost:3000/login');
    await page.type('input[type="email"]', 'admin@alpha.dev');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.goto('http://localhost:3000/leads', { waitUntil: 'networkidle0' });
    
    // Wait a couple of seconds to let websockets/api calls fail if they're going to
    await new Promise(r => setTimeout(r, 2000));
    
  } catch (err) {
    logs.push(`[SCRIPT ERROR] ${err.message}`);
  }
  
  console.log(logs.join('\n'));
  await browser.close();
})();
