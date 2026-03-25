const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package-lock.json","utf8"));
// Remove the windows SWC binary from the lock file optional deps
if(pkg.packages["node_modules/@next/swc-win32-x64-msvc"]) {
  delete pkg.packages["node_modules/@next/swc-win32-x64-msvc"];
  console.log("Removed win32 SWC from package-lock.json");
} else {
  console.log("Not found in packages, checking...");
  console.log(Object.keys(pkg.packages).filter(k=>k.includes("swc")));
}
fs.writeFileSync("package-lock.json", JSON.stringify(pkg, null, 2));
