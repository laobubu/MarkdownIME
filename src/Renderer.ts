/// <reference path="Utils.ts" />
/// <reference path="Renderer/InlineRenderer.ts" />

namespace MarkdownIME.Renderer{

namespace Pattern {
	export var hr = /^\s*([\-\=\*])(\s*\1){2,}\s*$/g;
	
	export var header = /^(#+)\s*(.+?)\s*\1?$/g;
	
	export var ul = /^ ?( *)[\*\+\-]\s+(.*)$/g;
	export var ol = /^ ?( *)\d+\.\s*(.*)$/g;
	
	export var blockquote = /^(\>|&gt;)\s*(.*)$/g;
	
	export var codeblock = /^```\s*(\S*)\s*$/g;
}

var inlineRenderer: InlineRenderer = InlineRenderer.makeMarkdownRenderer();

/**
 * Make one Block Node beautiful!
 */
export function Render(node : HTMLElement) : HTMLElement {
	var html = Utils.trim(node.innerHTML);
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
		new_node.innerHTML = inlineRenderer.RenderHTML(match_result[2]);
		node.parentNode.replaceChild(new_node, node);
		return new_node;
	}
	
	// ul
	Pattern.ul.lastIndex = 0;
	match_result = Pattern.ul.exec(html);
	if (match_result) {
		new_node = node.ownerDocument.createElement("li");
		new_node.innerHTML = inlineRenderer.RenderHTML(match_result[2]);
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
		new_node.innerHTML = inlineRenderer.RenderHTML(match_result[2]);
		node.parentNode.insertBefore(new_node, node);
		
		big_block = Utils.get_or_create_prev_block(new_node, "OL");
		Utils.wrap(big_block, new_node);
		
		node.parentNode.removeChild(node);
		return new_node;
	}
	
	//blockquote
	Pattern.blockquote.lastIndex = 0;
	match_result = Pattern.blockquote.exec(html);
	if (match_result) {
		big_block = Utils.get_or_create_prev_block(node, "blockquote");
		Utils.wrap(big_block, node);
		
		html = match_result[2];
	}
	
	//codeblock
	Pattern.codeblock.lastIndex = 0;
	match_result = Pattern.codeblock.exec(html);
	if (match_result) {
		big_block = node.ownerDocument.createElement('pre');
		
		if (match_result[1].length) {
			//language is told
			var typ = node.ownerDocument.createAttribute("lang");
			typ.value = match_result[1];
			big_block.attributes.setNamedItem(typ);
		}
		
		(<HTMLElement>big_block).innerHTML = "<br>";
		node.parentNode.replaceChild(big_block, node);
		
		return (<HTMLElement>big_block);
	}
	
	node.innerHTML = inlineRenderer.RenderHTML(html);
	return node;
}

}