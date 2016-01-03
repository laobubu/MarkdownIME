/* global MarkdownIME */

/**
 * Starts play a magic.
 * @param {div} editor the div element
 * @param {string} text text to be shown
 * @param {function(editor,text)} callback (optional) called when the magic is end
 * @param {HTMLElement} lineObject (optional) the container of current line.
 */
function demoStartOneLine(editor, text, callback, lineObject) {
	var p = lineObject || document.createElement("p");
	var text_arr = text.split("");
	
	var fakeSpaceEvent = {keyCode: 32, preventDefault: function(){}};
	
	var selection = window.getSelection();
	var range = document.createRange();
    
    var going = true;
    var NBSP = String.fromCharCode(160);
	
	editor.appendChild(p);
	editor.focus();
	
	function next() {
        if (!going) return;
        
		var p = editor.lastChild;
		if (p.childNodes.length == 1 && p.firstChild.nodeName == "BR")
			p.removeChild(p.childNodes[0]);
		
		var ch = text_arr.shift();
		if (ch) {
			if (ch != ' ' && text_arr[0] != ' ')
				ch += text_arr.shift() || "";
			p.innerHTML += ch.replace(/ /g, NBSP);
			setTimeout(next, (ch==' ')?250:60);
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
                
			    p.innerHTML = p.innerHTML.replace(/(\w)&nbsp;(?=[^&\s\r\n]{3})/g, '$1 ');
				
				range.selectNodeContents(p.lastChild || p);
				range.collapse(false);
				selection.removeAllRanges();
				selection.addRange(range);
			}, 200);
		}
	}
	next();
    
    return {
        stop: function() { going = false; },
        next: next
    }
}

/**
 * Start a script playing.
 * @param {div} editor the div element
 * @param {string[]} stringArray the text lines.
 * @param {function(editor)} _callback the callback when the magic is end
 */
function demoStartLines(editor, stringArray, callback) {
    var going = true;
    
    var currentMagic;
    var currentLineText;
    
    var fakeEnterEvent = {preventDefault: function(){}};
    
    function startNextLine() {
        if (!going) return;
        currentLineText = stringArray.shift();
        if (typeof currentLineText == "string") {
			try{ mdime_editor.ProcessCurrentLine(fakeEnterEvent); } catch(e){ }
			(editor.lastChild) && editor.removeChild(editor.lastChild);
            currentMagic = demoStartOneLine(editor, currentLineText, startNextLine);
        } else {
            (typeof(callback)=="function") && callback(editor);
        }
    }
    
    startNextLine();
    
    return {
        stop: function() { if (!going) return; going = false; currentMagic.stop(); },
        next: function() { currentMagic.next(); }
    }
}


//////////////////////////MAIN MAGIC
var editor = document.getElementById('editor');
var mdime_editor;

setTimeout(function showStart() {
	if (typeof MarkdownIME !== "object") {
		setTimeout(showStart, 100);
		editor.innerHTML = "<p>Loading...</p>";
		return;
	}
	editor.innerHTML = "";
	mdime_editor = MarkdownIME.Enhance(editor);
	if (!window.location.hash) {
		var magic = demoStartLines(editor, [
			"# Hello World", 
			"Just **directly type in** your *Markdown* text like `\\*this\\*`, then press Enter or Space."
		]);
		editor.addEventListener("keydown", function(){magic.stop();}, false);
	}
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

////////////TOC
var $toc = $('#toc');
(function makeTOC(parent) {
	var titles = $(parent).children('h1,h2,h3,h4,h5');
	titles.each(function(i,ele){
		var anchor = document.createElement('a');
		anchor.name = (ele.textContent);
		ele.insertBefore(anchor, ele.firstChild);
		
		var link = document.createElement('a');
		link.textContent = ele.textContent;
		link.href = '#' + encodeURIComponent(anchor.name)
		link.style.marginLeft = (1 * (ele.nodeName.substr(1) - 2)) + 'em';
		
		$toc.append(link);
	})
})('#s2');


setTimeout(function(){
	$('#s1>*').removeClass("hide");
}, 50);

var $body = $('body');
var $window = $(window);
var $bizzarebg = $('#bizzarebg')[0];
$window.scroll(function(){
	var wst = $window.scrollTop();
	var wh = $window.innerHeight();
	
	var biz = 1 - wst / (wh*0.5);
	if (biz < 0) biz = 0;
	$bizzarebg.style.opacity = biz.toString();
	
	$toc.css({top: Math.max(wh-wst,0) + 'px'})
}).scroll();


// a tweak to scroll smooth for bookmarks
function smoothGo(ev){
	var name = decodeURIComponent(this.getAttribute("href").substr(1));
	if (history.pushState) {
		history.pushState(null, name, this.getAttribute("href"));
		ev.preventDefault();
	}
	var t=$(document.getElementsByName(name)[0]);
	var pos=t.offset().top;
	$("html, body").animate({scrollTop: pos+'px'}, 500);
}
$('a').each(function(i,e){
	if ((e.getAttribute("href")||"").indexOf('#')!=0) return;
	if (e.hasAttribute('data-sg-enhanced')) return;
	e.setAttribute('data-sg-enhanced', '1');
	e.addEventListener('click', smoothGo, false);
})