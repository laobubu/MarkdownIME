/// <reference path="InlineBracketRuleBase.ts" />

namespace MarkdownIME.Renderer {
    export module Markdown {

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

                if (i2 === i1 + 2 && /^(EM|I)$/.test((<Node>proc.tokens[i1 + 1].data).nodeName)) {
                    //something like `*<i>To Be Bold</i>*`
                    proc.tokens.splice(i2, 1);
                    proc.tokens.splice(i1, 1);

                    let srcElement = <Element>proc.tokens[i1].data;
                    let newElement = proc.document.createElement(this.tagNameStrong);
                    while (srcElement.firstChild) newElement.appendChild(srcElement.firstChild);
                    proc.tokens[i1].data = newElement;

                    proc.i -= 2;
                    return;
                }

                var tokens = proc.tokens.splice(i1, i2 - i1 + 1);
                tokens.pop();
                tokens.shift();

                var fragment = proc.toFragment(tokens);
                var UE = document.createElement(this.tagNameEmphasis);

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
    }
}