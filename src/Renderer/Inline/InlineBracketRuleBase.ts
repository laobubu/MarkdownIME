/// <reference path="../InlineRenderer.ts" />

namespace MarkdownIME.Renderer {

    export abstract class InlineBracketRuleBase implements IInlineTokenRule {
        name: string;
        tokens: string[];

        abstract isLeftBracket(proc: InlineRenderProcess, token: IInlineToken): boolean;
        abstract isRightBracket(proc: InlineRenderProcess, token: IInlineToken): boolean;
        abstract ProcWrappedContent(proc: InlineRenderProcess, i1: number, i2: number);

        Proc(proc: InlineRenderProcess): boolean {
            var si = proc.tokens[proc.stacki(1)];
            var t = proc.tokens[proc.i];

            if (si.isToken && this.isLeftBracket(proc, si)) {
                if (t.isToken && this.isRightBracket(proc, si)) {
                    let i1 = proc.stacki(1), i2 = proc.i;
                    this.ProcWrappedContent(proc, i1, i2);
                    proc.popi();

                    return true;
                }
            } else if (t.isToken && this.isLeftBracket(proc, si)) {
                proc.pushi();
                return true;
            }

            return false;
        }
    }
}
