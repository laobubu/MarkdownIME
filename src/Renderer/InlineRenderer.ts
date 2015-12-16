/// <reference path="../Utils.ts" />

namespace MarkdownIME.Renderer {
	/**
	 * IInlineRendererReplacement
	 * @description can be used to implement customized replacement. Use [regex, replacement] or [method : func(text)]
	 */
	export interface IInlineRendererReplacement {
		name: string;
		
		regex? : RegExp;
		replacement? : any;
		
		method?(text: string) : string;
	}
	
	/**
	 * InlineRenderer: Renderer for inline objects
	 * 
	 *  [Things to be rendered] -> replacement chain -> [Renderer output]
	 *  (you can also add your custom inline replacement) 
	 * 
	 * @example MarkdownIME.Renderer.InlineRenderer.makeMarkdownRenderer().RenderHTML('**Hello Markdown**')
	 */
	export class InlineRenderer {
		
		/** Suggested Markdown Replacement */
		static markdownReplacement : IInlineRendererReplacement[] = [
			//NOTE process bold first, then italy.
			//NOTE safe way to get payload:
			//		((?:\\\_|[^\_])*[^\\])
			//		in which _ is the right bracket char
			
			//Preproccess
			{
				name: "escaping",
				regex: /(\\|<!--escaping-->)([\*`\(\)\[\]\~\\])/g,
				replacement: function(a, b, char) { return "<!--escaping-->&#" + char.charCodeAt(0) + ';' }
			},
			{
				name: "turn &nbsp; into spaces",
				regex: /&nbsp;/g,
				replacement: String.fromCharCode(160)
			},
			{
				name: 'turn &quot; into "s',
				regex: /&quot;/g,
				replacement: '"'
			},
			
			//Basic Markdown Replacements
			{
				name: "strikethrough",
				regex: /~~([^~]+)~~/g,
				replacement: "<del>$1</del>"
			},
			{
				name: "bold",
				regex: /\*\*([^\*]+)\*\*/g,
				replacement: "<b>$1</b>"
			},
			{
				name: "italy",
				regex: /\*([^\*]+)\*/g,
				replacement: "<i>$1</i>"
			},
			{
				name: "code",
				regex: /`([^`]+)`/g,
				replacement: "<code>$1</code>"
			},
			{
				name: "img with title",
				regex: /\!\[([^\]]*)\]\(([^\)\s]+)\s+("?)([^\)]+)\3\)/g,
				replacement: function(a,alt,src,b,title){
					return Utils.generateElementHTML("img",{alt:alt,src:src,title:title})
				}
			},
			{
				name: "img",
				regex: /\!\[([^\]]*)\]\(([^\)]+)\)/g,
				replacement: function(a,alt,src){
					return Utils.generateElementHTML("img",{alt:alt,src:src})
				}
			},
			{
				name: "link with title",
				regex: /\[([^\]]*)\]\(([^\)\s]+)\s+("?)([^\)]+)\3\)/g,
				replacement: function(a,text,href,b,title){
					return Utils.generateElementHTML("a",{href:href,title:title},text)
				}
			},
			{
				name: "link",
				regex: /\[([^\]]*)\]\(([^\)]+)\)/g,
				replacement: function(a,text,href){
					return Utils.generateElementHTML("a",{href:href},text)
				}
			},
			
			//Postproccess
			{
				name: "turn escaped chars back",
				regex: /<!--escaping-->&#(\d+);/g,
				replacement: function(_, charCode) { return "<!--escaping-->" + String.fromCharCode(~~charCode) }
			},
		];
		
		/** Replacements for this Renderer */
		replacement : IInlineRendererReplacement[] = [];
		
		/**
		 * do render.
		 * @note DOM whitespace will be removed by Utils.trim(str) .
		 * @note after escaping, `\` will become `<!--escaping-->`.
		 * @note if you want some chars escaped without `\`, use `<!--escaping-->`.
		 */
		public RenderHTML(html : string) : string {
			var rtn = Utils.trim(html);
			var i, rule;
			for (i = 0; i< this.replacement.length; i++) {
				rule = this.replacement[i];
				if ((typeof rule.method) == "function") {
					rtn = rule.method(rtn);
				} else {
					rtn = rtn.replace(rule.regex, rule.replacement);
				}
			}
			return rtn;
		}
		
		/**
		 * do render on a Node
		 * @return the output nodes
		 */
		public RenderNode(node : Node) : Node[] {
			var docfrag = node.ownerDocument.createElement('div');
			var nodes: Node[];
			var source = node['innerHTML'] || node.textContent;
			docfrag.innerHTML = this.RenderHTML(source);
			nodes = [].slice.call(docfrag.childNodes, 0);
			if (node.parentNode){
				if (node.nodeType == Node.TEXT_NODE) {
					while(docfrag.lastChild) {
						node.parentNode.insertBefore(node.nextSibling, docfrag.lastChild);
					}
					node.parentNode.removeChild(node);
				} else 
				if (node.nodeType == Node.ELEMENT_NODE) {
					while (node.firstChild) node.removeChild(node.firstChild);
					while (docfrag.firstChild) node.appendChild(docfrag.firstChild);
				}
			}
			return nodes;
		}
		
		/**
		 * (Factory Function) Create a Markdown InlineRenderer
		 */
		public static makeMarkdownRenderer() : InlineRenderer {
			var rtn : InlineRenderer = new InlineRenderer();
			rtn.replacement = this.markdownReplacement.concat(rtn.replacement);
			return rtn;
		}
	}
}
