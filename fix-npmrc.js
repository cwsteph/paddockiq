const fs = require("fs");
fs.writeFileSync(".npmrc", "optional=true\n");
console.log("wrote .npmrc");
