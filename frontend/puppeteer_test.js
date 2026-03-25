const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Capture frame navigation to detect reloads
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log('NAVIGATED TO:', frame.url());
    }
  });
  
  page.on('console', msg => console.log('[PAGE]', msg.text()));
  
  await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle0' });
  console.log('Page loaded.');
  
  await page.type('#email', 'wrong@email.com');
  await page.type('#password', 'badpass123');
  
  console.log('Clicking login...');
  await page.click('button[type="submit"]');
  
  // Wait to see what happens
  await new Promise(r => setTimeout(r, 2000));
  
  const errorMsg = await page.$eval('.error-message', el => el.innerText).catch(() => 'NO ERROR BANNER FOUND');
  console.log('FINAL STATE ERROR TEXT:', errorMsg);
  
  await browser.close();
})();
