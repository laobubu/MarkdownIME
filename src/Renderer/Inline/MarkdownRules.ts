/// <reference path="InlineBracketRuleBase.ts" />

namespace MarkdownIME.Renderer {
    export module Markdown {
        /** the name list of built-in Markdown inline rules */
        export var InlineRules: string[] = [
            "Emphasis",
            "StrikeThrough",
            "LinkAndImage"
        ];

        /** basic support of **Bold** and **Emphasis** */
        export class Emphasis extends InlineBracketRuleBase {
            name: string = "Markdown Emphasis";
            tokens: string[] = ['*'];

            tagNameEmphasis = "i";
            tagNameStrong = "b";

            isLeftBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean {
                return proc.isToken(token, this.tokens[0])
            }

            isRightBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean {
                return proc.isToken(token, this.tokens[0])
            }

            ProcWrappedContent(proc: InlineRenderProcess, i1: number, i2: number) {
                if (i2 === i1 + 1) {
                    //something like `**` of `***this*...`
                    proc.pushi();
                    proc.pushi(); //one more stack push because of the following `proc.popi();`
                    return;
                }

                var innerTokens = proc.tokens.slice(i1 + 1, i2);
                var tagName = this.tagNameEmphasis;
                var document = proc.document;

                if (proc.isToken(proc.tokens[i1 - 1], this.tokens[0]) &&
                    proc.isToken(proc.tokens[i2 + 1], this.tokens[0])) {
                    /**
                     * ## This is a `<strong>` tag
                     * ```
                     * The ***Fucking* one**
                     *       >-------<         THIS IS CORRECT
                     *     >>-------------<<   BUT THIS ONE!!
                     * ```
                     */
                    tagName = this.tagNameStrong;


                    i1 -= 1;
                    i2 += 1;
                    proc.popi();
                }
                else if (innerTokens.some(item => {
                    return !item.isToken && /^(EM|I)$/.test(item.data["nodeName"]);
                })) {
                    /**
                     * ## Case 1: is a new start
                     * ```
                     * The ***Fucking* Fox *Jumps***
                     *       >-------<         THIS IS CORRECT
                     *      >--------------<   BUT WTF?! NOT A PAIR!
                     * ```
                     */
                    if (innerTokens.length > 1) {
                        proc.pushi();
                        proc.pushi(); //one more stack push because of the following `proc.popi();`
                    } else {
                        proc.tokens.splice(i1, i2 - i1 + 1);
                        let src = <Element>innerTokens[0].data;
                        let dst = document.createElement(this.tagNameStrong);
                        while (src.firstChild) dst.appendChild(src.firstChild);
                        proc.tokens.splice(i1, 0, {
                            isToken: false,
                            data: dst
                        });
                    }
                    return;
                }

                proc.tokens.splice(i1, i2 - i1 + 1);

                var fragment = proc.toFragment(innerTokens);
                var UE = document.createElement(tagName);

                UE.appendChild(fragment);
                proc.tokens.splice(i1, 0, {
                    isToken: false,
                    data: UE
                });
            }
        }

        /** basic support of ~~StrikeThrough~~ */
        export class StrikeThrough extends InlineBracketRuleBase {
            name: string = "Markdown StrikeThrough";
            tokens: string[] = ['~'];

            tagName = "del";

            isLeftBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean {
                return proc.isToken(token, this.tokens[0]) &&
                    proc.isToken(proc.tokens[tokenIndex - 1], this.tokens[0])
            }

            isRightBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean {
                return proc.isToken(token, this.tokens[0]) &&
                    proc.isToken(proc.tokens[tokenIndex + 1], this.tokens[0])
            }

            ProcWrappedContent(proc: InlineRenderProcess, i1: number, i2: number) {
                if (i2 === i1 + 1) return;

                var document = proc.document;

                var tokens = proc.tokens.splice(i1 - 1, i2 - i1 + 3);
                tokens = tokens.slice(2, -2);

                var fragment = proc.toFragment(tokens);
                var UE = document.createElement(this.tagName);

                UE.appendChild(fragment);
                proc.tokens.splice(i1 - 1, 0, {
                    isToken: false,
                    data: UE
                });
            }
        }

        /** link and image with `[]`
         * 
         * Notice: the `src` OR `href` is not implemented here.
         */
        export class LinkAndImage extends InlineBracketRuleBase {
            name: string = "Markdown Link and Image";
            tokens: string[] = ['[', ']', '!'];

            isLeftBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean {
                return proc.isToken(token, this.tokens[0])
            }

            isRightBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean {
                return proc.isToken(token, this.tokens[1])
            }

            ProcWrappedContent(proc: InlineRenderProcess, i1: number, i2: number) {
                if (i2 === i1 + 1) return;

                var document = proc.document;
                var UE: Element;

                var innerTokens = proc.tokens.slice(i1 + 1, i2);

                if (proc.isToken(proc.tokens[i1 - 1], this.tokens[2])) {
                    UE = document.createElement("img");
                    UE.setAttribute("alt", proc.toString(innerTokens))
                    i1--;
                } else {
                    var fragment = proc.toFragment(innerTokens);
                    UE = document.createElement("a");
                    UE.appendChild(fragment);
                }

                proc.tokens.splice(i1, i2 - i1 + 1);
                proc.tokens.splice(i1, 0, {
                    isToken: false,
                    data: UE
                });
            }
        }
    }
}