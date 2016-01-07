
namespace MarkdownIME {
	
	/** something like a bridge between text and HTML, used to manipulate inline objects. */
	export class DomChaos {
		/** 
		 * the XML-free text; all the XML tags go to proxyStorage.
		 * 
		 * use `/\uFFFC\uFFF9\w+\uFFFB/g` to detect the placeholder(proxy) 
		 * 
		 * if you get new HTML data, use `setHTML(data)`
		 * if you want to replace some text to HTML, use `replace(pattern, replacementHTML)`
		 */
		text: string = "";
		
		/** a dict containing XML marks extracted from the innerHTML  */
		proxyStorage: any = {};

		/** clone content of a real element */
		cloneNode(htmlElement: HTMLElement) {
			var html = htmlElement.innerHTML;
			this.setHTML(html);
		}
		
		/** extract strange things and get clean text. */
		digestHTML(html: string): string {
			var repFun = this.createProxy.bind(this);

			html = html.replace(/<!--.+?-->/g, repFun);	//comment tags
			html = html.replace(/<\/?\w+(\s+[^>]+)?>/g, repFun); //normal tags
			html = html.replace(/\\./g, repFun); //escaping chars like \*
			
			html = Utils.html_entity_decode(html);

			return html;
		}
		
		/** set HTML content, which will update proxy storage */
		setHTML(html: string) {
			html = this.digestHTML(html);
			this.text = html;
		}
		
		/** get HTML content. things in proxyStorage will be recovered. */
		getHTML(): string {
			var rtn = Utils.text2html(this.text);

			for (var mark in this.proxyStorage) {
				rtn = rtn.replace(mark, this.proxyStorage[mark]);
			}

			return rtn;
		}
		
		/** 
		 * replace some text to HTML
		 * this is very helpful if the replacement is part of HTML / you are about to create new nodes.
		 */
		replace(pattern: RegExp | string, replacementHTML: string | ((...matchResult: string[]) => string)) {
			var self = this;
			this.text = this.text.replace(<any>pattern, function() {
				var r2;
				if (typeof replacementHTML === "function") {
					r2 = replacementHTML.apply(null, arguments);
				} else {
					r2 = replacementHTML;
				}
				return self.digestHTML(r2);
			});
		}

		/** storage some text to proxyStorage, and return its mark string */
		createProxy(reality: string): string {
			var mark = this.nextMark();
			this.proxyStorage[mark] = reality;
			return mark;
		}
		
		markCount: number = 0;  // a random seed
		markPrefix = String.fromCharCode(0xfffc, 0xfff9);
		markSuffix = String.fromCharCode(0xfffb);
		
		/** generate a random mark string */
		nextMark(): string {
			var mark;
			do {
				this.markCount++;
				mark = this.markPrefix + this.markCount.toString(36) + this.markSuffix;
			} while (this.text.indexOf(mark) !== -1);
			return mark;
		}
		
		/** 
		 * apply the HTML content to a real element and 
		 * keep original child nodes as much as possible
		 * 
		 * using outerHTML, which not work on FireFox < 11.0
		 * using a simple diff algorithm
		 */
		applyTo(target: HTMLElement) {
			var shadow = target.ownerDocument.createElement('div');
			shadow.innerHTML = this.getHTML();
			
			const luckyLength = 3;
			
			var ti = 0;
			var scount = shadow.childNodes.length;
			var sacrefice;
			
			while (sacrefice = shadow.childNodes[0]) {
				let match = false;
				
				console.log('Chaos: <' + sacrefice.nodeName + '>' + sacrefice.textContent);
				
				//search for the corresponding original node
				for (let ti2 = ti; ti2 < (ti + luckyLength) && ti2 < target.childNodes.length; ti2++) {
					let cmp = target.childNodes[ti2];
					console.log(' - Cmp @ ' + ti2 , cmp.nodeName, cmp.textContent);
					if (sacrefice.isEqualNode(cmp)) {
						//found the equal child from target.
						//remove strange things
						while (ti2 > ti) {
							target.removeChild(target.childNodes[ti]);
							ti2--;
						}
						//and now `cmp` is `target.childNodes[ti]`
						match = true; 
						break;
					}
				}
				//end of search
				
				if (match) {
					//the sacrefice shall die now.
					console.log(' - Keep');
					shadow.removeChild(sacrefice);
				} else {
					//move the node from shadow to target
					console.log(' - Insert!');
					target.insertBefore(sacrefice, target.childNodes[ti] || null);
				}
				ti++;
			}
			
			console.log('Chaos: End, tail: ' + (target.childNodes.length - scount));
			while (target.childNodes.length > scount) {
				target.removeChild(target.childNodes[scount]);
			}
		}
	}
	
	/** the render rule for  */
	export class InlineClassicElement {
		name: string;

		nodeName: string;
		leftBracket: string;
		rightBracket: string;

		nodeAttr = {};

		regex: RegExp;

		constructor(nodeName: string, leftBracket: string, rightBracket?: string) {
			this.nodeName = nodeName.toUpperCase();
			this.leftBracket = leftBracket;
			this.rightBracket = rightBracket || leftBracket;
			this.name = this.nodeName + " with " + this.leftBracket;

			this.regex = new RegExp(
				Utils.text2regex(this.leftBracket) + '(.+?)' + Utils.text2regex(this.rightBracket),
				"g"
			);
		}

		render(tree: DomChaos) {
			var self = this;
			tree.replace(this.regex, function(whole, wrapped) {
				return Utils.generateElementHTML(self.nodeName, self.nodeAttr, Utils.text2html(wrapped));
			});
		}

		unrender(node: HTMLElement) {
			if (node.nodeType == Node.ELEMENT_NODE && node.nodeName == this.nodeName) {
				
			}
		}
	}

}