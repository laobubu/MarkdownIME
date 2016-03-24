---
layout: homepage

subtitle: 一种全新的Web富文本输入方式

demotext:
 - "# 你好世界 8-)"
 - "在这里 **直接输入** 你的 *Markdown* 文字， `*例如这样*` ，然后按下空格或回车。"

github: "源代码 @ GitHub"
doc: 帮助文档
donate: 赏一杯咖啡

---

## 介绍

[Read the English version »](./?ncr) 或者 [帮忙翻译它](https://github.com/laobubu/MarkdownIME/edit/gh-pages/index.md).

想象一下，是否可以做一个<u>没有任何按钮</u>的富文本编辑器？

MarkdownIME 就是干这种事情的：只需要照着 Markdown 的写法输入你的文字，就可以立即得到排版结果，完全不需要动鼠标，不需要去点任何糟心的按钮。

支持各种手机浏览器，电脑上最低兼容到 IE9 。可以和大多数的富文本编辑器混合使用。

## 马上开始用

### 如果你是一个用户

#### 不用安装任何插件就能使用

<p style="text-align:center"><a title="加载 MarkdownIME" class="button" id="bookmarklet">载入 MarkdownIME</a></p>

把上面那个 Magic Bookmarklet 拖到浏览器的书签栏里。

当你在使用别的网站的富文本编辑器时（比如 印象笔记、云笔记、各种Discuz论坛的高级编辑模式...），点击那个书签，就可以开始享受别致的输入了。

部分网站屏蔽了第三方脚本（比如 知乎、OneNote），故不可运行。如果有任何问题，请[在此提交](https://github.com/laobubu/MarkdownIME/issues/new)，并告诉我你是在哪儿以及怎么遇到问题的。

#### 浏览器插件

暂时没有。如果你对此感兴趣的话，可以考虑[包养我一顿饭](//laobubu.net/donate.html)，或者去[GitHub源码](https://github.com/laobubu/MarkdownIME)看看，或者开发。谢谢！

### 如果你是网站站长

想让你的网站也一样神奇吗？看看[这个小手册（英文）](manual.html)，大概就知道怎么用了。

奇迹，只需三行 JavaScript 代码。

## 支持的特性

MarkdownIME 支持许多 Markdown 语法。直接按照其写法输入就可以了！

参考: [Markdown简明语法](http://ibruce.info/2013/11/26/markdown/)

### 支持的 Markdown 语法

#### 行内元素

*   [链接](http://laobubu.net)
*   强调: **加粗** & *倾斜*
*   ~~删除线~~
*   `行内代码`
*   图片
*   一些emoji表情 `:-)` <sup>[1]</sup>
*   Tex 数学公式: `$ E=mc^2 $` <sup>[2]</sup>

注：

1.  “emoji表情”功能以插件形式提供，并自动加载。可以和 [twemoji](https://github.com/twitter/twemoji) 配合使用。
2.  “Tex 数学公式”功能以插件形式提供，但是不会自动加载。详情请参考[源代码及其中的注释](https://github.com/laobubu/MarkdownIME/blob/master/src/Addon/MathAddon.ts)。

#### 块元素

*   标题 (使用 `#` 开头)
*   水平分割线 `---`
*   列表（支持子列表）
*   段落引用（Blockquote，支持盖楼）
*   代码块（不提供高亮功能）

#### 普通表格

MarkdownIME 可以使用 `| 表格 | 表头 | 文字 |` 这种格式创建表格。

当你在编辑一个单元格的时候，按下回车键可以插入新的行。

按两次回车键可以离开表格，并在表格底部创建空的文本段落。

此外，MarkdownIME 在编辑表格内容时会为一些键盘按键赋予高级功能。你可以使用 `Tab`, `Shift + Tab`, `上方向键` 和 `下方向键` 在单元格之间快速地移动。

### 已测试通过的编辑器

*   **普通的 contenteditable 元素** - 所有浏览器提供的最简单的“编辑器”。
*   **TinyMCE** - 一种漂亮又强大的富文本编辑器。如果有了 MarkdownIME 配合会更强大！
*   **Discuz 高级模式** - 论坛回帖也能轻松排版。

## 共同开发 / 疑难解答

作为一个普通的 JavaScript 开发者/学生，我需要各位大佬的帮助！

*   [在 GitHub 上 Fork 该项目](https://github.com/laobubu/MarkdownIME)
*   [包养我一顿饭钱](//laobubu.net/donate.html)
*   [汇报一个问题](https://github.com/laobubu/MarkdownIME/issues/new)
