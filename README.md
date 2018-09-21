# MarkdownIME

MarkdownIME is a fresh and fast way to make text formatted, and a minimal & powerful web rich-text editor.

- **MINIMAL**: No 3rd-party dependency. No buttons or stylesheets. Only require one `div[contentEditable]` and one `script` tags.
- **POWERFUL**: With Markdown markups and shortkeys, you can typeset your document on-the-fly.

[Try out the demo](https://laobubu.github.io/MarkdownIME/). Works like a charm on desktop and mobile!

![](https://laobubu.github.io/MarkdownIME/demo.gif?cache3)

## Quickstart / Guide

[Make a simpliest editor](https://codepen.io/laobubu/pen/ZQqEQo):

1. Include MarkdownIME
   - Via NPM: `const MarkdownIME = require("markdown-ime")`
   - or, via Script Tag: `<script src="https://build.laobubu.net/MarkdownIME/MarkdownIME.js"></script>`
2. Insert an HTML tag: `<div contentEditable id="editor"><p>Hello World</p></div>`
3. Activate MarkdownIME in one JavaScript: `MarkdownIME.Enhance(MarkdownIME.Scan(window));`
   - Using other editor like **TinyMCE** / **Quill**? Please follow [the examples](./examples).

More info can be found in [examples](./examples) and [documentation](https://laobubu.github.io/MarkdownIME/)

## Features

### Supported Editor

- **Vanilla _contenteditable_ elements** - a `div[contentEditable]` makes everything.
- Other rich-text editor based on `contentEditable`
  - [TinyMCE](https://www.tinymce.com/), [Quill](https://quilljs.com/), [WangEditor](http://www.wangeditor.com/) and more, see [examples](./examples)

### Supported Shorkeys

Full list can be found [here](src/extra/shortkeys.ts).

| Key | Feature | Key | Feature |
|-----|---------|-----|---------|
| <kbd>Ctrl + I</kbd> | Toggle Italic |  <kbd>Ctrl + B</kbd> | Toggle Bold |
| <kbd>Ctrl + U</kbd> | Toggle Underline |
| <kbd>Ctrl + Shift + =</kbd> | superscript | <kbd>Ctrl + =</kbd> | subscript |
| <kbd>Ctrl + L</kbd> | justifyLeft |  <kbd>Ctrl + E</kbd> | justifyCenter |
| <kbd>Ctrl + R</kbd> | justifyRight |

| Key | Feature |
|-----|---------|
| <kbd>`</kbd> | Mark selected text as inline-code |

#### Shortkeys in Tables

| Key | Feature | Key | Feature |
|-----|---------|-----|---------|
| <kbd>Insert</kbd> | Insert a column after | <kbd>Shift + Insert</kbd> | Insert a column before |
| <kbd>Tab</kbd> | Go next cell, or insert a row | <kbd>Shift + Tab</kbd> | Go previous cell |
| <kbd>Up</kbd> | Go cell above current | <kbd>Down</kbd> | Go cell under current |

| Key | Feature |
|-----|---------|
| <kbd>Enter</kbd> | If current row is empty, **finish the table**. Otherwise, **insert a row below**. |

Note that some shortkeys might be unavaliable in some browsers;
MarkdownIME shortkeys are disabled in TinyMCE by default.

### Supported Markdown Markups

#### Block Elements

- Headers (beginning with `#` )
- Horizontal ( `---` )
- (Nested) Lists
- (Nested) Blockquote
- Code Block

#### Span Elements

- [Links](http://laobubu.net)
- ***Emphasis***
- `In-line Code`
- ~~Strikethrough~~
- Images
- Emojis ( eg. `:)` or `:smile:` )

#### Tables

- Create a table with `| table | column | headers |` and <kbd>Enter</kbd> key
- Use shortkeys to navigate and master the table (see above)
