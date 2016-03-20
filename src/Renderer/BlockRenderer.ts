/// <reference path="../Utils.ts" />

namespace MarkdownIME.Renderer {
	
	export interface ElevateResult {
		parent:Element; 
		child:Element; 
		feature?:any;
		containerType?: BlockRendererContainer;
	};
	
	export class BlockRendererContainer {
		name: string;
		
		/** 
		 * the feature mark HTML, which will be removed.
		 * do not forget `^` when writing RegExp
		 * @example ^\s*\d+\.\s+ for ordered list.
		 * @example ^(\>|&gt;)\s* for blockquote
		 */
		featureMark: RegExp;
		
		/**
		 * the new nodeName of children. Use `null` to keep original nodeName when elevate a node.
		 * @example "LI" for "ol > li"
		 */
		childNodeName: string = null;
		
		/**
		 * the new nodeName of parent. Use `null` to prevent creating one.
		 * @example "OL" for "ol > li"
		 */
		parentNodeName: string = null;
		
		/**
		 * tell if user can type inside. this helps when creating strange things like <hr>
		 */
		isTypable: boolean = true;
		
		/**
		 * if is true, the text that matches featureMark will be deleted.
		 */
		removeFeatureMark: boolean = true;
		
		/** changing its name, moving it into proper container. return null if failed. */
		Elevate (node: Element) : ElevateResult {
			var feature = this.prepareElevate(node);
			if (!feature) return null;
			
			var child: Element;
			var parent: Element;
			
			if (!this.childNodeName) {
				child = node;
			} else {
				//create a new tag named with childNodeName
				child = node.ownerDocument.createElement(this.childNodeName);
				while (node.firstChild) {child.appendChild(node.firstChild)}
				node.parentNode.insertBefore(child, node);
				node.parentElement.removeChild(node);
			}
			
			if (!this.parentNodeName) {
				//do nothing. need no parent.
				parent = null;
			} else {
				if (child.previousElementSibling && child.previousElementSibling.nodeName == this.parentNodeName) {
					//this child is just next to the parent.
					parent = child.previousElementSibling;
					parent.appendChild(child);
				} else {
					//create parent.
					parent = child.ownerDocument.createElement(this.parentNodeName);
					Utils.wrap(parent, child);
				}
			}
			
			return {child: child, parent: parent, feature: feature};
		}
		
		/** 
		 * check if one node is elevatable and remove the feature mark.
		 * do NOT use this func outsides Elevate()
		 */
		prepareElevate(node: Element) : string[] {
			if (!node) return null;
			
			var matchResult = this.featureMark.exec(node.textContent);
			if (!matchResult) return null;
		
			if (this.removeFeatureMark) {
				let n = <HTMLElement> node;
				n.innerHTML = n.innerHTML.replace(/&nbsp;/g,String.fromCharCode(160)).replace(this.featureMark, '');
			}
			
			return matchResult;
		}
	}
	
	export namespace BlockRendererContainers {
		export class UL extends BlockRendererContainer {
			constructor() {
				super();
				this.name = "unordered list";
				this.featureMark = /^\s*[\*\+\-]\s+/;
				this.childNodeName = "LI";
				this.parentNodeName = "UL";
			}
		}
		
		export class OL extends BlockRendererContainer {
			constructor() {
				super();
				this.name = "ordered list";
				this.featureMark = /^\s*(\d+)\.\s+/;
				this.childNodeName = "LI";
				this.parentNodeName = "OL";
			}
			
			Elevate (node: Element) : ElevateResult {
				var rtn = super.Elevate(node);
				if (rtn && rtn.parent.childElementCount === 1) {
					rtn.parent.setAttribute("start", rtn.feature[1]);
				}
				return rtn;
			}
		}
		
		export class BLOCKQUOTE extends BlockRendererContainer {
			constructor() {
				super();
				this.name = "blockquote";
				this.featureMark = /^(\>|&gt;)\s*/;
				this.parentNodeName = "BLOCKQUOTE";
			}
		}
		
		/** assuming a <hr> is just another block container and things go easier */
		export class HR extends BlockRendererContainer {
			constructor() {
				super();
				this.isTypable = false;
				this.name = "hr";
				this.featureMark = /^\s{0,2}([\-_\=\*])(\s*\1){2,}$/;
			}
			
			Elevate (node: Element) : {parent:Element, child:Element} {
				if (!this.prepareElevate(node)) return null;
				
				var child = node.ownerDocument.createElement("hr");
				node.parentElement.insertBefore(child, node);
				node.parentElement.removeChild(node);
				
				return {parent: null, child: child};
			}
		}
		
