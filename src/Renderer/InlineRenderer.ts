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
         * @deprecated might not friendly to spaces. use RenderText instead.
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
		 * do render.
		 * @note after escaping, `\` will become `<!--escaping-->`.
         * @return {string} HTML Result
		 */
		public RenderText(text : string) : string {
			var rtn = text;
			var i, rule;
			for (i = 0; i< this.replacement.length; i++) {
				rule = this.replacement[i];
				rtn = rule.method(rtn);
			}
			return rtn;
		}
        
        /**
         * do render on a textNode
         * @note make sure the node is a textNode; function will NOT check!
		 * @return the output nodes
         */
        public RenderTextNode(node : Node) : Node[] {
            var docfrag = node.ownerDocument.createElement('div');
            var nodes: Node[];
            var source = node.textContent;
            docfrag.innerHTML = this.RenderText(source);
            nodes = [].slice.call(docfrag.childNodes);
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
		public RenderNode(node : Node) : Node[] {
			if (node.nodeType == Node.TEXT_NODE) {
                return this.RenderTextNode(node);
            }
            
            var textNodes : Node[] = this.PreproccessTextNodes(node);
            var textNode : Node;
            var rtn : Node[] = [];
            
            while (textNode = textNodes.shift()) {
                console.log('inline', textNode);
                let r1 = this.RenderTextNode(textNode);
                rtn.push.apply(rtn, r1);
            }
			return rtn;
		}
        
        /**
         * remove all child comments whose text is "escaping"
         * if the comments are followed by a textNode, add a escaping char "\" to the textNode
         * @note this function do recursive processing
         * @return {Node[]} all textNode. The first item is the last textNode.
         */
        public PreproccessTextNodes(parent : Node) : Node[] {
            if (!parent || parent.nodeType != Node.ELEMENT_NODE) return [];
            var i = parent.childNodes.length - 1;
            var rtn : Node[] = [];
            while (i >= 0) {
                let child = parent.childNodes[i];
                let nextSibling = child.nextSibling;
                
                switch (child.nodeType) {
                    
                    case Node.COMMENT_NODE:
                        if (nextSibling && nextSibling.nodeType == Node.TEXT_NODE && child.textContent == "escaping") {
                            // <!--escaping--> [TEXT_NODE]
                            nextSibling.textContent = "\\" + nextSibling.textContent;
                            parent.removeChild(child);
                        }
                        break;
                
                    case Node.TEXT_NODE:
                        if (nextSibling && nextSibling.nodeType == Node.TEXT_NODE) {
                            // [TEXT_NODE] [TEXT_NODE]
                            child.textContent += nextSibling.textContent;
                            parent.removeChild(nextSibling);
                            rtn.pop();
                        }
                        rtn.push(child);
                        break;
                        
                    case Node.ELEMENT_NODE:
                        let recursive_result = this.PreproccessTextNodes(child);
                        rtn.push.apply(rtn, recursive_result);
                        break;
                }
                
                i--;
            }
            return rtn;
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
