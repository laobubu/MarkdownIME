/*!@preserve 
	[MarkdownIME](https://github.com/laobubu/MarkdownIME)
    
    Copyright 2016 laobubu

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
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
export function Enhance(editor: Element | Element[]) : Editor {
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