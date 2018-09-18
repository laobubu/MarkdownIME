/// <reference path="./typings.d.ts" />

QUnit.module("Table");
QUnit.test("Make a table", function (assert) {
  setEditorContent("<p>| Hello | XX <b>World</b> |✍</p>")
  emulateKeyEvent(13, 'keypress')

  var table = editor.querySelector('table')

  assert.ok(table, "Made a table")
  assert.equal(table.querySelectorAll('th').length, 2, "Header row has 2 cells")
  assert.equal(table.querySelectorAll('td').length, 2, "And has 2 empty cells")

  var firstEmptyCell = table.querySelector('td')
  assert.ok(caretIsInside(firstEmptyCell), "Caret is in the 1st empty cell")
})

QUnit.test("Tab key", function (assert) {
  const keyCode = 9
  setEditorContent("<table><tr><th> Hello </th><th> XX <b>World</b></th></tr><tr><td>✍<br data-bogus=\"true\"></td><td></td></tr></table>")

  var table = editor.querySelector('table')
  var initCells = table.querySelectorAll('td')

  emulateKeyEvent(keyCode) // Tab
  assert.ok(caretIsInside(initCells[1]), "Tab: to next cell")

  emulateKeyEvent({ which: keyCode, keyCode, shiftKey: true }) // Shift+Tab
  assert.ok(caretIsInside(initCells[0]), "Shift-Tab: to prev cell")

  emulateKeyEvent(keyCode) // Tab
  emulateKeyEvent(keyCode) // Tab
  assert.equal(table.querySelectorAll('tr').length, 3, "Tab twice: insert a new row")
  assert.ok(caretIsInside(table.querySelectorAll('td')[2]), "Tab twice: caret in the first new cell")

  emulateKeyEvent({ which: keyCode, keyCode, shiftKey: true }) // Shift+Tab
  assert.ok(caretIsInside(initCells[1]), "Shift-Tab: back to last row's last cell")
})

QUnit.test("Enter key", function (assert) {
  const keyCode = 13
  setEditorContent("<table><tr><th> Hello </th><th> XX <b>World</b></th></tr><tr><td>Hi</td><td>There✍</td></tr></table>")

  var table = editor.querySelector('table')
  var $$ = (selector) => table.querySelectorAll(selector)

  emulateKeyEvent(keyCode) // Enter key in non-empty row

  assert.equal($$('tr').length, 3, 'Inserted a new row (Enter key in non-empty row)')
  assert.ok(caretIsInside($$('td')[3]), 'Caret in 4th cell')

  emulateKeyEvent(keyCode) // Enter key in empty row

  assert.equal($$('tr').length, 2, "Remove the current empty row (Enter key in empty row)")
  assert.notOk(caretIsInside(table), 'Caret leaves table')
  assert.ok(caretIsInside(table.nextElementSibling), "Caret is in table's following element")
})

QUnit.test("Up and Down key", function (assert) {
  setEditorContent(`
  <p>Lorem Ipsue</p>
  <table><tbody>
    <tr><th>R1</th><th>R2</th><th>R3<br></th></tr>
    <tr><td>a</td><td>b</td><td>c✍</td></tr>
    <tr><td>d</td><td>e</td><td>f</td></tr>
  </tbody></table>
  <p>Lorem Ipsue</p>`)

  var table = editor.querySelector('table')
  var $ = (selector) => table.querySelector(selector)
  var $$ = (selector) => table.querySelectorAll(selector)

  emulateKeyEvent(40) // Down
  assert.ok(caretIsInside($$('td')[5]), "Down key: to 6th cell")

  emulateKeyEvent(38) // Up
  assert.ok(caretIsInside($$('td')[2]), "Up key: to 3rd cell")

  emulateKeyEvent(40) // Down
  emulateKeyEvent(40) // Down
  assert.ok(caretIsInside(table.nextElementSibling), "Down key at last row: leave table")

  MarkdownIME.DOM.setCaretAfter($('th').firstChild)
  emulateKeyEvent(38) // Up
  assert.ok(caretIsInside(table.previousElementSibling), "Down key at first row: leave table")

})
