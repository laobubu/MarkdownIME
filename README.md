# MarkdownIME

Imagine a **rich** textbox **without** any **button**, it's easy if you try.

MarkdownIME provides a fresh way to write well-formatted text, by typing markdownized stuff. It will speed up writing, help you get rid of the small formatting buttons.

Works like a charm on mobile devices, too!

![](http://laobubu.github.io/MarkdownIME/demo.gif?cache2)

## Quickstart / Guide

Visit http://laobubu.github.io/MarkdownIME/ 

## Developing

### Program

[VSCode](https://code.visualstudio.com/) is favored.

To test / debug, run `npm run go`.

### Build

This project requires `tsc` (TypeScript Compiler) and `make` to compile. Optionally, `uglifyjs` can be used to compress the output.

You can get the tools via npm : `npm install --dev`

After obtaining the tools, just run `make` and you will get the js files. If you are using Windows, you might need a `make` binary.

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
