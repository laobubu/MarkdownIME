/// <reference path="Utils.ts" />
/// <reference path="Renderer.ts" />

namespace MarkdownIME{

export interface EditorConfig {
	/** the wrapper tagName of a line. usually "p" or "div" */
	wrapper?: string;
	
	/** the outterHTML of a `<br>` placeholder. on Chrome/Firefox, an empty line must has at least one `<br>` */
	emptyBreak?: string;
	
	/** use proto chain to apply default config. */
	__proto__?: EditorConfig;
};

export class Editor {
	
	static globalConfig: EditorConfig = {
		wrapper: 'p',
		emptyBreak: '<br data-mdime-bogus="true">'
	};
	
	config: EditorConfig;
	
	editor: Element;
	document: Document;
	window: Window;
	
	selection: Selection;
	
	isTinyMCE: boolean;	
	
	constructor(editor: Element, config?: EditorConfig) {
		this.editor = editor;
		
		this.document = editor.ownerDocument;
		this.window = editor.ownerDocument.defaultView;
		this.selection = this.window.getSelection();
		
		this.isTinyMCE = /tinymce/i.test(editor.id);
		
		this.config = config || {};
		this.config.__proto__ = Editor.globalConfig;
	}
	
	/**
	 * Init MarkdownIME on this editor.
	 */
	Init() : boolean {
		//Skip bad items
		if (!this.editor.hasAttribute('contenteditable'))	return false;
		if ( this.editor.hasAttribute('mdime-enhanced'))	return false;
		
		this.editor.addEventListener('keydown', this.keydownHandler.bind(this), false);
		this.editor.addEventListener('keyup', this.keyupHandler.bind(this), false);
		this.editor.setAttribute('mdime-enhanced', 'true');
		
		return true;
	}
	
	
	/**
	 * get the line element where the cursor is in.
	 * 
	 * @note when half_break is true, other things might not be correct.
	 */
	GetCurrentLine(range: Range) : {
		line: Element,
		parent_tree: Element[],
		half_break: boolean
	} {
		var _dummynode : Node;
		var result : {
			line: Element,
			parent_tree: Element[],
			half_break: boolean
		} = {
			line: null,
			parent_tree: [],
			half_break: false
		};
		
		// assuming not using tinymce:
		// interesting, the node is always a TextNode.
		// sometimes it became the editor itself / the wrapper, because : 
		// 1. there is no text.
		// 2. not on a text. might be after an image or sth.
		// 3. the cursor was set by some script. (eg. tinymce)
		
		var node = range.startContainer;
		
		// proccess tinymce, after this part, the node will be the line element
		if (this.isTinyMCE) {
			/** the block element tinymce created */
			let tinymce_node:Element = <Element>node;
			while (!Utils.is_node_block(tinymce_node)) {
				tinymce_node = tinymce_node.parentElement;
			}
			
			//according to test, node will become <sth><br bogus="true"></sth>
			
			//if this is half-break, then return
			if (
				!(node.childNodes.length == 1 && node.firstChild.nodeName == "BR")
			) {
				node = tinymce_node;
				result.half_break = true;
			} else
			
			//otherwise we get the real and normalized node.
			
			if (Utils.Pattern.NodeName.pre.test(tinymce_node.nodeName)) {
				//<pre> is special and tinymce handles it well
				node = tinymce_node;
			} else
			
			if (Utils.Pattern.NodeName.cell.test(tinymce_node.parentElement.nodeName)) {
				//F**king created two <p> inside a table cell!
				node = tinymce_node.parentElement; //table cell
				
				let oldP = tinymce_node.previousSibling;
				let oldPChild;
				while (oldPChild = oldP.firstChild) {
					node.insertBefore(oldPChild, oldP);
				}
				
				node.removeChild(oldP);
				node.removeChild(tinymce_node);
			} else {
				node = tinymce_node.previousSibling;
				tinymce_node.parentElement.removeChild(tinymce_node);
				
				if (Utils.Pattern.NodeName.list.test(node.nodeName)) {
					//tinymce helps us get rid of a list.
					//but we must get back to it.
					let tempLi = this.document.createElement('li');
					node.appendChild(tempLi);
					node = tempLi;
				}
			}
		}
		
		//normalize the node object, if the node is 
		// 1. editor > #text , then create one wrapper and use the wrapper.
		// 2. blockwrapper > [wrapper >] #text , then use the blockwrapper.
		// 3. editor , which means editor is empty. then f**k user.
		//cond 2
		while (!Utils.is_node_block(node) && node !== this.editor) {
			node = node.parentNode;
		}
		//cond 3
		if (node === this.editor) {
			node = this.document.createElement(this.config.wrapper);
			let r1 = this.document.createRange();
			r1.selectNodeContents(this.editor);
			r1.surroundContents(node);
		}
		
		//generate the parent tree to make things easier
		var parent_tree = Utils.build_parent_list(node, this.editor);
		console.log(node, parent_tree);
		
		result.line = <Element>node;
		result.parent_tree = parent_tree;
		return result;
	}
	
	
	
	
	/**
	 * Process the line on the cursor.
	 * call this from the event handler.
	 */
	ProcessCurrentLine(ev : KeyboardEvent) {
		
		var range = this.selection.getRangeAt(0);
		if (!range.collapsed) return;	// avoid processing with strange selection
		
		var currentLine = this.GetCurrentLine(range);
		var node = currentLine.line;
		var parent_tree = currentLine.parent_tree;
			
		//finally start processing
		//for <pre> block, special work is needed.
		if (Utils.Pattern.NodeName.pre.test(node.nodeName)) {
			let lineBreak = this.document.createElement('br');
			
			if (!this.isTinyMCE) {
				//vanilla editor has bug.
				range.deleteContents();
				range.insertNode(lineBreak);
				let ns = lineBreak.nextSibling;
				if (ns && (ns.nodeType === Node.TEXT_NODE) && (ns.textContent.length === 0)) {
					lineBreak.parentNode.removeChild(ns);
				}
				if (!lineBreak.nextSibling) {
					lineBreak.parentNode.appendChild(this.document.createElement("br"));
				}
				
				range.selectNodeContents(lineBreak.nextSibling);
				range.collapse(true);
				this.selection.removeAllRanges();
				this.selection.addRange(range);
				
				ev.preventDefault();
			}
			
			let text = (<HTMLPreElement>node).innerText;
			if (/^\n*(`{2,3})?\n*$/.test(text.substr(text.length - 4))) {
				let code = node.firstChild;
				let n : Node;
				while
					(n = code.lastChild,
						(
							(n.nodeType === 1 && n.nodeName === "BR") || 
							(n.nodeType === 3 && /^\n*(```)?\n*$/.test(n.textContent))
						)
					) 
					code.removeChild(n);
				this.CreateNewLine(node);
			}
			
