/// <reference path="Utils.ts" />
/// <reference path="Renderer/InlineRenderer.ts" />
/// <reference path="Renderer/BlockRenderer.ts" />
/// <reference path="Renderer/Inline/MarkdownRules.ts" />

//people <3 emoji
/// <reference path="Addon/EmojiAddon.ts" />

namespace MarkdownIME.Renderer{

namespace Pattern {
	export var codeblock = /^```\s*(\S*)\s*$/g;
}

export var inlineRenderer: InlineRenderer = new InlineRenderer();
export var blockRenderer : BlockRenderer  = new BlockRenderer();

Markdown.InlineRules.forEach(RuleName => {
    var Rule = Markdown[RuleName];
    inlineRenderer.addRule(new Rule());
})
inlineRenderer.addRule(new MarkdownIME.Addon.EmojiAddon());

blockRenderer.AddMarkdownRules();

/**
 * Make one Block Node beautiful!
 */
export function Render(node : HTMLElement) : HTMLElement {
	var html = Utils.trim(node.innerHTML);
	var match_result : Array<string>;
	var new_node : HTMLElement;
	
	console.log("Render", node, html);
	
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