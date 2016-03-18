/// <reference path="../typings/mocha/mocha.d.ts" />

mocha.setup("bdd")

var scripts = [
    "basic"
]

var awaitingScriptCount = scripts.length;

function loadScript(name) {
    var s = document.createElement("script");
    s.src = "test." + name + ".js";
    s.onload = loadScriptCallback;
    document.body.appendChild(s)
}

function loadScriptCallback() {
    if (--awaitingScriptCount) return;
    mocha.checkLeaks()
    mocha.globals(['MarkdownIME'])
    mocha.run()
}

scripts.forEach(loadScript);
