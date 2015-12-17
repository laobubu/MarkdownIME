var MarkdownIME;
(function (MarkdownIME) {
    var Utils;
    (function (Utils) {
        var Pattern;
        (function (Pattern) {
            var NodeName;
            (function (NodeName) {
                NodeName.list = /^(UL|OL)$/;
                NodeName.li = /^LI$/;
                NodeName.line = /^(P|DIV|H\d)$/;
                NodeName.blockquote = /^BLOCKQUOTE$/;
                NodeName.pre = /^PRE$/;
                NodeName.hr = /^HR$/;
            })(NodeName = Pattern.NodeName || (Pattern.NodeName = {}));
        })(Pattern = Utils.Pattern || (Utils.Pattern = {}));
        /**
         * Move the cursor to the end of one element.
         */
        function move_cursor_to_end(ele) {
            var selection = ele.ownerDocument.defaultView.getSelection();
            var range = ele.ownerDocument.createRange();
            var focusNode = ele;
            while (focusNode.nodeType == 1) {
                var children = focusNode.childNodes;
                var t = children[children.length - 1];
                if (!t)
                    break;
                focusNode = t;
            }
            range.selectNode(focusNode);
            range.collapse((focusNode.nodeName == "BR" || /^\n+$/.test(focusNode.textContent)));
            selection.removeAllRanges();
            selection.addRange(range);
        }
        Utils.move_cursor_to_end = move_cursor_to_end;
        /**
         * Check if it's a BR or empty stuff.
         */
        function is_node_empty(node, regardBrAsEmpty) {
            if (regardBrAsEmpty === void 0) { regardBrAsEmpty = true; }
            if (!node)
                return false;
            return (node.nodeType == Node.TEXT_NODE && /^[\s\r\n]*$/.test(node.nodeValue)) ||
                (node.nodeType == Node.COMMENT_NODE) ||
                (regardBrAsEmpty && node.nodeName == "BR");
        }
        Utils.is_node_empty = is_node_empty;
        /**
         * revert is_node_empty()
         */
        function is_node_not_empty(node) {
            return !is_node_empty(node);
        }
        Utils.is_node_not_empty = is_node_not_empty;
        /**
         * Check if one node is a container for text line
         */
        function is_node_block(node) {
            if (!node)
                return false;
            if (node.nodeType != 1)
                return false;
            return (Pattern.NodeName.line.test(node.nodeName) ||
                Pattern.NodeName.li.test(node.nodeName) ||
                Pattern.NodeName.pre.test(node.nodeName));
        }
        Utils.is_node_block = is_node_block;
        /**
         * Check if one line container can be processed.
         */
        function is_line_container_clean(wrapper) {
            var children = get_real_children(wrapper);
            var ci = children.length;
            if (ci == 1 && children[0].nodeType == 1) {
                //cracking nuts like <p><i><b>LEGACY</b></i></p>
                return is_line_container_clean(children[0]);
            }
            while (ci--) {
                var node = children[ci];
                if (node.nodeType == Node.TEXT_NODE)
                    continue; //textNode pass
                return false;
            }
            return true;
        }
        Utils.is_line_container_clean = is_line_container_clean;
        /**
         * Check if one line is empty
         */
        function is_line_empty(line) {
            if (line.textContent.length != 0)
                return false;
            if (line.innerHTML.indexOf('<img ') >= 0)
                return false;
            return true;
        }
        Utils.is_line_empty = is_line_empty;
        /**
         * Get the previousSibling big block wrapper or create one.
         * @note every char in blockTagName shall be upper, like "BLOCKQUOTE"
         */
        function get_or_create_prev_block(node, blockTagName) {
            var rtn = node.previousSibling;
            if (!rtn || rtn.nodeName != blockTagName) {
                rtn = node.ownerDocument.createElement(blockTagName);
                node.parentNode.insertBefore(rtn, node);
            }
            return rtn;
        }
        Utils.get_or_create_prev_block = get_or_create_prev_block;
        /**
         * Find all non-empty children
         */
        function get_real_children(node) {
            return [].filter.call(node.childNodes, is_node_not_empty);
        }
        Utils.get_real_children = get_real_children;
        /**
         * Get all nodes on the same line.
         * This is for lines like <br>...<br>. it is recommended to use TextNode as the anchor.
         * If the anchor is <br>, nodes before it will be in return.
         */
        function get_line_nodes(anchor, wrapper) {
            var rtn = [];
            var tmp;
            tmp = anchor.previousSibling;
            //...
            return rtn;
        }
        Utils.get_line_nodes = get_line_nodes;
        /**
         * Find the path to one certain container.
         * @return {Array<Node>}
         */
        function build_parent_list(node, end) {
            var rtn = [];
            var iter = node;
            while (true) {
                iter = iter.parentNode;
                if (!iter)
                    break;
                rtn.push(iter);
                if (iter == end)
                    break;
            }
            return rtn;
        }
        Utils.build_parent_list = build_parent_list;
        /**
         * text2html
         */
        function text2html(text) {
            return text.replace(/&/g, '&amp;').replace(/  /g, '&nbsp;&nbsp;').replace(/"/g, '&quot;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
        }
        Utils.text2html = text2html;
        /**
         * remove whitespace in the DOM text. works for textNode.
         */
        function trim(str) {
            return str.replace(/^[\t\r\n ]+/, '').replace(/[\t\r\n ]+$/, '').replace(/[\t\r\n ]+/, ' ');
        }
        Utils.trim = trim;
        /**
         * help one element wear a wrapper
         */
        function wrap(wrapper, node) {
            node.parentNode.replaceChild(wrapper, node);
            wrapper.appendChild(node);
        }
        Utils.wrap = wrap;
        /**
         * get outerHTML for a new element safely.
         * @see http://www.w3.org/TR/2000/WD-xml-c14n-20000119.html#charescaping
         * @see http://www.w3.org/TR/2011/WD-html-markup-20110113/syntax.html#void-element
         */
        function generateElementHTML(nodeName, props, innerHTML) {
            var rtn = "<" + nodeName;
            if (props) {
                for (var attr in props) {
                    if (!props.hasOwnProperty(attr))
                        continue;
                    var value = "" + props[attr];
                    value = value.replace(/"/g, "&quot;");
                    value = value.replace(/&/g, "&amp;");
                    value = value.replace(/</g, "&lt;");
                    value = value.replace(/\t/g, "&#x9;");
                    value = value.replace(/\r/g, "&#xA;");
                    value = value.replace(/\n/g, "&#xD;");
                    rtn += " " + attr + '="' + value + '"';
                }
            }
            rtn += ">";
            if (innerHTML) {
                rtn += innerHTML + "</" + nodeName + ">";
            }
            else if (!/^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i.test(nodeName)) {
                rtn += "</" + nodeName + ">";
            }
            return rtn;
        }
        Utils.generateElementHTML = generateElementHTML;
    })(Utils = MarkdownIME.Utils || (MarkdownIME.Utils = {}));
})(MarkdownIME || (MarkdownIME = {}));
/// <reference path="../Utils.ts" />
var MarkdownIME;
(function (MarkdownIME) {
    var Renderer;
    (function (Renderer) {
        /**
         * InlineRenderer: Renderer for inline objects
         *
         *  [Things to be rendered] -> replacement chain -> [Renderer output]
         *  (you can also add your custom inline replacement)
         *
         * @example MarkdownIME.Renderer.InlineRenderer.makeMarkdownRenderer().RenderHTML('**Hello Markdown**')
         */
        var InlineRenderer = (function () {
            function InlineRenderer() {
                /** Replacements for this Renderer */
                this.replacement = [];
            }
            /**
             * do render.
             * @note DOM whitespace will be removed by Utils.trim(str) .
             * @note after escaping, `\` will become `<!--escaping-->`.
             * @note if you want some chars escaped without `\`, use `<!--escaping-->`.
             */
            InlineRenderer.prototype.RenderHTML = function (html) {
                var rtn = MarkdownIME.Utils.trim(html);
                var i, rule;
                for (i = 0; i < this.replacement.length; i++) {
                    rule = this.replacement[i];
                    if ((typeof rule.method) == "function") {
                        rtn = rule.method(rtn);
                    }
                    else {
                        rtn = rtn.replace(rule.regex, rule.replacement);
                    }
                }
                return rtn;
            };
            /**
             * do render on a Node
             * @return the output nodes
             */
            InlineRenderer.prototype.RenderNode = function (node) {
                var docfrag = node.ownerDocument.createElement('div');
                var nodes;
                var source = node['innerHTML'] || node.textContent;
                docfrag.innerHTML = this.RenderHTML(source);
                nodes = [].slice.call(docfrag.childNodes, 0);
                if (node.parentNode) {
                    if (node.nodeType == Node.TEXT_NODE) {
                        while (docfrag.lastChild) {
                            node.parentNode.insertBefore(docfrag.lastChild, node.nextSibling);
                        }
                        node.parentNode.removeChild(node);
                    }
                    else if (node.nodeType == Node.ELEMENT_NODE) {
                        while (node.firstChild)
                            node.removeChild(node.firstChild);
                        while (docfrag.firstChild)
                            node.appendChild(docfrag.firstChild);
                    }
                }
                return nodes;
            };
            /**
             * (Factory Function) Create a Markdown InlineRenderer
             */
            InlineRenderer.makeMarkdownRenderer = function () {
                var rtn = new InlineRenderer();
                rtn.replacement = this.markdownReplacement.concat(rtn.replacement);
                return rtn;
            };
            /** Suggested Markdown Replacement */
            InlineRenderer.markdownReplacement = [
                //NOTE process bold first, then italy.
                //NOTE safe way to get payload:
                //		((?:\\\_|[^\_])*[^\\])
                //		in which _ is the right bracket char
                //Preproccess
                {
                    name: "escaping",
                    regex: /(\\|<!--escaping-->)([\*`\(\)\[\]\~\\])/g,
                    replacement: function (a, b, char) { return "<!--escaping-->&#" + char.charCodeAt(0) + ';'; }
                },
                {
                    name: "turn &nbsp; into spaces",
                    regex: /&nbsp;/g,
                    replacement: String.fromCharCode(160)
                },
                {
                    name: 'turn &quot; into "s',
                    regex: /&quot;/g,
                    replacement: '"'
                },
                //Basic Markdown Replacements
                {
                    name: "strikethrough",
                    regex: /~~([^~]+)~~/g,
                    replacement: "<del>$1</del>"
                },
                {
                    name: "bold",
                    regex: /\*\*([^\*]+)\*\*/g,
                    replacement: "<b>$1</b>"
                },
                {
                    name: "italy",
                    regex: /\*([^\*]+)\*/g,
                    replacement: "<i>$1</i>"
                },
                {
                    name: "code",
                    regex: /`([^`]+)`/g,
                    replacement: "<code>$1</code>"
                },
                {
                    name: "img with title",
                    regex: /\!\[([^\]]*)\]\(([^\)\s]+)\s+("?)([^\)]+)\3\)/g,
                    replacement: function (a, alt, src, b, title) {
                        return MarkdownIME.Utils.generateElementHTML("img", { alt: alt, src: src, title: title });
                    }
                },
                {
                    name: "img",
                    regex: /\!\[([^\]]*)\]\(([^\)]+)\)/g,
                    replacement: function (a, alt, src) {
                        return MarkdownIME.Utils.generateElementHTML("img", { alt: alt, src: src });
                    }
                },
                {
                    name: "link with title",
                    regex: /\[([^\]]*)\]\(([^\)\s]+)\s+("?)([^\)]+)\3\)/g,
                    replacement: function (a, text, href, b, title) {
                        return MarkdownIME.Utils.generateElementHTML("a", { href: href, title: title }, text);
                    }
                },
                {
                    name: "link",
                    regex: /\[([^\]]*)\]\(([^\)]+)\)/g,
                    replacement: function (a, text, href) {
                        return MarkdownIME.Utils.generateElementHTML("a", { href: href }, text);
                    }
                },
                //Postproccess
                {
                    name: "turn escaped chars back",
                    regex: /<!--escaping-->&#(\d+);/g,
                    replacement: function (_, charCode) { return "<!--escaping-->" + String.fromCharCode(~~charCode); }
                },
            ];
            return InlineRenderer;
        })();
        Renderer.InlineRenderer = InlineRenderer;
    })(Renderer = MarkdownIME.Renderer || (MarkdownIME.Renderer = {}));
})(MarkdownIME || (MarkdownIME = {}));
/// <reference path="Utils.ts" />
/// <reference path="Renderer/InlineRenderer.ts" />
var MarkdownIME;
(function (MarkdownIME) {
    var Renderer;
    (function (Renderer) {
        var Pattern;
        (function (Pattern) {
            Pattern.hr = /^\s*([\-\=\*])(\s*\1){2,}\s*$/g;
            Pattern.header = /^(#+)\s*(.+?)\s*\1?$/g;
            Pattern.ul = /^ ?( *)[\*\+\-]\s+(.*)$/g;
            Pattern.ol = /^ ?( *)\d+\.\s*(.*)$/g;
            Pattern.blockquote = /^(\>|&gt;)\s*(.*)$/g;
            Pattern.codeblock = /^```\s*(\S*)\s*$/g;
        })(Pattern || (Pattern = {}));
        var inlineRenderer = Renderer.InlineRenderer.makeMarkdownRenderer();
        /**
         * Make one Block Node beautiful!
         */
        function Render(node) {
            var html = MarkdownIME.Utils.trim(node.innerHTML);
            var match_result;
            var new_node;
            var big_block;
            console.log("Render", node, html);
            // hr 
            Pattern.hr.lastIndex = 0;
            match_result = Pattern.hr.exec(html);
            if (match_result) {
                new_node = node.ownerDocument.createElement("hr");
                node.parentNode.replaceChild(new_node, node);
                return new_node;
            }
            // header 
            Pattern.header.lastIndex = 0;
            match_result = Pattern.header.exec(html);
            if (match_result) {
                new_node = node.ownerDocument.createElement("h" + match_result[1].length);
                new_node.innerHTML = inlineRenderer.RenderHTML(match_result[2]);
                node.parentNode.replaceChild(new_node, node);
                return new_node;
            }
            // ul
            Pattern.ul.lastIndex = 0;
            match_result = Pattern.ul.exec(html);
            if (match_result) {
                new_node = node.ownerDocument.createElement("li");
                new_node.innerHTML = inlineRenderer.RenderHTML(match_result[2]);
                node.parentNode.insertBefore(new_node, node);
                big_block = MarkdownIME.Utils.get_or_create_prev_block(new_node, "UL");
                MarkdownIME.Utils.wrap(big_block, new_node);
                node.parentNode.removeChild(node);
                return new_node;
            }
            // ol
            Pattern.ol.lastIndex = 0;
            match_result = Pattern.ol.exec(html);
            if (match_result) {
                new_node = node.ownerDocument.createElement("li");
                new_node.innerHTML = inlineRenderer.RenderHTML(match_result[2]);
                node.parentNode.insertBefore(new_node, node);
                big_block = MarkdownIME.Utils.get_or_create_prev_block(new_node, "OL");
                MarkdownIME.Utils.wrap(big_block, new_node);
                node.parentNode.removeChild(node);
                return new_node;
            }
            //blockquote
            Pattern.blockquote.lastIndex = 0;
            match_result = Pattern.blockquote.exec(html);
            if (match_result) {
                big_block = MarkdownIME.Utils.get_or_create_prev_block(node, "blockquote");
                MarkdownIME.Utils.wrap(big_block, node);
                html = match_result[2];
            }
            //codeblock
            Pattern.codeblock.lastIndex = 0;
            match_result = Pattern.codeblock.exec(html);
            if (match_result) {
                big_block = node.ownerDocument.createElement('pre');
                if (match_result[1].length) {
                    //language is told
                    var typ = node.ownerDocument.createAttribute("lang");
                    typ.value = match_result[1];
                    big_block.attributes.setNamedItem(typ);
                }
                big_block.innerHTML = "<br>";
                node.parentNode.replaceChild(big_block, node);
                return big_block;
            }
            node.innerHTML = inlineRenderer.RenderHTML(html);
            return node;
        }
        Renderer.Render = Render;
    })(Renderer = MarkdownIME.Renderer || (MarkdownIME.Renderer = {}));
})(MarkdownIME || (MarkdownIME = {}));
/// <reference path="Utils.ts" />
/// <reference path="Renderer.ts" />
var MarkdownIME;
(function (MarkdownIME) {
    MarkdownIME.config = {
        "wrapper": "p",
        "code_block_max_empty_lines": 5,
    };
    var Editor = (function () {
        function Editor(editor) {
            this.editor = editor;
            this.document = editor.ownerDocument;
            this.window = editor.ownerDocument.defaultView;
            this.selection = this.window.getSelection();
            this.isTinyMCE = /tinymce/i.test(editor.id);
        }
        /**
         * Init MarkdownIME on this editor.
         */
        Editor.prototype.Init = function () {
            //Skip bad items
            if (!this.editor.hasAttribute('contenteditable'))
                return false;
            if (this.editor.hasAttribute('mdime-enhanced'))
                return false;
            this.editor.addEventListener('keydown', this.keydownHandler.bind(this), false);
            this.editor.setAttribute('mdime-enhanced', 'true');
            return true;
        };
        /**
         * Process the line on the cursor.
         * call this from the event handler.
         */
        Editor.prototype.ProcessCurrentLine = function (ev) {
            var _dummynode;
            var tinymce_node;
            var range = this.selection.getRangeAt(0);
            if (!range.collapsed)
                return; // avoid processing with strange selection
            // assuming not using tinymce:
            // interesting, the node is always a TextNode.
            // sometimes it became the editor itself / the wrapper, because : 
            // 1. there is no text.
            // 2. not on a text. might be after an image or sth.
            // 3. the cursor was set by some script. (eg. tinymce)
            var node = range.startContainer;
            if (node.nodeType == 3 && range.startOffset != node.textContent.length) {
                _dummynode = node;
                while (!MarkdownIME.Utils.is_node_block(_dummynode))
                    _dummynode = _dummynode.parentNode;
                if (MarkdownIME.Utils.Pattern.NodeName.pre.test(_dummynode.nodeName)) {
                    //safe insert <br> for <pre>, for browser always screw up
                    //insert right half text
                    node.parentNode.insertBefore(this.document.createTextNode(node.textContent.substr(range.startOffset)), node.nextSibling);
                    _dummynode = this.document.createElement('br');
                    node.parentNode.insertBefore(_dummynode, node.nextSibling);
                    node.textContent = node.textContent.substr(0, range.startOffset);
                    range.selectNode(_dummynode.nextSibling);
                    range.collapse(true);
                    this.selection.removeAllRanges();
                    this.selection.addRange(range);
                    ev.preventDefault();
                }
                return;
            }
            //if (node != node.parentNode.lastChild) return;
            if (this.isTinyMCE) {
                //according to test, node will become <sth><br bogus="true"></sth>
                //if this is half-break, then return
                if (!(MarkdownIME.Utils.Pattern.NodeName.pre.test(node.nodeName)) &&
                    !(node.childNodes.length == 1 && node.firstChild.nodeName == "BR"))
                    return;
                //so we get rid of it.
                tinymce_node = node;
                while (!MarkdownIME.Utils.is_node_block(tinymce_node)) {
                    tinymce_node = tinymce_node.parentNode;
                }
                //the we get the real and normalized node.
                if (MarkdownIME.Utils.Pattern.NodeName.pre.test(tinymce_node.nodeName)) {
                    //<pre> is special
                    node = tinymce_node;
                    while (node.lastChild && MarkdownIME.Utils.is_node_empty(node.lastChild)) {
                        node.removeChild(node.lastChild);
                    }
                    node.appendChild(this.document.createElement('br'));
                    node.appendChild(this.document.createElement('br'));
                    tinymce_node = null;
                }
                else {
                    node = tinymce_node.previousSibling;
                    if (MarkdownIME.Utils.Pattern.NodeName.list.test(node.nodeName)) {
                        //tinymce helps us get rid of a list.
                        return;
                    }
                }
            }
            //normalize the node object, if the node is 
            // 1. editor > #text , then create one wrapper and use the wrapper.
            // 2. blockwrapper > [wrapper >] #text , then use the blockwrapper.
            // 3. editor , which means editor is empty. then f**k user.
            //cond 3
            if (node == this.editor) {
                node = this.document.createElement(MarkdownIME.config.wrapper || "div");
                node.innerHTML = this.editor.innerHTML;
                this.editor.innerHTML = "";
                this.editor.appendChild(node);
            }
            //cond 2
            while (!MarkdownIME.Utils.is_node_block(node) && node.parentNode != this.editor) {
                node = node.parentNode;
            }
            //cond 1
            if (!MarkdownIME.Utils.is_node_block(node) && node.parentNode == this.editor) {
                _dummynode = this.document.createElement(MarkdownIME.config.wrapper || "div");
                MarkdownIME.Utils.wrap(_dummynode, node);
                node = _dummynode;
            }
            //generate the parent tree to make things easier
            var parent_tree = MarkdownIME.Utils.build_parent_list(node, this.editor);
            console.log(node, parent_tree);
            //further normalizing.
            //now node shall be a block node
            while (!MarkdownIME.Utils.is_node_block(node))
                node = parent_tree.shift();
            //finally start processing
            //for <pre> block, special work is needed.
            if (MarkdownIME.Utils.Pattern.NodeName.pre.test(node.nodeName)) {
                var txtnode = range.startContainer;
                while (txtnode.nodeType != 3 && txtnode.lastChild)
                    txtnode = txtnode.lastChild;
                var text = txtnode.textContent;
                var br = this.document.createElement('br');
                var space = this.document.createTextNode("\n");
                console.log("part", text);
                if (/^[\n\s]*$/.test(text)) {
                    for (var i = 1; i <= MarkdownIME.config.code_block_max_empty_lines; i++) {
                        var testnode = node.childNodes[node.childNodes.length - i];
                        if (!testnode)
                            break;
                        if (!MarkdownIME.Utils.is_node_empty(testnode))
                            break;
                    }
                    if (i > MarkdownIME.config.code_block_max_empty_lines)
                        text = '```';
                }
                if (text == '```') {
                    //end the code block
                    node.removeChild(txtnode);
                    while (node.lastChild && MarkdownIME.Utils.is_node_empty(node.lastChild))
                        node.removeChild(node.lastChild);
                    _dummynode = this.GenerateEmptyLine();
                    node.parentNode.insertBefore(_dummynode, node.nextSibling);
                    MarkdownIME.Utils.move_cursor_to_end(_dummynode);
                }
                else {
                    //insert another line
                    node.insertBefore(br, txtnode.nextSibling);
                    node.insertBefore(space, br.nextSibling);
                    MarkdownIME.Utils.move_cursor_to_end(space);
                }
                ev.preventDefault();
                return;
            }
            else if (MarkdownIME.Utils.is_line_empty(node)) {
                //ouch. it is an empty line.
                console.log("Ouch! empty line.");
                //create one empty line without format.
                _dummynode = this.GenerateEmptyLine();
                if (MarkdownIME.Utils.Pattern.NodeName.list.test(node.parentNode.nodeName)) {
                    //it's an empty list item
                    //which means it's time to end the list
                    node.parentNode.removeChild(node);
                    // get the list object
                    node = parent_tree.shift();
                    //create empty line
                    if (MarkdownIME.Utils.Pattern.NodeName.list.test(node.parentNode.nodeName)) {
                        //ouch! nested list!
                        _dummynode = this.GenerateEmptyLine("li");
                    }
                }
                else if (MarkdownIME.Utils.Pattern.NodeName.blockquote.test(node.parentNode.nodeName)) {
                    //empty line inside a blockquote
                    //end the blockquote
                    node.parentNode.removeChild(node);
                    //get the blockquote object
                    node = parent_tree.shift();
                }
                else {
                }
                node.parentNode.insertBefore(_dummynode, node.nextSibling);
                MarkdownIME.Utils.move_cursor_to_end(_dummynode);
                ev.preventDefault();
            }
            else {
                if (node.lastChild.attributes && (node.lastChild.attributes.getNamedItem("data-mdime-bogus") ||
                    node.lastChild.attributes.getNamedItem("data-mce-bogus")))
                    node.removeChild(node.lastChild);
                console.log("Renderer on", node);
                node = MarkdownIME.Renderer.Render(node);
                //Create another line after one node and move cursor to it.
                if (this.CreateNewLine(node)) {
                    ev.preventDefault();
                    tinymce_node && tinymce_node.parentNode.removeChild(tinymce_node);
                }
                else {
                    //let browser deal with strange things
                    console.error("MarkdownIME Cannot Handle Line Creating");
                    MarkdownIME.Utils.move_cursor_to_end(tinymce_node || node);
                }
            }
        };
        /**
         * Create new line after one node and move cursor to it.
         * return false if not successful.
         */
        Editor.prototype.CreateNewLine = function (node) {
            var _dummynode;
            //using browser way to create new line will get dirty format
            //so we create one new line without format.
            if (MarkdownIME.Utils.Pattern.NodeName.line.test(node.nodeName) ||
                MarkdownIME.Utils.Pattern.NodeName.hr.test(node.nodeName) ||
                MarkdownIME.Utils.Pattern.NodeName.li.test(node.nodeName)) {
                var tagName = MarkdownIME.Utils.Pattern.NodeName.li.test(node.nodeName) ? "li" : null;
                _dummynode = this.GenerateEmptyLine(tagName);
                node.parentNode.insertBefore(_dummynode, node.nextSibling);
                MarkdownIME.Utils.move_cursor_to_end(_dummynode);
                return true;
            }
            //as for a new <pre>, do not create new line
            if (MarkdownIME.Utils.Pattern.NodeName.pre.test(node.nodeName)) {
                MarkdownIME.Utils.move_cursor_to_end(node);
                return true;
            }
            return false;
        };
        /**
         * Handler for keydown
         */
        Editor.prototype.keydownHandler = function (ev) {
            var range = this.selection.getRangeAt(0);
            if (!range.collapsed)
                return; // avoid processing with strange selection
            var keyCode = ev.keyCode || ev.which;
            if (keyCode == 13 && !ev.shiftKey && !ev.ctrlKey) {
                this.ProcessCurrentLine(ev);
                return;
            }
            //if is typing, process special instant transform.
            var node = range.startContainer;
            if (node.nodeType == 3) {
                var text = node.textContent;
                var text_after = text.substr(range.startOffset + 1);
                var text_before = text.substr(0, range.startOffset);
                if (text_before.length < 2)
                    return; //too young, too simple
                if (text_before.charAt(text_before.length - 2) == "\\")
                    return; //escaping. run faster than others. 
            }
        };
        /**
         * Generate Empty Line
         */
        Editor.prototype.GenerateEmptyLine = function (tagName) {
            if (tagName === void 0) { tagName = null; }
            var rtn;
            rtn = this.document.createElement(tagName || MarkdownIME.config.wrapper || "div");
            rtn.innerHTML = '<br data-mdime-bogus="true">';
            return rtn;
        };
        return Editor;
    })();
    MarkdownIME.Editor = Editor;
})(MarkdownIME || (MarkdownIME = {}));
/// <reference path="Utils.ts" />
var MarkdownIME;
(function (MarkdownIME) {
    var UI;
    (function (UI) {
        var Toast = (function () {
            function Toast(element, timeout) {
                this.disappearing = false;
                this.timeout = 300;
                this.style = "\n\t\tposition: absolute; \n\t\tfont-size: 10pt; \n\t\tcolor: #363; \n\t\tborder: 1px solid #363; \n\t\tbackground: #CFC; \n\t\tpadding: 2pt 5pt; \n\t\tborder-radius: 0 0 5pt 0; \n\t\tz-index: 32760; \n\t\ttransition: .3s ease; \n\t\topacity: 0; \n\t\t";
                this.element = element;
                this.timeout = timeout;
            }
            Toast.prototype.show = function () {
                requestAnimationFrame((function () {
                    var dismiss = this.dismiss.bind(this);
                    this.element.style.opacity = '1';
                    this.element.addEventListener('mousemove', dismiss, false);
                    if (this.timeout)
                        setTimeout(dismiss, this.timeout);
                }).bind(this));
            };
            Toast.prototype.dismiss = function () {
                if (this.disappearing)
                    return;
                this.disappearing = true;
                this.element.style.opacity = '0';
                setTimeout((function () {
                    this.element.parentNode.removeChild(this.element);
                }).bind(this), 300);
            };
            Toast.makeToast = function (text, coveron, timeout) {
                if (timeout === void 0) { timeout = 0; }
                var document = coveron.ownerDocument || (coveron['createElement'] && coveron) || document;
                var container = coveron.parentNode || (coveron['createElement'] && coveron['body']);
                var toast_div = document.createElement("div");
                var toast = new Toast(toast_div, timeout);
                toast_div.setAttribute("style", toast.style);
                toast_div.textContent = text;
                toast_div.style.left = (coveron.offsetLeft || 0) + 'px';
                toast_div.style.top = (coveron.offsetTop || 0) + 'px';
                container.appendChild(toast_div);
                return toast;
            };
            Toast.SHORT = 800;
            Toast.LONG = 2000;
            return Toast;
        })();
        UI.Toast = Toast;
    })(UI = MarkdownIME.UI || (MarkdownIME.UI = {}));
})(MarkdownIME || (MarkdownIME = {}));
/*!@preserve
    [MarkdownIME](https://github.com/laobubu/MarkdownIME)
    Copyright 2016 laobubu
    Open the link to obtain the license info.
*/
/// <reference path="Utils.ts" />
/// <reference path="Editor.ts" />
/// <reference path="UI.ts" />
var MarkdownIME;
(function (MarkdownIME) {
    /**
     * Fetching contenteditable elements from the window and its iframe.
     */
    function Scan(window) {
        var document = window.document;
        var editors;
        editors = [].slice.call(document.querySelectorAll('[contenteditable]'));
        [].forEach.call(document.querySelectorAll('iframe'), function (i) {
            var result = Scan(i.contentWindow);
            if (result.length)
                editors = editors.concat(result);
        });
        return editors;
    }
    MarkdownIME.Scan = Scan;
    /**
     * Enhance one or more editor.
     */
    function Enhance(editor) {
        if (typeof editor['length'] === "number") {
            return [].map.call(editor, Enhance);
        }
        var rtn;
        rtn = new MarkdownIME.Editor(editor);
        if (rtn.Init())
            return rtn;
        return null;
    }
    MarkdownIME.Enhance = Enhance;
    /**
     * Bookmarklet Entry
     */
    function Bookmarklet(window) {
        [].forEach.call(Enhance(Scan(window)), function (editor) {
            MarkdownIME.UI.Toast.makeToast("MarkdownIME Activated", editor.editor, MarkdownIME.UI.Toast.SHORT).show();
        });
    }
    MarkdownIME.Bookmarklet = Bookmarklet;
    /**
     * Function alias, just for compatibility
     * @deprecated since version 0.2
     */
    MarkdownIME.bookmarklet = Bookmarklet;
    MarkdownIME.enhance = function (window, element) { Enhance(element); };
    MarkdownIME.prepare = MarkdownIME.enhance;
    MarkdownIME.scan = function (window) { Enhance(Scan(window)); };
})(MarkdownIME || (MarkdownIME = {}));
//# sourceMappingURL=MarkdownIME.js.map