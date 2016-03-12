/// <reference path="Renderer/InlineRenderer.ts" />
/// <reference path="Renderer/BlockRenderer.ts" />
/// <reference path="Renderer/Inline/MarkdownRules.ts" />

//people <3 emoji
/// <reference path="Addon/EmojiAddon.ts" />

namespace MarkdownIME.Renderer {
	export var inlineRenderer: InlineRenderer = new InlineRenderer();
	export var blockRenderer: BlockRenderer = new BlockRenderer();

	export var emojiRule = new MarkdownIME.Addon.EmojiAddon();

	Markdown.InlineRules.forEach(RuleName => {
		var Rule = Markdown[RuleName];
		inlineRenderer.addRule(new Rule());
	})
	inlineRenderer.addRule(emojiRule);

	blockRenderer.AddMarkdownRules();

	/**
	 * Make one Block Node beautiful!
	 */
	export function Render(node: Element): Element {
		var elevateResult = blockRenderer.Elevate(node);
		if (elevateResult) {
			if (!elevateResult.containerType.isTypable)
				return elevateResult.child;
			node = elevateResult.child;
		}

		inlineRenderer.RenderNode(node);
		return node;
	}

}
