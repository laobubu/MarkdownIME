/// <reference path="Utils.ts" />
/// <reference path="Renderer/InlineRenderer.ts" />
/// <reference path="Renderer/BlockRenderer.ts" />

//people <3 emoji
/// <reference path="Addon/EmojiAddon.ts" />

namespace MarkdownIME.Renderer{

namespace Pattern {
	export var codeblock = /^```\s*(\S*)\s*$/g;
}

export var inlineRenderer: InlineRenderer = new InlineRenderer();
export var blockRenderer : BlockRenderer  = new BlockRenderer();

inlineRenderer.AddMarkdownRules();
inlineRenderer.AddRule(new MarkdownIME.Addon.EmojiAddon());

blockRenderer.AddMarkdownRules();

/**
 * Make one Block Node beautiful!
 */
export function Render(node : HTMLElement) : HTMLElement {
	var html = Utils.trim(node.innerHTML);
	var match_result : Array<string>;
	var new_node : HTMLElement;
	var big_block : Node;
	
	console.log("Render", node, html);
	
	//codeblock
	match_result = Pattern.codeblock.exec(html);
	if (match_result) {
		big_block = node.ownerDocument.createElement('pre');
		
		if (match_result[1].length) {
			//language is told
			var typ = node.ownerDocument.createAttribute("lang");
			typ.value = match_result[1];
			big_block.attributes.setNamedItem(typ);
		}
		
		(<HTMLElement>big_block).innerHTML = '<br data-mdime-bogus="true">';
		node.parentNode.replaceChild(big_block, node);
		
		return (<HTMLElement>big_block);
	}
	
	var elevateResult = blockRenderer.Elevate(node);
	if (elevateResult) {
		if (!elevateResult.containerType.isTypable) 
			return <HTMLElement>elevateResult.child;
		node = <HTMLElement>elevateResult.child;
	}
	
	inlineRenderer.RenderNode(node);
	return node;
}

}