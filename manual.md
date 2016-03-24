---
layout: post
title: Manual
---

# Recipes

## Enhance all editors inside this window

```javascript
MarkdownIME.Enhance(MarkdownIME.Scan(window));
```

## Enhance one editor (with jQuery)

If you are using TinyMCE, make sure that you can find the real content-editable element; MarkdownIME only works with content-editable elements.

```javascript
MarkdownIME.Enhance($('#editor'));
```

## (almost) Full Example

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

# Basic API

## MarkdownIME.Scan(window)

Return all content-editable elements inside the window, which could be enhanced by MarkdownIME.

## MarkdownIME.Enhance(editors)

Enhance one or more editor, making MarkdownIME work on.

`editors` could be a content-editable HTML element, or an array of HTML elements.

Return one or more `MarkdownIME.Editor` instances if successful.

## MarkdownIME.Bookmarklet(window)

Scan and enhance all editors, then show a notice.

Return nothing.

# Advanced API

Here is a Travis-CI generated document: [http://build.laobubu.net/MarkdownIME/doc/](http://build.laobubu.net/MarkdownIME/doc/)

However, reading the [source code](https://github.com/laobubu/MarkdownIME) is always the best solution.


# Changelog

1.  2016-02-15 - laobubu - typedoc generated doc
2.  2015-12-12 - laobubu - first version
3.  2016-01-04 - laobubu - adding two recipes
4.  2016-02-05 - laobubu - adding codepen example and style
