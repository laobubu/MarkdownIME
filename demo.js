/* global MarkdownIME */

/**
 * Starts play a magic.
 * @param {HTMLDivElement} editor the div element
 * @param {string} text text to be shown
 * @param {(HTMLDivElement,string)=>void} callback (optional) called when the magic is end
 * @param {HTMLElement} lineObject (optional) the container of current line.
 */
function demoStartOneLine(editor, text, callback, lineObject) {
	var p = lineObject || document.createElement("p");
	var text_arr = text.split("");

	var selection = window.getSelection();
	var range = document.createRange();

    var going = true;
    var NBSP = String.fromCharCode(160);

	editor.appendChild(p);
	editor.focus();

	function next() {
        if (!going) return;

		var p = editor.lastChild;
		if (p.firstChild && p.firstChild.nodeName == "BR")
			p.removeChild(p.childNodes[0]);

		var ch = text_arr.shift();
		if (ch) {
			if (ch != ' ' && text_arr[0] != ' ')
				ch += text_arr.shift() || "";
			p.innerHTML += ch.replace(/ /g, NBSP);
			setTimeout(next, (ch == ' ') ? 250 : 60);
		}

		range.selectNodeContents(p.lastChild || p);
		range.collapse(false);
		selection.removeAllRanges();
		selection.addRange(range);

		if (!ch) {
			(typeof (callback) == "function") && callback(editor, text);
		} else if (ch == ' ') {
			//emulate space keyup
			setTimeout(function() {
				mdime_editor.inputHandler();

				p.innerHTML = p.innerHTML.replace(/(\w)&nbsp;(?=[^&\s\r\n])/g, '$1 ');

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
 * @param {HTMLDivElement} editor the div element
 * @param {string[]} stringArray the text lines.
 * @param {(editor:HTMLDivElement)=>void} callback the callback when the magic is end
 */
function demoStartLines(editor, stringArray, callback) {
    var going = true;

    var currentMagic;
    var currentLineText;

    var fakeEnterEvent = { preventDefault: function() { } };

    function startNextLine() {
        if (!going) return;
        currentLineText = stringArray.shift();
        if (typeof currentLineText == "string") {
			try { mdime_editor.ProcessCurrentLine(fakeEnterEvent); } catch (e) { }
			(editor.lastChild) && editor.removeChild(editor.lastChild);
            currentMagic = demoStartOneLine(editor, currentLineText, startNextLine);
        } else {
            (typeof (callback) == "function") && callback(editor);
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
var demotext;

var loading = "|/-\\";
var loading_i = 0;

setTimeout(function showStart() {
	if (typeof MarkdownIME !== "object") {
		setTimeout(showStart, 100);
		editor.innerHTML = "<p>Loading... " + loading.charAt(loading_i++) + " </p>";
		if (loading_i >= loading.length) loading_i = 0;
		return;
	}
	editor.innerHTML = "";
	MarkdownIME.Renderer.inlineRenderer.addRule(new MarkdownIME.Addon.MathAddon())
	mdime_editor = MarkdownIME.Enhance(editor);

	var shallPlay = ($(window).scrollTop() < $('#s2').offset().top);
	if (shallPlay) {
		var magic = demoStartLines(editor, demotext || [
			"# Hello World 8-)",
			"Just **directly type in** your *Markdown* text like `*this*`, then press Enter or Space."
		]);
		editor.addEventListener("keydown", function() { magic.stop(); }, false);
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
bookmarklet.setAttribute('href', 'javascript:' + encodeURIComponent(bookmarklet_script));
bookmarklet.addEventListener('click', function(ev) {
	alert('Oops. This magic bookmarklet shall be opened from bookmark bar.')
	ev.preventDefault();
}, true);


setTimeout(function() { $('#s1>h1, #s1>p, #s1>nav').removeClass("hide"); }, 50);
setTimeout(function() { $(editor).removeClass("hide"); }, 850);

var $body = $('body');
var $window = $(window);
var $bizzarebg = $('#bizzarebg')[0];
$window.scroll(function() {
	var wst = $window.scrollTop();
	var wh = $window.innerHeight();

	var biz = 1 - wst / (wh * 0.5);
	if (biz < 0) biz = 0;
	$bizzarebg.style.opacity = biz.toString();
}).scroll();

$(editor).keyup(function() { $window.scroll() })
