/// <reference path="Utils.ts" />
/// <reference path="Renderer.ts" />

namespace MarkdownIME{

export interface EditorConfig {
	/** the wrapper tagName of a line. usually "p" or "div" */
	wrapper?: string;
	
	/** the outterHTML of a `<br>` placeholder. on Chrome/Firefox, an empty line must has at least one `<br>` */
	emptyBreak?: string;
};
	
export interface IGetCurrentLineResult {
	line: Element,
	parent_tree: Element[],
	half_break: boolean
};

export class Editor {
	
	static defaultConfig: EditorConfig = {
		wrapper: 'p',
		emptyBreak: /MSIE (9|10)\./.test(navigator.appVersion) ? '' : '<br data-mdime-bogus="true">'
	};
	
	config: EditorConfig;
	
	editor: Element;
	document: Document;
	window: Window;
	
	selection: Selection;
	
	isTinyMCE: boolean;
	isIE: boolean;
	
	constructor(editor: Element, config?: EditorConfig) {
		this.editor = editor;

		this.document = editor.ownerDocument;
		this.window = editor.ownerDocument.defaultView;
		this.selection = this.window.getSelection();

		this.isTinyMCE = /tinymce/i.test(editor.id);
		this.isIE = /MSIE|Trident\//.test(this.window.navigator.userAgent);

		this.config = config || {};
		for (var key in Editor.defaultConfig) {
			this.config.hasOwnProperty(key) || (this.config[key] = Editor.defaultConfig[key]);
		}
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
		this.editor.addEventListener('input', this.inputHandler.bind(this), false);
		this.editor.setAttribute('mdime-enhanced', 'true');
		
		return true;
	}
	
