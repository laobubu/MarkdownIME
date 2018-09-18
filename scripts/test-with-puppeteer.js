const puppeteer = require('puppeteer');
const path = require('path')

function startWeb() {
  var connect = require('connect');
  var serveStatic = require('serve-static');

  var app = connect();
  app.use(serveStatic(path.resolve(__dirname, '..'), { 'index': ['index.html'] }));
  app.listen(6041);

  console.log('=== MarkdownIME Test Runner ===')
  console.log('Server loaded on http://localhost:6041');
}

async function main() {
  startWeb();

  let browser = await (puppeteer.launch().catch(err => {
    // All credit goes to the Great FireWall
    return puppeteer.launch({ executablePath: `C:/Program Files (x86)/Google/Chrome/Application/chrome.exe` })
  }));
  let page = await browser.newPage();

  // Attach to browser console log events, and log to node console
  await page.on('console', msg => console.log(msg.text()));

  await page.exposeFunction('harness_testDone', async details => {
    console.log(`[-] ${details.module} / ${details.name} : ` + "Total: ", details.total, " Failed: ", details.failed, " Passed: ", details.passed, " Runtime: ", details.runtime)
  });

  await page.exposeFunction('harness_done', details => {
    console.log("Total: ", details.total, " Failed: ", details.failed, " Passed: ", details.passed, " Runtime: ", details.runtime);
    
    page.close()
      .then(() => browser.close())
      .catch(err => {
        console.warn("[WARN] Error while closing puppeteer browser")
        console.warn(err)
      })
      .then(() => process.exit(details.failed ? 1 : 0))
  });

  await page.goto('http://localhost:6041/test/');

  await page.evaluate(() => {
    QUnit.config.testTimeout = 10000;
    QUnit.done((details) => { window.harness_done(details); });
    QUnit.testDone((details) => { window.harness_testDone(details); });
    console.log("Let's test!")
  });
}

main().catch(err => {
  console.error(err)
  process.exit(2)
})
