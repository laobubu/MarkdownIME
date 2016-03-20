/// <reference path="../typings/qunit/qunit.d.ts" />
/// <reference path="../dist/MarkdownIME.d.ts" />

QUnit.module("Editor");

var ime = MarkdownIME.Enhance(editor);

QUnit.test("deal with editors whose children is only one #text", function( assert ) {
  var ev = document.createEvent("KeyboardEvent");
  ev.which = ev.keyCode = 13;
  
  var srcText = "*l*`o`~~r~~**e**[m](..)";
  var dstText = "lorem";
  
  editor.innerHTML = srcText;
  MarkdownIME.Utils.move_cursor_to_end(editor);
  ime.ProcessCurrentLine(ev);
  
  assert.equal(editor.firstChild.nodeName, "P",        "elevate text to block");
  assert.equal(editor.firstChild.textContent, dstText, "and render it");
});
