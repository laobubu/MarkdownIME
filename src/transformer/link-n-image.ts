import { TransformerResult } from ".";
import { setCaretAfter, isTextNode, elt, getContextDocument } from "../dom";
import { lastIndexOf, TNSPosition } from "../dom/textNodeSearch";

function transformLinkAndImage(caret: Node): TransformerResult {
  if (!isTextNode(caret)) return TransformerResult.FAILED
  if (caret.textContent.slice(-1) !== ')') return TransformerResult.FAILED

  const document = getContextDocument()

  let lineNodes = caret.parentElement.childNodes
  let endPos: TNSPosition = { node: caret, ch: caret.textContent.length - 1 }

  let middlePos: TNSPosition = lastIndexOf(lineNodes, "](", endPos)
  if (!middlePos) return TransformerResult.FAILED

  let beginPos: TNSPosition = lastIndexOf(lineNodes, "[", middlePos)
  if (!beginPos) return TransformerResult.FAILED

  // we found ( , )[ and ]    and it's time to extract data

  let urlRange = document.createRange()
  urlRange.setStart(middlePos.node, middlePos.ch)
  urlRange.setEnd(endPos.node, endPos.ch + 1)

  let url = urlRange.cloneContents().textContent.slice(2, -1).trim() // remove "](" and ")", then trim
  if (!url) return TransformerResult.FAILED

  let beginNodeText = beginPos.node.textContent
  let resultElement: HTMLElement
  let isImage = beginNodeText.charAt(beginPos.ch - 1) === '!'

  let textRange = document.createRange()
  textRange.setStart(beginPos.node, beginPos.ch + 1)
  textRange.setEnd(middlePos.node, middlePos.ch)

  if (isImage) {
    let alt = textRange.cloneContents().textContent.trim()
    resultElement = elt("img", { src: url, alt })

    textRange.setStart(beginPos.node, beginPos.ch - 1)
    textRange.setEnd(endPos.node, endPos.ch + 1)
    textRange.deleteContents()
    textRange.insertNode(resultElement)
  } else {
    resultElement = elt("a", { href: url })

    let junkRange = document.createRange()
    junkRange.setStart(beginPos.node, beginPos.ch)
    junkRange.setEnd(beginPos.node, beginPos.ch + 1)

    junkRange.deleteContents()
    urlRange.deleteContents()
    textRange.surroundContents(resultElement)
  }

  setCaretAfter(resultElement)

  return TransformerResult.SUCCESS
}

export default transformLinkAndImage
