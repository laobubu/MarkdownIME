import { elt, setCaretAfter, insertAfter } from "../dom";
import { TransformerResult } from ".";

export type MathRenderer = (formula: string, displayMode?: boolean) => HTMLElement

let renderer: MathRenderer = defaultRenderer

export function getMathRenderer() { return renderer }
export function setMathRenderer(r: MathRenderer) { renderer = r || defaultRenderer }

function defaultRenderer(formula: string, displayMode?: boolean): HTMLElement {
  var src = 'http://latex.codecogs.com/gif.latex?' + encodeURIComponent(formula);
  var img = elt('img', {
    src,
    alt: formula,
    title: formula,
    'data-formula': formula,
  });
  return img
}

function transformMath(caret: Node) {
  if (caret.nodeType !== Node.TEXT_NODE) return TransformerResult.FAILED

  const text = caret.textContent
  const mat = text.match(/(\${1,2})([^\$]+)\1$/)
  if (!mat) return TransformerResult.FAILED

  const expr = mat[2], displayMode = mat[1].length == 2
  const mathEl = renderer(expr, displayMode)
  if (!mathEl) return TransformerResult.FAILED

  caret.textContent = text.slice(0, -mat[0].length)
  insertAfter(mathEl, caret)
  setCaretAfter(mathEl)

  return TransformerResult.SUCCESS
}

export default transformMath
