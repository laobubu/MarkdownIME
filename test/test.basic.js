/// <reference path="../typings/qunit/qunit.d.ts" />
/// <reference path="../dist/MarkdownIME.d.ts" />

QUnit.module("Basic");
QUnit.test("Scan", function(assert) {
    var frameDiv = document.createElement('div');
    var loadedIframes = 0;
    var done = assert.async(1);
    frameDiv.innerHTML = 
        '<iframe src="http://lab.laobubu.net/mdime/forbid"></iframe>' +
        '<iframe src="freeplay.html"></iframe>' ;
    document.body.appendChild(frameDiv);
    [].forEach.call(frameDiv.children, function(iframe){
        iframe.addEventListener("load", cntx, false);
    })
    
    function cntx() {
        if (++loadedIframes !== 2) return;
        
        var result = MarkdownIME.Scan(window);
        assert.equal(result.length, 2, "Found two editable div");
        assert.equal(result[0], editor, "One is the text container below");
        assert.equal(result[1].nextElementSibling.tagName, "PRE", "One is from <freeplay.html>, who is before a <pre>");
        
        document.body.removeChild(frameDiv);
        done();
    }
})
