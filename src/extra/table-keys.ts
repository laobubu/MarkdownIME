import { findUpward, findCaret, setCaret, makeLine, replace, insertAfter, elt, makeBr } from "../dom";

/**
 * Handle keyboard events for table. Now supports:
 *
 * - Insert: insert a column
 * - Tab: goto next cell, or insert a row
 * - Backspace: delete empty row
 * - Del: delete empty row
 * - Up/Down/Left/Right: navigate between cells
 *
 * @returns {boolean} handled or not
 */
export function handleKeyboardEvent(ev: KeyboardEvent): boolean {
  var keyCode = ev.keyCode || ev.which;
  var noAdditionalKeys = !(ev.shiftKey || ev.ctrlKey || ev.altKey);

  if (
    (keyCode !== 8) && //BACKSPACE
    (keyCode !== 45) && //INSERT
    (keyCode !== 46) && //DELETE
    (keyCode !== 9) && //TAB
    (keyCode !== 13) && //ENTER
    (keyCode < 37 || keyCode > 40)
  ) return false;

  var caret = findCaret()
  if (!caret) return false

  let td = findUpward(caret, el => /^t[dh]$/i.test(el.nodeName)) as HTMLTableCellElement
  let tr = findUpward(td, el => /^tr$/i.test(el.nodeName)) as HTMLTableRowElement
  let table = findUpward(tr, el => /^table$/i.test(el.nodeName)) as HTMLTableElement
  if (!td || !tr || !table) return false

  let td_index = 0; // the index of current td
  let td_count = tr.childElementCount;
  while (td_index < td_count && tr.children[td_index] !== td) td_index++;

  if (td_index >= td_count) return false; // not found the cell. awkward but shall not happen

  var focus: Element = null;

  function removeRow() {
    if (noAdditionalKeys && !tr.textContent.trim()) {
      focus = tr.nextElementSibling || table.nextElementSibling;

      if (!focus) insertAfter(focus = makeLine(), table)
      else if (focus.firstElementChild) focus = focus.firstElementChild;

      tr.parentElement.removeChild(tr);
    }
  }

  function removeWholeTable() {
    focus = table.nextElementSibling

    if (!focus) replace(table, focus = makeLine())
    else table.parentElement.removeChild(table)
  }

  function removeColumn() {
    let trs = table.querySelectorAll('tr')
    for (let i = 0; i < trs.length; i++) {
      const tr = trs[i];
      const refTd = tr.children[td_index]
      tr.removeChild(refTd)
    }
  }

  function insertColumn() {
    if (!ev.shiftKey) td_index++; //insert column after the current
    let trs = table.querySelectorAll('tr')
    for (let i = 0; i < trs.length; i++) {
      const tr = trs[i];
      const refTd = tr.children[td_index]
      const newTd = elt(refTd.nodeName, null, [makeBr()])
      tr.insertBefore(newTd, refTd)
    }
    focus = tr.children[td_index];
  }

  function insertRow(focusCell?: number) {
    let newTr = elt('tr')
    for (let i = 0; i < tr.childNodes.length; i++) newTr.appendChild(elt('td'))
    focus = newTr.children[focusCell || 0] || newTr.firstElementChild // first new cell
    focus.appendChild(makeBr())
    insertAfter(newTr, tr)
  }

  switch (keyCode) {
    case 13: //ENTER: maybe end a table
      if (noAdditionalKeys) {
        if ("" === tr.textContent.trim()) removeRow()
        else insertRow(td_index)
      }
      break
    case 46: //DELETE
    case 8: //BACKSPACE
      if (noAdditionalKeys && td.nodeName === "TH" && !td.textContent.trim()) {
        // Caret is in the heading row, an empty column.

        focus = (keyCode === 46 && td.nextElementSibling) || td.previousElementSibling;

        if (!focus) removeWholeTable()  // No more column! the whole table is deleted.
        else removeColumn()             // Remove a column
      } else {
        removeRow()
      }
      break;
    case 45: //INSERT
      insertColumn()
      break;
    case 9: //TAB
      if (noAdditionalKeys) {
        focus = td.nextElementSibling ||
          (tr.nextElementSibling && tr.nextElementSibling.firstElementChild)

        if (!focus) insertRow() // create a row?
      } else if (ev.shiftKey) {
        focus = td.previousElementSibling ||
          (tr.previousElementSibling && tr.previousElementSibling.lastElementChild) ||
          table.previousElementSibling;
      }
      break;
    case 38: //UP
      if (noAdditionalKeys) {
        focus = (tr.previousElementSibling && (<HTMLTableRowElement>tr.previousElementSibling).children[td_index]) ||
          table.previousElementSibling;
      }
      break;
    case 40: //DOWN
      if (noAdditionalKeys) {
        focus = (tr.nextElementSibling && (<HTMLTableRowElement>tr.nextElementSibling).children[td_index]) ||
          table.nextElementSibling;
      }
      break;
  }

  if (focus) {
    setCaret(focus)
    ev.preventDefault();

    return true;
  }

  return false;
}