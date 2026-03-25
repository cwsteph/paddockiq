const fs = require("fs");
fs.unlinkSync("package-lock.json");
console.log("Deleted package-lock.json");
