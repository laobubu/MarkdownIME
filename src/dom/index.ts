/** This file provides some util functions for DOM manipulation */

let win = window
let document = window.document

/** Set the context document. This will affect some DOM operation like `elt`, `findCaret` */
export function setContextDocument(doc: Document) {
  document = doc || window.document
  win = document.defaultView
}

/**
 * Get the context document that currently MarkdownIME is using.
 *
 * The context affects some DOM operation like `elt`, `findCaret`
 */
export function getContextDocument() {
  return document
}

/**
 * Try to get the node which is exactly before the caret.
 */
export function findCaret(): Node {
  const sel = document.getSelection();
  const { anchorNode, anchorOffset } = sel
  if (!sel.isCollapsed || !anchorNode) return null

  if (anchorNode.nodeType === Node.ELEMENT_NODE) {
    return anchorOffset == 0 ? anchorNode : anchorNode.childNodes[anchorOffset - 1]
  }

  if (anchorNode.nodeType === Node.TEXT_NODE) {
    let { textContent } = anchorNode
    if (anchorOffset == 0) return anchorNode.previousSibling
    if (textContent.length <= anchorOffset) return anchorNode
    // break text node into two
    anchorNode.textContent = textContent.slice(0, anchorOffset)
    let newNode = document.createTextNode(textContent.slice(anchorOffset))
    anchorNode.parentNode.insertBefore(newNode, anchorNode.nextSibling)
    sel.setPosition(anchorNode, anchorOffset)
    return anchorNode
  }

  return null
}

export function setCaret(anchor: Node, offset?: number) {
  const sel = document.getSelection();
  if (!sel.isCollapsed) sel.collapseToEnd();
  sel.setPosition(anchor, offset || 0);
  scrollIntoViewIfNeeded((isTextNode(anchor) ? anchor.parentNode : anchor) as HTMLElement)
}

export function setCaretAfter(anchor: Node) {
  const parent = anchor.parentNode
  setCaret(parent, [].indexOf.call(parent.childNodes, anchor) + 1)
  scrollIntoViewIfNeeded((isTextNode(anchor) ? parent : anchor) as HTMLElement)
}

/**
 * Get Line Container Node
 */
export function getLineContainer(el: Node) {
  return findUpward(el, node => /^(?:div|p|h\d|pre|body|td|th|li|dt|dd|blockquote)$/i.test(node.nodeName)) as HTMLElement
}

export function breakElement(el: Element) {
  if (!el || !el.parentElement) return
  const parent = el.parentElement
  const frag = document.createDocumentFragment()
  while (el.childNodes.length) frag.appendChild(el.childNodes[0])
  parent.insertBefore(frag, el)
  parent.removeChild(el)
}

export function findUpward(el: Node, checker: (el: Node) => boolean): Node {
  while (el) {
    if (checker(el)) return el
    else el = el.parentNode
  }
  return null
}

/** tidy one node's childNodes, concate broken text nodes */
export function tidy(el: Element) {
  let nodes = el.childNodes
  for (let i = 0; i < nodes.length; i++) {
    let base = nodes[i]
    if (base.nodeType !== Node.TEXT_NODE) continue

    let forwardCnt = 1
    let forwardText = ""
    while (nodes[i + forwardCnt] && nodes[i + forwardCnt].nodeType === Node.TEXT_NODE) {
      forwardText += nodes[i + forwardCnt].textContent
      forwardCnt++
    }

    if (forwardCnt > 1) {
      while (forwardCnt-- > 1) el.removeChild(nodes[i + 1])
      base.textContent += forwardText
    }
    i++
  }
}

/** Create element */
export function elt<TagName extends keyof HTMLElementTagNameMap>(tag: TagName, attrs?: Record<string, string | true>, content?: string | NodeList | Node[]): HTMLElementTagNameMap[TagName];
export function elt(tag: string, attrs?: Record<string, string | true>, content?: string | NodeList | Node[]): HTMLElement;

