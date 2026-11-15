const { chromium } = require('/Users/dinalperera/.npm/_npx/420ff84f11983ee5/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const results=[];
 for(const [name,width,height] of [['desktop',1440,1100],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:3194/stays',{waitUntil:'networkidle'});
  const map=page.locator('section[aria-labelledby="area-guide"]');
  await map.scrollIntoViewIfNeeded();
  await map.screenshot({path:`output/bali-travel-review/stays-${name}.png`});
  const ungasan=page.getByRole('button',{name:'Ungasan & Melasti',exact:false}).last();
  await ungasan.click();
  assert.equal(await ungasan.getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#area-description').innerText(),/Spacious villas/);
  const suluban=page.getByRole('button',{name:'Explore Suluban & the western cliffs',exact:true});
  await suluban.focus();await page.keyboard.press('Enter');
  assert.match(await page.locator('#area-description').innerText(),/western cliffs/);
  if(name==='desktop') {await page.getByRole('button',{name:'Explore Balangan & Dreamland',exact:true}).hover();assert.match(await page.locator('#area-description').innerText(),/driving/);}
  assert.ok(await page.getByRole('link',{name:'Stone Villas, our wedding venue, open Google Maps'}).getAttribute('href'));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Stays page overflow');
  await page.goto('http://localhost:3194/bali#visas',{waitUntil:'networkidle'});
  await page.locator('#visas').screenshot({path:`output/bali-travel-review/visa-${name}.png`});
  assert.equal(await page.getByRole('link',{name:'Apply for your tourist visa',exact:false}).getAttribute('href'),'https://evisa.imigrasi.go.id/');
  assert.equal(await page.getByRole('link',{name:'Pay the Bali tourist levy',exact:false}).getAttribute('href'),'https://lovebali.baliprov.go.id/');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Visa page overflow');
  await page.goto('http://localhost:3194/flights',{waitUntil:'networkidle'});
  const cards=page.locator('article');assert.ok(await cards.count()>0);
  await cards.first().screenshot({path:`output/bali-travel-review/flight-${name}.png`});
  await page.locator('#baggage-guide details').first().locator('summary').click();
  assert.match(await page.locator('#baggage-guide details').first().innerText(),/A\$87/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Flights page overflow');
  assert.deepEqual(errors,[]);
  results.push({viewport:name,map:'hover/click/keyboard passed',visa:'official CTA links passed',flights:'cards and baggage accordion passed',overflow:false,consoleErrors:errors.length});
  await page.close();
 }
 for(const method of ['GET','POST']){const r=await fetch('http://localhost:3194/api/cron/flights',{method});assert.equal(r.status,401);}
 console.log(JSON.stringify(results));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
