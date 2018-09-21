const fs = require('fs');
const path = require('path');

process.chdir(path.resolve(__dirname, '..'));

////// copy files

[
  // "package.json",  <-- auto-generated
  "MarkdownIME.d.ts",
  "LICENSE",
  "README.md",
]
  .forEach(fn => fs.copyFileSync(fn, path.join("dist", fn)));

///// For compatibility only

if (fs.existsSync("dist/MarkdownIME.min.js")) fs.unlinkSync("dist/MarkdownIME.min.js")
fs.copyFileSync("dist/MarkdownIME.js", "dist/MarkdownIME.min.js")

///// package.json process

const packageJSON = JSON.parse(fs.readFileSync("package.json", "utf-8"))
delete packageJSON['scripts']['prepare']
delete packageJSON['scripts']['prepublishOnly']
for (let k in packageJSON) {
  let val = packageJSON[k]
  // remove "dist/" prefix
  if (typeof val === 'string' && /^dist\//.test(val)) packageJSON[k] = val.slice(5)
}
fs.writeFileSync("dist/package.json", JSON.stringify(packageJSON, null, 2))
