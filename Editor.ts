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
		
		if (this.isTinyMCE) {
			//according to test, node will become <sth><br bogus="true"></sth>
			//if this is half-break, then return
			if (!(node.childNodes.length == 1 && node.firstChild.nodeName == "BR"))
				return;
			//so we get rid of it.
			tinymce_node = node;
			while (!Utils.is_node_block(tinymce_node)) {
				tinymce_node = tinymce_node.parentNode;
			}
			//the we get the real and normalized node.
			node = tinymce_node.previousSibling;
			while (/^UL|OL$/.test(node.nodeName)) {
				node = node.lastChild.lastChild; // this will get the text in li, or another nested ul/ol object.
			}
		}
		
		//normalize the node object, if the node is 
		// 1. editor > #text , then create one wrapper and use the wrapper.
		// 2. blockwrapper > [wrapper >] #text , then use the blockwrapper.
		// 3. editor , which means editor is empty. then f**k user.
		//cond 3
		if (node == this.editor) {
			ev.preventDefault();
			return;
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
		if (Utils.is_line_empty(<HTMLElement> node)) {
			//ouch. it is an empty line.
			console.log("Ouch! empty line.");
			if (node.nodeName == "LI") {
				//it's an empty list item
				//which means it's time to end the list
				node.parentNode.removeChild(node);
				// get the list object
				node = parent_tree.shift();
				//create empty line
				if (/^UL|OL$/.test(node.parentNode.nodeName)) {
					//ouch! nested list!
					_dummynode = this.GenerateEmptyLine("li");
				} else {
					//free! create one new line after the list
					_dummynode = this.GenerateEmptyLine();
				}
				//and insert after the list
				node.parentNode.insertBefore(_dummynode, node.nextSibling);
				node = _dummynode;
				//then focus on the line.
			} else
			{
				//it's just one normal line.
				//create one new line without format.
				_dummynode = this.GenerateEmptyLine();
				node.parentNode.insertBefore(_dummynode, node.nextSibling);
				node = _dummynode;
			}
			Utils.move_cursor_to_end(node);
			ev.preventDefault();
		} else {
			console.log("Renderer on", node);
			node = Renderer.Render(<HTMLElement> node);
			Utils.move_cursor_to_end(node);
			//using browser way to create new line will get dirty format
			//so we create one new line without format.
		}
		
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
		
		//if is typing, process special instant transform.
		var node : Node = range.startContainer;
		if (node.nodeType == 3) {
			var text = node.textContent;
			var text_after = text.substr(range.startOffset + 1);
			var text_before = text.substr(0, range.startOffset);
			
			if (text_before.length < 2) return; //too young, too simple
			if (text_before.charAt(text_before.length - 2) == "\\") return; //escaping. run faster than others. 
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