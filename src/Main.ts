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

namespace MarkdownIME {
	/**
	 * Fetching contenteditable elements from the window and its iframe.
	 */
	export function Scan(window: Window): Element[] {
		var document = window.document;
		var editors: Element[] = [].slice.call(document.querySelectorAll('[contenteditable], [designMode]'));

		[].forEach.call(
			document.querySelectorAll('iframe'),
			(i) => {
				try {
					var result = Scan(i.contentWindow);
					[].push.apply(editors, result);
				} catch (err) {
					//security limit, cannot scan the iframe
				}
			}
		);

		return editors;
	}

	/**
	 * Enhance one or more editor.
	 */
	export function Enhance(editor: Element | Element[]): Editor | Editor[] {
		if (typeof editor['length'] === "number" && editor[0]) {
			return [].map.call(editor, Enhance);
		}

		var rtn: Editor;
		rtn = new Editor(<Element>editor);
		if (rtn.Init())
			return rtn;

		return null;
	}

	/**
	 * Bookmarklet Entry
	 */
	export function Bookmarklet(window: Window) {
		(<Editor[]>Enhance(Scan(window))).forEach((editor: Editor) => {
			if (!editor) return;
			UI.Toast.showToast("MarkdownIME Activated", <HTMLElement>editor.editor, UI.Toast.SHORT, true);
		});
	}
}
