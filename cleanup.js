const fs = require("fs");

// Fix .gitignore to block .env files
let gi = fs.readFileSync(".gitignore", "utf8");
if (!gi.includes(".env")) {
  gi += "\n.env\n.env.local\n*.js.map\nfix-*.js\ncheck-*.js\nwrite-*.js\npush-db.js\ndel-lock.js\nsetup.js\n";
  fs.writeFileSync(".gitignore", gi);
  console.log("Updated .gitignore");
}

// Remove .env from tracking
const {execSync} = require("child_process");
try {
  execSync("git rm --cached .env 2>/dev/null || true", {stdio:"inherit"});
  execSync("git rm --cached fix-pkg.js fix-prisma5.js fix-prisma7.js check-pkg.js write-api.js push-db.js del-lock.js 2>/dev/null || true", {stdio:"inherit"});
} catch(e) {}
console.log("Done");
