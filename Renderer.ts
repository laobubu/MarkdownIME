/// <reference path="Utils.ts" />

namespace MarkdownIME.Renderer{

namespace Pattern {
	//NOTE process bold first, then italy.
	//$1 is something strange
	//$2 is the text
	export var bold = /([^\\]|^)\*\*((?:\\\*|[^\*])*[^\\])\*\*/g;
	export var italy = /([^\\]|^)\*((?:\\\*|[^\*])*[^\\])\*/g;
	export var code = /([^\\]|^)`((?:\\`|[^`])*[^\\])`/g;
	
	export var header = /^(#+)\s*(.+?)\s*\1?$/g;
	
	export var escaping = /\\([\*`])/g;
}

/**
 * Render inline objects, HTML in HTML out
 */
export function RenderInlineHTML(html : string) : string {
	var rtn = html;
	rtn = rtn.replace(Pattern.bold, "$1<b>$2</b>");
	rtn = rtn.replace(Pattern.italy, "$1<i>$2</i>");
	rtn = rtn.replace(Pattern.code, "$1<code>$2</code>");
	
	rtn = rtn.replace(Pattern.escaping, '$1');
	return rtn;
}

/**
 * Make one Block Node beautiful!
 */
export function Render(node : HTMLElement) : HTMLElement {
	var html = node.innerHTML.trim();
	var match_result : Array<string>;
	var rtn : HTMLElement;
	
	// header 
	match_result = Pattern.header.exec(html);
	if (match_result) {
		rtn = node.ownerDocument.createElement("h" + match_result[1].length);
		rtn.innerHTML = RenderInlineHTML(match_result[2]);
		node.parentNode.replaceChild(rtn, node);
		
		return rtn;
	}
	
	node.innerHTML = RenderInlineHTML(html);
	return node;
}

}