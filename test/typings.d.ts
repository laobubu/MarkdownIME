/// <reference types="qunit" />
/// <reference path="../dist/index" />

import * as MarkdownIME_Module from "../dist/index"

declare global {
  var editor: HTMLElement
  var ime: MarkdownIME_Module.Editor
  var MarkdownIME: typeof import("../dist/index")

  /**
   * Set editor content, and move caret to somewhere
   * @param html may contain "✍" which means caret is there
   */
  function setEditorContent(html: string);

  /**
   * Emulate a key event on `#editor`
   * @param info which keycode, or event info
   * @param type event type. by default is "keydown"
   */
  function emulateKeyEvent(which: number | KeyboardEventInit, type?: 'keydown' | 'keypress' | 'keyup');

  function caretIsInside(node: HTMLElement): boolean;
}
