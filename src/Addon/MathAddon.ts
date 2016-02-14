/// <reference path="../Renderer/InlineRenderer.ts" />

namespace MarkdownIME.Addon {
	/**
	 * MathAddon is an add-on for InlineRenderer, transforms `$y=ax^2+b$` into a formatted html.
	 * 
	 * This addon MUST have a higher priority, than other inline elements like emphasising.
	 * 
	 * To enable, execute this:
	 *  `MarkdownIME.Renderer.inlineRenderer.rules.unshift(new MarkdownIME.Addon.MathAddon())`
	 * 
	 * Use CODECOGS API to generate the picture.
	 * @see http://latex.codecogs.com/eqneditor/editor.php
	 * 
	 * Originally planned to use http://www.mathjax.org/ , but failed due to its async proccessing.
	 */
	export class MathAddon implements MarkdownIME.Renderer.IInlineRule {

		name = "MathFormula";
		
		//this is the formula image URL prefix.
		imgServer = 'http://latex.codecogs.com/gif.latex?';
		
		regex: RegExp = /([^\\]|^)(\${1,2})(.*?[^\\])\2/g;
		
		render(tree: DomChaos){
			tree.replace(this.regex, (whole, leading, bracket, formula) => {
				// var rtn = `<!--protect--><script type="math/tex">${wrapped}</script><!--/protect-->`;
				var formulaHtmlized = Utils.text2html(formula);
				var imgUrl = this.imgServer + encodeURIComponent(formula);
				var rtn = `<!--protect--><!--formula:${formulaHtmlized}--><img alt="${formulaHtmlized}" class="formula" src="${imgUrl}"><!--/protect-->`
				return leading + rtn;
			});
		}
		
		unrender(tree: DomChaos){
			tree.screwUp(/<!--protect--><!--formula:(.+?)--><img .+?><!--\/protect-->/g, function (whole, formulaHtmlized) {
				return '$' + Utils.html_entity_decode(formulaHtmlized) + '$';
			})
		}
	}
}