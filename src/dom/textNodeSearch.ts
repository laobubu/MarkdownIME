export interface TNSPosition {
  node: Text
  ch: number // char index
}

export function lastIndexOf(nodes: NodeList, needle: string, since?: TNSPosition): TNSPosition {
  let node: Node, ch: number

  if (since) {
    if (!since.node) return null
    node = since.node
    ch = since.ch

    while (ch < 0) {
      do { node = node.previousSibling } while (node && node.nodeType !== Node.TEXT_NODE);
      if (!node) return null
      node = node as Text
      ch += node.textContent.length
    }

    ch = node.textContent.lastIndexOf(needle, ch)
    if (ch > -1) return { node: node as Text, ch }
    else node = node.previousSibling
  } else {
    node = nodes[nodes.length - 1]
  }

  if (!node) return null

  do {
    if (node.nodeType !== Node.TEXT_NODE) continue
    ch = node.textContent.lastIndexOf(needle)
    if (ch > -1) return { node: node as Text, ch }
  } while (node = node.previousSibling)

  return null
}
