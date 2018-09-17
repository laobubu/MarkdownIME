import { elt } from "../dom";
import createBlockTransformer from "./pattern/block";

const transformCodefence = createBlockTransformer(/^```+([\w-]*)$/, (match, line) => {
  let lang = match[1]

  let ans = elt('pre', null, line.childNodes)
  if (lang) ans.setAttribute("data-lang", lang)

  return ans
})

export default transformCodefence
