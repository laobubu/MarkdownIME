/// <reference path="Utils.ts" />
/// <reference path="Editor.ts" />

namespace MarkdownIME{

/**
 * Fetching contenteditable nodes from the window and its iframe.
 */
export function Scan(window : Window) : Array<Node>{
	var document = window.document;
	var editors : Array<Node>;
	
	editors = [].slice.call(document.querySelectorAll('[contenteditable]'));
	
	[].forEach.call(
		document.querySelectorAll('iframe'), 
		function(i){
			var result = Scan(i.contentWindow);
			if (result.length)
				editors = editors.concat(result);
		}
	);
	
	return editors;
}

/**
 * Enhance one or more editor.
 */
export function Enhance(editor: any) {
	if (typeof editor['length'] == "number") {
		[].forEach.call(editor, Enhance);
		return;
	}
	
	var rtn : Editor;
	rtn = new Editor(editor);
	rtn.Init();
	
	return rtn;
}

}