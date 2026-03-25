const fs = require("fs");
const path = require("path");

// Read package-lock and strip ALL windows/swc optional deps
const lock = JSON.parse(fs.readFileSync("package-lock.json","utf8"));
let removed = 0;
for (const key of Object.keys(lock.packages || {})) {
  if (key.includes("swc-win32") || key.includes("swc-darwin") || key.includes("swc-linux-arm")) {
    delete lock.packages[key];
    removed++;
  }
}
// Also fix the root package entry
if (lock.packages[""] && lock.packages[""].optionalDependencies) {
  for (const dep of Object.keys(lock.packages[""].optionalDependencies)) {
    if (dep.includes("swc-win32")) {
      delete lock.packages[""].optionalDependencies[dep];
      removed++;
    }
  }
}
fs.writeFileSync("package-lock.json", JSON.stringify(lock, null, 2));
console.log("Removed", removed, "platform-specific entries");