			return;
		} else
		if (Utils.is_line_empty(<HTMLElement> node)) {
			//ouch. it is an empty line.
			console.log("Ouch! empty line.");
			//create one empty line without format.
			let emptyLine = this.GenerateEmptyLine();
			if (Utils.Pattern.NodeName.list.test(node.parentNode.nodeName)) {
				//it's an empty list item
				//which means it's time to end the list
				node.parentNode.removeChild(node);
				// get the list object
				node = parent_tree.shift();
				//create empty line
				if (Utils.Pattern.NodeName.list.test(node.parentNode.nodeName)) {
					//ouch! nested list!
					emptyLine = this.GenerateEmptyLine("li");
				}
			} else
			if (Utils.Pattern.NodeName.cell.test(node.nodeName)) {
				//empty table cell
				let tr = node.parentElement;
				let table = tr.parentElement.parentElement; // table > tbody > tr
				if (tr.textContent.trim() === "") {
					//if the whole row is empty, end the table.
					tr.parentNode.removeChild(tr);
					node = table;
				} else {
					//otherwise, create a row. 
					emptyLine = <HTMLElement>this.CreateNewCell(node);
					node = null;
				}
			} else
			if (Utils.Pattern.NodeName.blockquote.test(node.parentNode.nodeName)) {
				//empty line inside a blockquote
				//end the blockquote
				node.parentNode.removeChild(node);
				//get the blockquote object
				node = parent_tree.shift(); 
			} else
			{
				//it's just one normal line.
				//create one new line without format.
			}
			node && node.parentNode.insertBefore(emptyLine, node.nextSibling);
			Utils.move_cursor_to_end(emptyLine);
			ev.preventDefault();
		} else 
		{
			if (node.lastChild.attributes && (
					node.lastChild.attributes.getNamedItem("data-mdime-bogus") ||
					node.lastChild.attributes.getNamedItem("data-mce-bogus")
				)
			)
				node.removeChild(node.lastChild);
			
			console.log("Renderer on", node);
			
			node = Renderer.Render(<HTMLElement> node);
			
			if (node.parentNode.nodeName === "PRE") {
				Utils.move_cursor_to_end(node);
				ev.preventDefault();
			} else
			//Create another line after one node and move cursor to it.
			if (this.CreateNewLine(node)) {
				ev.preventDefault();
			} else {
				//let browser deal with strange things
				console.error("MarkdownIME Cannot Handle Line Creating");
				Utils.move_cursor_to_end(node);
			}
		}
	}
	
	/**
	 * Create new table row.
	 * @argument {Node} refer - current cell
	 * @return   {Node} the corresponding new cell element
	 */
	CreateNewCell(refer : Node) {
		if (!refer || !Utils.Pattern.NodeName.cell.test(refer.nodeName)) return null;
		let rtn : Element;
		let tr = refer.parentNode;
		let table = tr.parentNode.parentNode;
		let newTr = this.document.createElement("tr");
		for (let i = tr.childNodes.length; i--;) {
			if (Utils.Pattern.NodeName.cell.test(tr.childNodes[i].nodeName)) {
				let newTd = newTr.insertCell(0);
				newTd.innerHTML = this.config.emptyBreak;
				if (tr.childNodes[i] === refer) {
					//this new cell is right under the old one
					rtn = newTd;
				}
			}
		}
		tr.parentNode.insertBefore(newTr, tr.nextSibling);
		return rtn;
	}
	
	/**
	 * Create new line after one node and move cursor to it.
	 * return false if not successful.
	 */
	CreateNewLine(node : Node) : boolean {
		var _dummynode : Node;
		var re = Utils.Pattern.NodeName;
		
		//create table row
		if (
			re.cell.test(node.nodeName)
		) {
			_dummynode = this.CreateNewCell(node);
			Utils.move_cursor_to_end(_dummynode);
			return true;
		}
		
		//using browser way to create new line will get dirty format
		//so we create one new line without format.
		if (
			re.line.test(node.nodeName) ||
			re.li.test(node.nodeName) ||
			re.hr.test(node.nodeName)
		) {
			var tagName = re.li.test(node.nodeName) ? "li" : null;
			_dummynode = this.GenerateEmptyLine(tagName);
			node.parentNode.insertBefore(_dummynode, node.nextSibling);
			Utils.move_cursor_to_end(_dummynode);
			return true;
		}
		
		return false;
	}
	
	/**
	 * Handler for keydown
	 */
	keydownHandler(ev : KeyboardEvent) {
		var range = this.selection.getRangeAt(0);
		if (!range.collapsed) return;	// avoid processing with strange selection
		
		var keyCode = ev.keyCode || ev.which;
		var noAdditionalKeys = !(ev.shiftKey || ev.ctrlKey || ev.altKey);
		
		if (noAdditionalKeys && keyCode === 13) {
			this.ProcessCurrentLine(ev);
			return;
		} else 
		if ((keyCode === 9) || (keyCode >= 37 && keyCode <= 40)) { //Tab & arrow keys
			let handled = false;
			let parent_tree = Utils.build_parent_list(range.startContainer, this.editor);
			parent_tree.unshift(<Element>range.startContainer); // for empty cells
			let parent_tree_block = parent_tree.filter(Utils.is_node_block);
			console.log(parent_tree)
			if (Utils.Pattern.NodeName.cell.test(parent_tree_block[0].nodeName)) {
				//swift move between cells
				let td    = <HTMLElement>parent_tree_block[0];
				let tr    = <HTMLTableRowElement>td.parentElement;
				let table = <HTMLTableElement>tr.parentElement.parentElement;
				let focus : Element = null;
				let td_index = 0;
				while (td_index < tr.childElementCount && !tr.children[td_index].isSameNode(td)) td_index++;
				if (td_index < tr.childElementCount) {
					switch (keyCode) {
					case 9: //TAB
						if (noAdditionalKeys)
							focus = td.nextElementSibling || 
								(tr.nextElementSibling && tr.nextElementSibling.firstElementChild) ||
								(this.CreateNewCell(tr.firstElementChild));
						else if (ev.shiftKey)
							focus = td.previousElementSibling || 
								(tr.previousElementSibling && tr.previousElementSibling.lastElementChild) ||
								table.previousElementSibling;
						break;
					case 38: //UP
						if (noAdditionalKeys)
							focus = (tr.previousElementSibling && (<HTMLTableRowElement>tr.previousElementSibling).children[td_index]) ||
								table.previousElementSibling;
						break;
					case 40: //DOWN
						if (noAdditionalKeys)
							focus = (tr.nextElementSibling && (<HTMLTableRowElement>tr.nextElementSibling).children[td_index]) ||
								table.nextElementSibling;
						break;
					}
					
					if (focus !== null) {
						range.selectNodeContents(focus.lastChild || focus);
						range.collapse(false);
						this.selection.removeAllRanges();
						this.selection.addRange(range);
						handled = true;
					}
				}
			}
			
			if (handled) {
				ev.preventDefault();
			}
		}
	}
	
	keyupHandler(ev : KeyboardEvent) {
		var keyCode = ev.keyCode || ev.which;
		var range = this.selection.getRangeAt(0);
		
		if (!range.collapsed) return;	// avoid processing with strange selection
		
		//if is typing, process special instant transform.
		var node : Node = range.startContainer;
		if (node.nodeType == Node.TEXT_NODE) {
			var text = node.textContent;
			var text_after = text.substr(range.startOffset + 1);
			var text_before = text.substr(0, range.startOffset);
			
			if (text_after.length) return; //instant render only work at the end of line, yet.
			if (text_before.length < 2) return; //too young, too simple
			if (text_before.charAt(text_before.length - 2) == "\\") return; //escaping. run faster than others.
			
			if (keyCode == 32) {
				//space key pressed.
				console.log("instant render at", node);
                let focusNode = node.nextSibling;
                let shall_do_block_rendering : boolean = true;
				while (!Utils.is_node_block(node)) {
                    if (shall_do_block_rendering && node != node.parentNode.firstChild) {
                        shall_do_block_rendering = false;
                    }
					node = node.parentNode;
                }
				console.log("fix to ", node);
				if (node != this.editor && node.nodeName != "PRE") {
					let result = shall_do_block_rendering ? Renderer.blockRenderer.Elevate(<HTMLElement>node) : null;
                    if (result == null ) {
                        //failed to elevate. this is just a plian inline rendering work.
                        let result = Renderer.inlineRenderer.RenderNode(<HTMLElement>node);
                        let tail = (focusNode && focusNode.previousSibling) || (<HTMLElement> result.pop());
						Utils.move_cursor_to_end(tail);
					} else {
						if (result.child.textContent.length == 0) 
							(<HTMLElement>result.child).innerHTML = this.config.emptyBreak;
						Utils.move_cursor_to_end(result.child);
					}
				}
			}
		}
	}
	
	/**
	 * Generate Empty Line
	 */
	GenerateEmptyLine(tagName : string = null) : HTMLElement {
		var rtn : HTMLElement;
		rtn = this.document.createElement(tagName || this.config.wrapper || "div");
		rtn.innerHTML = this.config.emptyBreak;
		return rtn;
	}
}

}