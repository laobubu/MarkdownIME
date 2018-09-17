import { findUpward } from "../dom";

import transformHR from "./hr";
import transformHeader from "./header";
import transformBlockquote from "./blockquote";
import transformOrderedList from "./ordered-list";
import transformUnorderedList from "./unordered-list";
import transformCodefence from "./codefence";
import inlineStyleTransformers from "./inline-collection";
import transformLinkAndImage from "./link-n-image";
import transformEmoji from "./emoji";
import transformMath from "./math";

export const enum TransformerResult {
  FAILED = 0,
  SUCCESS,
  NEED_PREVENT_DEFAULT,
}
export type TransformerType = (caret: Node) => TransformerResult

const transformers: Array<TransformerType> = [
  transformHeader, transformHR, transformBlockquote,
  transformOrderedList, transformUnorderedList,
  transformCodefence,

  ...inlineStyleTransformers,
  transformLinkAndImage,
  transformEmoji,
  transformMath,
]

export function caretIsSafeForInline(caret: Node): caret is Text {
  if (caret.nodeType !== Node.TEXT_NODE) return false
  if (findUpward(caret, parent => /^(?:code|pre)$/i.test(parent.nodeName))) return false
  return true
}

export { transformers }
