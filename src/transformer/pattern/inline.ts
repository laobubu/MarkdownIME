import { getLineContainer, replace, setCaret, elt, makeBr, setCaretAfter, tidy, getContextDocument } from "../../dom";
import { TransformerResult, TransformerType, caretIsSafeForInline } from "../index";
import { lastIndexOf } from "../../dom/textNodeSearch";

/**
 * Create a Transformer for inline elements.
 *
 * examples: (where `|` is caret, '**' is tag):
 *  - `<p> Hello **World**|</p>`
 *  - `<p> Hello **Wo <b>rl</b> d**|</p>`
 */
export default function createInlineTransformer(
  tag: string,
  doWrap: (range: Range) => HTMLElement,
  reserveTag?: boolean,
): TransformerType {
  const tagLen = tag.length

  return function (caret: Node): TransformerResult {
    if (!caretIsSafeForInline(caret) || caret.textContent.slice(-tagLen) !== tag) {
      return TransformerResult.FAILED
    }

    // do not accept **space before tailing tag **
    if (caret.textContent.slice(-tagLen - 1, -tagLen) === ' ') return TransformerResult.FAILED

    const document = getContextDocument()
    let caretTextLen = caret.textContent.length

    // find beginning tag
    let beginPos = lastIndexOf(caret.parentNode.childNodes, tag, { node: caret, ch: caretTextLen - tagLen - 1 })
    if (!beginPos) return TransformerResult.FAILED

    let endCh = caretTextLen - tagLen

    if (!reserveTag) {
      // remove the tag
      caret.textContent = caret.textContent.slice(0, -tagLen)

      let bnt = beginPos.node.textContent
      beginPos.node.textContent = bnt.slice(0, beginPos.ch) + bnt.slice(beginPos.ch + tagLen)

      if (caret === beginPos.node) endCh -= tagLen
    } else {
      // move the selected range
      beginPos.ch += tagLen
    }

    let range = document.createRange()
    range.setStart(beginPos.node, beginPos.ch)
    range.setEnd(caret, endCh)

    let wrapper = doWrap(range)
    if (!wrapper) return TransformerResult.FAILED

    setCaretAfter(wrapper)
    tidy(wrapper.parentElement)
    return TransformerResult.SUCCESS
  }
}