import { elt } from "../dom";
import createBlockTransformer from "./pattern/block";

const transformUnorderedList = createBlockTransformer(/^[-*]$/, (match, line) => {
  let item = elt("li", null, line.childNodes)
  let list = elt("ul", null, [item])
  return list
})

export default transformUnorderedList
