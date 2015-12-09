var MarkdownIME;
(function (MarkdownIME) {
    var Utils;
    (function (Utils) {
        /**
         * Move the cursor to the end of one element.
         */
        function move_cursor_to_end(ele) {
            var selection = ele.ownerDocument.defaultView.getSelection();
            var range = ele.ownerDocument.createRange();
            var focusNode = ele;
            while (focusNode.nodeType == 1) {
                var children = [].filter.call(focusNode.childNodes, is_node_not_empty);
                var t = children[children.length - 1];
                if (!t)
                    break;
                focusNode = t;
            }
            range.selectNode(focusNode);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        Utils.move_cursor_to_end = move_cursor_to_end;
        /**
         * Check if it's a BR or empty stuff.
         */
        function is_node_empty(node) {
            return (node.nodeType == 3 && (node.nodeName == "BR" || /^[\s\r\n]*$/.test(node.nodeValue)));
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
            if (node.nodeType != 1)
                return false;
            return (/^(P|DIV|LI|H\d)$/.test(node.nodeName));
        }
        Utils.is_node_block = is_node_block;
        /**
         * Check if one line container can be processed.
         */
        function is_line_container_clean(wrapper) {
            var children = [].filter.call(wrapper.childNodes, is_node_not_empty);
            var ci = children.length;
            if (ci == 1 && children[0].nodeType == 1) {
                //cracking nuts like <p><i><b>LEGACY</b></i></p>
                return is_line_container_clean(children[0]);
            }
            while (ci--) {
                var node = children[ci];
                if (node.nodeType == 3)
                    continue; //textNode pass
                return false;
            }
            return true;
        }
        Utils.is_line_container_clean = is_line_container_clean;
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
         * help one element wear a wrapper
         */
        function wrap(wrapper, node) {
            node.parentNode.replaceChild(wrapper, node);
            wrapper.appendChild(node);
        }
        Utils.wrap = wrap;
    })(Utils = MarkdownIME.Utils || (MarkdownIME.Utils = {}));
})(MarkdownIME || (MarkdownIME = {}));
/// <reference path="Utils.ts" />
var MarkdownIME;
(function (MarkdownIME) {
    var Renderer;
    (function (Renderer) {
        var Pattern;
        (function (Pattern) {
            //NOTE process bold first, then italy.
            //$1 is something strange
            //$2 is the text
            Pattern.bold = /([^\\]|^)\*\*((?:\\\*|[^\*])*[^\\])\*\*/g;
            Pattern.italy = /([^\\]|^)\*((?:\\\*|[^\*])*[^\\])\*/g;
            Pattern.code = /([^\\]|^)`((?:\\`|[^`])*[^\\])`/g;
            Pattern.header = /^(#+)\s*(.+?)\s*\1?$/;
        })(Pattern || (Pattern = {}));
        /**
         * Render inline objects, HTML in HTML out
         */
        function RenderInlineHTML(html) {
            var rtn = html;
            rtn = rtn.replace(Pattern.bold, "$1<b>$2</b>");
            rtn = rtn.replace(Pattern.italy, "$1<i>$2</i>");
            rtn = rtn.replace(Pattern.code, "$1<code>$2</code>");
            return rtn;
        }
        Renderer.RenderInlineHTML = RenderInlineHTML;
        /**
         * Make one Block Node beautiful!
         */
        function Render(node) {
            var html = node.innerHTML.trim();
            var match_result;
            var rtn;
            // header 
            match_result = Pattern.header.exec(html);
            if (match_result) {
                rtn = node.ownerDocument.createElement("h" + match_result[1].length);
                rtn.innerHTML = RenderInlineHTML(match_result[2]);
                node.parentNode.replaceChild(rtn, node);
                return rtn;
            }
            node.innerHTML = RenderInlineHTML(html);
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
        "wrapper": "p"
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
            if (this.isTinyMCE) {
                //according to test, node will become <sth><br bogus="true"></sth>
                //so we get rid of it.
                tinymce_node = node;
                while (!MarkdownIME.Utils.is_node_block(tinymce_node)) {
                    tinymce_node = tinymce_node.parentNode;
                }
                //the we get the real and normalized node.
                node = tinymce_node.previousSibling;
            }
            //normalize the node object, if the node is 
            // 1. editor > #text , then create one wrapper and use the wrapper.
            // 2. blockwrapper > [wrapper >] #text , then use the blockwrapper.
            // 3. editor , which means editor is empty. then f**k user.
            if (node == this.editor) {
                ev.preventDefault();
                return;
            }
            while (!MarkdownIME.Utils.is_node_block(node) && node.parentNode != this.editor) {
                node = node.parentNode;
            }
            // cond 1
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
            console.log("Renderer on", node);
            node = MarkdownIME.Renderer.Render(node);
            MarkdownIME.Utils.move_cursor_to_end(node);
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
        return Editor;
    })();
    MarkdownIME.Editor = Editor;
})(MarkdownIME || (MarkdownIME = {}));
/// <reference path="Utils.ts" />
/// <reference path="Editor.ts" />
var MarkdownIME;
(function (MarkdownIME) {
    /**
     * Fetching contenteditable nodes from the window and its iframe.
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
        if (typeof editor['length'] == "number") {
            [].forEach.call(editor, Enhance);
            return;
        }
        var rtn;
        rtn = new MarkdownIME.Editor(editor);
        rtn.Init();
        return rtn;
    }
    MarkdownIME.Enhance = Enhance;
})(MarkdownIME || (MarkdownIME = {}));
