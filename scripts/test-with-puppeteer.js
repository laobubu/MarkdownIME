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

startWeb();
(async () => {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Attach to browser console log events, and log to node console
  await page.on('console', msg => console.log(msg.text()));

  await page.exposeFunction('harness_testDone', async details => {
    console.log(`[-] ${details.module} / ${details.name} : ` + "Total: ", details.total, " Failed: ", details.failed, " Passed: ", details.passed, " Runtime: ", details.runtime)
  });

  await page.exposeFunction('harness_done', async details => {
    console.log("Total: ", details.total, " Failed: ", details.failed, " Passed: ", details.passed, " Runtime: ", details.runtime);
    await browser.close()
    process.exit(details.failed ? 1 : 0)
  });

  await page.goto('http://localhost:6041/test/');

  await page.evaluate(() => {
    QUnit.config.testTimeout = 10000;
    QUnit.done((details) => { window.harness_done(details); });
    QUnit.testDone((details) => { window.harness_testDone(details); });
    console.log("Let's test!")
  });


})();