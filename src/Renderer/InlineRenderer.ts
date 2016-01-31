/// <reference path="../Utils.ts" />
/// <reference path="../VDom.ts" />

namespace MarkdownIME.Renderer {
	/**
	 * IInlineRendererReplacement
	 * @description can be used to implement customized replacement.
	 */
	export interface IInlineRule {
		name: string;
		render(tree: DomChaos);
		unrender?(tree: DomChaos);
	}
	
	/** the render rule for Markdown simple inline wrapper like *emphasis* ~~and~~ `inline code` */
	export class InlineWrapperRule implements IInlineRule {
		name: string;

		nodeName: string;
		leftBracket: string;
		rightBracket: string;

		nodeAttr = {};

		regex: RegExp; //for Markdown syntax like **(.+)**
		regex2_L: RegExp;	//for HTML tags like <b>
		regex2_R: RegExp;	//for HTML tags like </b>

		constructor(nodeName: string, leftBracket: string, rightBracket?: string) {
			this.nodeName = nodeName.toUpperCase();
			this.leftBracket = leftBracket;
			this.rightBracket = rightBracket || leftBracket;
			this.name = this.nodeName + " with " + this.leftBracket;

			this.regex = new RegExp(
				'([^\\\\]|^)' + Utils.text2regex(this.leftBracket) + '(.*?[^\\\\])' + Utils.text2regex(this.rightBracket),
				"g"
			);
			this.regex2_L = new RegExp(
				"^<" + this.nodeName + "(\\s+[^>]*)?>$",
				"gi"
			);
			this.regex2_R = new RegExp(
				"^</" + this.nodeName + ">$",
				"gi"
			);
		}

		render(tree: DomChaos) {
			tree.replace(this.regex, (whole, leading, wrapped) => {
				if (wrapped === this.rightBracket) return whole; //avoid something like ``` or ***
				return leading + Utils.generateElementHTML(this.nodeName, this.nodeAttr, Utils.text2html(wrapped))
			});
		}

		unrender(tree: DomChaos) {
			tree.screwUp(this.regex2_L, this.leftBracket);
			tree.screwUp(this.regex2_R, this.rightBracket);
		}
	}
	
	/**
	 * Use RegExp to do replace.
	 * One implement of IInlineRendererReplacement.
	 */
	export class InlineRegexRule implements IInlineRule {
		name: string;
		regex : RegExp;
		replacement : any;
		
		constructor(name: string, regex: RegExp, replacement: any) {
			this.name = name;
			this.regex = regex;
			this.replacement = replacement;
		}
		
		render(tree: DomChaos) {
			tree.replace(this.regex, this.replacement);
		}

		unrender(tree: DomChaos) {
			//not implemented
		}
	}
	
	/**
	 * InlineRenderer: Renderer for inline objects
	 * 
	 *  [Things to be rendered] -> replacement chain -> [Renderer output]
	 *  (you can also add your custom inline replacement) 
	 * 
	 * @example 
	 * var renderer = new MarkdownIME.Renderer.InlineRenderer();
	 * renderer.AddMarkdownRules();
	 * renderer.RenderHTML('**Hello Markdown**');
	 * // returns "<b>Hello Markdown</b>"
	 */
	export class InlineRenderer {
		
		/** Suggested Markdown Replacement */
		static markdownReplacement: IInlineRule[] = [
			//NOTE process bold first, then italy.
			
			new InlineRegexRule(
				"img with title",
				/\!\[(.*?)\]\(([^\)\s]+)\s+("?)([^\)]+)\3\)/g,
				function(a, alt, src, b, title) {
					return Utils.generateElementHTML("img", { alt: alt, src: src, title: title })
				}
			),
			new InlineRegexRule(
				"img",
				/\!\[(.*?)\]\(([^\)]+)\)/g,
				function(a, alt, src) {
					return Utils.generateElementHTML("img", { alt: alt, src: src })
				}
			),
			new InlineRegexRule(
				"link with title",
				/\[(.*?)\]\(([^\)\s]+)\s+("?)([^\)]+)\3\)/g,
				function(a, text, href, b, title) {
					return Utils.generateElementHTML("a", { href: href, title: title }, Utils.text2html(text))
				}
			),
			new InlineRegexRule(
				"link",
				/\[(.*?)\]\(([^\)]+)\)/g,
				function(a, text, href) {
					return Utils.generateElementHTML("a", { href: href }, Utils.text2html(text))
				}
			),
			new InlineWrapperRule("del", "~~"),
			new InlineWrapperRule("strong", "**"),
			new InlineWrapperRule("em", "*"),
			new InlineWrapperRule("code", "`")
		];
		
		/** Rules for this Renderer */
		rules: IInlineRule[] = [];
		
		/** Render, on a DomChaos object */
		public RenderChaos(tree: DomChaos) {
			tree.screwUp(/^<!--escaping-->$/g, "\\");
			for (let i = 0; i < this.rules.length; i++) {
				let rule = this.rules[i];
				if (typeof rule.unrender === "function")
					rule.unrender(tree);
			}
			for (let i = 0; i < this.rules.length; i++) {
				let rule = this.rules[i];
				rule.render(tree);
			}
			tree.replace(/\\([^\w\s])/g, (whole, char) => `<!--escaping-->${char}`);
		}
		
		/** Render a HTML part, returns a new HTML part */
		public RenderHTML(html: string): string {
			var tree: DomChaos = new DomChaos();
			tree.setHTML(html);
			this.RenderChaos(tree);
			return tree.getHTML();
		}
		
		/**
		 * Markdown Text to HTML 
		 * @note after escaping, `\` will become `\u001B`.
         * @return {string} HTML Result
		 */
		public RenderText(text: string): string {
			return this.RenderHTML(Utils.text2html(text));
		}
        
        /**
         * do render on a textNode
         * @note make sure the node is a textNode; function will NOT check!
		 * @return the output nodes
         */
        public RenderTextNode(node : Node) : Node[] {
            var docfrag = node.ownerDocument.createElement('div');
            var nodes: Node[];
            docfrag.textContent = node.textContent;
			nodes = this.RenderNode(docfrag);
            while(docfrag.lastChild) {
                node.parentNode.insertBefore(docfrag.lastChild, node.nextSibling);
            }
            node.parentNode.removeChild(node);
            return nodes;
        }
		
		/**
		 * do render on a Node
		 * @return the output nodes
		 */
		public RenderNode(node : HTMLElement) : Node[] {
			console.log('Inline renderer on', node);
			var tree: DomChaos = new DomChaos();
			tree.cloneNode(node)
			this.RenderChaos(tree);
			tree.applyTo(node);
			return [].slice.call(node.childNodes,0);
		}
		
		/** Add basic Markdown rules into this InlineRenderer */
		public AddMarkdownRules() : InlineRenderer {
			this.rules = InlineRenderer.markdownReplacement.concat(this.rules);
			return this;
		}
		
		/** Add one extra replacing rule */
		public AddRule(rule : IInlineRule) {
			this.rules.push(rule);
		}
	}
}
