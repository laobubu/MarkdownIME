/// <reference path="../typings/qunit/qunit.d.ts" />
/// <reference path="../dist/MarkdownIME.d.ts" />

QUnit.module("InlineRenderer");

QUnit.test("Process Basic", function(assert) {
    var testHTML = "    Hello [<b class=\"lorem\">Welcome to</b> the \\]] <i>good</i> tests ";
    var testText = "    Hello [Welcome to the \\]] good tests ";
    var testElement = document.createElement("p");
    testElement.innerHTML = testHTML;

    var renderer = MarkdownIME.Renderer.inlineRenderer;

    var tokens = renderer.parse(testElement);
    var tokens_shall = [
        { "isToken": false, "data": "    Hello " },
        { "isToken": true, "data": "[" },
        { "isToken": false, "data": testElement.children[0] },
        { "isToken": false, "data": " the \\]" },
        { "isToken": true, "data": "]" },
        { "isToken": false, "data": " " },
        { "isToken": false, "data": testElement.children[1] },
        { "isToken": false, "data": " tests " }
    ];
    assert.deepEqual(tokens, tokens_shall, "Parse tokens");

    var proc = new MarkdownIME.Renderer.InlineRenderProcess(renderer, document, tokens);
    assert.notEqual(proc, null, "Generate a InlineRenderProcess");

    var text = proc.toString();
    assert.equal(text, testText, "Proc => toString");

    var tempDiv = document.createElement("p");
    var frag = proc.toFragment();
    tempDiv.appendChild(frag);
    assert.equal(tempDiv.innerHTML, testHTML, "Proc => toFragment");
})

QUnit.test("BracketRule", function(assert) {
    /** A temporary BracketRule, turn `[something]` into `<u>something</u>` */
    var TempRule = (function() {
        var _super = MarkdownIME.Renderer.InlineBracketRuleBase;
        __extends(TempRule, _super);
        function TempRule() {
            _super.apply(this, arguments);
            this.name = "TempRule";
            this.tokens = ['[', ']'];
        }
        TempRule.prototype.isLeftBracket = function(proc, token) {
            return proc.isToken(token, '[');
        };
        TempRule.prototype.isRightBracket = function(proc, token) {
            return proc.isToken(token, ']');
        };
        TempRule.prototype.ProcWrappedContent = function(proc, i1, i2) {
            var tokens = proc.tokens.splice(i1, i2 - i1 + 1);
            tokens.pop();
            tokens.shift();
            var fragment = proc.toFragment(tokens);
            var UE = document.createElement("u");
            UE.appendChild(fragment);
            proc.tokens.splice(i1, 0, {
                isToken: false,
                data: UE
            });
        };
        return TempRule;
    })();

    var renderer = new MarkdownIME.Renderer.InlineRenderer();
    renderer.addRule(new TempRule());

    var testHTML = "    Hello [<b class=\"lorem\">Welcome to</b> the \\]] <i>good</i> tests ";
    var testText = "    Hello [Welcome to the \\]] good tests ";
    var testElement = document.createElement("p");
    testElement.innerHTML = testHTML;
    
    var expectHTML = "    Hello <u><b class=\"lorem\">Welcome to</b> the \\]</u> <i>good</i> tests ";
    var expectText = "    Hello Welcome to the \\] good tests ";
    
    renderer.RenderNode(testElement);
    
    assert.equal(testElement.innerHTML, expectHTML, "generate correct HTML");
    assert.equal(testElement.textContent, expectText, "generate correct Text");
})

QUnit.test("Built-in Markdown Rules", function(assert) {
    var renderer = MarkdownIME.Renderer.inlineRenderer;
    var testElement = document.createElement("p");
    
    function testSentenceHTML(fromHTML, toHTML) {
        testElement.innerHTML = fromHTML;
        renderer.RenderNode(testElement);
        assert.equal(testElement.innerHTML, toHTML, "[HTML] " + fromHTML);
    }
    
    function testSentenceText(fromText, toText) {
        testElement.textContent = fromText;
        renderer.RenderNode(testElement);
        assert.equal(testElement.textContent, toText, "[TEXT] " + fromText);
    }
    
    testSentenceHTML("*a\\**", "<i>a\\*</i>");
    testSentenceHTML("**a\\***", "<b>a\\*</b>");
    testSentenceHTML("***Mixed*\\* Stuff**", "<b><i>Mixed</i>\\* Stuff</b>");
    testSentenceHTML("***Mixed** Stuff2**", "<i><b>Mixed</b> Stuff2</i>*");
    
    testSentenceHTML("~~~del <i>the</i> \\~~xx~~", "~<del>del <i>the</i> \\~~xx</del>");
    testSentenceHTML("`inline **code**`", "<code>inline **code**</code>");
    
    testSentenceText("***mix*** **bo\\*ld** *italy* ~~st~~ `co\\`de` **\\*mix*** [li\\]nk](..)", "mix bo\\*ld italy st co\\`de \\*mix* li\\]nk");
})
