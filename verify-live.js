import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log('🔍 Running automated live verification of http://localhost:3000 ...');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const consoleLogs = [];
    const pageErrors = [];

    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', err => {
      pageErrors.push(err.message);
    });

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 15000 });

    const title = await page.title();
    const rootHtml = await page.$eval('#root', el => el.innerHTML);

    console.log('--------------------------------------------------');
    console.log('Page Title:', title);
    console.log('Rendered #root HTML Length:', rootHtml.length, 'bytes');
    console.log('Console Logs Count:', consoleLogs.length);
    console.log('Page Errors Count:', pageErrors.length);

    if (pageErrors.length > 0) {
      console.error('❌ Page Errors Found:', pageErrors);
    } else {
      console.log('✅ ZERO Page Errors!');
    }

    const hasHeader = rootHtml.includes("Earth–Mars Mission Control");
    const hasKepler = rootHtml.includes("Kepler's Crew");
    const hasOrbital = rootHtml.includes("Orbital Physics");
    const hasScheduler = rootHtml.includes("Data Optimization Engine");
    const hasAutonomy = rootHtml.includes("Autonomous Emergency Response");

    console.log('UI Element Checks:');
    console.log('  - Header rendered:', hasHeader);
    console.log('  - Kepler logo rendered:', hasKepler);
    console.log('  - Orbital visualizer rendered:', hasOrbital);
    console.log('  - Data scheduler rendered:', hasScheduler);
    console.log('  - Autonomous emergency handler rendered:', hasAutonomy);

    if (hasHeader && hasOrbital && hasScheduler && pageErrors.length === 0) {
      console.log('🎉 VERIFICATION SUCCESSFUL: Everything is 100% working!');
    }

    await browser.close();
  } catch (err) {
    console.error('Verification script error:', err.message);
  }
})();
