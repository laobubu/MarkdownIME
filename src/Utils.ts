declare interface Element {
	scrollIntoViewIfNeeded(centerIfNeeded:boolean);
}

if (!Element.prototype['scrollIntoViewIfNeeded']) {
  Element.prototype['scrollIntoViewIfNeeded'] = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

    var parent = this.parentNode,
        parentComputedStyle = window.getComputedStyle(parent, null),
        parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
        parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
        overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
        overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
        overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
        overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
        alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      this.scrollIntoView(alignWithTop);
    }
  };
}

namespace MarkdownIME.Utils {
	
	export namespace Pattern {
		export namespace NodeName {
			export var list = /^(UL|OL)$/i;
			export var li = /^LI$/i;
			export var cell = /^T[HD]$/i;
			export var line = /^(P|DIV|H\d|T[HD])$/i;
			export var blockquote = /^BLOCKQUOTE$/i;
			export var pre = /^PRE$/i;
			export var hr = /^HR$/i;
			export var autoClose = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
		}
	}
	
	/**
	 * Move the cursor to the end of one element.
	 */
	export function move_cursor_to_end(ele : Node) {
		var selection = ele.ownerDocument.defaultView.getSelection();
		var range = ele.ownerDocument.createRange();
		var focusNode = ele;
		
		while (focusNode.nodeType === Node.ELEMENT_NODE) {
			//find the last non-autoClose child element node, or child text node
			let i = focusNode.childNodes.length;
			while (--i !== -1) {
				let c = focusNode.childNodes[i];
				if (
					(c.nodeType === Node.TEXT_NODE) ||
					(c.nodeType === Node.ELEMENT_NODE)
				) {
					focusNode = c;
					break;
				}
			}
			if (i === -1) {
				break; //not found...
			}
		}
		
		if (Pattern.NodeName.autoClose.test(focusNode.nodeName))
			range.selectNode(focusNode);
		else
			range.selectNodeContents(focusNode);
		range.collapse(focusNode.nodeName === "BR");
		
		selection.removeAllRanges();
		selection.addRange(range);
		
		focusNode.parentElement.scrollIntoViewIfNeeded(true);
	}
	
	/**
	 * Check if it's a BR or empty stuff.
	 */
	export function is_node_empty(node : Node, regardBrAsEmpty : boolean = true) {
		if (!node) return false;
		return	(node.nodeType == Node.TEXT_NODE && /^[\s\r\n]*$/.test(node.nodeValue)) || 
				(node.nodeType == Node.COMMENT_NODE) ||
				(regardBrAsEmpty && node.nodeName == "BR");
	}
	
	/**
	 * revert is_node_empty()
	 */
	export function is_node_not_empty(node : Node) {
		return !is_node_empty(node);
	}
	
	/**
	 * Check if one node is a container for text line
	 */
	export function is_node_block(node : Node) {
		if (!node) return false;
		if (node.nodeType != 1) return false;
		return (
			Pattern.NodeName.line.test(node.nodeName) ||
			Pattern.NodeName.li.test(node.nodeName) ||
			Pattern.NodeName.pre.test(node.nodeName)
		);
	}
	
	/**
	 * Check if one line container can be processed.
	 */
	export function is_line_container_clean(wrapper : Node) {
		var children = get_real_children(wrapper);
		var ci : number = children.length;
		if (ci == 1 && children[0].nodeType == 1) {
			//cracking nuts like <p><i><b>LEGACY</b></i></p>
			return is_line_container_clean(children[0]);
		}
		while (ci--) {
			var node = children[ci];
			if (node.nodeType == Node.TEXT_NODE) continue;	//textNode pass
			return false;
		}
		return true;
	}
	
	/**
	 * Check if one line is empty
	 */
	export function is_line_empty(line : HTMLElement) : boolean {
		if (line.textContent.length != 0) return false;
		if (line.innerHTML.indexOf('<img ') >= 0) return false;
		return true;
	}
	
