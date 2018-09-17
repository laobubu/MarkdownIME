import { isTextNode, elt, replace, setCaret, makeBr, setCaretAfter, getContextDocument } from "../dom";

export default function tryMakeTable(caret: Node, line: Element): boolean {
  let nodes = line.childNodes, first: Node = nodes[0], last: Node = nodes[nodes.length - 1]

  // sometime there is an extra <br>, just remove it
  if (last && last.nodeName.toLowerCase() === 'br') {
    line.removeChild(last)
    last = nodes[nodes.length - 1]
  }

  if (!isTextNode(first) || !isTextNode(last)) return false
  if (!/^\s*\|/.test(first.textContent) || !/\|\s*$/.test(last.textContent)) return false

  let headerCells: HTMLTableHeaderCellElement[] = []
  let currentCell: HTMLTableHeaderCellElement = null

  function goNextCell() {
    if (currentCell && currentCell.childNodes.length > 0) headerCells.push(currentCell)
    currentCell = elt('th')
  }

  goNextCell()

  while (nodes.length > 0) {
    let srcNode = nodes[0]
    if (isTextNode(srcNode)) {
      srcNode.textContent.split("|").forEach((text, idx) => {
        if (idx > 0) goNextCell()
        if (!/^\s*$/.test(text)) currentCell.appendChild(getContextDocument().createTextNode(text))
      })
      line.removeChild(srcNode)
    } else {
      currentCell.appendChild(srcNode)
    }
  }

  goNextCell()

  if (headerCells.length == 0) return false

  let headerRow = elt('tr', null, headerCells)
  let contentRow = elt('tr', null, headerCells.map(() => elt('td')))
  let table = elt('table', null, [headerRow, contentRow])

  let contentCell = contentRow.childNodes[0] as HTMLTableCellElement
  contentCell.appendChild(makeBr())

  replace(line, table)
  setCaret(contentCell)

  return true
}
