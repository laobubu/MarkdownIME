---
layout: homepage

subtitle: A FRESH WAY TO TYPE & FORMAT

demotext:
 - "# Hello World 8-)"
 - "Just **directly type in** your *Markdown* text like `*this*`, then press Enter or Space."

github: View on GitHub
doc: Documentation
donate: Buy me a coffee

---

<script>
var ua_langs = navigator.languages.slice();
var ua_lang;
if (window.location.search !== "?ncr")
while (ua_lang = ua_langs.shift()) {
    if (/^(zh)$/.test(ua_lang)) {
        window.location.href = "./index." + ua_lang + ".html";
        break;
    } 
}
</script>

## Introducing

[中文版 MarkdownIME 介绍页面 »](./index.zh.html)

Imagine a rich textbox without any button, it's easy if you try.

MarkdownIME provides a fresh way to write well-formatted text. Just type in markdown-ized stuff, and your texts get formatted on-the-fly!

Works like a charm on mobile devices, too!

## Quickstart

### For users who know Markdown

#### It's plugin-free!

<a title="Load MarkdownIME" class="button" id="bookmarklet">Load MarkdownIME</a>

Drag this bookmarklet to your bookmark bar.

When you want to use it on a rich-text editor (eg. Evernote), just click the bookmark and start Markdown!

If you are in trouble, [submit an issue](https://github.com/laobubu/MarkdownIME/issues/new), and tell me where and how you meet the problem.

1.  Some websites may not allow external scripts and the magic bookmarklet might not work.
2.  Only `contentEditable` editors are supported yet; MarkdownIME will not work on the editors with other technology (eg. OneNote, Google Doc).

#### Browser Extension

Not for now. If you are willing to support, you can [buy me a coffee](//laobubu.net/donate.html) or see what you can do [on GitHub](https://github.com/laobubu/MarkdownIME). Thanks!

### For developers

Interested in using MarkdownIME on your website? Read [this simple manual](manual.html)!

Just a few lines of Javascript, and that's all.

## Features

MarkdownIME supports most Markdown syntax. Just type in Markdown style, and press Enter.

Learn more: [Markdown Basic](https://help.github.com/articles/markdown-basics/)

### Supported Markdown Syntax

#### Inline Elements

*   Links
*   Emphasis: **Bold** & *Italics*
*   ~~Strikethrough~~
*   `In-line Codes`
*   Pictures
*   Emoji `:-)` <sup>[1]</sup>
*   Math equations (TeX): `$ E=mc^2 <section id="s2" <sup>[2]</sup>

Notes:

1.  Emoji feature is provided as an add-on. It's loaded automatically. Works better with [twemoji](https://github.com/twitter/twemoji).
2.  TeX equations feature is provided as an add-on, which will NOT load by default. Learn more from [the source code and the comments](https://github.com/laobubu/MarkdownIME/blob/master/src/Addon/MathAddon.ts).

#### Block Elements

*   Headers (beginning with `#`s)
*   Horizontal rules ---
*   Lists & Nested lists
*   Blockquotes & Nested blockquotes
*   Code Blocks

#### Simple table

You can make a table by typing the header row like `| header | goes | here |`.

When editing a cell, press Enter to insert a row below.

Press Enter key twice to exit the table and start a new line of text.

Besides, MarkdownIME allows you to use common hotkeys to navigate from cell to cell, with `Tab`, `Shift + Tab`, `Up Arrow` and `Down Arrow` keys.

### Supported Editors

*   **Vanilla 'contenteditable' elements** - browsers solve everything.
*   **TinyMCE** - now it's easier to type on EverNote and more.

## Contribute / Troubleshooting

Well, I'm not really good at Javascript-ing and I need your help.

*   [Fork me on GitHub](https://github.com/laobubu/MarkdownIME)
*   [Buy me a coffee](//laobubu.net/donate.html)
*   [Submit an issue](https://github.com/laobubu/MarkdownIME/issues/new)
