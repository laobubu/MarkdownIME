var MarkdownIME;
(function (MarkdownIME) {
    var Utils;
    (function (Utils) {
        var Pattern;
        (function (Pattern) {
            var NodeName;
            (function (NodeName) {
                NodeName.list = /^(UL|OL)$/i;
                NodeName.li = /^LI$/i;
                NodeName.cell = /^T[HD]$/i;
                NodeName.line = /^(P|DIV|H\d|T[HD])$/i;
                NodeName.blockquote = /^BLOCKQUOTE$/i;
                NodeName.pre = /^PRE$/i;
                NodeName.hr = /^HR$/i;
                NodeName.autoClose = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
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
            range.selectNodeContents(focusNode);
            range.collapse((focusNode.nodeName == "BR"));
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
        /** convert some chars to HTML entities (`&` -> `&amp;`) */
        function text2html(text) {
            return text.replace(/&/g, '&amp;').replace(/  /g, ' &nbsp;').replace(/"/g, '&quot;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
        }
        Utils.text2html = text2html;
        /** add slash chars for a RegExp */
        function text2regex(text) {
            return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }
        Utils.text2regex = text2regex;
        /** convert HTML entities to chars */
        function html_entity_decode(html) {
            var dict = {
                'nbsp': String.fromCharCode(160),
                'amp': '&',
                'quot': '"',
                'lt': '<',
                'gt': '>'
            };
            return html.replace(/&(nbsp|amp|quot|lt|gt);/g, function (whole, name) {
                return dict[name];
            });
        }
        Utils.html_entity_decode = html_entity_decode;
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
                    value = value.replace(/&/g, "&amp;");
                    value = value.replace(/"/g, "&quot;");
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
            else if (!Pattern.NodeName.autoClose.test(nodeName)) {
                rtn += "</" + nodeName + ">";
            }
            return rtn;
        }
        Utils.generateElementHTML = generateElementHTML;
    })(Utils = MarkdownIME.Utils || (MarkdownIME.Utils = {}));
})(MarkdownIME || (MarkdownIME = {}));
/// <reference path="Utils.ts" />
var MarkdownIME;
(function (MarkdownIME) {
    /** something like a bridge between text and HTML, used to manipulate inline objects. */
    var DomChaos = (function () {
        function DomChaos() {
            /**
             * the XML-free text; all the XML tags go to proxyStorage.
             *
             * use `/\uFFFC\uFFF9\w+\uFFFB/g` to detect the placeholder(proxy)
             *
             * if you get new HTML data, use `setHTML(data)`
             * if you want to replace some text to HTML, use `replace(pattern, replacementHTML)`
             */
            this.text = "";
            /** a dict containing XML marks extracted from the innerHTML  */
            this.proxyStorage = {};
            this.markCount = 0; // a random seed
            this.markPrefix = String.fromCharCode(0xfffc, 0xfff9);
            this.markSuffix = String.fromCharCode(0xfffb);
        }
        /** clone content of a real element */
        DomChaos.prototype.cloneNode = function (htmlElement) {
            var html = htmlElement.innerHTML;
            this.setHTML(html);
        };
        /** extract strange things and get clean text. */
        DomChaos.prototype.digestHTML = function (html) {
            var repFun = this.createProxy.bind(this);
            html = html.replace(/<\/?\w+(\s+[^>]*)?>/g, repFun); //normal tags
            html = html.replace(/<!--protect-->.*?<--\/protect-->/g, repFun); //regard a part of HTML as a entity. Wrap with `<--protect-->` and `<--/protect-->`
            html = html.replace(/<!--.+?-->/g, repFun); //comment tags
            html = MarkdownIME.Utils.html_entity_decode(html);
            return html;
        };
        /** set HTML content, which will update proxy storage */
        DomChaos.prototype.setHTML = function (html) {
            this.markCount = 0;
            this.proxyStorage = {};
            html = this.digestHTML(html);
            this.text = html;
        };
        /**
         * get HTML content. things in proxyStorage will be recovered.
         *
         * @argument {string} [althtml] - the HTML containing proxy replacement. If not set, the html of this DomChaos will be used.
         */
        DomChaos.prototype.getHTML = function (althtml) {
            var _this = this;
            var rtn = althtml || MarkdownIME.Utils.text2html(this.text); //assuming this will not ruin the Unicode chars
            rtn = rtn.replace(/\uFFFC\uFFF9\w+\uFFFB/g, function (mark) { return (_this.proxyStorage[mark]); });
            return rtn;
        };
        /**
         * replace some text to HTML
         * this is very helpful if the replacement is part of HTML / you are about to create new nodes.
         *
         * @argument {RegExp}   pattern to match the text (not HTML)
         * @argument {function} replacementHTML the replacement HTML (not text. you shall convert the strange chars like `<` and `>` to html entities)
         */
        DomChaos.prototype.replace = function (pattern, replacementHTML) {
            var self = this;
            this.text = this.text.replace(pattern, function () {
                var r2;
                if (typeof replacementHTML === "function") {
                    r2 = replacementHTML.apply(null, arguments);
                }
                else {
                    r2 = replacementHTML;
                }
                return self.digestHTML(r2);
            });
        };
        /**
         * replace the tags from proxyStorage. this works like a charm when you want to un-render something.
         *
         * @argument {RegExp} pattern to match the proxy content.
         * @argument {boolean} [keepProxy] set to true if you want to keep the proxy placeholder in the text.
         *
         * @example
         * chaos.screwUp(/^<\/?b>$/gi, "**")
         * //before: getHTML() == "Hello <b>World</b>"	proxyStorage == {1: "<b>", 2: "</b>"}
         * //after:  getHTML() == "Hello **World**"		proxyStorage == {}
         */
        DomChaos.prototype.screwUp = function (pattern, replacement, keepProxy) {
            var _this = this;
            var screwed = {};
            var not_screwed = {};
            this.text = this.text.replace(/\uFFFC\uFFF9\w+\uFFFB/g, function (mark) {
                if (screwed.hasOwnProperty(mark))
                    return screwed[mark];
                if (not_screwed.hasOwnProperty(mark))
                    return mark;
                var r1 = _this.proxyStorage[mark];
                var r2 = r1.replace(pattern, replacement);
                if (r1 === r2) {
                    //nothing changed
                    not_screwed[mark] = true;
                    return mark;
                }
                if (keepProxy)
                    _this.proxyStorage[mark] = r2;
                else
                    delete _this.proxyStorage[mark];
                screwed[mark] = r2;
                return r2;
            });
        };
        /** storage some text to proxyStorage, and return its mark string */
        DomChaos.prototype.createProxy = function (reality) {
            var mark;
            for (mark in this.proxyStorage) {
                if (this.proxyStorage[mark] === reality)
                    return mark;
            }
            mark = this.nextMark();
            this.proxyStorage[mark] = reality;
            return mark;
        };
        /** generate a random mark string */
        DomChaos.prototype.nextMark = function () {
            var mark;
            do {
                this.markCount++;
                mark = this.markPrefix + this.markCount.toString(36) + this.markSuffix;
            } while (this.text.indexOf(mark) !== -1);
            return mark;
        };
        /**
         * apply the HTML content to a real element and
         * keep original child nodes as much as possible
         *
         * using a simple diff algorithm
         */
        DomChaos.prototype.applyTo = function (target) {
            var shadow = target.ownerDocument.createElement('div');
            shadow.innerHTML = this.getHTML();
            //the childNodes from shadow not have corresponding nodes from target.
            var wildChildren = [].slice.call(shadow.childNodes, 0);
            for (var ti = 0; ti < target.childNodes.length; ti++) {
                var tnode = target.childNodes[ti];
                var match = false;
                for (var si1 = 0; si1 < wildChildren.length; si1++) {
                    var snode = wildChildren[si1];
                    match = tnode.isEqualNode(snode);
                    //cond1. replace the shadow's child
                    if (match) {
                        shadow.replaceChild(tnode, snode);
                        wildChildren.splice(si1, 1);
                        break;
                    }
                    //cond2. replace the shadow's child's child
                    //which means some original node just got wrapped.
                    if (snode.nodeType == Node.ELEMENT_NODE) {
                        for (var si2 = 0; si2 < snode.childNodes.length; si2++) {
                            var snodec = snode.childNodes[si2];
                            if (tnode.isEqualNode(snodec)) {
                                snode.replaceChild(tnode, snodec);
                                match = true;
                                break;
                            }
                        }
                    }
                    if (match)
                        break;
                }
                match && ti--; //if match, ti = ti - 1 , because the tnode moved to shadow.
            }
            target.innerHTML = ""; //clear all nodes.
            while (shadow.childNodes.length) {
                target.appendChild(shadow.firstChild);
            }
        };
        return DomChaos;
    })();
    MarkdownIME.DomChaos = DomChaos;
})(MarkdownIME || (MarkdownIME = {}));
/// <reference path="../Utils.ts" />
/// <reference path="../VDom.ts" />
var MarkdownIME;
(function (MarkdownIME) {
    var Renderer;
    (function (Renderer) {
        /** the render rule for Markdown simple inline wrapper like *emphasis* ~~and~~ `inline code` */
        var InlineWrapperRule = (function () {
            function InlineWrapperRule(nodeName, leftBracket, rightBracket) {
                this.nodeAttr = {};
                this.nodeName = nodeName.toUpperCase();
                this.leftBracket = leftBracket;
                this.rightBracket = rightBracket || leftBracket;
                this.name = this.nodeName + " with " + this.leftBracket;
                this.regex = new RegExp('([^\\\\]|^)' + MarkdownIME.Utils.text2regex(this.leftBracket) + '(.*?[^\\\\])' + MarkdownIME.Utils.text2regex(this.rightBracket), "g");
                this.regex2_L = new RegExp("^<" + this.nodeName + "(\\s+[^>]*)?>$", "gi");
                this.regex2_R = new RegExp("^</" + this.nodeName + ">$", "gi");
            }
            InlineWrapperRule.prototype.render = function (tree) {
                var _this = this;
                tree.replace(this.regex, function (whole, leading, wrapped) {
                    if (wrapped === _this.rightBracket)
                        return whole; //avoid something like ``` or ***
                    return leading + MarkdownIME.Utils.generateElementHTML(_this.nodeName, _this.nodeAttr, MarkdownIME.Utils.text2html(wrapped));
                });
            };
            InlineWrapperRule.prototype.unrender = function (tree) {
                tree.screwUp(this.regex2_L, this.leftBracket);
                tree.screwUp(this.regex2_R, this.rightBracket);
            };
            return InlineWrapperRule;
        })();
        Renderer.InlineWrapperRule = InlineWrapperRule;
        /**
         * Use RegExp to do replace.
         * One implement of IInlineRendererReplacement.
         */
        var InlineRegexRule = (function () {
            function InlineRegexRule(name, regex, replacement) {
                this.name = name;
                this.regex = regex;
                this.replacement = replacement;
            }
            InlineRegexRule.prototype.render = function (tree) {
                tree.replace(this.regex, this.replacement);
            };
            InlineRegexRule.prototype.unrender = function (tree) {
                //not implemented
            };
            return InlineRegexRule;
        })();
        Renderer.InlineRegexRule = InlineRegexRule;
        /**
         * InlineRenderer: Renderer for inline objects
         *
         *  [Things to be rendered] -> replacement chain -> [Renderer output]
         *  (you can also add your custom inline replacement)
         *
         * @example
         * var renderer = new MarkdownIME.Renderer.InlineRenderer();
         * renderer.AddMarkdownRules();
         * renderer.RenderHTML('**Hello Markdown**');
         * // returns "<b>Hello Markdown</b>"
         */
        var InlineRenderer = (function () {
            function InlineRenderer() {
                /** Rules for this Renderer */
                this.rules = [];
            }
            /** Render, on a DomChaos object */
            InlineRenderer.prototype.RenderChaos = function (tree) {
                tree.screwUp(/^<!--escaping-->$/g, "\\");
                for (var i = 0; i < this.rules.length; i++) {
                    var rule = this.rules[i];
                    if (typeof rule.unrender === "function")
                        rule.unrender(tree);
                }
                for (var i = 0; i < this.rules.length; i++) {
                    var rule = this.rules[i];
                    rule.render(tree);
                }
                tree.replace(/\\([^\w\s])/g, function (whole, char) { return ("<!--escaping-->" + char); });
            };
            /** Render a HTML part, returns a new HTML part */
            InlineRenderer.prototype.RenderHTML = function (html) {
                var tree = new MarkdownIME.DomChaos();
                tree.setHTML(html);
                this.RenderChaos(tree);
                return tree.getHTML();
            };
            /**
             * Markdown Text to HTML
             * @note after escaping, `\` will become `\u001B`.
             * @return {string} HTML Result
             */
            InlineRenderer.prototype.RenderText = function (text) {
                return this.RenderHTML(MarkdownIME.Utils.text2html(text));
            };
            /**
             * do render on a textNode
             * @note make sure the node is a textNode; function will NOT check!
             * @return the output nodes
             */
            InlineRenderer.prototype.RenderTextNode = function (node) {
                var docfrag = node.ownerDocument.createElement('div');
                var nodes;
                docfrag.textContent = node.textContent;
                nodes = this.RenderNode(docfrag);
                while (docfrag.lastChild) {
                    node.parentNode.insertBefore(docfrag.lastChild, node.nextSibling);
                }
                node.parentNode.removeChild(node);
                return nodes;
            };
            /**
             * do render on a Node
             * @return the output nodes
             */
            InlineRenderer.prototype.RenderNode = function (node) {
                console.log('Inline renderer on', node);
                var tree = new MarkdownIME.DomChaos();
                tree.cloneNode(node);
                this.RenderChaos(tree);
                tree.applyTo(node);
                return [].slice.call(node.childNodes, 0);
            };
            /** Add basic Markdown rules into this InlineRenderer */
            InlineRenderer.prototype.AddMarkdownRules = function () {
                this.rules = InlineRenderer.markdownReplacement.concat(this.rules);
                return this;
            };
            /** Add one extra replacing rule */
            InlineRenderer.prototype.AddRule = function (rule) {
                this.rules.push(rule);
            };
            /** Suggested Markdown Replacement */
            InlineRenderer.markdownReplacement = [
                //NOTE process bold first, then italy.
                new InlineRegexRule("img with title", /\!\[(.*?)\]\(([^\)\s]+)\s+("?)([^\)]+)\3\)/g, function (a, alt, src, b, title) {
                    return MarkdownIME.Utils.generateElementHTML("img", { alt: alt, src: src, title: title });
                }),
                new InlineRegexRule("img", /\!\[(.*?)\]\(([^\)]+)\)/g, function (a, alt, src) {
                    return MarkdownIME.Utils.generateElementHTML("img", { alt: alt, src: src });
                }),
                new InlineRegexRule("link with title", /\[(.*?)\]\(([^\)\s]+)\s+("?)([^\)]+)\3\)/g, function (a, text, href, b, title) {
                    return MarkdownIME.Utils.generateElementHTML("a", { href: href, title: title }, MarkdownIME.Utils.text2html(text));
                }),
                new InlineRegexRule("link", /\[(.*?)\]\(([^\)]+)\)/g, function (a, text, href) {
                    return MarkdownIME.Utils.generateElementHTML("a", { href: href }, MarkdownIME.Utils.text2html(text));
                }),
                new InlineWrapperRule("del", "~~"),
                new InlineWrapperRule("strong", "**"),
                new InlineWrapperRule("em", "*"),
                new InlineWrapperRule("code", "`")
            ];
            return InlineRenderer;
        })();
        Renderer.InlineRenderer = InlineRenderer;
    })(Renderer = MarkdownIME.Renderer || (MarkdownIME.Renderer = {}));
})(MarkdownIME || (MarkdownIME = {}));
/// <reference path="../Utils.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MarkdownIME;
(function (MarkdownIME) {
    var Renderer;
    (function (Renderer) {
        ;
        var BlockRendererContainer = (function () {
            function BlockRendererContainer() {
                /**
                 * the new nodeName of children. Use `null` to keep original nodeName when elevate a node.
                 * @example "LI" for "ol > li"
                 */
                this.childNodeName = null;
                /**
                 * the new nodeName of parent. Use `null` to prevent creating one.
                 * @example "OL" for "ol > li"
                 */
                this.parentNodeName = null;
                /**
                 * tell if user can type inside. this helps when creating strange things like <hr>
                 */
                this.isTypable = true;
                /**
                 * if is true, the text that matches featureMark will be deleted.
                 */
                this.removeFeatureMark = true;
            }
            /** changing its name, moving it into proper container. return null if failed. */
            BlockRendererContainer.prototype.Elevate = function (node) {
                var feature = this.prepareElevate(node);
                if (!feature)
                    return null;
                var child;
                var parent;
                if (!this.childNodeName) {
                    child = node;
                }
                else {
                    //create a new tag named with childNodeName
                    child = node.ownerDocument.createElement(this.childNodeName);
                    while (node.firstChild) {
                        child.appendChild(node.firstChild);
                    }
                    node.parentNode.insertBefore(child, node);
                    node.parentElement.removeChild(node);
                }
                if (!this.parentNodeName) {
                    //do nothing. need no parent.
                    parent = null;
                }
                else {
                    if (child.previousElementSibling && child.previousElementSibling.nodeName == this.parentNodeName) {
                        //this child is just next to the parent.
                        parent = child.previousElementSibling;
                        parent.appendChild(child);
                    }
                    else {
                        //create parent.
                        parent = child.ownerDocument.createElement(this.parentNodeName);
                        MarkdownIME.Utils.wrap(parent, child);
                    }
                }
                return { child: child, parent: parent, feature: feature };
            };
            /**
             * check if one node is elevatable and remove the feature mark.
             * do NOT use this func outsides Elevate()
             */
            BlockRendererContainer.prototype.prepareElevate = function (node) {
                if (!node)
                    return null;
                var matchResult = this.featureMark.exec(node.textContent);
                if (!matchResult)
                    return null;
                if (this.removeFeatureMark) {
                    var n = node;
                    n.innerHTML = n.innerHTML.replace(/&nbsp;/g, String.fromCharCode(160)).replace(this.featureMark, '');
                }
                return matchResult;
            };
            return BlockRendererContainer;
        })();
        Renderer.BlockRendererContainer = BlockRendererContainer;
        var BlockRendererContainers;
        (function (BlockRendererContainers) {
            var UL = (function (_super) {
                __extends(UL, _super);
                function UL() {
                    _super.call(this);
                    this.name = "unordered list";
                    this.featureMark = /^\s*[\*\+\-]\s+/;
                    this.childNodeName = "LI";
                    this.parentNodeName = "UL";
                }
                return UL;
            })(BlockRendererContainer);
            BlockRendererContainers.UL = UL;
            var OL = (function (_super) {
                __extends(OL, _super);
                function OL() {
                    _super.call(this);
                    this.name = "ordered list";
                    this.featureMark = /^\s*(\d+)\.\s+/;
                    this.childNodeName = "LI";
                    this.parentNodeName = "OL";
                }
                OL.prototype.Elevate = function (node) {
                    var rtn = _super.prototype.Elevate.call(this, node);
                    if (rtn) {
                        rtn.parent.setAttribute("start", rtn.feature[1]);
                    }
                    return rtn;
                };
                return OL;
            })(BlockRendererContainer);
            BlockRendererContainers.OL = OL;
            var BLOCKQUOTE = (function (_super) {
                __extends(BLOCKQUOTE, _super);
                function BLOCKQUOTE() {
                    _super.call(this);
                    this.name = "blockquote";
                    this.featureMark = /^(\>|&gt;)\s*/;
                    this.parentNodeName = "BLOCKQUOTE";
                }
                return BLOCKQUOTE;
            })(BlockRendererContainer);
            BlockRendererContainers.BLOCKQUOTE = BLOCKQUOTE;
            /** assuming a <hr> is just another block container and things go easier */
            var HR = (function (_super) {
                __extends(HR, _super);
                function HR() {
                    _super.call(this);
                    this.isTypable = false;
                    this.name = "hr";
                    this.featureMark = /^\s{0,2}([\-_\=\*])(\s*\1){2,}$/;
                }
                HR.prototype.Elevate = function (node) {
                    if (!this.prepareElevate(node))
                        return null;
                    var child = node.ownerDocument.createElement("hr");
                    node.parentElement.insertBefore(child, node);
                    node.parentElement.removeChild(node);
                    return { parent: null, child: child };
                };
                return HR;
            })(BlockRendererContainer);
            BlockRendererContainers.HR = HR;
            var CodeBlock = (function (_super) {
                __extends(CodeBlock, _super);
                function CodeBlock() {
                    _super.call(this);
                    this.name = "code block";
                    this.featureMark = /^```(\s*(\w+)\s*)?$/;
                    this.removeFeatureMark = false;
                }
                CodeBlock.prototype.Elevate = function (node) {
                    var match = this.prepareElevate(node);
                    if (!match)
                        return null;
                    //create a new tag named with childNodeName
                    var d = node.ownerDocument;
                    var code = d.createElement("code");
                    var pre = d.createElement("pre");
                    code.innerHTML = '<br data-mdime-bogus="true">';
                    pre.appendChild(code);
                    node.parentNode.insertBefore(pre, node);
                    node.parentElement.removeChild(node);
                    if (match[1]) {
                        pre.setAttribute("lang", match[2]);
                        code.setAttribute("class", match[2]);
                    }
                    return { parent: pre, child: code };
                };
                return CodeBlock;
            })(BlockRendererContainer);
            BlockRendererContainers.CodeBlock = CodeBlock;
            var HeaderText = (function (_super) {
                __extends(HeaderText, _super);
                function HeaderText() {
                    _super.call(this);
                    this.name = "header text";
                    this.featureMark = /^(#+)\s+/;
                }
                HeaderText.prototype.Elevate = function (node) {
                    var match = this.prepareElevate(node);
                    if (!match)
                        return null;
                    //create a new tag named with childNodeName
                    var child = node.ownerDocument.createElement("H" + match[1].length);
                    while (node.firstChild) {
                        child.appendChild(node.firstChild);
                    }
                    node.parentNode.insertBefore(child, node);
                    node.parentElement.removeChild(node);
                    return { parent: null, child: child };
                };
                return HeaderText;
            })(BlockRendererContainer);
            BlockRendererContainers.HeaderText = HeaderText;
            var TableHeader = (function (_super) {
                __extends(TableHeader, _super);
                function TableHeader() {
                    _super.call(this);
                    this.name = "table header";
                    this.featureMark = /^\|(.+)\|$/;
                    this.removeFeatureMark = false;
                }
                TableHeader.prototype.Elevate = function (node) {
                    var match = this.prepareElevate(node);
                    if (!match)
                        return null;
                    //FIXME: styles inside the table header will be discarded!
                    // (in fact, a fancy header is not good :) )
                    //create a new table.
                    var d = node.ownerDocument;
                    var table = d.createElement("table");
                    var tbody = d.createElement("tbody");
                    var tr = d.createElement("tr");
                    var th = match[1].split("|").map(function (text) {
                        var rtn = d.createElement("th");
                        rtn.textContent = text.trim();
                        tr.appendChild(rtn);
                        return rtn;
                    });
                    table.appendChild(tbody);
                    tbody.appendChild(tr);
                    var container = node.parentElement;
                    container.insertBefore(table, node);
                    container.removeChild(node);
                    var extraLine = d.createElement(node.nodeName);
                    extraLine.innerHTML = '<br data-mdime-bogus="true">';
                    container.insertBefore(extraLine, table.nextElementSibling);
                    return { parent: table, child: th[0] };
                };
                return TableHeader;
            })(BlockRendererContainer);
            BlockRendererContainers.TableHeader = TableHeader;
        })(BlockRendererContainers = Renderer.BlockRendererContainers || (Renderer.BlockRendererContainers = {}));
        /**
         * In fact the BlockRenderer is not a renderer; it can elevate / degrade a node, changing its name, moving it from one container to another.
         */
        var BlockRenderer = (function () {
            function BlockRenderer() {
                this.containers = [];
            }
            /** Elevate a node. Make sure the node is a block node. */
            BlockRenderer.prototype.Elevate = function (node) {
                for (var i = 0; i < this.containers.length; i++) {
                    var container = this.containers[i];
                    var rtn = container.Elevate(node);
                    if (rtn) {
                        rtn.containerType = container;
                        return rtn;
                    }
                }
                return null;
            };
            /**
             * Get suggested nodeName of a new line inside a container.
             * @return null if no suggestion.
             */
            BlockRenderer.prototype.GetSuggestedNodeName = function (container) {
                for (var i = 0; i < this.containers.length; i++) {
                    var cc = this.containers[i];
                    if (cc.parentNodeName == container.nodeName)
                        return cc.childNodeName;
                }
                return null;
            };
            /**
             * Add Markdown rules into this BlockRenderer
             */
            BlockRenderer.prototype.AddMarkdownRules = function () {
                this.containers = BlockRenderer.markdownContainers.concat(this.containers);
                return this;
            };
            BlockRenderer.markdownContainers = [
                new BlockRendererContainers.CodeBlock(),
                new BlockRendererContainers.TableHeader(),
                new BlockRendererContainers.BLOCKQUOTE(),
                new BlockRendererContainers.HeaderText(),
                new BlockRendererContainers.HR(),
                new BlockRendererContainers.OL(),
                new BlockRendererContainers.UL()
            ];
            return BlockRenderer;
        })();
        Renderer.BlockRenderer = BlockRenderer;
    })(Renderer = MarkdownIME.Renderer || (MarkdownIME.Renderer = {}));
})(MarkdownIME || (MarkdownIME = {}));
/// <reference path="../Renderer/InlineRenderer.ts" />
var MarkdownIME;
(function (MarkdownIME) {
    var Addon;
    (function (Addon) {
        /**
         * EmojiAddon is an add-on for InlineRenderer, translating `8-)` into ![😎](https://twemoji.maxcdn.com/36x36/1f60e.png)
         * Part of the code comes from `markdown-it/markdown-it-emoji`
         *
         * @see https://github.com/markdown-it/markdown-it-emoji/
         */
        var EmojiAddon = (function () {
            function EmojiAddon() {
                this.name = "Emoji";
                this.use_shortcuts = true;
                /** use twemoji to get `img` tags if possible. if it bothers, disable it. */
                this.use_twemoji = true;
                this.twemoji_config = {};
                this.full_syntax = /:(\w+):/g;
                /** shortcuts RegExp cache. Order: [shortest, ..., longest] */
                this.shortcuts_cache = [];
                this.chars = {
                    "smile": "😄",
                    "smiley": "😃",
                    "grinning": "😀",
                    "blush": "😊",
                    "wink": "😉",
                    "heart_eyes": "😍",
                    "kissing_heart": "😘",
                    "kissing_closed_eyes": "😚",
                    "kissing": "😗",
                    "kissing_smiling_eyes": "😙",
                    "stuck_out_tongue_winking_eye": "😜",
                    "stuck_out_tongue_closed_eyes": "😝",
                    "stuck_out_tongue": "😛",
                    "flushed": "😳",
                    "grin": "😁",
                    "pensive": "😔",
                    "relieved": "😌",
                    "unamused": "😒",
                    "disappointed": "😞",
                    "persevere": "😣",
                    "cry": "😢",
                    "joy": "😂",
                    "sob": "😭",
                    "sleepy": "😪",
                    "disappointed_relieved": "😥",
                    "cold_sweat": "😰",
                    "sweat_smile": "😅",
                    "sweat": "😓",
                    "weary": "😩",
                    "tired_face": "😫",
                    "fearful": "😨",
                    "scream": "😱",
                    "angry": "😠",
                    "rage": "😡",
                    "confounded": "😖",
                    "laughing": "😆",
                    "satisfied": "😆",
                    "yum": "😋",
                    "mask": "😷",
                    "sunglasses": "😎",
                    "sleeping": "😴",
                    "dizzy_face": "😵",
                    "astonished": "😲",
                    "worried": "😟",
                    "frowning": "😦",
                    "anguished": "😧",
                    "imp": "👿",
                    "smiling_imp": "😈",
                    "open_mouth": "😮",
                    "neutral_face": "😐",
                    "confused": "😕",
                    "hushed": "😯",
                    "no_mouth": "😶",
                    "innocent": "😇",
                    "smirk": "😏",
                    "expressionless": "😑",
                    "smiley_cat": "😺",
                    "smile_cat": "😸",
                    "heart_eyes_cat": "😻",
                    "kissing_cat": "😽",
                    "smirk_cat": "😼",
                    "scream_cat": "🙀",
                    "crying_cat_face": "😿",
                    "joy_cat": "😹",
                    "pouting_cat": "😾",
                    "heart": "❤️",
                    "broken_heart": "💔",
                    "two_hearts": "💕",
                    "sparkles": "✨",
                    "fist": "✊",
                    "hand": "✋",
                    "raised_hand": "✋",
                    "cat": "🐱",
                    "mouse": "🐭",
                    "cow": "🐮",
                    "monkey_face": "🐵",
                    "star": "⭐",
                    "zap": "⚡",
                    "umbrella": "☔",
                    "hourglass": "⌛",
                    "watch": "⌚",
                    "black_joker": "🃏",
                    "mahjong": "🀄",
                    "coffee": "☕",
                    "anchor": "⚓",
                    "wheelchair": "♿",
                    "negative_squared_cross_mark": "❎",
                    "white_check_mark": "✅",
                    "loop": "➿",
                    "aries": "♈",
                    "taurus": "♉",
                    "gemini": "♊",
                    "cancer": "♋",
                    "leo": "♌",
                    "virgo": "♍",
                    "libra": "♎",
                    "scorpius": "♏",
                    "sagittarius": "♐",
                    "capricorn": "♑",
                    "aquarius": "♒",
                    "pisces": "♓",
                    "x": "❌",
                    "exclamation": "❗",
                    "heavy_exclamation_mark": "❗",
                    "question": "❓",
                    "grey_exclamation": "❕",
                    "grey_question": "❔",
                    "heavy_plus_sign": "➕",
                    "heavy_minus_sign": "➖",
                    "heavy_division_sign": "➗",
                    "curly_loop": "➰",
                    "black_medium_small_square": "◾",
                    "white_medium_small_square": "◽",
                    "black_circle": "⚫",
                    "white_circle": "⚪",
                    "white_large_square": "⬜",
                    "black_large_square": "⬛"
                };
                /** shortcuts. use RegExp instead of string would be better. */
                this.shortcuts = {
                    angry: ['>:(', '>:-('],
                    blush: [':")', ':-")'],
                    broken_heart: ['</3', '<\\3'],
                    // :\ and :-\ not used because of conflict with markdown escaping
                    confused: [':/', ':-/'],
                    cry: [":'(", ":'-(", ':,(', ':,-('],
                    frowning: [':(', ':-('],
                    heart: ['<3'],
                    two_hearts: [/(<3|❤){2}/g],
                    imp: [']:(', ']:-('],
                    innocent: ['o:)', 'O:)', 'o:-)', 'O:-)', '0:)', '0:-)'],
                    joy: [":')", ":'-)", ':,)', ':,-)', ":'D", ":'-D", ':,D', ':,-D'],
                    kissing: [':*', ':-*'],
                    laughing: ['x-)', 'X-)'],
                    neutral_face: [':|', ':-|'],
                    open_mouth: [':o', ':-o', ':O', ':-O'],
                    rage: [':@', ':-@'],
                    smile: [':D', ':-D'],
                    smiley: [':)', ':-)'],
                    smiling_imp: [']:)', ']:-)'],
                    sob: [":,'(", ":,'-(", ';(', ';-('],
                    stuck_out_tongue: [':P', ':-P'],
                    sunglasses: ['8-)', 'B-)'],
                    sweat: [',:(', ',:-('],
                    sweat_smile: [',:)', ',:-)'],
                    unamused: [':s', ':-S', ':z', ':-Z', ':$', ':-$'],
                    wink: [';)', ';-)']
                };
            }
            EmojiAddon.prototype.render = function (tree) {
                tree.replace(this.full_syntax, this.magic1.bind(this));
                if (this.use_shortcuts) {
                    if (!this.shortcuts_cache.length)
                        this.UpdateShortcutCache();
                    var self = this;
                    for (var i = this.shortcuts_cache.length - 1; i >= 0; i--) {
                        tree.replace(this.shortcuts_cache[i].regexp, function () { return self.magic1(null, self.shortcuts_cache[i].targetName); });
                    }
                }
            };
            EmojiAddon.prototype.unrender = function (tree) { };
            /** magic1 translates `:name:` into proper emoji char */
            EmojiAddon.prototype.magic1 = function (fulltext, name) {
                var rtnval = this.chars[name] || fulltext;
                if (this.use_twemoji && typeof twemoji != "undefined") {
                    rtnval = twemoji.parse(rtnval, this.twemoji_config);
                }
                return rtnval;
            };
            /** update the shortcuts RegExp cache. Run this after modifing the shortcuts! */
            EmojiAddon.prototype.UpdateShortcutCache = function () {
                this.shortcuts_cache = [];
                for (var name_1 in this.shortcuts) {
                    var shortcut_phrases = this.shortcuts[name_1];
                    for (var s_i = shortcut_phrases.length - 1; s_i >= 0; s_i--) {
                        var regex = shortcut_phrases[s_i];
                        if (!(regex instanceof RegExp)) {
                            regex = new RegExp(MarkdownIME.Utils.text2regex(regex), "g");
                        }
                        this.shortcuts_cache.push({
                            regexp: regex,
                            length: regex.toString().length,
                            targetName: name_1
                        });
                    }
                }
                this.shortcuts_cache.sort(function (a, b) { return (a.length - b.length); });
            };
            return EmojiAddon;
        })();
        Addon.EmojiAddon = EmojiAddon;
    })(Addon = MarkdownIME.Addon || (MarkdownIME.Addon = {}));
})(MarkdownIME || (MarkdownIME = {}));
/// <reference path="Utils.ts" />
/// <reference path="Renderer/InlineRenderer.ts" />
/// <reference path="Renderer/BlockRenderer.ts" />
//people <3 emoji
/// <reference path="Addon/EmojiAddon.ts" />
var MarkdownIME;
(function (MarkdownIME) {
    var Renderer;
    (function (Renderer) {
        var Pattern;
        (function (Pattern) {
            Pattern.codeblock = /^```\s*(\S*)\s*$/g;
        })(Pattern || (Pattern = {}));
        Renderer.inlineRenderer = new Renderer.InlineRenderer();
        Renderer.blockRenderer = new Renderer.BlockRenderer();
        Renderer.inlineRenderer.AddMarkdownRules();
        Renderer.inlineRenderer.AddRule(new MarkdownIME.Addon.EmojiAddon());
        Renderer.blockRenderer.AddMarkdownRules();
        /**
         * Make one Block Node beautiful!
         */
        function Render(node) {
            var html = MarkdownIME.Utils.trim(node.innerHTML);
            var match_result;
            var new_node;
            console.log("Render", node, html);
            var elevateResult = Renderer.blockRenderer.Elevate(node);
            if (elevateResult) {
                if (!elevateResult.containerType.isTypable)
                    return elevateResult.child;
                node = elevateResult.child;
            }
            Renderer.inlineRenderer.RenderNode(node);
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
            this.editor.addEventListener('keyup', this.keyupHandler.bind(this), false);
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
            if (node.nodeType == Node.TEXT_NODE && range.startOffset != node.textContent.length) {
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
                else if (MarkdownIME.Utils.Pattern.NodeName.cell.test(tinymce_node.parentElement.nodeName)) {
                    //F**king created two <p> inside a table cell!
                    node = tinymce_node.parentElement; //table cell
                    var oldP = tinymce_node.previousSibling;
                    var oldPChild;
                    while (oldPChild = oldP.firstChild) {
                        node.insertBefore(oldPChild, oldP);
                    }
                    node.removeChild(oldP);
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
                var lineBreak = this.document.createTextNode("\n");
                if (!this.isTinyMCE) {
                    //vanilla editor has bug.
                    range.insertNode(lineBreak);
                    var ns = lineBreak.nextSibling;
                    if (ns && (ns.nodeType === Node.TEXT_NODE) && (ns.textContent.length === 0)) {
                        lineBreak.parentNode.removeChild(ns);
                    }
                    if (!lineBreak.nextSibling) {
                        console.log("fucking fix");
                        lineBreak.parentNode.insertBefore(this.document.createElement("br"), lineBreak);
                    }
                    MarkdownIME.Utils.move_cursor_to_end(lineBreak);
                    ev.preventDefault();
                }
                var text = node.textContent;
                if (/^\n*(`{2,3})?\n*$/.test(text.substr(text.length - 4))) {
                    var code = node.firstChild;
                    var n;
                    while (n = code.lastChild,
                        ((n.nodeType === 1 && n.nodeName === "BR") ||
                            (n.nodeType === 3 && /^\n*(```)?\n*$/.test(n.textContent))))
                        code.removeChild(n);
                    this.CreateNewLine(node);
                }
                return;
            }
            else if (MarkdownIME.Utils.is_line_empty(node)) {
                //ouch. it is an empty line.
                console.log("Ouch! empty line.");
                //create one empty line without format.
                var emptyLine = this.GenerateEmptyLine();
                if (MarkdownIME.Utils.Pattern.NodeName.list.test(node.parentNode.nodeName)) {
                    //it's an empty list item
                    //which means it's time to end the list
                    node.parentNode.removeChild(node);
                    // get the list object
                    node = parent_tree.shift();
                    //create empty line
                    if (MarkdownIME.Utils.Pattern.NodeName.list.test(node.parentNode.nodeName)) {
                        //ouch! nested list!
                        emptyLine = this.GenerateEmptyLine("li");
                    }
                }
                else if (MarkdownIME.Utils.Pattern.NodeName.cell.test(node.nodeName)) {
                    //empty table cell
                    var tr = node.parentNode;
                    var table = tr.parentNode.parentNode; // table > tbody > tr
                    if (tr.textContent.trim() === "") {
                        //if the whole row is empty, end the table.
                        tr.parentNode.removeChild(tr);
                        node = table;
                    }
                    else {
                        //otherwise, create a row. 
                        emptyLine = this.CreateNewCell(node);
                        node = null;
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
                node && node.parentNode.insertBefore(emptyLine, node.nextSibling);
                MarkdownIME.Utils.move_cursor_to_end(emptyLine);
                ev.preventDefault();
            }
            else {
                if (node.lastChild.attributes && (node.lastChild.attributes.getNamedItem("data-mdime-bogus") ||
                    node.lastChild.attributes.getNamedItem("data-mce-bogus")))
                    node.removeChild(node.lastChild);
                console.log("Renderer on", node);
                node = MarkdownIME.Renderer.Render(node);
                if (node.parentNode.nodeName === "PRE") {
                    MarkdownIME.Utils.move_cursor_to_end(node);
                    ev.preventDefault();
                }
                else 
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
         * Create new table row.
         * @argument {Node} refer - current cell
         * @return   {Node} the corresponding new cell element
         */
        Editor.prototype.CreateNewCell = function (refer) {
            if (!refer || !MarkdownIME.Utils.Pattern.NodeName.cell.test(refer.nodeName))
                return null;
            var rtn;
            var tr = refer.parentNode;
            var table = tr.parentNode.parentNode;
            var newTr = this.document.createElement("tr");
            for (var i = tr.childNodes.length; i--;) {
                if (MarkdownIME.Utils.Pattern.NodeName.cell.test(tr.childNodes[i].nodeName)) {
                    var newTd = newTr.insertCell(0);
                    newTd.innerHTML = '<br data-mdime-bogus="true">';
                    if (tr.childNodes[i] === refer) {
                        //this new cell is right under the old one
                        rtn = newTd;
                    }
                }
            }
            tr.parentNode.insertBefore(newTr, tr.nextSibling);
            return rtn;
        };
        /**
         * Create new line after one node and move cursor to it.
         * return false if not successful.
         */
        Editor.prototype.CreateNewLine = function (node) {
            var _dummynode;
            var re = MarkdownIME.Utils.Pattern.NodeName;
            //create table row
            if (re.cell.test(node.nodeName)) {
                _dummynode = this.CreateNewCell(node);
                MarkdownIME.Utils.move_cursor_to_end(_dummynode);
                return true;
            }
            //using browser way to create new line will get dirty format
            //so we create one new line without format.
            if (re.line.test(node.nodeName) ||
                re.pre.test(node.nodeName) ||
                re.hr.test(node.nodeName)) {
                var tagName = re.li.test(node.nodeName) ? "li" : null;
                _dummynode = this.GenerateEmptyLine(tagName);
                node.parentNode.insertBefore(_dummynode, node.nextSibling);
                MarkdownIME.Utils.move_cursor_to_end(_dummynode);
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
            var noAdditionalKeys = !(ev.shiftKey || ev.ctrlKey || ev.altKey);
            if (noAdditionalKeys && keyCode === 13) {
                this.ProcessCurrentLine(ev);
                return;
            }
            else if ((keyCode === 9) || (keyCode >= 37 && keyCode <= 40)) {
                var handled = false;
                var parent_tree = MarkdownIME.Utils.build_parent_list(range.startContainer, this.editor);
                parent_tree.unshift(range.startContainer); // for empty cells
                var parent_tree_block = parent_tree.filter(MarkdownIME.Utils.is_node_block);
                console.log(parent_tree);
                if (MarkdownIME.Utils.Pattern.NodeName.cell.test(parent_tree_block[0].nodeName)) {
                    //swift move between cells
                    var td = parent_tree_block[0];
                    var tr = td.parentElement;
                    var table = tr.parentElement.parentElement;
                    var focus_1 = null;
                    var td_index = 0;
                    while (td_index < tr.childElementCount && !tr.children[td_index].isSameNode(td))
                        td_index++;
                    if (td_index < tr.childElementCount) {
                        switch (keyCode) {
                            case 9:
                                if (noAdditionalKeys)
                                    focus_1 = td.nextElementSibling ||
                                        (tr.nextElementSibling && tr.nextElementSibling.firstElementChild) ||
                                        (this.CreateNewCell(tr.firstElementChild));
                                else if (ev.shiftKey)
                                    focus_1 = td.previousElementSibling ||
                                        (tr.previousElementSibling && tr.previousElementSibling.lastElementChild) ||
                                        table.previousElementSibling;
                                break;
                            case 38:
                                if (noAdditionalKeys)
                                    focus_1 = (tr.previousElementSibling && tr.previousElementSibling.children[td_index]) ||
                                        table.previousElementSibling;
                                break;
                            case 40:
                                if (noAdditionalKeys)
                                    focus_1 = (tr.nextElementSibling && tr.nextElementSibling.children[td_index]) ||
                                        table.nextElementSibling;
                                break;
                        }
                        if (focus_1 !== null) {
                            range.selectNodeContents(focus_1.lastChild || focus_1);
                            range.collapse(false);
                            this.selection.removeAllRanges();
                            this.selection.addRange(range);
                            handled = true;
                        }
                    }
                }
                if (handled) {
                    ev.preventDefault();
                }
            }
        };
        Editor.prototype.keyupHandler = function (ev) {
            var keyCode = ev.keyCode || ev.which;
            var range = this.selection.getRangeAt(0);
            if (!range.collapsed)
                return; // avoid processing with strange selection
            //if is typing, process special instant transform.
            var node = range.startContainer;
            if (node.nodeType == Node.TEXT_NODE) {
                var text = node.textContent;
                var text_after = text.substr(range.startOffset + 1);
                var text_before = text.substr(0, range.startOffset);
                if (text_after.length)
                    return; //instant render only work at the end of line, yet.
                if (text_before.length < 2)
                    return; //too young, too simple
                if (text_before.charAt(text_before.length - 2) == "\\")
                    return; //escaping. run faster than others.
                if (keyCode == 32) {
                    //space key pressed.
                    console.log("instant render at", node);
                    var focusNode = node.nextSibling;
                    var shall_do_block_rendering = true;
                    while (!MarkdownIME.Utils.is_node_block(node)) {
                        if (shall_do_block_rendering && node != node.parentNode.firstChild) {
                            shall_do_block_rendering = false;
                        }
                        node = node.parentNode;
                    }
                    console.log("fix to ", node);
                    if (node != this.editor && node.nodeName != "PRE") {
                        var result = shall_do_block_rendering ? MarkdownIME.Renderer.blockRenderer.Elevate(node) : null;
                        if (result == null) {
                            //failed to elevate. this is just a plian inline rendering work.
                            var result_1 = MarkdownIME.Renderer.inlineRenderer.RenderNode(node);
                            var tail = (focusNode && focusNode.previousSibling) || result_1.pop();
                            MarkdownIME.Utils.move_cursor_to_end(tail);
                        }
                        else {
                            if (result.child.textContent.length == 0)
                                result.child.innerHTML = '<br data-mdime-bogus="true">';
                            MarkdownIME.Utils.move_cursor_to_end(result.child);
                        }
                    }
                }
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
                this.style = "\nposition: absolute; \nfont-size: 10pt; \ncolor: #363; \nborder: 1px solid #363; \nbackground: #CFC; \npadding: 2pt 5pt; \nborder-radius: 0 0 5pt 0; \nz-index: 32760; \ntransition: .3s ease; \nopacity: 0; \n";
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

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
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
/// <reference path="../Renderer/InlineRenderer.ts" />
var MarkdownIME;
(function (MarkdownIME) {
    var Addon;
    (function (Addon) {
        /**
         * MathAddon is an add-on for InlineRenderer, transforms `$y=ax^2+b$` into a formatted html.
         *
         * This addon MUST have a higher priority, than other inline elements like emphasising.
         *
         * To enable, execute this:
         *  `MarkdownIME.Renderer.inlineRenderer.rules.unshift(new MarkdownIME.Addon.MathAddon())`
         *
         * Use Google Chart API to generate the picture.
         * @see https://developers.google.com/chart/infographics/docs/formulas
         *
         * Originally planned to use http://www.mathjax.org/ , but failed due to its async proccessing.
         */
        var MathAddon = (function () {
            function MathAddon() {
                this.name = "MathFormula";
                //this is the formula image URL prefix.
                this.imgServer = 'https://chart.googleapis.com/chart?cht=tx&chf=bg,s,00000000&chl=';
                this.regex = /([^\\]|^)(\${1,2})(.*?[^\\])\2/g;
            }
            MathAddon.prototype.render = function (tree) {
                var _this = this;
                tree.replace(this.regex, function (whole, leading, bracket, formula) {
                    // var rtn = `<!--protect--><script type="math/tex">${wrapped}</script><!--/protect-->`;
                    var formulaHtmlized = MarkdownIME.Utils.text2html(formula);
                    var imgUrl = _this.imgServer + encodeURIComponent(formula);
                    var rtn = "<!--protect--><!--formula:" + formulaHtmlized + "--><img alt=\"" + formulaHtmlized + "\" class=\"formula\" src=\"" + imgUrl + "\"><!--/protect-->";
                    return leading + rtn;
                });
            };
            MathAddon.prototype.unrender = function (tree) {
                tree.screwUp(/<!--protect--><!--formula:(.+?)--><img .+?><!--\/protect-->/g, function (whole, formulaHtmlized) {
                    return '$' + MarkdownIME.Utils.html_entity_decode(formulaHtmlized) + '$';
                });
            };
            return MathAddon;
        })();
        Addon.MathAddon = MathAddon;
    })(Addon = MarkdownIME.Addon || (MarkdownIME.Addon = {}));
})(MarkdownIME || (MarkdownIME = {}));
//# sourceMappingURL=MarkdownIME.js.map