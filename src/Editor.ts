/// <reference path="Utils.ts" />
/// <reference path="Renderer.ts" />

namespace MarkdownIME{

export var config = {
	"wrapper": "p",	// the default wrapper for plain text line
};

export class Editor {
	editor: Element;
	document: Document;
	window: Window;
	
	selection: Selection;
	
	isTinyMCE: boolean;
	
	constructor(editor: Element) {
		this.editor = editor;
		
		this.document = editor.ownerDocument;
		this.window = editor.ownerDocument.defaultView;
		this.selection = this.window.getSelection();
		
		this.isTinyMCE = /tinymce/i.test(editor.id);
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
	 * Process the line on the cursor.
	 * call this from the event handler.
	 */
	ProcessCurrentLine(ev : KeyboardEvent) {
		var _dummynode : Node;
		var tinymce_node : Node;
		
		var range = this.selection.getRangeAt(0);
		if (!range.collapsed) return;	// avoid processing with strange selection
		
		// assuming not using tinymce:
		// interesting, the node is always a TextNode.
		// sometimes it became the editor itself / the wrapper, because : 
		// 1. there is no text.
		// 2. not on a text. might be after an image or sth.
		// 3. the cursor was set by some script. (eg. tinymce)
		var node = range.startContainer;
		
		if (node.nodeType == Node.TEXT_NODE && range.startOffset != node.textContent.length) {
			_dummynode = node;
			while (!Utils.is_node_block(_dummynode)) _dummynode = _dummynode.parentNode;
			if (Utils.Pattern.NodeName.pre.test(_dummynode.nodeName)) {
				//safe insert <br> for <pre>, for browser always screw up
				//insert right half text
				node.parentNode.insertBefore(this.document.createTextNode(node.textContent.substr(range.startOffset)), node.nextSibling);
				_dummynode = this.document.createElement('br');
				node.parentNode.insertBefore(_dummynode, node.nextSibling);
				node.textContent = node.textContent.substr(0, range.startOffset);
				
				range.selectNode(_dummynode.nextSibling);
				range.collapse(true);
				this.selection.removeAllRanges();
				this.selection.addRange(range);
				
				ev.preventDefault();
			}
			return;
		}
		//if (node != node.parentNode.lastChild) return;
		
		if (this.isTinyMCE) {
			//according to test, node will become <sth><br bogus="true"></sth>
			//if this is half-break, then return
			if (
				!(Utils.Pattern.NodeName.pre.test(node.nodeName)) &&
				!(node.childNodes.length == 1 && node.firstChild.nodeName == "BR")
			)
				return;
			//so we get rid of it.
			tinymce_node = node;
			while (!Utils.is_node_block(tinymce_node)) {
				tinymce_node = tinymce_node.parentNode;
			}
			//the we get the real and normalized node.
			if (Utils.Pattern.NodeName.pre.test(tinymce_node.nodeName)) {
				//<pre> is special
				node = tinymce_node;
				while (node.lastChild && Utils.is_node_empty(node.lastChild)) {
					node.removeChild(node.lastChild);
				}
				node.appendChild(this.document.createElement('br'));
				node.appendChild(this.document.createElement('br'));
				tinymce_node = null;
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
				//the tinymce_node will be removed by the following code
			} else {
				node = tinymce_node.previousSibling;
				if (Utils.Pattern.NodeName.list.test(node.nodeName)) {
					//tinymce helps us get rid of a list.
					return;
				}
			}
		}
		
		//normalize the node object, if the node is 
		// 1. editor > #text , then create one wrapper and use the wrapper.
		// 2. blockwrapper > [wrapper >] #text , then use the blockwrapper.
		// 3. editor , which means editor is empty. then f**k user.
		//cond 3
		if (node == this.editor) {
			node = this.document.createElement(config.wrapper || "div");
			(<HTMLElement>node).innerHTML = (<HTMLElement>this.editor).innerHTML;
			(<HTMLElement>this.editor).innerHTML = "";
			this.editor.appendChild(node);
		}
		//cond 2
		while (!Utils.is_node_block(node) && node.parentNode != this.editor) {
			node = node.parentNode;
		}
		//cond 1
		if (!Utils.is_node_block(node) && node.parentNode == this.editor) {
			_dummynode = this.document.createElement(config.wrapper || "div");
			Utils.wrap(_dummynode, node);
			node = _dummynode;
		}
	
		
		//generate the parent tree to make things easier
		var parent_tree = Utils.build_parent_list(node, this.editor);
		console.log(node, parent_tree);
		
		//further normalizing.
		//now node shall be a block node
		while (!Utils.is_node_block(node)) 
			node = parent_tree.shift();
			
		//finally start processing
		//for <pre> block, special work is needed.
		if (Utils.Pattern.NodeName.pre.test(node.nodeName)) {
			let lineBreak = this.document.createTextNode("\n");
			
			if (!this.isTinyMCE) {
				//vanilla editor has bug.
				range.insertNode(lineBreak);
				let ns = lineBreak.nextSibling;
				if (ns && (ns.nodeType === Node.TEXT_NODE) && (ns.textContent.length === 0)) {
					lineBreak.parentNode.removeChild(ns);
				}
				if (!lineBreak.nextSibling) {
					console.log("fucking fix");
					lineBreak.parentNode.insertBefore(this.document.createElement("br"), lineBreak);
				}
				Utils.move_cursor_to_end(lineBreak);
				ev.preventDefault();
			}
			
			let text = node.textContent;
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
				let tr = node.parentNode;
				let table = tr.parentNode.parentNode; // table > tbody > tr
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
				tinymce_node && tinymce_node.parentNode.removeChild(tinymce_node);
			} else {
				//let browser deal with strange things
				console.error("MarkdownIME Cannot Handle Line Creating");
				Utils.move_cursor_to_end(tinymce_node || node);
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
				newTd.innerHTML = '<br data-mdime-bogus="true">';
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
			re.pre.test(node.nodeName) ||
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
			parent_tree.unshift(range.startContainer); // for empty cells
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
							(<HTMLElement>result.child).innerHTML = '<br data-mdime-bogus="true">';
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
		rtn = this.document.createElement(tagName || config.wrapper || "div");
		rtn.innerHTML = '<br data-mdime-bogus="true">';
		return rtn;
	}
}

}