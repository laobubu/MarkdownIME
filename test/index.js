/// <reference path="../typings/mocha/mocha.d.ts" />

mocha.setup("bdd")

var scripts = [
    "basic"
]

function loadScript(name) {
    return new Promise(function (solve) {
        var s = document.createElement("script");
        s.src = "test/test." + name + ".js";
        s.onload = solve;
        document.body.appendChild(s)}
    )
}

Promise.all(scripts.map(loadScript)).then(function() {
    mocha.checkLeaks()
    mocha.globals(['MarkdownIME'])
    mocha.run()
})
