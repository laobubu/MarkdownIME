/* global MarkdownIME */

/**
 * @param {HTMLDivElement} editor the div element
 * @param {string[]} lines
 */
function playMagic(editor, mdime_editor, lines) {
	var texts = lines.join("\n"), chIdx = 0, playing = true, line

	editor.innerHTML = "<p></p>"

	function ensureCaretPos() {
		line = editor.lastChild
		if (line.lastChild && line.lastChild.nodeName.toLowerCase() === 'br') {
			line.removeChild(line.lastChild)
		}
		var el = line.lastChild
		if (!el) {
			el = document.createTextNode("")
			line.appendChild(el)
		}
		MarkdownIME.DOM.setCaretAfter(el)
		return el
	}
	function startLine() {
		line = MarkdownIME.elt("p");
		editor.appendChild(line)
	}
	function nextChar() {
		if (!playing) return
		var ch = texts.charAt(chIdx), delay = 0

		if (ch === "\n") {
			delay = 150
			mdime_editor.doTransform(true)
			startLine()
		} else {
			var el = ensureCaretPos()

			if (ch === " ") {
				mdime_editor.doTransform(false)
				delay = 100
				el = ensureCaretPos()
			}

			if (!MarkdownIME.DOM.isTextNode(el)) {
				el = document.createTextNode(ch)
				line.appendChild(el)
			} else {
				el.textContent += ch
			}

			ensureCaretPos()
		}

		var peekChar = texts.charAt(++chIdx)
		if (!delay && (peekChar === ' ' || peekChar === '\n')) delay = 280
		if (chIdx < texts.length && playing) setTimeout(nextChar, delay || 25)
	}

	nextChar()

	return { stop: function () { playing = false } }
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
	mdime_editor = MarkdownIME.Enhance(editor);

	var shallPlay = ($(window).scrollTop() < $('#s2').offset().top);
	if (shallPlay) {
		var magic = playMagic(editor, mdime_editor, demotext || [
			"# Hello World 8-)",
			"Just **directly type in** your *Markdown* text like `*this*`, then press Enter or Space."
		]);
		editor.addEventListener("keydown", function () { magic.stop(); }, false);
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
bookmarklet.addEventListener('click', function (ev) {
	alert('Oops. This magic bookmarklet shall be opened from bookmark bar.')
	ev.preventDefault();
}, true);


setTimeout(function () { $('#s1>h1, #s1>p, #s1>nav').removeClass("hide"); }, 50);
setTimeout(function () { $(editor).removeClass("hide"); }, 850);

var $body = $('body');
var $window = $(window);
var $bizzarebg = $('#bizzarebg')[0];
$window.scroll(function () {
	var wst = $window.scrollTop();
	var wh = $window.innerHeight();

	var biz = 1 - wst / (wh * 0.5);
	if (biz < 0) biz = 0;
	$bizzarebg.style.opacity = biz.toString();
}).scroll();

$(editor).keyup(function () { $window.scroll() })
