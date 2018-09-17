import createInlineTransformer from "./pattern/inline";
import { elt } from "../dom";
import { TransformerType } from ".";

const makeWrapFn = (tag: string) => (range: Range) => {
  const wrapper = elt(tag)
  range.surroundContents(wrapper)
  return wrapper
}

export const wrapCode = makeWrapFn("code")
export const wrapBold = makeWrapFn("b")
export const wrapItalic = makeWrapFn("i")
export const wrapDel = makeWrapFn("del")

export const wrapBoldItalic = (range: Range) => {
  const wrapper = elt("b")
  const wrapperOutside = elt("i")
  range.surroundContents(wrapper)
  range.surroundContents(wrapperOutside)
  return wrapperOutside
}

const inlineStyleTransformers: TransformerType[] = [
  createInlineTransformer("`", wrapCode),

  createInlineTransformer("***", wrapBoldItalic),
  createInlineTransformer("___", wrapBoldItalic),

  // "bold" must be in front of "italic"
  createInlineTransformer("**", wrapBold),
  createInlineTransformer("__", wrapBold),

  createInlineTransformer("*", wrapItalic),
  createInlineTransformer("_", wrapItalic),

  createInlineTransformer("~~", wrapDel),
]

export default inlineStyleTransformers