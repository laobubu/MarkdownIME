/// <reference path="./typings.d.ts" />

QUnit.module("Basic");
QUnit.test("Scan", function (assert) {
  var frameDiv = document.createElement('div');
  var loadedIframes = 0;
  var done = assert.async(1);
  frameDiv.innerHTML =
    '<iframe src="https://laobubu.net/"></iframe>' +  // MarkdownIME has no permission to access this iframe
    '<iframe src="../examples/simple.html"></iframe>';  // But it can access this one
  document.body.appendChild(frameDiv);
  [].forEach.call(frameDiv.children, function (iframe) {
    iframe.addEventListener("load", cntx, false);
  })

  function cntx() {
    if (++loadedIframes !== 2) return;

    var result = MarkdownIME.Scan(window);
    assert.strictEqual(result.length, 2, "Found two editable div");
    assert.strictEqual(result[0], editor, "One is the text container below");
    assert.strictEqual(result[1].ownerDocument.title, "Simpliest MarkdownIME editor", "One is from an iframe <../examples/simple.html>");

    document.body.removeChild(frameDiv);
    done();
  }
})