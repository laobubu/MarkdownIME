import { elt } from "../dom";
import createBlockTransformer from "./pattern/block";

const transformHeader = createBlockTransformer(/^#{1,6}$/, (match, line) => {
  let headerLevel = match[0].length
  let headerEl = elt("h" + headerLevel, null, line.childNodes)
  return headerEl
})

export default transformHeader