	/**
	 * Get the previousSibling big block wrapper or create one.
	 * @note every char in blockTagName shall be upper, like "BLOCKQUOTE"
	 */
	export function get_or_create_prev_block(node : Node, blockTagName : string) : Node {
		var rtn : Node = node.previousSibling;
		if (!rtn || rtn.nodeName != blockTagName) {
			rtn = node.ownerDocument.createElement(blockTagName);
			node.parentNode.insertBefore(rtn, node);
		}
		return rtn;
	}
	
	/**
	 * Find all non-empty children
	 */
	export function get_real_children(node : Node) : Array<Node> {
		return [].filter.call(node.childNodes, is_node_not_empty);
	}
	
	/**
	 * Get all nodes on the same line. 
	 * This is for lines like <br>...<br>. it is recommended to use TextNode as the anchor. 
	 * If the anchor is <br>, nodes before it will be in return.
	 */
	export function get_line_nodes(anchor : Node, wrapper : Node) : Array<Node> {
		var rtn = [];
		var tmp : Node;
		tmp = anchor.previousSibling;
		//...
		return rtn;
	}
	
	/**
	 * Get all parent elements.
	 * 
	 * @returns {Element[]} the parents, exclude `node`, include `end`.
	 */
	export function build_parent_list(node : Node, end : Element) : Element[] {
		var rtn : Element[] = [];
		var iter : Element = node.parentElement;
		while (iter) {
			rtn.push(iter);
			if (iter === end) break;
			iter = iter.parentElement;
		}
		return rtn;
	}

	/** convert some chars to HTML entities (`&` -> `&amp;`) */
	export function text2html(text: string): string {
		return text.replace(/&/g, '&amp;').replace(/  /g, ' &nbsp;').replace(/"/g, '&quot;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
	}
	
	/** add slash chars for a RegExp */
	export function text2regex(text: string): string {
		return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	}
	
	/** convert HTML entities to chars */
	export function html_entity_decode(html: string): string {
		var dict = {
            'nbsp': String.fromCharCode(160),
            'amp': '&',
            'quot': '"',
            'lt': '<',
            'gt': '>'
        }
		return html.replace(/&(nbsp|amp|quot|lt|gt);/g, function(whole, name) {
			return dict[name];
		})
	}
	
	/**
	 * remove whitespace in the DOM text. works for textNode.
	 */
	export function trim(str : string) : string {
		return str.replace(/^[\t\r\n ]+/,'').replace(/[\t\r\n ]+$/,'').replace(/[\t\r\n ]+/,' ');
	}
	
	/**
	 * help one element wear a wrapper
	 */
	export function wrap(wrapper : Node, node : Node) {
		node.parentNode.replaceChild(wrapper, node);
		wrapper.appendChild(node);
	}
	
	/** 
	 * get outerHTML for a new element safely.
	 * @see http://www.w3.org/TR/2000/WD-xml-c14n-20000119.html#charescaping
	 * @see http://www.w3.org/TR/2011/WD-html-markup-20110113/syntax.html#void-element
	 */
	export function generateElementHTML(nodeName: string, props?: Object, innerHTML?: string):string {
		var rtn = "<" + nodeName;
		if (props) {
			for (let attr in props) {
				if (!props.hasOwnProperty(attr)) continue;
				let value = "" + props[attr];
				value = value.replace(/&/g,  "&amp;" );
				value = value.replace(/"/g,  "&quot;");
				value = value.replace(/</g,  "&lt;"  );
				value = value.replace(/\t/g, "&#x9;" );
				value = value.replace(/\r/g, "&#xA;" );
				value = value.replace(/\n/g, "&#xD;" );
				rtn += " " + attr + '="' + value + '"';
			}
		}
		rtn += ">";
		if (innerHTML) {
			rtn += innerHTML + "</" + nodeName + ">";
		} else 
		if (!Pattern.NodeName.autoClose.test(nodeName)) {
			rtn += "</" + nodeName + ">";
		}
		return rtn;
	}
}
