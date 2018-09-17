import { elt } from "../dom";
import createBlockTransformer from "./pattern/block";

const transformHR = createBlockTransformer(/^---+$/, (match, line) => {
  let hr = elt('hr')
  line.parentNode.insertBefore(hr, line)
  return line
})

export default transformHR
