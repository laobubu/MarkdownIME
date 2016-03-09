/// <reference path="../Renderer/InlineRenderer.ts" />

namespace MarkdownIME.Addon {
	/**
	 * MathAddon is an add-on for InlineRenderer, transforms `$y=ax^2+b$` into a formatted html.
	 * 
	 * This addon MUST have a higher priority, than other inline elements like emphasising.
	 * 
	 * To enable, execute this:
	 *  `MarkdownIME.Renderer.inlineRenderer.addRule(new MarkdownIME.Addon.MathAddon())`
	 * 
	 * Use CODECOGS API to generate the picture.
	 * @see http://latex.codecogs.com/eqneditor/editor.php
	 * 
	 * Originally planned to use http://www.mathjax.org/ , but failed due to its async proccessing.
	 */
	export class MathAddon implements MarkdownIME.Renderer.IInlineTokenRule {
		
		name = "MathFormula";

		//this is the formula image URL prefix.
		imgServer = 'http://latex.codecogs.com/gif.latex?';

		tokens: string[] = ["$"];

		Proc(proc: MarkdownIME.Renderer.InlineRenderProcess): boolean {
			var i1 = proc.i, leftToken = proc.tokens[i1];
			if (!proc.isToken(leftToken, this.tokens[0])) return false;

			while (++proc.i < proc.tokens.length) {
				var rightToken = proc.tokens[proc.i];
				if (proc.isToken(rightToken, this.tokens[0])) {
					if (proc.i === i1 + 1) {
						// something like $$ , not valid
						return false;
					}

					var img = proc.document.createElement('img');
					var formula = proc.toString(proc.tokens.slice(i1 + 1, proc.i)).trim();
					var imgUrl = this.imgServer + encodeURIComponent(formula);
					img.setAttribute("src", imgUrl);
					img.setAttribute("alt", formula);

					proc.tokens.splice(i1, proc.i - i1 + 1, {
						isToken: false,
						data: img
					});
					return true;
				}
			}

			return false;
		}
	}
}