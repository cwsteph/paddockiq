const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json","utf8"));
delete pkg.dependencies["@next/swc-win32-x64-msvc"];
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
console.log("Removed win32 SWC from package.json");
console.log("deps now:", JSON.stringify(pkg.dependencies, null, 2));
