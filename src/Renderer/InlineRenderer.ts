/// <reference path="../Utils.ts" />

namespace MarkdownIME.Renderer {
    export interface IInlineRule {
        name: string;
    }

    export interface IInlineToken {
        isToken: boolean;
        data: string | Node;
    }

    /**
     * InlineRenderer: Renderer for inline objects
     * 
     * Flow:
     * 
     * 1. Parse: `HTMLElement.childNodes => IInlineToken[]`
     * 2. 
     * 
     * @example 
     * ```
     * var renderer = new MarkdownIME.Renderer.InlineRenderer();
     * // Add Markdown rules here...
     * renderer.RenderNode(node); // where node.innerHTML == "Hello **World<img src=...>**"
     * assert(node.innerHTML == "Hello <b>World<img src=...></b>");
     * ```
     */
    export class InlineRenderer {

        rules: IInlineRule[] = [];

        /** The chars that could be a token */
        tokenChars: { [char: string]: any } = {};

        /**
         * do render on a Node
         * 
         * @example
         * ```
         * renderer.RenderNode(node); //where node.innerHTML == "Hello **World<img src=...>**"
         * assert(node.innerHTML == "Hello <b>World<img src=...></b>")
         * ```
         */
        public RenderNode(node: HTMLElement) {
            
        }

        /**
         * Extract tokens.
         * 
         * @example
         * ```
         * var tokens = renderer.Parse(node); //where node.innerHTML == "Hello [<img src=...> \\]Welcome](xxx)"
         * tokens[0] == {isToken: false, data: "Hello "}
         * tokens[1] == {isToken: true,  data: "["}
         * tokens[2] == {isToken: false, data: (ElementObject)}
         * tokens[3] == {isToken: false, data: " \\]Welcome"}
         * //...
         * ```
         */
        public Parse(contentContainer: Element): IInlineToken[] {
            var rtn: IInlineToken[] = [];

            var childNodes = contentContainer.childNodes, childCount = childNodes.length, i = -1;

            var strBuff: string = "";
            function flushStringBuffer() {
                strBuff && rtn.push({
                    isToken: false,
                    data: strBuff
                });
                strBuff = "";
            }

            while (++i !== childCount) {
                let node = childNodes[i];

                if (node.nodeType !== Node.TEXT_NODE) {
                    rtn.push({
                        isToken: false,
                        data: node
                    });
                    continue;
                }

                let escaped = false;
                let str = node.textContent;

                if (!str.length) continue;

                for (let j = 0; j !== str.length; j++) {
                    let char = str.charAt(j);
                    if (!escaped && this.tokenChars.hasOwnProperty(char)) {
                        flushStringBuffer();
                        rtn.push({
                            isToken: true,
                            data: char
                        });
                        continue; //skip updating strBuff
                    }
                    else if (escaped) escaped = false;
                    else if (char === "\\") escaped = true;

                    strBuff += char;
                }

                flushStringBuffer();
            }

            return rtn;
        }

        /** Add one extra replacing rule */
        public AddRule(rule: IInlineRule) {
            this.rules.push(rule);
        }
    }
}
