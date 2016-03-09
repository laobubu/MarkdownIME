/// <reference path="../InlineRenderer.ts" />

namespace MarkdownIME.Renderer {

    export class InlineBracketRuleBase implements IInlineTokenRule {
        name: string;
        tokens: string[];

        leftBracket: string;
        rightBracket: string;

        ProcWrappedContent(proc: InlineRenderProcess, i1: number, i2: number) {
            //This function needs to be overwritten
            throw new Error("Not implemented ProcWrappedContent of MarkdownIME.Renderer.InlineBracketRuleBase");
        }

        Proc(proc: InlineRenderProcess): boolean {
            var si = proc.tokens[proc.stacki(1)];
            var t = proc.tokens[proc.i];

            if (si.isToken && si.data === this.leftBracket) {
                if (t.isToken && t.data === this.rightBracket) {
                    let i1 = proc.stacki(1), i2 = proc.i;
                    this.ProcWrappedContent(proc, i1, i2);
                    proc.popi();

                    return true;
                }
            } else if (t.isToken && t.data === this.leftBracket) {
                proc.pushi();
                return true;
            }

            return false;
        }
    }
}
