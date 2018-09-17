/// <reference types="qunit" />
/// <reference path="../dist/index" />

import * as MarkdownIME_Module from "../dist/index"

declare global {
  var editor: HTMLElement
  var ime: MarkdownIME_Module.Editor
  var MarkdownIME: typeof import("../dist/index")
}
