/// <reference path="Utils.ts" />

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

			html = html.trim();
			html = html.replace(/<\/?\w+(\s+[^>]*)?>/g, repFun); //normal tags
			html = html.replace(/<!--protect-->[\d\D]*?<--\/protect-->/g, repFun); //regard a part of HTML as a entity. Wrap with `<--protect-->` and `<--/protect-->`
			html = html.replace(/<!--[\d\D]+?-->/g, repFun);	//comment tags
			
			html = Utils.html_entity_decode(html);

			return html;
		}
		
		/** set HTML content, which will update proxy storage */
		setHTML(html: string) {
			this.markCount = 0;
			this.proxyStorage = {};
			html = this.digestHTML(html);
			this.text = html;
		}
		
		/** 
		 * get HTML content. things in proxyStorage will be recovered.
		 * 
		 * @argument {string} [althtml] - the HTML containing proxy replacement. If not set, the html of this DomChaos will be used. 
		 */
		getHTML(althtml?: string): string {
			var rtn = althtml || Utils.text2html(this.text); //assuming this will not ruin the Unicode chars
			rtn = rtn.replace(/\uFFFC\uFFF9\w+\uFFFB/g, (mark) => (this.proxyStorage[mark]));
			return rtn;
		}
		
		/** 
		 * replace some text to HTML
		 * this is very helpful if the replacement is part of HTML / you are about to create new nodes.
		 * 
		 * @argument {RegExp}   pattern to match the text (not HTML)
		 * @argument {function} replacementHTML the replacement HTML (not text. you shall convert the strange chars like `<` and `>` to html entities)
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
		
		/**
		 * replace the tags from proxyStorage. this works like a charm when you want to un-render something.
		 * 
		 * @argument {RegExp} pattern to match the proxy content.
		 * @argument {boolean} [keepProxy] set to true if you want to keep the proxy placeholder in the text.
		 * 
		 * @example
		 * chaos.screwUp(/^<\/?b>$/gi, "**")
		 * //before: getHTML() == "Hello <b>World</b>"	proxyStorage == {1: "<b>", 2: "</b>"}
		 * //after:  getHTML() == "Hello **World**"		proxyStorage == {}
		 */
		screwUp(pattern: RegExp, replacement: string | ((...matchResult: string[]) => string), keepProxy?: boolean) {
			var screwed = {};
			var not_screwed = {};
			this.text = this.text.replace(/\uFFFC\uFFF9\w+\uFFFB/g, (mark) => {
				if (screwed.hasOwnProperty(mark)) return screwed[mark];
				if (not_screwed.hasOwnProperty(mark)) return mark;

				var r1 = this.proxyStorage[mark];
				var r2 = r1.replace(pattern, replacement);

				if (r1 === r2) {
					//nothing changed
					not_screwed[mark] = true;
					return mark;
				}

				if (keepProxy) this.proxyStorage[mark] = r2;
				else delete this.proxyStorage[mark];

				screwed[mark] = r2;
				return r2;
			});
		}

		/** storage some text to proxyStorage, and return its mark string */
		createProxy(reality: string): string {
			var mark;
			for (mark in this.proxyStorage) {
				if (this.proxyStorage[mark] === reality) return mark;
			}
			mark = this.nextMark();
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
		 * using a simple diff algorithm
		 */
		applyTo(target: HTMLElement) {
			var shadow = target.ownerDocument.createElement('div');
			shadow.innerHTML = this.getHTML();

			//the childNodes from shadow not have corresponding nodes from target.
			var wildChildren: Node[] = [].slice.call(shadow.childNodes, 0);

			for (let ti = 0; ti < target.childNodes.length; ti++) {
				var tnode = target.childNodes[ti];
				let match = false;
				for (let si1 = 0; si1 < wildChildren.length; si1++) {
					var snode = wildChildren[si1];
					match = tnode.isEqualNode(snode);
					//cond1. replace the shadow's child
					if (match) {
						shadow.replaceChild(tnode, snode);
						wildChildren.splice(si1, 1);
						break;
					}
					//cond2. replace the shadow's child's child
					//which means some original node just got wrapped.
					if (snode.nodeType == Node.ELEMENT_NODE) {
						for (let si2 = 0; si2 < snode.childNodes.length; si2++) {
							let snodec = snode.childNodes[si2];
							if (tnode.isEqualNode(snodec)) {
								snode.replaceChild(tnode, snodec);
								match = true;
								break;
							}
						}
					}
					if (match) break;
				}
				match && ti--; //if match, ti = ti - 1 , because the tnode moved to shadow.
			}

			target.innerHTML = ""; //clear all nodes.
			while (shadow.childNodes.length) {
				target.appendChild(shadow.firstChild);
			}
		}
	}
}