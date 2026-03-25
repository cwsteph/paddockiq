const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json","utf8"));
console.log("deps:", JSON.stringify(pkg.dependencies, null, 2));
console.log("devDeps:", JSON.stringify(pkg.devDependencies, null, 2));
console.log("optionalDeps:", JSON.stringify(pkg.optionalDependencies, null, 2));
