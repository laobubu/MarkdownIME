/*!
 * MarkdownIME by laobubu
 * @url https://github.com/laobubu/MarkdownIME
 */

import * as DOM from "./dom"
import { findCaret, setCaret, replace, getLineContainer, findUpward, makeLine, setContextDocument } from "./dom";
import { transformers, TransformerResult } from './transformer'

import bindShortkeys from "./extra/shortkeys";
import tryHoistBlock from "./extra/leave-block";
import tryInsertLine from "./extra/new-line";
import { Toast } from "./extra/toast";
import tryMakeTable from "./extra/make-table";

export { DOM }
export { getContextDocument, setContextDocument, elt } from "./dom"
export { Toast, ToastStatus } from "./extra/toast";
export { emoticonDict, shortcodeDict as emojiDict } from "./transformer/emoji"
export { getMathRenderer, setMathRenderer, MathRenderer } from "./transformer/math";

export interface Editor {
  editor: HTMLElement
  document: Document

  /**
   * do transform on current caret.
   *
   * @param enterKey if true, a new line might be inserted
   */
  doTransform(enterKey?: boolean): TransformerResult
}

export interface EnhanceOption {
  /**
   * MarkdownIME provides Ctrl+B, Ctrl+I, Ctrl+E, Ctrl+R ... shortkeys by default.
   * You may disable this feature
   *
   * If not configured, MarkdownIME will set to `true` if the editor is TinyMCE
   */
  noShortkey: boolean

  /** When MarkdownIME is ready, show a toast above */
  successToast: boolean
}

/** Return all content-editable elements inside the window, which could be enhanced by MarkdownIME. */
export function Scan(window: Window): HTMLElement[] {
  var document = window.document
  var candidates = document.querySelectorAll('[contenteditable], [designMode]')
  var editors: HTMLElement[] = [];

  for (let i = 0; i < candidates.length; i++) {
    let candidate = candidates[i] as HTMLElement
    let rect = candidate.getBoundingClientRect()
    if (rect.height > 10 && rect.width > 10) editors.push(candidate)
  }

  [].forEach.call(
    document.querySelectorAll('iframe'),
    (i) => {
      try {
        var result = Scan(i.contentWindow)
        editors.push(...result)
      } catch (err) {
        //security limit, cannot scan the iframe
      }
    }
  );

  return editors;
}

/** Enhance one contentEditable element, making MarkdownIME work on. */
export function Enhance(editor: HTMLElement, options?: Partial<EnhanceOption>): Editor

/** Enhance multi contentEditable elements, making MarkdownIME work on. */
export function Enhance(editor: ArrayLike<HTMLElement>, options?: Partial<EnhanceOption>): Editor[]

export function Enhance(editor: HTMLElement | ArrayLike<HTMLElement>, options?: Partial<EnhanceOption>): Editor | Editor[] {
  if ('length' in editor) {
    let ans: Editor[] = []
    for (let i = 0; i < editor.length; i++) ans.push(EnhanceOne(editor[i], options))
    return ans
  } else {
    return EnhanceOne(editor, options)
  }
}

/** Scan and enhance all editors, then show a notice. */
export function Bookmarklet(win?: Window, options?: Partial<EnhanceOption>) {
  const opts: Partial<EnhanceOption> = { successToast: true }
  if (options) { for (let key in options) opts[key] = options[key] }

  const editableElements = Scan(win || window)
  Enhance(editableElements, opts)
}

function EnhanceOne(editor: HTMLElement, options?: Partial<EnhanceOption>): Editor {
  if (!options) options = {};

  if (!('noShortkey' in options)) {
    // by default, disable shortkeys in TinyMCE and Quill
    options.noShortkey = editor.id === 'tinymce' || /\bql-editor\b/.test(editor.className)
  }

  if (!options.noShortkey) bindShortkeys(editor)

  let document = editor.ownerDocument
  let doTransform = (enterKey?: boolean): TransformerResult => {
    setContextDocument(document)
    let caretEl = findCaret()
    if (!caretEl) return TransformerResult.FAILED

    if (editor === caretEl) {
      caretEl = makeLine()
      editor.appendChild(caretEl)
      setCaret(caretEl)
    } else if (caretEl.nodeType === Node.TEXT_NODE && caretEl.parentNode === editor) {
      // make a line container for
      // <div id="editor"> content <b> not </b> wrapped by P or DIV </div>
      let placeholder = document.createComment("placeholder")
      replace(caretEl, placeholder)
      let line = makeLine([caretEl])
      replace(placeholder, line)
      setCaret(caretEl)
    }

    for (let i = 0; i < transformers.length; i++) {
      let transformer = transformers[i]
      let trResult = transformer(caretEl)
      if (trResult !== TransformerResult.FAILED) return trResult
    }

    // no transformer work. Maybe time to handle Enter Key?

    if (enterKey) {
      let isInCodeFence = !!findUpward(caretEl, el => el.nodeName.toLowerCase() === 'pre')
      let line = getLineContainer(caretEl)
      let success = tryHoistBlock(caretEl, line)

      if (!isInCodeFence && !success) {
        success = tryInsertLine(caretEl, line) || tryMakeTable(caretEl, line)
      }

      if (success) return TransformerResult.NEED_PREVENT_DEFAULT
    }

    // Everything failed

    return TransformerResult.FAILED
  }

  editor.addEventListener('keypress', ev => {
    if (ev.which === 32 || ev.which === 13) { // pressed space key
      let trResult = doTransform(ev.which === 13)
      if (trResult === TransformerResult.NEED_PREVENT_DEFAULT) ev.preventDefault()
    }
  }, false)

  if (options.successToast) Toast.showToast("MarkdownIME loaded", editor, Toast.SHORT, true);

  return { editor, document, doTransform }
}