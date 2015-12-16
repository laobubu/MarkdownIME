/// <reference path="../src/Main.ts" />
/// <reference path="../src/Utils.ts" />

var editor = document.getElementById('editor');
var ime = MarkdownIME.Enhance(editor);

//////////////////////////////////////////////////////////////
function setHTML(html)  { 
  while(editor.firstChild){
    editor.removeChild(editor.firstChild);
  } 
  editor.innerHTML = html||''; 
  MarkdownIME.Utils.move_cursor_to_end(editor);
 }
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
  
  var srcText = "***mix*** **bo\\*ld** *italy* ~~st~~ `co\\`de` **\\*mix*** [li\\]nk](..)";
  var dstText = "mix bo*ld italy st co`de *mix* li]nk";
  
  var srcNode = createTextContainer(srcText);
  var newNode = ren.Render(srcNode);
  
  assert.equal(srcNode, newNode, "return same block element");
  assert.equal(newNode.textContent, dstText, "get correct text");
  
  newNode = ren.Render(newNode);
  assert.equal(newNode.textContent, dstText, "render twice and keep escaping");
});
QUnit.test("render a hr object", function( assert ) {
  setHTML();
  
  var goodExamples = ['---', '* * *', ' - - - '];
  var badExamples  = ['\\---', '* \\* *'];
  
  goodExamples.forEach(function(srcText) {
    var srcNode = createTextContainer(srcText);
    var newNode = ren.Render(srcNode);
    assert.equal(newNode.nodeName, "HR", "return <hr> for " + srcText);
  }, this);
  
  badExamples.forEach(function(srcText) {
    var srcNode = createTextContainer(srcText);
    var newNode = ren.Render(srcNode);
    assert.notEqual(newNode.nodeName, "HR", "not return <hr> for " + srcText);
  }, this);
});
QUnit.test("elevate to a list", function( assert ) {
  setHTML();
  
  var srcText = "1. *l*`o`~~r~~**e**[m](..)";
  var dstText = "lorem";
  
  var srcNode = createTextContainer(srcText);
  var newNode = ren.Render(srcNode);
  
  assert.equal(newNode.nodeName, "LI", "return a <li> element");
  assert.equal(newNode.parentNode.nodeName, "OL", "get an <ol> wrapper");
  assert.equal(newNode.textContent, dstText, "get correct text");
});
QUnit.test("elevate to a blockquote", function( assert ) {
  setHTML();
  
  var srcText = "> *l*`o`~~r~~**e**[m](..)";
  var dstText = "lorem";
  
  var srcNode = createTextContainer(srcText);
  var newNode = ren.Render(srcNode);
  
  assert.equal(srcNode, newNode, "keep the line block element");
  assert.equal(newNode.parentNode.nodeName, "BLOCKQUOTE", "get a <blockquote> wrapper");
  assert.equal(newNode.textContent, dstText, "get correct text");
});



///////////////////////////////////////////////////////////////
QUnit.module("IME(Editor)");
QUnit.test("deal with editors whose children is only one #text", function( assert ) {
  var ev = document.createEvent("KeyboardEvent");
  ev.which = ev.keyCode = 13;
  
  var srcText = "*l*`o`~~r~~**e**[m](..)";
  var dstText = "lorem";
  
  setHTML(srcText);
  ime.ProcessCurrentLine(ev);
  assert.equal(editor.firstChild.nodeName, "P",        "elevate text to block");
  assert.equal(editor.firstChild.textContent, dstText, "and render it");
});
