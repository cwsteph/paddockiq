const https = require("https");
const siteId = "232dcd47-f178-442f-adb2-6dc1a59c47bf";

// We need to use Netlify API - but we need a token
// Instead, lets write a .env file to commit approach
// Actually the simplest fix: add NODE_VERSION to netlify.toml
const fs = require("fs");
const toml = fs.readFileSync("netlify.toml", "utf8");
const updated = toml.replace(
  "[build]",
  "[build]\n  environment = { NODE_VERSION = \"20\" }"
);
fs.writeFileSync("netlify.toml", updated);
console.log("Updated netlify.toml:");
console.log(fs.readFileSync("netlify.toml", "utf8"));
