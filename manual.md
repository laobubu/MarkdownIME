---
layout: post
title: Manual
---

# Install

You can

- **Use the NPM package** → *const MarkdownIME = require("[markdown-ime](https://www.npmjs.com/package/markdown-ime/)");*
- or directly use the **built bundle file** in browser: <https://build.laobubu.net/MarkdownIME/MarkdownIME.js>

MarkdownIME doesn't require any stylesheet. However, to get best visual experience, please prepare your own gorgeous stylesheet, or copy one from [the example](https://codepen.io/laobubu/pen/ZQqEQo)

# Recipes

## Enhance all editors inside the window

```javascript
MarkdownIME.Enhance(MarkdownIME.Scan(window));
```

## Enhance one editor

```javascript
MarkdownIME.Enhance(document.getElementById('editor')); // vanilla DOM element.
MarkdownIME.Enhance($('#editor')); // jQuery's array-like stuff.
```

## With TinyMCE, Quill and more

To use MarkdownIME with **TinyMCE, Quill, WangEditor** or other rich editors, the best practice is to [follow the examples](https://github.com/laobubu/MarkdownIME/tree/master/examples)!

## (Maybe) Full Example

MarkdownIME has NO dependency, and you can use it with just a content-editable element.

Demo on CodePen: [http://codepen.io/laobubu/pen/ZQqEQo](http://codepen.io/laobubu/pen/ZQqEQo)

```html
<div id="editor" contentEditable="true">
    <p>Input your text here...</p>
</div>

<script src="/path/to/MarkdownIME.js"></script>
<script>
    var editor = document.getElementById('editor');
    MarkdownIME.Enhance(editor);
</script>
```

# API

Every API is under `MarkdownIME` namespace; you shall add `MarkdownIME.` prefix.

```javascript
var editors1 = Scan(window); // Wrong :(
var editors2 = MarkdownIME.Scan(window); // Correct :)
```

## Basic API

### Scan(window)

Return all content-editable elements inside the window, which could be enhanced by MarkdownIME.

### Enhance(editors)

Enhance one or more editor, making MarkdownIME work on.

`editors` could be a content-editable HTML element, or an array of HTML elements.

Return one or more `MarkdownIME.Editor` instances if successful.

### Bookmarklet(window)

Scan and enhance all editors, then show a notice.

Return nothing.

## Math Renderer API

By default MarkdownIME renders TeX formulas via <https://latex.codecogs.com/> service, which might be kinda bad.

You can integrate other renderer, eg [KaTeX](https://katex.org/), by writing **a custom renderer function**.

Example: <https://codepen.io/laobubu/pen/PdLBra>

The renderer function accepts two arguments: TeX formula string, and a ~~useless~~ boolean. Once rendered, this function returns the Element Node. If failed to renderer, returns `null`.

```js
function myAmazingMathRenderer(formula, isDisplayMode) {
    try {
        var element = MarkdownIME.elt('span', { "data-formula": formula, "title": formula })
        katex.render(formula, element, { throwOnError: true })
        element.firstChild.setAttribute('contenteditable', 'false')
        return element
    } catch (er) {
        console.error("KaTeX failed to render: " + formula)
        console.error(er)
    }
    return null
}

// Use our new renderer
MarkdownIME.setMathRenderer(myAmazingMathRenderer)
```

## Advanced API

- `MarkdownIME.elt(tagName, attrs?, childNodes?)`
  - Create a DOM element
  - `attrs` attributes for the new element. eg. `{ src: "xxx.jpg", width: "500" }`
- `MarkdownIME.DOM.*`
  - *see [dom.ts](https://github.com/laobubu/MarkdownIME/blob/master/src/dom/index.ts) which provides useful DOM functions.*

Please read the [source code](https://github.com/laobubu/MarkdownIME).

# Changelog

1.  2016-02-15 - laobubu - typedoc generated doc
2.  2015-12-12 - laobubu - first version
3.  2016-01-04 - laobubu - adding two recipes
4.  2016-02-05 - laobubu - adding codepen example and style
5.  2016-04-02 - laobubu - update titles
6.  2018-09-22 - laobubu - rewrite a lot
