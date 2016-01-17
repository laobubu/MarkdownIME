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




///////////////////////////////////////////////////////////////

var oldChildren = [];
var newChildren = [];
QUnit.module("DOMChaos", {
	afterEach: (assert) => {
		oldChildren.forEach((node)=>{
			if (node.parentNode !== editor) return;
			if (node.nodeType == 3) { //textNode
				var wrap = document.createElement("span");
				node.parentNode.insertBefore(wrap, node);
				wrap.appendChild(node);
				node = wrap;
			}
			if (node.nodeType == 1) { //element
				node.style.backgroundColor = "#FFC";
			}
		})
	}
});
QUnit.test("Apply without any change", function( assert ) {
	var chaos = new MarkdownIME.DomChaos();
	
	var testHTML = "A <b>B</b> <i>C</i>";
	setHTML(testHTML);
	oldChildren = [].slice.call(editor.childNodes);
	chaos.cloneNode(editor);
	chaos.applyTo(editor);
	newChildren = [].slice.call(editor.childNodes);
	
	assert.deepEqual(newChildren, oldChildren, "same children");
});
QUnit.test("Insert something", function( assert ) {
	var chaos = new MarkdownIME.DomChaos();
	
	var testHTML  = "A <b>B</b> <i>C</i>";
	setHTML(testHTML);
	oldChildren = [].slice.call(editor.childNodes);
	
	var testHTML2 = "A <b>B</b> something <i>C</i>";
	chaos.setHTML(testHTML2);
	chaos.applyTo(editor);
	newChildren = [].slice.call(editor.childNodes);
	
	assert.notEqual(newChildren[2], oldChildren[2], "the 3rd child changed");
	newChildren.splice(2,1);
	oldChildren.splice(2,1);
	assert.deepEqual(newChildren, oldChildren, "others remain");
});
QUnit.test("Wrap something", function( assert ) {
	var chaos = new MarkdownIME.DomChaos();
	
	var testHTML  = "A <b>B</b> <i>C</i>";
	setHTML(testHTML);
	oldChildren = [].slice.call(editor.childNodes);
	
	var testHTML2 = "A <i><b>B</b></i> <i>C</i>";
	chaos.setHTML(testHTML2);
	chaos.applyTo(editor);
	newChildren = [].slice.call(editor.childNodes);
	
	assert.notEqual(newChildren[1], oldChildren[1], "the 2nd child changed");
	assert.notEqual(newChildren[1].parentNode, oldChildren[1], "the 2nd child moved into a wrapper");
	newChildren.splice(1,1);
	oldChildren.splice(1,1);
	assert.deepEqual(newChildren, oldChildren, "others remain");
});
QUnit.test("Delete something", function( assert ) {
	var chaos = new MarkdownIME.DomChaos();
	
	var testHTML  = "A <b>B</b> <i>C</i>";
	setHTML(testHTML);
	oldChildren = [].slice.call(editor.childNodes);
	
	var testHTML2 = "A  <i>C</i>"; //notice that there are 2 spaces
	chaos.setHTML(testHTML2);
	chaos.applyTo(editor);
	newChildren = [].slice.call(editor.childNodes);
	
	assert.equal(newChildren.length, 2, "get two childNodes");
	assert.strictEqual(newChildren[newChildren.length - 1], oldChildren[oldChildren.length - 1], "last one survived");
});
