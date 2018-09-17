var editor = document.getElementById('editor');
var ime = MarkdownIME.Enhance(editor);

var scripts = [
  "basic",
  "transformer1",
  // "block-renderer",
  // "inline-renderer",
  // "editor"
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

QUnit.log(({ result, module, name, message, actual, expected, source }) => {
  if (result) return;

  let output = `[!] FAILED: ${module} / ${name} =====`;
  if (message) output += `\n  ${message}`;
  if (actual) output += `\n  [expect] ${expected}\n  [actual] ${actual}`;
  if (source) output += `\n  [source] ${source.trimLeft()}`;

  console.log(output);
});


scripts.forEach(loadScript);
