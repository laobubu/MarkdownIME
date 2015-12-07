/* global editor */
/***
 * This script is unnecessary, just making page looks better.
 */

/**
 * Starts play a magic.
 * @param {div} editor - the editor
 * @param {string} text - text to be shown
 */
function demoStart(editor, text, callback) {
	var p = document.createElement("p");
	var tn = document.createTextNode("");
	var text_arr = text.split("");
	
	var selection = window.getSelection();
	var range = document.createRange();
	
	p.appendChild(tn);
	editor.appendChild(p);
	editor.focus();
	
	function next() {
		var ch = text_arr.shift();
		if (ch) {
			if (Math.random() > 0.7) ch += text_arr.shift() || "";  
			tn.textContent += ch;
			setTimeout(next, ~~(Math.random()*50+50));
		}
		
		range.selectNodeContents(tn);
		range.collapse(false);
		selection.removeAllRanges();
		selection.addRange(range);
		
		if (!ch && typeof(callback)=="function") callback(editor, text); 
	}
	next();
}

demoStart(editor, 
	"Try typing something markdownized " +
	"like **bold text**, `code`, [links](http://laobubu.net), " + 
	"then press Enter."
);

document.getElementById('bookmarklet').addEventListener('click', function(ev){
	alert('Oops. This magic bookmarklet shall be opened from bookmark bar.')
	ev.preventDefault();
}, true);