import { elt } from "../dom";
import createBlockTransformer from "./pattern/block";

const transformOrderedList = createBlockTransformer(/^(\d+)[\.\)]$/, (match, line) => {
  let start = match[1] // start number
  let item = elt("li", null, line.childNodes)
  let list = elt("ol", { start }, [item])
  return list
})

export default transformOrderedList
