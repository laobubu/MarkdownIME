---
layout: post
title: Manual
---

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

**TinyMCE Notice**: your `<textarea>` element is not supported by MarkdownIME. If you don't know how to get the *real* rich editor, consider the lazy way: [Enhance all editors inside the window](#Enhance%20all%20editors%20inside%20the%20window).

## Full Example

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

## Advanced API

Here is a Travis-CI generated document: [http://build.laobubu.net/MarkdownIME/doc/](http://build.laobubu.net/MarkdownIME/doc/)

However, reading the [source code](https://github.com/laobubu/MarkdownIME) is always the best solution.

# Changelog

1.  2016-02-15 - laobubu - typedoc generated doc
2.  2015-12-12 - laobubu - first version
3.  2016-01-04 - laobubu - adding two recipes
4.  2016-02-05 - laobubu - adding codepen example and style
5.  2016-04-02 - laobubu - update titles
