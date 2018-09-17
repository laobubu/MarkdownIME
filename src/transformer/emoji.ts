import { TransformerResult } from ".";
import { setCaretAfter } from "../dom";
import * as EmojiData from "../extra/emoji-data";

export const shortcodeDict: Record<string, string> = {
  "smile": "😄",
}

export const emoticonDict: Record<string, string> = {
  ":)": "😃",
}

EmojiData.loadShortCodes(shortcodeDict)
EmojiData.loadEmoticons(emoticonDict, shortcodeDict)

function transformEmoji(caret: Node): TransformerResult {
  if (caret.nodeType !== Node.TEXT_NODE) return TransformerResult.FAILED

  const text = caret.textContent
  let output: string = null
  let removeCharCount = 0

  for (const emoticon in emoticonDict) {
    if (text.slice(-emoticon.length) === emoticon) {
      output = emoticonDict[emoticon]
      removeCharCount = emoticon.length
      break
    }
  }

  if (!output) {
    let mat = text.match(/:([^:]+):$/)
    output = mat && shortcodeDict[mat[1]]
    if (output) {
      removeCharCount = mat[0].length
    }
  }

  if (!output) return TransformerResult.FAILED

  caret.textContent = text.slice(0, -removeCharCount) + output
  setCaretAfter(caret)

  return TransformerResult.SUCCESS
}

export default transformEmoji
