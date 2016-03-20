/// <reference path="../typings/qunit/qunit.d.ts" />
/// <reference path="../dist/MarkdownIME.d.ts" />

QUnit.module("BlockRenderer");

/**
 * Creating a Element with given textContent
 * 
 * @param {string} text
 * @param {string} [tagName]
 * @returns {HTMLElement}
 */
var createTextContainer = function(text, tagName) {
    var node = document.createElement(tagName || "p");
    node.textContent = text;
    editor.appendChild(node);
    return node;
}

/**
 * Test a block renderer
 * 
 * @param {QUnitAssert} assert from QUnit
 * @param {string} text original text
 * @param {string} expectChildTag
 * @param {string} expectChildText
 * @param {string} [expectParentTag] leave empty if not check parent
 * @param {boolean} [negative] reverse result or not
 */
var testBlockRenderer = function(assert, text, expectChildTag, expectChildText, expectParentTag, negative) {
    var srcNode = createTextContainer(text);
    var renderer = MarkdownIME.Renderer.blockRenderer;
    var result = renderer.Elevate(srcNode);
    var newNode = result && result.child || {};

    var eq = negative ? function(rea, exp, str) {
        assert.notEqual(rea, exp, "　NOT " + str);
    } : function(rea, exp, str) {
        assert.equal(rea, exp, "　" + str);
    };

    if (!result && negative) {
        assert.ok(true, "NOT work with " + text);
        return;
    }

    assert.notEqual(result, null, "Testing " + text);

    (typeof expectChildTag === "string") && eq(newNode.nodeName, expectChildTag, "Child's tagName is <" + expectChildTag + ">");
    (typeof expectChildText === "string") && eq(newNode.textContent, expectChildText, "Child's textContent is " + expectChildText);
    (typeof expectParentTag === "string") && eq(result.parent && result.parent.nodeName, expectParentTag, "Parent's tagName is <" + expectParentTag + ">");

    return result;
}

QUnit.test("Horizontal Rules", function(assert) {

    var goodExamples = ['---', '* * *', '- - -'];
    var badExamples = ['\\---', '* \\* *', '- - - '];

    goodExamples.forEach(function(srcText) {
        testBlockRenderer(assert, srcText, "HR", "");
    });

    badExamples.forEach(function(srcText) {
        testBlockRenderer(assert, srcText, "HR", null, null, true);
    });
})

QUnit.test("Ordered list", function(assert) {
    //NOTE: Test illegal syntax first!
    testBlockRenderer(assert, "4.2 billion", "LI", "2 billion", "OL", true);
    var result1 = testBlockRenderer(assert, "2. 2 billion", "LI", "2 billion", "OL");
    var result2 = testBlockRenderer(assert, "3. world is good", "LI", "world is good", "OL");
    assert.equal(result2.parent, result1.parent, "Combine to the last list");
    assert.equal(result2.parent.start, 2, "List starts from 2");
})

QUnit.test("Unordered list", function(assert) {
    //NOTE: Test illegal syntax first!
    testBlockRenderer(assert, "-- shakesphere", "LI", "shakesphere", "UL", true);
    var result1 = testBlockRenderer(assert, "- 2 billion", "LI", "2 billion", "UL");
    var result2 = testBlockRenderer(assert, "+ [laobubu.net]", "LI", "[laobubu.net]", "UL");
    var result3 = testBlockRenderer(assert, "* **pure test**", "LI", "**pure test**", "UL");
    assert.equal(result2.parent, result1.parent, "Combine to the last list");
    assert.equal(result3.parent, result1.parent, "Combine to the last list (2)");
})

QUnit.test("BlockQuote", function(assert) {
    testBlockRenderer(assert, "> Hello Yahhh", "P", "Hello Yahhh", "BLOCKQUOTE");
    testBlockRenderer(assert, ">> Much better", "P", "Much better", "BLOCKQUOTE");
})
