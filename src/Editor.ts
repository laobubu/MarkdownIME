/// <reference path="Utils.ts" />
/// <reference path="Renderer.ts" />

namespace MarkdownIME{

export var config = {
	"wrapper": "p",	// the default wrapper for plain text line
	"code_block_max_empty_lines": 5, // if there are so many continous empty lines, end the code block 
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
			var txtnode = range.startContainer;
			while (txtnode.nodeType != Node.TEXT_NODE && txtnode.lastChild)
				txtnode = txtnode.lastChild;
			var text = txtnode.textContent;
			var br = this.document.createElement('br');
			var space = this.document.createTextNode("\n");
			console.log("part", text);
			
			if (/^[\n\s]*$/.test(text)) {
				for (var i = 1; i <= config.code_block_max_empty_lines; i++) {
					var testnode = node.childNodes[node.childNodes.length - i];
					if (!testnode) break;
					if (!Utils.is_node_empty(testnode)) break;
				}
				if (i > config.code_block_max_empty_lines)
					text = '```';
			}
			
			if (text == '```') {
				//end the code block
				node.removeChild(txtnode);
				while (node.lastChild && Utils.is_node_empty(node.lastChild))
					node.removeChild(node.lastChild);
				_dummynode = this.GenerateEmptyLine();
				node.parentNode.insertBefore(_dummynode, node.nextSibling);
				Utils.move_cursor_to_end(_dummynode);
			} else {
				//insert another line
				node.insertBefore(br, txtnode.nextSibling);
				node.insertBefore(space, br.nextSibling);
				Utils.move_cursor_to_end(space);
			}
			ev.preventDefault();
			return;
		} else
		if (Utils.is_line_empty(<HTMLElement> node)) {
			//ouch. it is an empty line.
			console.log("Ouch! empty line.");
			//create one empty line without format.
			_dummynode = this.GenerateEmptyLine();
			if (Utils.Pattern.NodeName.list.test(node.parentNode.nodeName)) {
				//it's an empty list item
				//which means it's time to end the list
				node.parentNode.removeChild(node);
				// get the list object
				node = parent_tree.shift();
				//create empty line
				if (Utils.Pattern.NodeName.list.test(node.parentNode.nodeName)) {
					//ouch! nested list!
					_dummynode = this.GenerateEmptyLine("li");
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
			node.parentNode.insertBefore(_dummynode, node.nextSibling);
			Utils.move_cursor_to_end(_dummynode);
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
	 * Create new line after one node and move cursor to it.
	 * return false if not successful.
	 */
	CreateNewLine(node : Node) : boolean {
		var _dummynode : Node;
		
		//using browser way to create new line will get dirty format
		//so we create one new line without format.
		if (
			Utils.Pattern.NodeName.line.test(node.nodeName) ||
			Utils.Pattern.NodeName.hr.test(node.nodeName) ||
			Utils.Pattern.NodeName.li.test(node.nodeName)
		) {
			var tagName = Utils.Pattern.NodeName.li.test(node.nodeName) ? "li" : null;
			_dummynode = this.GenerateEmptyLine(tagName);
			node.parentNode.insertBefore(_dummynode, node.nextSibling);
			Utils.move_cursor_to_end(_dummynode);
			return true;
		}
		
		//as for a new <pre>, do not create new line
		if (
			Utils.Pattern.NodeName.pre.test(node.nodeName)
		) {
			Utils.move_cursor_to_end(node);
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
		
		if (keyCode == 13 && !ev.shiftKey && !ev.ctrlKey) {
			this.ProcessCurrentLine(ev);
			return;
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
				while (!Utils.is_node_block(node)) 
					node = node.parentNode;
				console.log("fix to ", node);
				if (node != this.editor && node.nodeName != "PRE") {
					let result = Renderer.Render(<HTMLElement>node);
					if (result.nodeName == "HR") {
						//for <hr> something needs to be special.
						this.CreateNewLine(result);
					} else {
						if (result.textContent.length == 0) 
							result.innerHTML = '<br data-mdime-bogus="true">';
						Utils.move_cursor_to_end(result);
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