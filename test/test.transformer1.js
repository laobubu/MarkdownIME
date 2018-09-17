/// <reference path="./typings.d.ts" />

QUnit.module("Transformer");
QUnit.test("Transformers 1", function (assert) {
  /**
   * @param {string} srcHtml contains "✍" which means caret is there
   * @param {string} expectHtml
   * @param {string} message
   * @param {boolean} [enterKey]
   */
  function test(message, srcHtml, expectHtml, enterKey) {
    srcHtml = srcHtml.replace('✍', '<span data-anchor></span>')
    editor.innerHTML = srcHtml

    let anchor = editor.querySelector('[data-anchor]')
    let caret = anchor.previousSibling
    anchor.parentNode.removeChild(anchor)
    MarkdownIME.DOM.setCaretAfter(caret)

    ime.doTransform(!!enterKey)

    assert.equal(editor.innerHTML, expectHtml, message)
  }

  test("Inline -- bold", `Hello **World**✍`, `<p>Hello <b>World</b></p>`)
  test("Inline -- italic (with other DOMNode inside)", `<div>Lorem *<b>Ipsue</b>*✍ Dollar</div>`, `<div>Lorem <i><b>Ipsue</b></i> Dollar</div>`)
  test("Inline -- italic 2", `<div>Lorem *CDE <b>Ipsue</b>*✍ Dollar</div>`, `<div>Lorem <i>CDE <b>Ipsue</b></i> Dollar</div>`)
  test("Inline -- don't style if there's a space before tailing token", `<div>XX *CDE <b>Ipsue</b> *✍ YY</div>`, `<div>XX *CDE <b>Ipsue</b> * YY</div>`)
  test("Inline -- bold + italic", `Hello ***World***✍`, `<p>Hello <i><b>World</b></i></p>`)

  test("InlineCode -- ", "<p>`Func Lorem`✍ Ipsue</p>", "<p><code>Func Lorem</code> Ipsue</p>")
  test("InlineCode -- ignore backquotes in <code>", "<p>Already <code>is `code`✍</code> now</p>", "<p>Already <code>is `code`</code> now</p>")

  test("Header", "###✍", `<h3><br data-bogus="true"></h3>`)
  test("Header - transform exisiting paragraph", "<p>##✍Hello</p>", `<h2>Hello</h2>`)

  test("HR", "<p>-----✍</p>", `<hr><p><br data-bogus="true"></p>`)

  test("Empty Unordered List", "<p>-✍</p>", "<ul><li><br data-bogus=\"true\"></li></ul>")
  test("Empty Ordered List", "<p>3.✍</p>", "<ol start=\"3\"><li><br data-bogus=\"true\"></li></ol>")
  test("Ordered List", "<p>4.✍Hello World</p>", "<ol start=\"4\"><li>Hello World</li></ol>")

  test("Blockquote", "<p>>>>✍</p>", "<blockquote><blockquote><blockquote><p><br data-bogus=\"true\"></p></blockquote></blockquote></blockquote>")
  test("Blockquote with content", "<p>>>>✍Wow</p>", "<blockquote><blockquote><blockquote><p>Wow</p></blockquote></blockquote></blockquote>")
})