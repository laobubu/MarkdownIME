/// <reference path="../src/Main.ts" />
/// <reference path="../src/Utils.ts" />

var editor = document.getElementById('editor');
var ime = MarkdownIME.Enhance(editor);

//////////////////////////////////////////////////////////////
function setHTML(html)  { editor.innerHTML = html||''; }
function getHTML()      { return editor.innerHTML; }

function useTestLine(id) {
  var src = document.querySelector("#" + id);
  var node = document.createElement(src.tagName);
  node.innerHTML = src.innerHTML;
  editor.appendChild(node);
  MarkdownIME.Utils.move_cursor_to_end(node);
  return node; 
}

function createTextContainer(text, tagName) {
  var node = document.createElement(tagName || "p");
  node.textContent = text;
  editor.appendChild(node);
  MarkdownIME.Utils.move_cursor_to_end(node);
  return node; 
}

//////////////////////////////////////////////////////////////
QUnit.module("Renderer");
var ren = MarkdownIME.Renderer;
QUnit.test("render entire line block", function( assert ) {
  setHTML();
  
  var srcNode = createTextContainer("***mix*** **bo\\*ld** *italy* ~~st~~ `co\\`de` **\\*mix*** [li\\]nk](..)");
  var newNode = ren.Render(srcNode);
  
  assert.equal(srcNode, newNode);
  assert.equal(newNode.textContent, "mix bo*ld italy st co`de *mix* li]nk");
});