export function elt(tag: string, attrs?: Record<string, string | true>, content?: string | NodeList | Node[]) {
  var el = document.createElement(tag)
  if (attrs) for (var attr in attrs) {
    let val = attrs[attr]
    el.setAttribute(attr, "" + val);
  }
  if (typeof content === 'string') el.textContent = content;
  else if (content && content.length > 0) [].slice.call(content).forEach(child => el.appendChild(child));
  return el;
}

/** create <br> for empty lines */
export function makeBr() {
  return elt('br', { 'data-bogus': true })
}

/** create <p> for empty lines */
export function makeLine(content?: Node[] | NodeList) {
  return elt('p', null, content || [makeBr()])
}

/** insert new node before old one, then remove old one */
export function replace(old: Node, newNode: Node) {
  let parent = old && old.parentNode;
  if (!parent) return
  parent.insertBefore(newNode, old)
  parent.removeChild(old)
}

/** insert a node after an existsing one */
export function insertAfter(newNode: Node, refNode: Node) {
  let parent = refNode && refNode.parentNode;
  if (!parent) return
  parent.insertBefore(newNode, refNode.nextSibling)
}

export function isTextNode(node: any): node is Text {
  return node && node.nodeType === Node.TEXT_NODE
}

interface ClientRect {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

/**
 * get current viewport rect
 *
 * @returns Non-Standard ClientRect (because IE/Edge not supports DOMRect)
 */
export function getViewport(_window?: Window, considerScroll?: boolean): ClientRect {
  if (!_window) _window = win || window;

  let left = considerScroll ? _window.pageXOffset : 0
  let top = considerScroll ? _window.pageYOffset : 0
  let height = _window.innerHeight
  let width = _window.innerWidth

  return {
    left, top, height, width,
    right: left + width,
    bottom: top + height,
  }
}

const enum RectContainType {
  /** subRect is in the container */ CONTAINED = 0,
  /** subRect is above the container */ ABOVE,
  /** subRect is below the container */ BELOW,
  LEFT, RIGHT
}

function rectContains(container: ClientRect, subRect: ClientRect, tolerance: number): RectContainType {
  if (container.left - subRect.left >= tolerance) return RectContainType.LEFT
  if (subRect.right - container.right >= tolerance) return RectContainType.RIGHT
  if (container.top - subRect.top >= tolerance) return RectContainType.ABOVE
  if (subRect.bottom - container.bottom >= tolerance) return RectContainType.BELOW
  return RectContainType.CONTAINED
}

/**
 * a much better polyfill for scrollIntoViewIfNeeded
 *
 * @returns - `true` -- trigged and now node is on the top edge.
 *          - `false` -- trigged and node is on the bottom edge.
 *          - `undefined` -- nothing happened
 */
export function scrollIntoViewIfNeeded(node: HTMLElement) {
  if ('scrollIntoViewIfNeeded' in node) { // Chrome only stuff
    (node as any).scrollIntoViewIfNeeded(false);
    return;
  }

  const body = node.ownerDocument.body
  const window = body.ownerDocument.defaultView

  let scrollArg: (undefined | true | false) = void 0;

  let nodeRect: ClientRect = node.getBoundingClientRect()
  let node_it = node

  while (scrollArg === void 0) {
    let container: HTMLElement = node_it.parentElement
    let containerRect: ClientRect = (node_it === body) ? getViewport(window, false) : container.getBoundingClientRect()

    let rectRelation = rectContains(containerRect, nodeRect, 5)
    if (rectRelation === RectContainType.LEFT || rectRelation === RectContainType.ABOVE) scrollArg = true
    if (rectRelation === RectContainType.RIGHT || rectRelation === RectContainType.BELOW) scrollArg = false

    if (node_it === body) break

    node_it = container
  }

  if (scrollArg !== void 0) node.scrollIntoView(scrollArg)
  return scrollArg
}
