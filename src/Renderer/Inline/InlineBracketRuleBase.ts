/// <reference path="../InlineRenderer.ts" />

namespace MarkdownIME.Renderer {

    export abstract class InlineBracketRuleBase implements IInlineTokenRule {
        name: string;
        tokens: string[];

        abstract isLeftBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean;
        abstract isRightBracket(proc: InlineRenderProcess, token: IInlineToken, tokenIndex?: number): boolean;
        abstract ProcWrappedContent(proc: InlineRenderProcess, i1: number, i2: number);

        Proc(proc: InlineRenderProcess): boolean {
            var sti = proc.stacki(1), st = proc.tokens[sti] || { isToken: false, data: "" };
            var tti = proc.i, tt = proc.tokens[tti];

            if (st.isToken && this.isLeftBracket(proc, st, sti) &&
                tt.isToken && this.isRightBracket(proc, tt, tti)) {
                let i1 = proc.stacki(1), i2 = proc.i;
                this.ProcWrappedContent(proc, i1, i2);
                proc.popi();

                return true;
            } else if (tt.isToken && this.isLeftBracket(proc, tt, tti)) {
                proc.pushi();
                return true;
            }

            return false;
        }
    }
}
