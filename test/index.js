var editor = document.getElementById('editor');

var scripts = [
    "basic",
    "block-renderer",
    "inline-renderer",
    "editor"
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
    //Adding POST Test Code Here
}

scripts.forEach(loadScript);
