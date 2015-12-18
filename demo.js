/* global MarkdownIME */
/***
 * This script is unnecessary, just making page looks better.
 */

/**
 * Starts play a magic.
 * @param {div} editor - the editor
 * @param {string} text - text to be shown
 */
function demoStart(editor, text, _callback) {
	var p = document.createElement("p");
	var text_arr = text.split("");
	
	var fakeSpaceEvent = {keyCode: 32, preventDefault: function(){}};
	
	var selection = window.getSelection();
	var range = document.createRange();
	
	var callback = _callback;
	
	editor.appendChild(p);
	editor.focus();
	
	function next() {
		var p = editor.lastChild;
		if (p.childNodes.length == 1 && p.firstChild.nodeName == "BR")
			p.removeChild(p.childNodes[0]);
		
		var ch = text_arr.shift();
		if (ch) {
			if (ch != ' ' && text_arr[0] != ' ')
				ch += text_arr.shift() || "";
			p.innerHTML += ch;
			setTimeout(next, (ch==' ')?300:100);
		}
		
		range.selectNodeContents(p.lastChild || p);
		range.collapse(false);
		selection.removeAllRanges();
		selection.addRange(range);
		
		if (!ch) {
			(typeof(callback)=="function") && callback(editor, text);
		} else if (ch == ' ') {
			//emulate space keyup
			setTimeout(function() {
				mdime_editor.keyupHandler(fakeSpaceEvent);
				p.innerHTML += ' ';
				
				range.selectNodeContents(p.lastChild || p);
				range.collapse(false);
				selection.removeAllRanges();
				selection.addRange(range);
			}, 250);
		}
	}
	next();
}


//////////////////////////MAIN MAGIC
var editor = document.getElementById('editor');
var mdime_editor = MarkdownIME.Enhance(editor);

setTimeout(function() {
	demoStart(editor, 
		"# Hello World", 
		function() {
			try{mdime_editor.ProcessCurrentLine();} catch(e){}
			editor.removeChild(editor.lastChild);
			demoStart(editor, 
				"Just **directly type in** " +
				"your *Markdown* text like `\\*this\\*`, " + 
				"then press Enter or Space."
			)
		}
	);
}, 2000);

///////////////////////////BOOKMARKLET
var mdimejs = document.getElementById('s_mdime').getAttribute('src');
var bookmarklet_script = 
"(function(){" + 
	"var s=document.createElement('script');" + 
	"s.setAttribute('type','text/javascript');" + 
	"s.setAttribute('src','" + mdimejs + "');" + 
	"s.onload=function(){MarkdownIME.Bookmarklet(window)};" + 
	"document.documentElement.appendChild(s);" + 
"})()";
var bookmarklet = document.getElementById('bookmarklet');
bookmarklet.setAttribute('src', 'javascript:' + encodeURIComponent(bookmarklet_script));
bookmarklet.addEventListener('click', function(ev){
	alert('Oops. This magic bookmarklet shall be opened from bookmark bar.')
	ev.preventDefault();
}, true);



setTimeout(function(){
	$('#s1>*').removeClass("hide");
}, 50);

var $body = $('body');
var $window = $(window);
var $bizzarebg = $('#bizzarebg')[0];
$window.scroll(function(){
	var biz = 1 - $window.scrollTop() / ($window.innerHeight()*0.5);
	if (biz < 0) biz = 0;
	$bizzarebg.style.opacity = biz.toString();
}).scroll();


// a tweak to scroll smooth for bookmarks
function smoothGo(ev){
	ev.preventDefault();
	var t=$(document.getElementsByName(this.getAttribute("href").substr(1))[0]);
	var pos=t.offset().top;
	$("html, body").animate({scrollTop: pos+'px'}, 500);
}
$('a').each(function(i,e){
	if ((e.getAttribute("href")||"").indexOf('#')!=0) return;
	if (e.hasAttribute('data-sg-enhanced')) return;
	e.setAttribute('data-sg-enhanced', '1');
	e.addEventListener('click', smoothGo, false);
})