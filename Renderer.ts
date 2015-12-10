/// <reference path="Utils.ts" />

namespace MarkdownIME.Renderer{

namespace Pattern {
	export var InlineElement = [
		//NOTE process bold first, then italy.
		//NOTE safe way to get payload:
		//		((?:\\\_|[^\_])*[^\\])
		//		in which _ is the right bracer
		//$1 is something strange
		//$2 is the text
		{
			name: "bold",
			regex: /([^\\]|^)\*\*((?:\\\*|[^\*])*[^\\])\*\*/g,
			replacement: "$1<b>$2</b>"
		},
		{
			name: "italy",
			regex: /([^\\]|^)\*((?:\\\*|[^\*])*[^\\])\*/g,
			replacement: "$1<i>$2</i>"
		},
		{
			name: "code",
			regex: /([^\\]|^)`((?:\\`|[^`])*[^\\])`/g,
			replacement: "$1<code>$2</code>"
		},
		{
			name: "img with title",
			regex: /([^\\]|^)\!\[((?:\\\]|[^\]])*[^\\])?\]\(((?:\\[\)\s]|[^\)\s])*[^\\])\s+(&quot;|"|)((?:\\\)|[^\)])*[^\\])\4\)/g, //$4 is used to check &quot; for title
			replacement: '$1<img alt="$2" src="$3" title="$5">'
		},
		{
			name: "img",
			regex: /([^\\]|^)\!\[((?:\\\]|[^\]])*[^\\])?\]\(((?:\\\)|[^\)])*[^\\])\)/g,
			replacement: '$1<img alt="$2" src="$3">'
		},
		{
			name: "link with title",
			regex: /([^\\]|^)\[((?:\\\]|[^\]])*[^\\])\]\(((?:\\[\)\s]|[^\)\s])*[^\\])\s+(&quot;|"|)((?:\\\)|[^\)])*[^\\])\4\)/g, //$4 is used to check &quot; for title
			replacement: '$1<a href="$3" title="$5">$2</a>'
		},
		{
			name: "link",
			regex: /([^\\]|^)\[((?:\\\]|[^\]])*[^\\])\]\(((?:\\\)|[^\)])*[^\\])\)/g,
			replacement: '$1<a src="$3">$2</a>'
		},
		{
			//NOTE put this on the tail!
			name: "escaping",
			regex: /\\([\*`\(\)\[\]])/g,
			replacement: "$1"
		},
		{
			//NOTE put this on the tail!
			name: "&nbsp convert",
			regex: /  /g,
			replacement: " &nbsp;"
		}
	];
	
	export var hr = /^\s*([\-\=\*])(\s*\1){2,}\s*$/g;
	
	export var header = /^(#+)\s*(.+?)\s*\1?$/g;
	
	export var ul = /^ ?( *)[\*\+\-]\s+(.*)$/g;
	export var ol = /^ ?( *)\d+\.\s*(.*)$/g;
	
	export var blockquote = /^(\>*)\s*(.*)$/g;
}

/**
 * Render inline objects, HTML in HTML out
 * @note Remove redundant space and convert '&nbsp;' to ' ' before use this function. 
 * @note This function will turn ' ' into '&nbsp;' when return.
 */
export function RenderInlineHTML(html : string) : string {
	var rtn = html;
	var i, rule;
	for (i = 0; i< Pattern.InlineElement.length; i++) {
		rule = Pattern.InlineElement[i];
		if ((typeof rule.method) == "function") {
			rtn = rule.method(rtn);
		} else {
			rtn = rtn.replace(rule.regex, rule.replacement);
		}
	}
	return rtn;
}

/**
 * Make one Block Node beautiful!
 */
export function Render(node : HTMLElement) : HTMLElement {
	var html = node.innerHTML.trim().replace(/\s{2,}/g,' ').replace('&nbsp;',' ');
	var match_result : Array<string>;
	var new_node : HTMLElement;
	var big_block : Node;
	
	console.log("Render", node, html);
	
	// hr 
	Pattern.hr.lastIndex = 0;
	match_result = Pattern.hr.exec(html);
	if (match_result) {
		new_node = node.ownerDocument.createElement("hr");
		node.parentNode.replaceChild(new_node, node);
		return new_node;
	}
	
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