		export class CodeBlock extends BlockRendererContainer {
			constructor() {
				super();
				this.name = "code block";
				this.featureMark = /^```(\s*(\w+)\s*)?$/;
				this.removeFeatureMark = false;
			}
			
			Elevate (node: Element) : {parent:Element, child:Element} {
				var match = this.prepareElevate(node);
				if (!match) return null;
				
				//create a new tag named with childNodeName
				var d    = node.ownerDocument;
				var code = d.createElement("code");
				var pre  = d.createElement("pre");
				code.innerHTML = '<br data-mdime-bogus="true">';
				pre.appendChild(code);
				node.parentNode.insertBefore(pre, node);
				node.parentElement.removeChild(node);
				
				if (match[1]) {
					pre.setAttribute("lang", match[2]);
					code.setAttribute("class", match[2]);
				}
				
				return {parent: pre, child: code};
			}
		}
		
		export class HeaderText extends BlockRendererContainer {
			constructor() {
				super();
				this.name = "header text";
				this.featureMark = /^(#+)\s+/;
			}
			
			Elevate (node: Element) : {parent:Element, child:Element} {
				var match = this.prepareElevate(node);
				if (!match) return null;
				
				//create a new tag named with childNodeName
				var child = node.ownerDocument.createElement("H" + match[1].length);
				while (node.firstChild) {child.appendChild(node.firstChild)}
				node.parentNode.insertBefore(child, node);
				node.parentElement.removeChild(node);
				
				return {parent: null, child: child};
			}
		}
		
		export class TableHeader extends BlockRendererContainer {
			constructor() {
				super();
				this.name = "table header";
				this.featureMark = /^\|(.+)\|$/;
				this.removeFeatureMark = false;
			}
			
			Elevate (node: Element) : {parent:Element, child:Element} {
				var match = this.prepareElevate(node);
				if (!match) return null;
				
				//FIXME: styles inside the table header will be discarded!
				// (in fact, a fancy header is not good :) )
				
				//create a new table.
				var d     = node.ownerDocument;
				var table = d.createElement("table");
				var tbody = d.createElement("tbody");
				var tr    = d.createElement("tr");
				var th    = match[1].split("|").map((text)=>{
					let rtn = d.createElement("th");
					rtn.textContent = text.trim();
					tr.appendChild(rtn);
					return rtn;
				})
				
				table.appendChild(tbody);
				tbody.appendChild(tr);
				
				var container = node.parentElement;
				container.insertBefore(table, node);
				container.removeChild(node);
				
				var extraLine = d.createElement(node.nodeName);
				extraLine.innerHTML = '<br data-mdime-bogus="true">';
				container.insertBefore(extraLine, table.nextElementSibling);
				
				return {parent: table, child: th[0]};
			}
		}
	}
	
	/**
	 * In fact the BlockRenderer is not a renderer; it can elevate / degrade a node, changing its name, moving it from one container to another.
	 */
	export class BlockRenderer {

		containers: BlockRendererContainer[] = [];

		/** Elevate a node. Make sure the node is a block node. */
		Elevate(node: Element): ElevateResult {
			var finalResult: ElevateResult = null;
			var elevateOn: Element = node;
			var newestResult: ElevateResult;
			while (newestResult = this.ElevateOnce(elevateOn)) {
				elevateOn = newestResult.child;
				finalResult = newestResult;
			}
			return finalResult;
		}

		/** Elevate once. Not work with `> ## this situation` */
		ElevateOnce(node: Element): ElevateResult {
			for (var i = 0; i < this.containers.length; i++) {
				let container = this.containers[i];
				var rtn: ElevateResult = container.Elevate(node);
				if (rtn) {
					rtn.containerType = container;
					return rtn;
				}
			}
			return null;
		}
		
		/** 
		 * Get suggested nodeName of a new line inside a container.
		 * @return null if no suggestion.
		 */
		GetSuggestedNodeName ( container : Element ) : string {
			for (var i = 0; i< this.containers.length; i++) {
				let cc = this.containers[i];
				if (cc.parentNodeName == container.nodeName) 
					return cc.childNodeName;
			}
			return null;
		}
		
		static markdownContainers : BlockRendererContainer[] = [
			new BlockRendererContainers.CodeBlock(),
			new BlockRendererContainers.TableHeader(),
			new BlockRendererContainers.BLOCKQUOTE(),
			new BlockRendererContainers.HeaderText(),
			new BlockRendererContainers.HR(),
			new BlockRendererContainers.OL(),
			new BlockRendererContainers.UL()
		];
		
		/**
		 * Add Markdown rules into this BlockRenderer
		 */
		public AddMarkdownRules() : BlockRenderer {
			this.containers = BlockRenderer.markdownContainers.concat(this.containers);
			return this;
		}
	}
}