/// <reference path="../Utils.ts" />

namespace MarkdownIME.Renderer {
	/**
	 * IInlineRendererReplacement
	 * @description can be used to implement customized replacement.
	 */
	export interface IInlineRendererReplacement {
		name: string;
		method(text: string) : string;
	}
	
	/**
	 * Use RegExp to do replace.
	 * One implement of IInlineRendererReplacement.
	 */
	export class InlineRendererRegexpReplacement implements IInlineRendererReplacement {
		name: string;
		regex : RegExp;
		replacement : any;
		
		constructor(name: string, regex: RegExp, replacement: any) {
			this.name = name;
			this.regex = regex;
			this.replacement = replacement;
		}
		
		method(text: string) : string {
			return text.replace(this.regex, this.replacement);
		}
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
			new InlineRendererRegexpReplacement(
				"escaping",
				/(\\|<!--escaping-->)([\*`\(\)\[\]\~\\])/g,
				function(a, b, char) { return "<!--escaping-->&#" + char.charCodeAt(0) + ';' }
			),
			new InlineRendererRegexpReplacement(
				"turn &nbsp; into spaces",
				/&nbsp;/g,
				String.fromCharCode(160)
			),
			new InlineRendererRegexpReplacement(
				'turn &quot; into "s',
				/&quot;/g,
				'"'
			),
			
			//Basic Markdown Replacements
			new InlineRendererRegexpReplacement(
				"strikethrough",
				/~~([^~]+)~~/g,
				"<del>$1</del>"
			),
			new InlineRendererRegexpReplacement(
				"bold",
				/\*\*([^\*]+)\*\*/g,
				"<b>$1</b>"
			),
			new InlineRendererRegexpReplacement(
				"italy",
				/\*([^\*]+)\*/g,
				"<i>$1</i>"
			),
			new InlineRendererRegexpReplacement(
				"code",
				/`([^`]+)`/g,
				"<code>$1</code>"
			),
			new InlineRendererRegexpReplacement(
				"img with title",
				/\!\[([^\]]*)\]\(([^\)\s]+)\s+("?)([^\)]+)\3\)/g,
				function(a,alt,src,b,title){
					return Utils.generateElementHTML("img",{alt:alt,src:src,title:title})
				}
			),
			new InlineRendererRegexpReplacement(
				"img",
				/\!\[([^\]]*)\]\(([^\)]+)\)/g,
				function(a,alt,src){
					return Utils.generateElementHTML("img",{alt:alt,src:src})
				}
			),
			new InlineRendererRegexpReplacement(
				"link with title",
				/\[([^\]]*)\]\(([^\)\s]+)\s+("?)([^\)]+)\3\)/g,
				function(a,text,href,b,title){
					return Utils.generateElementHTML("a",{href:href,title:title},text)
				}
			),
			new InlineRendererRegexpReplacement(
				"link",
				/\[([^\]]*)\]\(([^\)]+)\)/g,
				function(a,text,href){
					return Utils.generateElementHTML("a",{href:href},text)
				}
			),
			
			//Postproccess
			new InlineRendererRegexpReplacement(
				"turn escaped chars back",
				/<!--escaping-->&#(\d+);/g,
				function(_, charCode) { return "<!--escaping-->" + String.fromCharCode(~~charCode) }
			),
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
				rtn = rule.method(rtn);
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
						node.parentNode.insertBefore(docfrag.lastChild, node.nextSibling);
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
