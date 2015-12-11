/*!@preserve 
	[MarkdownIME](https://github.com/laobubu/MarkdownIME)
	Copyright 2016 laobubu
	Open the link to obtain the license info. 
*/

/// <reference path="Utils.ts" />
/// <reference path="Editor.ts" />
/// <reference path="UI.ts" />

namespace MarkdownIME{

/**
 * Fetching contenteditable elements from the window and its iframe.
 */
export function Scan(window : Window) : Array<Element>{
	var document = window.document;
	var editors : Array<Element>;
	
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
export function Enhance(editor: Element | Element[]) {
	if (typeof editor['length'] === "number") {
		return [].map.call(editor, Enhance);
	}
	
	var rtn : Editor;
	rtn = new Editor(<Element>editor);
	if (rtn.Init())	
		return rtn;
		
	return null;
}

/**
 * Bookmarklet Entry
 */
export function Bookmarklet(window: Window) {
	[].forEach.call(Enhance(Scan(window)),
	function(editor : Editor){
		UI.Toast.makeToast("MarkdownIME Activated", <HTMLElement>editor.editor, UI.Toast.SHORT).show();
	});
}

/**
 * Function alias, just for compatibility
 * @deprecated since version 0.2
 */
export var bookmarklet = Bookmarklet;
export var enhance = (window, element)=>{Enhance(element)};
export var prepare = enhance;
export var scan = (window)=>{Enhance(Scan(window))};

}