	/**
	 * get the line element where the cursor is in.
	 * 
	 * @note when half_break is true, other things might not be correct.
	 */
	GetCurrentLine(range: Range): IGetCurrentLineResult {
		var _dummynode: Node;
		var result: IGetCurrentLineResult = {
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
			let tinymce_node: Element = <Element>node;
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
		} else {
			//judge if is half_break
			if (node.nodeType === Node.TEXT_NODE) {
				result.half_break = range.startOffset !== node.textContent.length;
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
		
			if (currentLine.half_break) return;
		
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
	 * @argument {Element} refer - current cell
	 * @returns  {Element} the corresponding new cell element
	 */
	CreateNewCell(refer: Element): Element {
		if (!refer || !Utils.Pattern.NodeName.cell.test(refer.nodeName)) return null;
		let rtn: Element;
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
	 * 
	 * @param   {Element} node - current line element.
	 * @returns {Element} new line element or `null`
	 */
	CreateNewLine(node: Element): Element {
		var newElement: Element;
		var re = Utils.Pattern.NodeName;

		//create table row
		if (
			re.cell.test(node.nodeName)
		) {
			newElement = this.CreateNewCell(node);
			Utils.move_cursor_to_end(newElement);
			return newElement;
		}

		//using browser way to create new line will get dirty format
		//so we create one new line without format.
		var tagName = null;
		if (re.li.test(node.nodeName)) tagName = "li";
		newElement = this.GenerateEmptyLine(tagName);
		node.parentNode.insertBefore(newElement, node.nextSibling);
		Utils.move_cursor_to_end(newElement);
		return newElement;
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
		}
		
		this.keydownHandler_Table(ev);
	}
	
	/** 
	 * execute the instant rendering. 
	 * 
	 * this will not work inside a `<pre>` element.
	 * 
	 * @param {Range} range where the caret(cursor) is. You can get it from `window.getSelection().getRangeAt(0)`
	 * @param {boolean} moveCursor true if you want to move the caret(cursor) after rendering.
	 * @return {boolean} successful or not.
	 */
	instantRender(range: Range, moveCursor?: boolean): boolean {
		var element: Node = range.startContainer.parentNode;
		var blockNode: Element = <Element>element;

		while (!Utils.is_node_block(blockNode)) {
			blockNode = <Element>blockNode.parentNode;
		}
		if (blockNode === this.editor) return false;
		if (blockNode.nodeName === "PRE") return false;
		if (element.nodeName === "CODE") return false;

		if (
			element === blockNode &&
			range.startContainer.nodeType === Node.TEXT_NODE &&
			range.startContainer === blockNode.firstChild
		) {
			//execute blockRenderer.Elevate
			let blockRendererResult = Renderer.blockRenderer.Elevate(blockNode);
			if (blockRendererResult) {
				let newBlock = blockRendererResult.child;
				if (newBlock.textContent.length === 0) {
					(<HTMLElement>newBlock).innerHTML = this.config.emptyBreak;
				}
				moveCursor && Utils.move_cursor_to_end(newBlock);
				return;
			}
		}
		range.setStart(element, 0);

		var fragment = range.extractContents();
		Renderer.inlineRenderer.RenderNode(fragment);

		let firstChild = element.firstChild;
		if (firstChild.nodeType === Node.TEXT_NODE && firstChild.textContent === "") {
			element.removeChild(firstChild);
			firstChild = element.firstChild;
		}
		
		var lastNode = fragment.lastChild;
		element.insertBefore(fragment, firstChild);
		if (moveCursor){
			if (lastNode.nodeType === Node.TEXT_NODE) {
				Utils.move_cursor_to_end(lastNode);
			} else {
				let range = this.document.createRange();
				range.selectNode(lastNode);
				range.collapse(false);
				this.selection.removeAllRanges();
				this.selection.addRange(range);
			}
		}
	}
	
	/**
	 * keyupHandler
	 *
	 * 1. call `instantRender` when space key is released.
	 */
	keyupHandler(ev: KeyboardEvent) {
		var keyCode = ev.keyCode || ev.which;
		var range = this.selection.getRangeAt(0);

		if (this.isIE && keyCode === 32 && range.collapsed && range.startContainer.nodeType === Node.TEXT_NODE) {
			this.instantRender(range, true);
		}
	}

	/**
	 * inputHandler
	 */
	inputHandler(ev) {
		var range = this.selection.getRangeAt(0);
		if (range.collapsed && range.startContainer.nodeType === Node.TEXT_NODE && /\s$/.test(range.startContainer.textContent)) {
			this.instantRender(range, true);
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
	
	/**
	 * KeyDown Event Handler for Tables
	 * 
	 * Move cursor using TAB, Shift+TAB, UP and DOWN
	 * 
	 * @returns {boolean} handled or not.
	 */
	keydownHandler_Table(ev : KeyboardEvent): boolean {
		var keyCode = ev.keyCode || ev.which;
		var noAdditionalKeys = !(ev.shiftKey || ev.ctrlKey || ev.altKey);

		if (
			(keyCode !== 8) && //BACKSPACE
			(keyCode !== 45) && //INSERT
			(keyCode !== 46) && //DELETE
			(keyCode !== 9) && //TAB
			(keyCode < 37 || keyCode > 40)
		) return false;
		
		var range = this.selection.getRangeAt(0);
		
		var parent_tree = Utils.build_parent_list(range.startContainer, this.editor);
		parent_tree.unshift(<Element>range.startContainer); // for empty cells
		var parent_tree_block = parent_tree.filter(Utils.is_node_block);
		
		let td    = <HTMLElement>parent_tree_block[0];
		let tr    = <HTMLTableRowElement>td.parentElement;
		let table = <HTMLTableElement>tr.parentElement.parentElement;
		
		if (!Utils.Pattern.NodeName.cell.test(td.nodeName)) return false;
		
		let td_index = 0; // the index of current td
		let td_count = tr.childElementCount;
		while (td_index < td_count && tr.children[td_index] !== td) td_index++;

		if (td_index >= td_count) return false; // not found the cell. awkward but shall not happen
		
		var focus: Element = null;
		
		switch (keyCode) {
			case 46: //DELETE
			case 8: //BACKSPACE
				if (noAdditionalKeys && td.nodeName === "TH" && !td.textContent.trim()) {
					focus = (keyCode === 46 && td.nextElementSibling) || td.previousElementSibling;
					if (!focus) {
						//the whole table is deleted.
						focus = table.nextElementSibling || this.CreateNewLine(table);
						table.parentElement.removeChild(table);
					} else {
						for (let i = 0, c = table.childElementCount; i < c; i++) {
							let tbody = <HTMLElement>table.children[i];
							for (let i = 0, c = tbody.childElementCount; i < c; i++) {
								let tr = <HTMLElement>tbody.children[i];
								tr.removeChild(tr.children[td_index]);
							}
						} 
					}
				} else
				if (noAdditionalKeys && !tr.textContent.trim()) {
					focus = tr.nextElementSibling || table.nextElementSibling || this.CreateNewLine(table);
					if (focus.firstElementChild) focus = focus.firstElementChild;
					tr.parentElement.removeChild(tr);
				}
				break;
			case 45: //INSERT
				if (!ev.shiftKey) td_index++; //insert column after the current
				
				for (let i = 0, c = table.childElementCount; i < c; i++) {
					let tbody = <HTMLElement>table.children[i];
					for (let i = 0, c = tbody.childElementCount; i < c; i++) {
						let tr = <HTMLElement>tbody.children[i];
						let ref = tr.children[td_index];
						let newTd = this.document.createElement(tr.children[0].tagName);
						tr.insertBefore(newTd, ref);
					}
				}
				
				focus = td.parentElement.children[td_index];
				break;
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

		if (focus) {
			Utils.move_cursor_to_end(focus);
			ev.preventDefault();
			
			return true;
		}
		
		return false;
	}
}

}