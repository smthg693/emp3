import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log('Testing http://localhost:3000 in headless browser...');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE [' + msg.type() + ']:', msg.text()));
    page.on('pageerror', err => console.error('CRITICAL PAGE ERROR:', err.message));

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 10000 });

    const title = await page.title();
    console.log('Page Title:', title);

    const rootContent = await page.$eval('#root', el => el.innerHTML);
    console.log('#root Content Length:', rootContent.length);

    if (rootContent.length === 0) {
      console.error('❌ #root is EMPTY! The page is rendering a blank/black screen.');
    } else {
      console.log('✅ #root contains rendered elements! Snippet:', rootContent.substring(0, 150));
    }

    await browser.close();
  } catch (err) {
    console.error('Test Execution Error:', err.message);
  }
})();
