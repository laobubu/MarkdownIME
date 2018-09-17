import { wrapCode } from "../transformer/inline-collection";
import { findUpward, breakElement, setCaretAfter, getContextDocument } from "../dom";
import { handleKeyboardEvent } from "./table-keys";

function handleFormattingKeys(ev: KeyboardEvent): boolean {
  const { ctrlKey: ctrl, shiftKey: shift, altKey: alt, which } = ev
  const document = getContextDocument()

  if (false) { }
  else if (ctrl && !shift && !alt && which == 73) /* Ctrl+I */ document.execCommand("italic")
  else if (ctrl && !shift && !alt && which == 66) /* Ctrl+B */ document.execCommand("bold")
  else if (ctrl && !shift && !alt && which == 85) /* Ctrl+U */ document.execCommand("underline")
  else if (ctrl && shift && !alt && which == 61) /* Ctrl+Shift+= */ document.execCommand("superscript")
  else if (ctrl && !shift && !alt && which == 61) /* Ctrl+= */ document.execCommand("subscript")
  else if (ctrl && !shift && !alt && which == 76) /* Ctrl+L */ document.execCommand("justifyLeft")
  else if (ctrl && !shift && !alt && which == 69) /* Ctrl+E */ document.execCommand("justifyCenter")
  else if (ctrl && !shift && !alt && which == 82) /* Ctrl+R */ document.execCommand("justifyRight")
  else return false

  return true
}

function toggleInlineElement(ev: KeyboardEvent): boolean {
  const { ctrlKey: ctrl, shiftKey: shift, altKey: alt, which } = ev
  if (ctrl || shift || alt) return false

  const document = getContextDocument()
  const sel = document.getSelection()
  if (sel.isCollapsed) return false

  let caret = sel.focusNode
  if (caret.nodeType === Node.ELEMENT_NODE) caret = caret.childNodes[sel.focusOffset] || caret

  const range = sel.getRangeAt(0)

  if (which === 192) /* ` */ {
    let code = findUpward(caret, el => el.nodeName.toLowerCase() === 'code') as HTMLElement

    if (code) {
      const newCaretAfter = code.lastChild
      breakElement(code)
      setCaretAfter(newCaretAfter)
    } else {
      code = wrapCode(range)
      setCaretAfter(code)
    }
  }
  else return false

  return true
}

export default function bindShortkeys(editor: HTMLElement) {
  editor.addEventListener('keydown', ev => {
    try {
      let handled = false /* add a `false` to align the following methods */
        || handleFormattingKeys(ev)
        || toggleInlineElement(ev)
        || handleKeyboardEvent(ev) // table keys

      if (!handled) return
    } catch (err) {
      return
    }

    ev.preventDefault()
    ev.stopPropagation()
  }, false)
}
