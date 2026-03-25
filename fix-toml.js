const fs = require("fs");
fs.writeFileSync("netlify.toml", `[build]
  command = "npx prisma generate && npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
`);
console.log("Done");
console.log(fs.readFileSync("netlify.toml", "utf8"));
