import { insertAfter, elt, setCaretAfter, makeBr } from "../dom";

export default function tryInsertLine(caret: Node, line: Element): boolean {
  const lineNodeName = line.nodeName.toLowerCase()

  if (lineNodeName === 'pre') {
    // Insert new line into <pre> code fence
    // Only Chrome creates another <pre> like <p>, which is not acceptable

    // Other browsers are smart, no need to worry about them.
    if (!/chrome|webkit/i.test(navigator.userAgent)) return false

    const cNext = caret.nextSibling
    if (cNext && cNext.nodeName.toLowerCase() === 'br') {
      insertAfter(makeBr(), cNext)
      setCaretAfter(cNext)
    } else {
      const br = makeBr()
      insertAfter(br, caret)
      insertAfter(makeBr(), br)
      setCaretAfter(br)
    }

    return true
  }

  return false
}