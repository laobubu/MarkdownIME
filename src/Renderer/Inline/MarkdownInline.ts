/// <reference path="InlineBracketRuleBase.ts" />

namespace MarkdownIME.Renderer {
    namespace Markdown {
        class Emphasis extends InlineBracketRuleBase {
            name: string = "Markdown Emphasis";
            tokens: string[] = ['*'];

            isLeftBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean {
                return proc.isToken(token, '*')
            }

            isRightBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean {
                return proc.isToken(token, '*')
            }

            ProcWrappedContent(proc: InlineRenderProcess, i1: number, i2: number) {
                if (i2 === i1 + 1) {
                    //something like `**` of `***this*...`
                    proc.pushi();
                    proc.pushi(); //one more stack push because of the following `proc.popi();`
                    return;
                }

                if (i2 === i1 + 2 && (<Node>proc.tokens[i1 + 1].data).nodeName === "I") {
                    //something like `*<i>To Be Bold</i>*`
                    proc.tokens.splice(i2, 1);
                    proc.tokens.splice(i1, 1);
                    (<Node>proc.tokens[i1].data).nodeName = "B";
                    proc.i -= 2;
                    return;
                }

                var tokens = proc.tokens.splice(i1, i2 - i1 + 1);
                tokens.pop();
                tokens.shift();

                var fragment = proc.toFragment(tokens);
                var UE = document.createElement("i");

                UE.appendChild(fragment);
                proc.tokens.splice(i1, 0, {
                    isToken: false,
                    data: UE
                });
            }
        }
    }
}