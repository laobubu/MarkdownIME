import { getLineContainer, replace, setCaret, elt, makeBr, getContextDocument } from "../../dom";
import { TransformerResult, TransformerType } from "../index";

export default function createBlockTransformer(
  prefix: RegExp,
  transformLine: (matchResult: RegExpMatchArray, oldLine: Element, caret: Node) => Element,
): TransformerType {
  return (caret: Node): TransformerResult => {
    let matchResult = caret.textContent.match(prefix)
    if (!matchResult) return TransformerResult.FAILED

    let line = getLineContainer(caret)
    let tmpNode = caret
    while (tmpNode != line) {
      if (tmpNode.previousSibling) return TransformerResult.FAILED
      tmpNode = tmpNode.parentNode
    }

    const document = getContextDocument()

    let placeHolder = document.createComment("placeholder")
    line.parentNode.insertBefore(placeHolder, line)

    let newLine = transformLine(matchResult, line, caret)
    if (!newLine) {
      return TransformerResult.FAILED
    } else if (newLine === line) {
      placeHolder.parentNode.removeChild(placeHolder)
    } else {
      try { placeHolder.parentNode.removeChild(line) } catch (err) { }
      replace(placeHolder, newLine)
    }

    caret.textContent = ""
    if (!newLine.textContent && !newLine.querySelector('br')) {
      let br = makeBr()
      if (caret.nodeType === Node.TEXT_NODE)
        caret.parentNode.insertBefore(br, caret.nextSibling)
      else
        caret.appendChild(br)
    }
    setCaret(caret)

    return TransformerResult.NEED_PREVENT_DEFAULT
  }
}