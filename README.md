# MarkdownIME

[![Build Status](https://travis-ci.org/laobubu/MarkdownIME.svg?branch=master)](https://travis-ci.org/laobubu/MarkdownIME)

MarkdownIME is a fresh and fast way to make text formatted, and a minimal & powerful web rich-text editor.

**MINIMAL**: No buttons or stylesheets. It only require one `div[contentEditable]` and two `script` tags.

**POWERFUL**: User types with Markdown, and MarkdownIME gets the text formatted, instantly!

[Try out the demo](http://laobubu.github.io/MarkdownIME/). Works like a charm on desktop and mobile!

![](http://laobubu.github.io/MarkdownIME/demo.gif?cache3)

## Quickstart / Guide

Visit http://laobubu.github.io/MarkdownIME/

## Download

Newest build form Travis-CI:

 - Uncompressed version: <http://build.laobubu.net/MarkdownIME/MarkdownIME.js>
 - Uglified version: <http://build.laobubu.net/MarkdownIME/MarkdownIME.min.js>
 - Documentation: <http://build.laobubu.net/MarkdownIME/doc/>

## Developing

1. Install dev tools: `npm install`
2. Code: use [VSCode](https://code.visualstudio.com/)
3. Test on Browser: `npm run go`
4. Build: `make`

## Features

### Supported Markdown Syntax

#### Span Elements

 - [Links](http://laobubu.net)
 - ***Emphasis***
 - `In-line Code`
 - ~~Strikethrough~~
 - Images
 
#### Block Elements

 - Headers (beginning with `#` )
 - Horizontal
 - (Nested) Lists
 - (Nested) Blockquote
 - Code Block

#### Tables

Create a table with `| table | column | headers |`

### Supported Editor

 - **Vanilla contenteditable elements** - browsers solve everything.
 - **TinyMCE** - now typing on EverNote and others is easier.
 
## LICENSE

```
Copyright 2016 laobubu

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
