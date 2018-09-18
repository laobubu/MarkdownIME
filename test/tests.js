var editor = document.getElementById('editor');
var ime = MarkdownIME.Enhance(editor);

var scripts = [
  "basic",
  "transformer1",
  "table",
]

var awaitingScriptCount = scripts.length;

function loadScript(name) {
  var s = document.createElement("script");
  s.src = "test." + name + ".js";
  s.onload = loadScriptCallback;
  document.body.appendChild(s)
}

function loadScriptCallback() {
  if (--awaitingScriptCount) return;
  //Adding POST Test Code Here
}

////////////////////////////////////////////////////////////
/// GLOBAL METHODS

/** 
 * @param {string} html may contain "✍" which means caret is there
 */
function setEditorContent(html) {
  html = html.replace('✍', '<span data-anchor></span>')
  editor.innerHTML = html

  let anchor = editor.querySelector('[data-anchor]')
  if (anchor) {
    MarkdownIME.DOM.setCaretAfter(anchor)
    anchor.parentNode.removeChild(anchor)
  }
}

function emulateKeyEvent(info, type = 'keydown') {
  let init = (typeof info === 'number') ? { which: info, keyCode: info } : info;
  let ev = new KeyboardEvent(type, init)
  editor.dispatchEvent(ev)
  return ev
}

function caretIsInside(node) {
  if (!node) return false

  var caret = MarkdownIME.DOM.findCaret()
  if (!caret) return false
  if (node.isSameNode(caret)) return true

  var posRelation = node.compareDocumentPosition(caret)

  return posRelation == document.DOCUMENT_POSITION_CONTAINS
}

////////////////////////////////////////////////////////////

QUnit.log(({ result, module, name, message, actual, expected, source }) => {
  if (result) return;

  let output = `[!] FAILED: ${module} / ${name} =====`;
  if (message) output += `\n  ${message}`;
  if (actual) output += `\n  [expect] ${expected}\n  [actual] ${actual}`;
  if (source) output += `\n  [source] ${source.trimLeft()}`;

  console.log(output);
});

console.log(navigator.userAgent)

scripts.forEach(loadScript);
