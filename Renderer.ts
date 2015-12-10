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
	
	export var ul = /^ ?( *)[\*\+\-]\s+(.*)$/g;
	export var ol = /^ ?( *)\d+\.\s*(.*)$/g;
	
	export var blockquote = /^(\>*)\s*(.*)$/g;
	
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
	var new_node : HTMLElement;
	var big_block : Node;
	
	console.log("Render", node, html);
	
	// header 
	Pattern.header.lastIndex = 0;
	match_result = Pattern.header.exec(html);
	if (match_result) {
		new_node = node.ownerDocument.createElement("h" + match_result[1].length);
		new_node.innerHTML = RenderInlineHTML(match_result[2]);
		node.parentNode.replaceChild(new_node, node);
		return new_node;
	}
	
	// ul
	Pattern.ul.lastIndex = 0;
	match_result = Pattern.ul.exec(html);
	if (match_result) {
		new_node = node.ownerDocument.createElement("li");
		new_node.innerHTML = RenderInlineHTML(match_result[2]);
		node.parentNode.insertBefore(new_node, node);
		
		big_block = Utils.get_or_create_prev_block(new_node, "UL");
		Utils.wrap(big_block, new_node);
		
		node.parentNode.removeChild(node);
		return new_node;
	}
	
	// ol
	Pattern.ol.lastIndex = 0;
	match_result = Pattern.ol.exec(html);
	if (match_result) {
		new_node = node.ownerDocument.createElement("li");
		new_node.innerHTML = RenderInlineHTML(match_result[2]);
		node.parentNode.insertBefore(new_node, node);
		
		big_block = Utils.get_or_create_prev_block(new_node, "OL");
		Utils.wrap(big_block, new_node);
		
		node.parentNode.removeChild(node);
		return new_node;
	}
	
	node.innerHTML = RenderInlineHTML(html);
	return node;
}

}