import { elt, makeLine } from "../dom";
import createBlockTransformer from "./pattern/block";

const transformBlockquote = createBlockTransformer(/^(?:>\s*)+$/, (match, line) => {
  let bqCount = 0, txt = match[0]
  for (let i = 0; i < txt.length; i++) if (txt.charAt(i) === '>') bqCount++

  const isInList = line.tagName.toLowerCase() === "li"
  if (isInList) line = makeLine(line.childNodes)

  let ans = line;
  while (bqCount--) ans = elt("blockquote", null, [ans])

  if (isInList) ans = elt("li", null, [ans])

  return ans
})

export default transformBlockquote
